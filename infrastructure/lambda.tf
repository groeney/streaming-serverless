locals {
  # Runtime specific locals
  enable_node_runtime   = "${var.LAMBDA_RUNTIME == "nodejs8.10"}"
  enable_python_runtime = "${local.enable_node_runtime ? "0" : "1"}"
  runtime_short         = "${local.enable_node_runtime ? "js" : "py"}"

  runtime_dir            = "./lambda/${local.runtime_short}"
  cp_command             = "cp -rf ../../lib/* ./ && cp -rf ../../../lib/* ./"
  node_package_command   = "${local.cp_command} && npm i"
  py_package_command     = "${local.cp_command} && python3 -m pip install -r ./requirements.txt -t ./vendored"
  create_package_command = "${local.enable_node_runtime ? local.node_package_command : local.py_package_command}"

  # Validator specific locals
  validator_role      = "FAKE_VALIDATOR_ROLE_ARN"
  tasks_validator_dir = "${local.runtime_dir}/tasks-validator"

  # Executer specific locals
  executer_role      = "FAKE_EXECUTER_ROLE_ARN"
  email_executer_dir = "${local.runtime_dir}/email-executer"
  sms_executer_dir   = "${local.runtime_dir}/sms-executer"
}

##################
### VALIDATORS ###
##################

### tasks validator ###

module "tasks_validator" {
  source                 = "./lambda/terraform/validator"
  role_arn               = "${local.validator_role}"
  stream_arn             = "${module.tasks_table.stream_arn}"
  create_package_command = "${local.create_package_command}"
  runtime                = "${var.LAMBDA_RUNTIME}"
  runtime_short          = "${local.runtime_short}"
  function_dir           = "${local.tasks_validator_dir}/fn"
  package_dir            = "${local.tasks_validator_dir}"
  table                  = "tasks"
}

output "tasks_validator_arn" {
  value = "${module.tasks_validator.validator_arn}"
}

output "tasks_validator_invoke_arn" {
  value = "${module.tasks_validator.validator_invoke_arn}"
}

output "tasks_validator_qualified_arn" {
  value = "${module.tasks_validator.validator_qualified_arn}"
}

##################
### EXECUTERS ####
##################

### email executer ###

module "email_executer" {
  source                      = "./lambda/terraform/executer"
  role_arn                    = "${local.executer_role}"
  sns_notifications_topic_arn = "${aws_sns_topic.notifications.arn}"
  create_package_command      = "${local.create_package_command}"
  runtime                     = "${var.LAMBDA_RUNTIME}"
  runtime_short               = "${local.runtime_short}"
  function_dir                = "${local.email_executer_dir}/fn"
  package_dir                 = "${local.email_executer_dir}"
  target                      = "email"

  _env = {
    SENDGRID_KEY = "${var.SENDGRID_KEY}"
  }
}

output "email_executer_arn" {
  value = "${module.email_executer.executer_arn}"
}

output "email_executer_invoke_arn" {
  value = "${module.email_executer.executer_invoke_arn}"
}

output "email_executer_qualified_arn" {
  value = "${module.email_executer.executer_qualified_arn}"
}

### sms executer ###

module "sms_executer" {
  source                      = "./lambda/terraform/executer"
  role_arn                    = "${local.executer_role}"
  sns_notifications_topic_arn = "${aws_sns_topic.notifications.arn}"
  create_package_command      = "${local.create_package_command}"
  runtime                     = "${var.LAMBDA_RUNTIME}"
  runtime_short               = "${local.runtime_short}"
  function_dir                = "${local.sms_executer_dir}/fn"
  package_dir                 = "${local.sms_executer_dir}"
  target                      = "sms"

  _env = {
    TWILIO_SID   = "${var.TWILIO_SID}"
    TWILIO_TOKEN = "${var.TWILIO_TOKEN}"
    TWILIO_FROM  = "${var.TWILIO_FROM}"
  }
}

output "sms_executer_arn" {
  value = "${module.sms_executer.executer_arn}"
}

output "sms_executer_invoke_arn" {
  value = "${module.sms_executer.executer_invoke_arn}"
}

output "sms_executer_qualified_arn" {
  value = "${module.sms_executer.executer_qualified_arn}"
}
