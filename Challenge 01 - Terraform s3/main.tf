terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  # Desactiva las comprobaciones bloqueadas por AWS Academy
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true

  # Salta comprobaciones específicas de S3
  s3_use_path_style           = false
}

# 1. Bucket S3 (le indicamos que ignore cambios en object_lock)
resource "aws_s3_bucket" "bucket_challenge" {
  bucket        = "challenge-1-enma"
  force_destroy = true

  lifecycle {
    ignore_changes = [
      object_lock_configuration,
      object_lock_enabled
    ]
  }

  tags = {
    Name = "terraform-s3-challenge"
  }
}

# 2. Desactivar el bloqueo de acceso público
resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.bucket_challenge.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# 3. Configuración de sitio web estático
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.bucket_challenge.id

  index_document {
    suffix = "index.html"
  }
}

# 4. Política para lectura pública
resource "aws_s3_bucket_policy" "public_read" {
  bucket     = aws_s3_bucket.bucket_challenge.id
  depends_on = [aws_s3_bucket_public_access_block.public_access]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.bucket_challenge.arn}/*"
      }
    ]
  })
}

# 5. Subida automática del index.html
resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.bucket_challenge.id
  key          = "index.html"
  source       = "${path.module}/index.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/index.html")
}

# 6. Salida de la URL
output "website_endpoint" {
  description = "URL publica del sitio web en S3"
  value       = "http://challenge-1-enma.s3-website-us-east-1.amazonaws.com/"
}