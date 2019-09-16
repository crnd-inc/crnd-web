List Popover Widget
===================

.. |badge2| image:: https://img.shields.io/badge/license-LGPL--3-blue.png
    :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
    :alt: License: LGPL-3

.. |badge3| image:: https://img.shields.io/badge/powered%20by-yodoo.systems-00a09d.png
    :target: https://yodoo.systems

.. |badge5| image:: https://img.shields.io/badge/maintainer-CR&D-purple.png
    :target: https://crnd.pro/

.. |badge6| image:: https://img.shields.io/badge/GitHub-CRnD_Web_List_Popover_Widget-green.png
    :target: https://github.com/crnd-inc/crnd-web/tree/11.0/crnd_web_list_popover_widget


|badge2| |badge5| |badge6|

Widget allows you to get text-overflow: ellipsis and popover for long text, char or HTML fields on tree view.

For different type of field used different widgets:

    * char field: dynamic_popover_char,

    * text field: dynamic_popover_text,

    * HTML field: dynamic_popover_html.

Widget has the following options:

    * max_width - string, max-width for field view (default 300px),

    * popover_max_width - string, max-width for popover (default 276px),

    * animation - string, 'True' or 'False'. Specifies whether to add a CSS fade transition effect when opening and closing the popover (default 'False'),

    * placement - string, specifies the popover position (default "auto"):

        "top" - Popover on top

        "bottom" - Popover on bottom

        "left" - Popover on left

        "right" - Popover on right

        "auto" - Lets the browser decide the position of the popover,

    * line_clamp - string, number of multi strings for field view (default 1).

        NOTE: line_clamp option is not work for IE, it always will be 1.

How it works:

1. Define a widget on the list view:

For text field:

    .. code:: xml

        <field name="test_description_text" string="Description"
               widget="dynamic_popover_text"
               options="{'max_width': '350px', 'line_clamp': '3'}"/>

For char field:

    .. code:: xml

        <field name="test_description_char" string="Description"
               widget="dynamic_popover_char"
               options="{'max_width': '350px', 'line_clamp': '3'}"/>

For HTML field:

    .. code:: xml

        <field name="test_description_html" string="Description"
               widget="dynamic_popover_html"
               options="{'max_width': '350px', 'line_clamp': '3'}"/>

For common user agents:

![Alt Text](static/description/ellipsis_for_common_ua.png)

![Alt Text](static/description/popover_for_common_ua.png)

For IE user agents:

![Alt Text](static/description/ellipsis_for_IE_ua.png)

![Alt Text](static/description/popover_for_IE_ua.png)

For HTML fields:

![Alt Text](static/description/html_field.png)

Edit mode:

![Alt Text](static/description/edit_mode_1.png)

![Alt Text](static/description/edit_mode_2.png)

![Alt Text](static/description/edit_mode_3.png)

![Alt Text](static/description/edit_mode_4.png)


Launch your own ITSM system in 60 seconds:
''''''''''''''''''''''''''''''''''''''''''

Create your own `Bureaucrat ITSM <https://yodoo.systems/saas/template/bureaucrat-itsm-demo-data-95>`__ database

|badge3|

Bug Tracker
===========

Bugs are tracked on `https://crnd.pro/requests <https://crnd.pro/requests>`_.
In case of trouble, please report there.


Maintainer
''''''''''
.. image:: https://crnd.pro/web/image/3699/300x140/crnd.png

Our web site: https://crnd.pro/

This module is maintained by the Center of Research & Development company.

We can provide you further Odoo Support, Odoo implementation, Odoo customization, Odoo 3rd Party development and integration software, consulting services. Our main goal is to provide the best quality product for you.

For any questions `contact us <mailto:info@crnd.pro>`__.
