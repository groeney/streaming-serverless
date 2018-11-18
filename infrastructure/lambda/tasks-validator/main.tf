variable "role_arn" {}
variable "stream_arn" {}

resource "null_resource" "tasks_validator_function_null" {
  triggers {
    index = "${uuid()}"
  }
  provisioner "local-exec" {
    command = "npm run copyLib && npm i"
    working_dir = "./lambda/tasks-validator/fn"
  }
}

data "archive_file" "tasks_validator_function_zip" {
  type = "zip"
  source_dir = "./lambda/tasks-validator/fn"
  output_path = "./lambda/tasks-validator/output/function.zip"
  depends_on = ["null_resource.tasks_validator_function_null"]
}

resource "aws_lambda_function" "tasks_validator" {
  function_name = "tasks-validator"
  description = "Validator for DynamoDB Stream on Tasks table."
  handler = "index.lambda_handler"
  runtime = "nodejs8.10"
  filename = "./lambda/tasks-validator/output/function.zip"
  source_code_hash = "${data.archive_file.tasks_validator_function_zip.output_base64sha256}"
  role = "${var.role_arn}"
  memory_size = 128
  timeout = 30

  depends_on = ["data.archive_file.tasks_validator_function_zip"]
}

resource "aws_lambda_event_source_mapping" "tasks_validator_source" {
  event_source_arn = "${var.stream_arn}"
  function_name     = "${aws_lambda_function.tasks_validator.function_name}"
  starting_position = "TRIM_HORIZON"
}

###############
### OUTPUTS ###
###############

output "tasks_validator_arn" {
  value = "${aws_lambda_function.tasks_validator.arn}"
}

output "tasks_validator_invoke_arn" {
  value = "${aws_lambda_function.tasks_validator.invoke_arn}"
}

output "tasks_validator_qualified_arn" {
  value = "${aws_lambda_function.tasks_validator.qualified_arn}"
}
