"""
Subscribes to events sns topic and sends sms notifications to appropriate users
"""
import os
import boto3
from ast import literal_eval
from twilio.rest import Client

FUNCTION_NAME = os.environ["AWS_LAMBDA_FUNCTION_NAME"]
print(f"Loading function {FUNCTION_NAME}")

session = boto3.setup_default_session(
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    region_name=os.environ["AWS_REGION"],
)
sns = boto3.client(
    "sns", endpoint_url=f"http://{os.environ['LOCALSTACK_HOSTNAME']}:4575"
)

client = Client(os.environ.get("TWILIO_SID"), os.environ.get("TWILIO_TOKEN"))
from_ = os.environ.get("TWILIO_FROM")


def lambda_handler(event, context):
    print(f"event: {event}")
    try:
        message = event["Records"][0]["Sns"]["Message"]
        notifications = literal_eval(message)["default"]["notifications"]
    except:
        notifications = dict()

    assert (
        notifications
    ), f"SNS Message was malformed because notifications is empty or not initialized in local scope: {notifications}"

    return sms_handler(notifications)


def sms_handler(notifications):
    sms_notification = notifications.get("sms")
    if not sms_notification:
        return f"No sms notification defined in {notifications}"
    message = sms_transport(sms_notification)
    return message.sid


def sms_transport(sms_notification):
    to = sms_notification.get("to")
    body = sms_notification.get("body")
    return client.messages.create(to=to, body=body, from_=from_)
