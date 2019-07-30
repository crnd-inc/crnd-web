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

Widget allows you to get text-overflow: ellipsis and popover for long text fields on tree view.

Widget has the following options:

    * max_width - string, max-width for field view (default 300px),

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


Launch your own ITSM system in 60 seconds:
''''''''''''''''''''''''''''''''''''''''''

Create your own `Bureaucrat ITSM <https://yodoo.systems/saas/template/itsm-16>`__ database

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