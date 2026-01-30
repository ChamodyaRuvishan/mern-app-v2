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

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "container_name" {
  type    = string
  default = ""
}

variable "env" {
  type    = map(string)
  default = {}
}