# infra/variables.tf

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "name" {
  type    = string
  default = "mern-backend"
}

variable "image_repo" {
  type        = string
  description = "e.g. youruser/mern-backend or ECR URL"
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "app_port" {
  type    = number
  default = 3001
}

variable "health_check_path" {
  type    = string
  default = "/"
}

variable "env" {
  type    = map(string)
  default = {}
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "key_name" {
  type        = string
  default     = ""
  description = "Existing EC2 key pair name for SSH. Leave empty to skip key pair attachment."
}

variable "ssh_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "CIDR allowed to SSH to the instance. Restrict to your IP in production."
}
