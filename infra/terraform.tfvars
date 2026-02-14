# infra/terraform.tfvars

region            = "us-east-1"
name              = "mern-backend"
image_repo        = "chamodyaruvishan/mern-backend" # REPLACE THIS
image_tag         = "latest"
app_port          = 8000
health_check_path = "/"
instance_type     = "t3.micro"
key_name          = "jenkins-deploy-key"
ssh_cidr          = "0.0.0.0/0"

# Add environment variables for your app here
env = {
  MONGO_URI = "mongodb+srv://cruvishan9:Balangoda123manawaya@cluster0.dtywg.mongodb.net/mern-db?appName=Cluster0" # REPLACE THIS
  NODE_ENV  = "production"
  JWT_SECRET = "skdjfhkjsdhfkjhsdkjfhkjsdhf"
}
