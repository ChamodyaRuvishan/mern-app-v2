# infra/main.tf

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# --- Networking Lookups ---
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

# --- Security Groups ---
resource "aws_security_group" "alb" {
  name        = "${var.name}-alb-sg"
  description = "Allow HTTP to ALB"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "svc" {
  name        = "${var.name}-svc-sg"
  description = "Only ALB can reach service port"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }
}

# --- Load Balancer ---
resource "aws_lb" "this" {
  name               = "${var.name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "this" {
  name        = "${var.name}-tg"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  # Keep `ip` to avoid forced replacement of existing target group in your account.
  target_type = "ip"

  health_check {
    path                = var.health_check_path
    matcher             = "200-399"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 5
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}

locals {
  env_file_lines = join("\n", [for k, v in var.env : "${k}=${v}"])
}

# --- EC2 ---
resource "aws_instance" "app" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  instance_type               = var.instance_type
  key_name                    = var.key_name != "" ? var.key_name : null
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.svc.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              set -euxo pipefail
              dnf update -y
              dnf install -y docker
              dnf install -y ec2-instance-connect
              systemctl enable docker
              systemctl start docker

              mkdir -p /opt/mern
              cat > /opt/mern/.env <<'ENVFILE'
              ${local.env_file_lines}
              ENVFILE

              docker rm -f mern-backend || true
              docker pull ${var.image_repo}:${var.image_tag}
              docker run -d --name mern-backend --restart always \
                --env-file /opt/mern/.env \
                -p ${var.app_port}:${var.app_port} \
                ${var.image_repo}:${var.image_tag}
              EOF

  tags = {
    Name = "${var.name}-ec2"
  }
}

resource "aws_lb_target_group_attachment" "app" {
  target_group_arn = aws_lb_target_group.this.arn
  target_id        = aws_instance.app.private_ip
  port             = var.app_port
}
