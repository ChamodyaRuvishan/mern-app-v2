# infra/outputs.tf

output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "ec2_instance_id" {
  value = aws_instance.app.id
}

output "ec2_public_ip" {
  value = aws_instance.app.public_ip
}
