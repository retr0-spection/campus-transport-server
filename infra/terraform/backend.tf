terraform {
  backend "s3" {
    bucket         = "campus-transport"  # Replace with your S3 bucket name
    key            = "terraform/terraform.tfstate"  # The path to the state file within the bucket
    region         = "us-west-2"
    encrypt        = true  # Encrypt the state file
  }
}

