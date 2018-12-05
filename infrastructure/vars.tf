variable "SENDGRID_KEY" {}
variable "LOCAL_EMAIL" {}

variable "AWS_KEY" {
  default = "FAKE_AWS_KEY"
}
variable "AWS_SECRET" {
  default = "FAKE_AWS_SECRET"
}
variable "region" {
  default = "us-east-1"
}

variable "kinesis" {
  default = "http://localhost:4568"
}

variable "dynamodb" {
  default = "http://localhost:4569"
}

variable "dynamodbstreams" {
  default = "http://localhost:4570"
}

variable "lambda" {
  default = "http://localhost:4574"
}

variable "sns" {
  default = "http://localhost:4575"
}

variable "s3" {
  default = "http://localhost:4572"
}
