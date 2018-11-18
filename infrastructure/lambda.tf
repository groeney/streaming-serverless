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
