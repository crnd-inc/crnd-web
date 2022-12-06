def str2bool(value, default=None):
    """ Convert str value to boolean value.

        If value could be parsed ('true' or 'false') then
        converted value will be returned.
        If value could not be parsed, default value will be returned.

        :param str value: value to convert to boolean
        :param bool default: Default value
        :return bool: value converted to value
    """
    if value is None:
        return default

    if value is True or value is False:
        return value

    val = value.lower()

    if val == 'true':
        return True
    if val == 'false':
        return False

    return default
