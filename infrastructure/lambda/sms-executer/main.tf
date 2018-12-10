variable "role_arn" {}
variable "sns_notifications_topic_arn" {}
variable "twilio_sid" {}
variable "twilio_token" {}
variable "twilio_from" {}
variable "local_phone" {}

resource "null_resource" "sms_executer_function_null" {
  triggers {
    index = "${uuid()}"
  }
  provisioner "local-exec" {
    command = "npm run copyLib && npm i"
    working_dir = "./lambda/sms-executer/fn"
  }
}

data "archive_file" "sms_executer_function_zip" {
  type = "zip"
  source_dir = "./lambda/sms-executer/fn"
  output_path = "./lambda/sms-executer/output/function.zip"
  depends_on = ["null_resource.sms_executer_function_null"]
}

resource "aws_lambda_function" "sms_executer" {
  function_name = "sms-executer"
  description = "SMS executer"
  handler = "index.lambda_handler"
  runtime = "nodejs8.10"
  filename = "./lambda/sms-executer/output/function.zip"
  source_code_hash = "${data.archive_file.sms_executer_function_zip.output_base64sha256}"
  role = "${var.role_arn}"
  memory_size = 128
  timeout = 30

  environment {
    variables {
      TWILIO_SID = "${var.twilio_sid}"
      TWILIO_TOKEN = "${var.twilio_token}"
      TWILIO_FROM = "${var.twilio_from}"
      LOCAL_PHONE = "${var.local_phone}"
    }
  }

  depends_on = ["data.archive_file.sms_executer_function_zip"]
}

resource "aws_sns_topic_subscription" "sms_executer_target" {
  topic_arn = "${var.sns_notifications_topic_arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.sms_executer.arn}"
}

###############
### OUTPUTS ###
###############

output "sms_executer_arn" {
  value = "${aws_lambda_function.sms_executer.arn}"
}

output "sms_executer_invoke_arn" {
  value = "${aws_lambda_function.sms_executer.invoke_arn}"
}

output "sms_executer_qualified_arn" {
  value = "${aws_lambda_function.sms_executer.qualified_arn}"
}
