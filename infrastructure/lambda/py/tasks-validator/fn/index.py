"""
Handles the following event types: INSERT, MODIFY and REMOVE for Tasks table DynamoDB Stream.
"""
import os
import boto3
from validator_helpers import (
    EVENTS,
    parse_validator_method,
    create_py_compliant_event,
    create_sns_params,
    handle_validator_results,
    interpolate_vars,
)
from helpers import parse_ddb_node

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
    record = event.get("Records", [])[0]

    assert isinstance(record, dict)

    validator_method_name = parse_validator_method(record["eventName"])
    sns_params = globals()[validator_method_name](record["dynamodb"])
    try:
        res = handle_validator_results(sns, sns_params, "notifications")
        return f"{FUNCTION_NAME} succeeded: {res}"
    except Exception as e:
        return f"{FUNCTION_NAME} failed with {e} on record: {record}"


def validate_insert(data):
    event = dict()
    events = EVENTS["Tasks"]["INSERT"]
    new_task = parse_ddb_node(data.get("NewImage"))
    var_data = dict(new_task=new_task)

    assert isinstance(events, list)
    assert isinstance(new_task, dict)

    """ --- START event business logic --- """

    event = create_py_compliant_event(events[0])

    event = interpolate_vars(event, **var_data)

    """ --- END event business logic --- """
    return create_sns_params(event)


def validate_modify(data):
    event = dict()
    events = EVENTS["Tasks"]["MODIFY"]
    new_task = parse_ddb_node(data.get("NewImage"))
    old_task = parse_ddb_node(data.get("OldImage"))
    var_data = dict(new_task=new_task, old_task=old_task)

    assert isinstance(events, list)
    assert isinstance(new_task, dict)
    assert isinstance(old_task, dict)

    """ --- START event business logic --- """
    if new_task.get("completed") and not old_task.get("completed"):
        event = create_py_compliant_event(events[0])
        event = interpolate_vars(event, **var_data)

    if not (new_task.get("title") == old_task.get("title")):
        event = create_py_compliant_event(events[1])
        event = interpolate_vars(event, **var_data)

    """ --- END event business logic --- """

    return create_sns_params(event)


def validate_remove(data):
    event = dict()
    events = EVENTS["Tasks"]["REMOVE"]
    old_task = parse_ddb_node(data.get("OldImage"))
    var_data = dict(old_task=old_task)

    assert isinstance(events, list)
    assert isinstance(old_task, dict)

    """ --- START event business logic --- """

    event = create_py_compliant_event(events[0])
    event = interpolate_vars(event, **var_data)

    """ --- END event business logic --- """

    return create_sns_params(event)
