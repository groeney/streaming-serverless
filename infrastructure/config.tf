provider "aws" {
  access_key = "${var.AWS_KEY}"
  secret_key = "${var.AWS_SECRET}"
  region = "${var.region}"
  skip_credentials_validation = true
  skip_metadata_api_check = true
  skip_requesting_account_id = true

  endpoints {
    dynamodb = "${var.dynamodb}"
    lambda = "${var.lambda}"
    sns = "${var.sns}"
    kinesis = "${var.kinesis}"
  }
}
