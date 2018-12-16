import os
import re
from yaml import load
import json

EVENTS = load(open("./events.yml"))


def create_py_compliant_event(event):
    original_variables = event.get("variables")

    old_values = ["$"]
    old_values.extend(original_variables)

    new_values = [""]
    new_values.extend([_convert_camel_to_underscore(x) for x in original_variables])

    py_compliant_event_str = _multi_replace(str(event), old_values, new_values)

    return eval(py_compliant_event_str)


def create_sns_params(event):
    notifications = {} if not event else _create_notification_params(event)
    return (
        {}
        if not notifications
        else dict(Message=json.dumps(notifications), MessageStructure="json")
    )


def handle_validator_results(sns, sns_params, topic_name):
    return (
        "Not a valid event"
        if not sns_params
        else _publish_to_topic(sns, sns_params, topic_name)
    )


def interpolate_vars(event, **resource_data):
    variable_map = _handle_variables(event, **resource_data)
    event["variable_map"] = variable_map
    notifications = event.get("notifications")
    for medium, config in notifications.items():
        assert isinstance(config, dict)
        notifications[medium] = {
            attr_key: attr_val.format(**variable_map)
            for attr_key, attr_val in config.items()
        }
    return event


def parse_validator_method(event_name):
    return f"validate_{event_name.lower()}"


""" Methods to be used internally within this module"""


def _convert_camel_to_underscore(key):
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", key)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


def _create_notification_params(event):
    notifications = event.get("notifications")
    variable_map = event.get("variable_map")

    assert isinstance(notifications, dict)
    assert isinstance(variable_map, dict)

    for key in notifications.keys():
        notifications[key]["to"] = variable_map.get(f"{key}_to")
        notifications[key][
            "body"
        ] += f". Sent from my {os.environ['AWS_LAMBDA_FUNCTION_NAME']}!"

    return {"default": dict(notifications=notifications)}


def _get_topic_arn(sns, topic_name):
    topics = sns.list_topics().get("Topics")
    return next(
        topic["TopicArn"]
        for topic in topics
        if _get_topic_name_from_ARN(topic.get("TopicArn")) == topic_name
    )


def _get_topic_name_from_ARN(arn):
    """
  Returns undefined if arn is invalid
  Example
  arn: "arn:aws:sns:us-east-1:123456789012:notifications"
  """
    return arn.split(":")[-1]


def _handle_variables(event, **resource_data):
    def get_subject_task(**kwargs):
        return kwargs.get("new_task") or kwargs.get("old_task") or dict()

    mappings = dict(
        email_to=lambda **kwargs: get_subject_task(**kwargs).get("assignee_email"),
        task_title=lambda **kwargs: get_subject_task(**kwargs).get("title"),
    )
    return {key: mappings[key](**resource_data) for key in event.get("variables")}


def _multi_replace(s, old_values, new_values):
    """
    Given a string and replace_me with_me lists, it returns the replaced string.
    :param str string: string to execute replacements on
    :param old_values old values to be replaced
    :param new_values values to be substituted in place of old values
    :rtype: str
    """
    old_values = [re.escape(v) for v in old_values]
    replacements = dict(zip(old_values, new_values))
    pattern = re.compile("|".join(replacements.keys()))
    s = pattern.sub(lambda match: replacements[re.escape(match.group())], s)
    return s


def _publish_to_topic(sns, sns_params, topic_name):
    topic_arn = _get_topic_arn(sns, topic_name)
    return sns.publish(TopicArn=topic_arn, **sns_params)
