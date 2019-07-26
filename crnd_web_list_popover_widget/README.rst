List Popover Widget
===================

Widget allows you to get text-overflow: ellipsis and popover for long text fields on tree view.

Widget has the following options:

    * max_width - sting, max-width for field view (default 300px),

    * line_clamp - string, number of multi strings for field view (default 1).

        NOTE: line_clamp option is not work for IE, it always will be 1.

How it works:

1. Define a widget on the list view:

    .. code:: xml

        <field name="test_description" string="Description"
               widget="dynamic_popover"
               options="{'max_width': '350px', 'line_clamp': '3'}"/>

For common user agents:

![Alt Text](static/description/ellipsis_for_common_ua.png)

![Alt Text](static/description/popover_for_common_ua.png)

For IE user agents:

![Alt Text](static/description/ellipsis_for_IE_ua.png)

![Alt Text](static/description/popover_for_IE_ua.png)
