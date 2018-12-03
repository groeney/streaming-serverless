resource "aws_sns_topic" "notifications" {
  name = "notifications"
  display_name = "Notifications"
}

output "notifications_topic_arn" {
  value = "${aws_sns_topic.notifications.arn}"
}
