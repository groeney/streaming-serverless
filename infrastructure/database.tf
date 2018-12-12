module "tasks_table" {
  source        = "./dynamodb/tables/tasks"
  name          = "Tasks"
  hash_key      = "task_id"
  hash_key_type = "S"
}

output "tasks_table_name" {
  value = "${module.tasks_table.table_name}"
}

output "tasks_table_stream_arn" {
  value = "${module.tasks_table.stream_arn}"
}
