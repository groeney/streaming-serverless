variable "role_arn" {}
variable "sns_notifications_topic_arn" {}
variable "sendgrid_key" {}
variable "local_email" {}

resource "null_resource" "email_executer_function_null" {
  triggers {
    index = "${uuid()}"
  }
  provisioner "local-exec" {
    command = "npm run copyLib && npm i"
    working_dir = "./lambda/email-executer/fn"
  }
}

data "archive_file" "email_executer_function_zip" {
  type = "zip"
  source_dir = "./lambda/email-executer/fn"
  output_path = "./lambda/email-executer/output/function.zip"
  depends_on = ["null_resource.email_executer_function_null"]
}

resource "aws_lambda_function" "email_executer" {
  function_name = "email-executer"
  description = "Email executer"
  handler = "index.lambda_handler"
  runtime = "nodejs8.10"
  filename = "./lambda/email-executer/output/function.zip"
  source_code_hash = "${data.archive_file.email_executer_function_zip.output_base64sha256}"
  role = "${var.role_arn}"
  memory_size = 128
  timeout = 30

  environment {
    variables {
      SENDGRID_KEY = "${var.sendgrid_key}",
      LOCAL_EMAIL = "${var.local_email}"
    }
  }

  depends_on = ["data.archive_file.email_executer_function_zip"]
}

resource "aws_sns_topic_subscription" "email_executer_target" {
  topic_arn = "${var.sns_notifications_topic_arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.email_executer.arn}"
}

###############
### OUTPUTS ###
###############

output "email_executer_arn" {
  value = "${aws_lambda_function.email_executer.arn}"
}

output "email_executer_invoke_arn" {
  value = "${aws_lambda_function.email_executer.invoke_arn}"
}

output "email_executer_qualified_arn" {
  value = "${aws_lambda_function.email_executer.qualified_arn}"
}
