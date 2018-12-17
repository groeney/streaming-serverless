variable "role_arn" {}
variable "sns_notifications_topic_arn" {}
variable "target" {}

variable "runtime" {
  description = "Actual lambda runtime e.g. node8.10"
}

variable "runtime_short" {
  description = "Abbreviated lambda runtime e.g. js"
}

variable "create_package_command" {
  description = "Bash command to install dependencies for appropriate runtime"
}

variable "_env" {
  type = "map"
}

locals {
  env = "${merge("${var._env}", map("PYTHONPATH", "/var/task/vendored:/var/runtime"))}"
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

data "archive_file" "executer_function_zip" {
  type        = "zip"
  source_dir  = "${var.function_dir}"
  output_path = "${var.package_dir}/output/function.zip"
  depends_on  = ["null_resource.function_null"]
}

resource "aws_lambda_function" "executer" {
  function_name    = "${var.target}-executer"
  description      = "${var.target} executer"
  handler          = "index.lambda_handler"
  runtime          = "${var.runtime}"
  filename         = "${var.package_dir}/output/function.zip"
  source_code_hash = "${data.archive_file.executer_function_zip.output_base64sha256}"
  role             = "${var.role_arn}"
  memory_size      = 128
  timeout          = 30

  environment {
    variables = "${local.env}"
  }

  depends_on = ["data.archive_file.executer_function_zip"]
}

resource "aws_sns_topic_subscription" "executer_target" {
  topic_arn = "${var.sns_notifications_topic_arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.executer.arn}"
}

###############
### OUTPUTS ###
###############

output "executer_arn" {
  value = "${aws_lambda_function.executer.arn}"
}

output "executer_invoke_arn" {
  value = "${aws_lambda_function.executer.invoke_arn}"
}

output "executer_qualified_arn" {
  value = "${aws_lambda_function.executer.qualified_arn}"
}
