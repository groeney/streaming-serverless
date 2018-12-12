variable "role_arn" {}
variable "stream_arn" {}

variable "runtime" {
  description = "Actual lambda runtime e.g. node8.10"
}

variable "runtime_short" {
  description = "Abbreviated lambda runtime e.g. js"
}

variable "create_package_command" {
  description = "Bash command to install dependencies for appropriate runtime"
}

variable "table" {
  description = "DynamoDB table for which the stream and validator is enabled"
}

variable "function_dir" {
  description = "Relative path to correct lambda runtime function handler"
}

variable "package_dir" {
  description = "Relative path to correct lambda output loc"
}

resource "null_resource" "function_null" {
  triggers {
    index = "${uuid()}"
  }

  provisioner "local-exec" {
    command     = "${var.create_package_command}"
    working_dir = "${var.function_dir}"
  }
}

data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = "${var.function_dir}"
  output_path = "${var.package_dir}/output/function.zip"
  depends_on  = ["null_resource.function_null"]
}

resource "aws_lambda_function" "validator" {
  function_name    = "${var.table}-validator-${var.runtime_short}"
  description      = "Validator for DynamoDB Stream on ${var.table} table."
  handler          = "index.lambda_handler"
  runtime          = "${var.runtime}"
  filename         = "${var.package_dir}/output/function.zip"
  source_code_hash = "${data.archive_file.function_zip.output_base64sha256}"
  role             = "${var.role_arn}"
  memory_size      = 128
  timeout          = 30

  depends_on = ["data.archive_file.function_zip"]
}

resource "aws_lambda_event_source_mapping" "validator_source" {
  event_source_arn  = "${var.stream_arn}"
  function_name     = "${aws_lambda_function.validator.function_name}"
  starting_position = "TRIM_HORIZON"
}

###############
### OUTPUTS ###
###############

output "validator_arn" {
  value = "${aws_lambda_function.validator.arn}"
}

output "validator_invoke_arn" {
  value = "${aws_lambda_function.validator.invoke_arn}"
}

output "validator_qualified_arn" {
  value = "${aws_lambda_function.validator.qualified_arn}"
}
