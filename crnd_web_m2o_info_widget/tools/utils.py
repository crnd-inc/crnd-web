def helper_get_many2one_info_data(record, field_names):
    """ Prepare field's info for m2o_info widget

        :param RecordSet record: recordset (with single record)
            to get info from.
        :param list[str] field_names: List of names of fields to get info for
        :return list[dict]: List of dictionaries with info on each field.

        Retruned dictionary contains follosing fields:
            - name - the technical name of the field
            - string - the label of the field
            - value - the value of the field in record
    """
    record.ensure_one()
    res = []
    for field_name in field_names:
        field = record._fields.get(field_name)
        if not field:
            continue
        res += [{
            'value': record[field_name],
            'string': field.get_description(
                record.env)['string'],
            'name': field_name,
        }]
    return res
