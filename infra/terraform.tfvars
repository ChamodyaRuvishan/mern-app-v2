# infra/terraform.tfvars

region            = "us-east-1"
name              = "mern-backend"
image_repo        = "chamodyaruvishan/mern-backend" # REPLACE THIS
image_tag         = "latest"
app_port          = 3001
health_check_path = "/"

# Add environment variables for your app here
env = {
  MONGO_URI = "mongodb+srv://user:pass@cluster.mongodb.net/db" # REPLACE THIS
  NODE_ENV  = "production"
}