##################
### VALIDATORS ###
##################

### tasks validator ###

module "tasks_validator" {
  source     = "./lambda/tasks-validator"
  role_arn = "FAKE_ROLE_ARN"
  stream_arn = "${module.tasks_table.stream_arn}"
}

output "tasks_validator_arn" {
  value = "${module.tasks_validator.tasks_validator_arn}"
}

output "tasks_validator_invoke_arn" {
  value = "${module.tasks_validator.tasks_validator_invoke_arn}"
}

output "tasks_validator_qualified_arn" {
  value = "${module.tasks_validator.tasks_validator_qualified_arn}"
}

##################
### EXECUTERS ####
##################

### email executer ###

module "email_executer" {
  source               = "./lambda/email-executer"
  role_arn             = "FAKE_ROLE_ARN"
  sns_notifications_topic_arn = "${aws_sns_topic.notifications.arn}"
  sendgrid_key         = "${var.SENDGRID_KEY}"
  local_email = "${var.LOCAL_EMAIL}"
}

output "email_executer_arn" {
  value = "${module.email_executer.email_executer_arn}"
}

output "email_executer_invoke_arn" {
  value = "${module.email_executer.email_executer_invoke_arn}"
}

output "email_executer_qualified_arn" {
  value = "${module.email_executer.email_executer_qualified_arn}"
}
