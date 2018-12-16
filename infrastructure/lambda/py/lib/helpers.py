def parse_ddb_node(node):
    data = dict({})
    data["M"] = node
    return _unmarshall_value(data)


def _unmarshall_value(node):
    if type(node) is not dict:
        return node

    for key, value in node.items():
        # S – String - return string
        # N – Number - return int or float (if includes '.')
        # B – Binary - not handled
        # BOOL – Boolean - return Bool
        # NULL – Null - return None
        # M – Map - return a dict
        # L – List - return a list
        # SS – String Set - not handled
        # NN – Number Set - not handled
        # BB – Binary Set - not handled
        key = key.lower()
        if key == "bool":
            return value
        if key == "null":
            return None
        if key == "s":
            return value
        if key == "n":
            if "." in str(value):
                return float(value)
            return int(value)
        if key in ["m", "l"]:
            if key == "m":
                data = {}
                for key1, value1 in value.items():
                    if key1.lower() == "l":
                        data = [_unmarshall_value(n) for n in value1]
                    else:
                        if type(value1) is not dict:
                            return _unmarshall_value(value)
                        data[key1] = _unmarshall_value(value1)
                return data
            data = []
            for item in value:
                data.append(_unmarshall_value(item))
            return data
