"""
Subscribes to events sns topic and sends sms notifications to appropriate users
"""
import os
import boto3

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


def lambda_handler(event, context):
    print(f"event: {event}")
    return {}
