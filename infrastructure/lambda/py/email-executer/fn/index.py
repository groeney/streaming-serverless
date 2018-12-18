"""
Subscribes to events sns topic and sends email notifications to appropriate users
"""
import os
import boto3
from ast import literal_eval
import sendgrid
from sendgrid.helpers.mail import Email, Content, Mail, SandBoxMode

FUNCTION_NAME = os.environ["AWS_LAMBDA_FUNCTION_NAME"]
print(f"Loading function {FUNCTION_NAME} with {os.environ}")

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
    try:
        message = event["Records"][0]["Sns"]["Message"]
        notifications = literal_eval(message)["default"]["notifications"]
    except:
        notifications = dict()

    assert (
        notifications
    ), f"SNS Message was malformed because notifications is empty or not initialized in local scope: {notifications}"

    return email_handler(notifications)


def email_handler(notifications):
    email_notification = notifications.get("email")
    if not email_notification:
        return f"No email notification defined in {notifications}"

    response = email_transport(email_notification)
    return f"{response.status_code} {response.headers} {response.body}"


def email_transport(email_notification):
    sg = sendgrid.SendGridAPIClient(apikey=os.environ.get("SENDGRID_KEY"))
    mail = Mail(**create_email_params(email_notification))
    return sg.client.mail.send.post(request_body=mail.get())


def create_email_params(email_notification):
    from_email = Email(
        email="hello@streaming-serverless.io", name="Steaming Serverless"
    )
    to_email = Email(email=email_notification.get("to"))
    content = Content("text/plain", email_notification.get("body"))
    subject = email_notification.get("subject")
    return dict(
        from_email=from_email, to_email=to_email, content=content, subject=subject
    )
