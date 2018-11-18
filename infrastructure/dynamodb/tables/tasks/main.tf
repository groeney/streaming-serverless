variable "name" {}
variable "hash_key" {}
variable "hash_key_type" {}

resource "aws_dynamodb_table" "table" {
  name = "${var.name}"
  read_capacity = 5
  write_capacity = 5
  hash_key = "${var.hash_key}"
  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "${var.hash_key}"
    type = "${var.hash_key_type}"
  }

  lifecycle {
    ignore_changes = [
      "read_capacity",
      "write_capacity"
    ]
  }
}

output "table_name" {
  value = "${aws_dynamodb_table.table.name}"
}

output "stream_arn" {
  value = "${aws_dynamodb_table.table.stream_arn}"
}
