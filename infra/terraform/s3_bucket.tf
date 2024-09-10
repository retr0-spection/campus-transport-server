# Data source for existing S3 bucket
data "aws_s3_bucket" "terraform_state" {
  bucket = "campus-transport-bucket"
}

# Server-side encryption configuration for the existing bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = data.aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Versioning configuration for the existing bucket
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = data.aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ACL configuration for the existing bucket
resource "aws_s3_bucket_acl" "terraform_state" {
  bucket = data.aws_s3_bucket.terraform_state.id
  acl    = "private"
}

# Lifecycle configuration for the existing bucket
resource "aws_s3_bucket_lifecycle_configuration" "terraform_state" {
  bucket = data.aws_s3_bucket.terraform_state.id

  rule {
    id     = "prevent_destroy"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Tags for the existing bucket
resource "aws_s3_bucket_tagging" "terraform_state" {
  bucket = data.aws_s3_bucket.terraform_state.id

  tags = {
    Name        = "TerraformState"
    Environment = "Production"
  }
}
