terraform {
  backend "s3" {
    bucket         = "campus-auth"  # Replace with your S3 bucket name
    key            = "terraform/terraform.tfstate"  # The path to the state file within the bucket
    region         = "us-east-1"
    encrypt        = true  # Encrypt the state file
  }
}

