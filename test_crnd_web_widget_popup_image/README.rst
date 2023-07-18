CRnD Widget Popup Image
=======================

.. |badge2| image:: https://img.shields.io/badge/license-LGPL--3-blue.png
    :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
    :alt: License: LGPL-3

.. |badge3| image:: https://img.shields.io/badge/powered%20by-yodoo.systems-00a09d.png
    :target: https://yodoo.systems
    
.. |badge5| image:: https://img.shields.io/badge/maintainer-CR&D-purple.png
    :target: https://crnd.pro/

.. |badge6| image:: https://img.shields.io/badge/GitHub-CRnD_Widget_Popup_Image-green.png
    :target: https://github.com/crnd-inc/crnd-web/tree/11.0/crnd_web_widget_popup_image
    

|badge2| |badge5| |badge6|

Widget allows you to popup images from the binary fields. It is available on the form and tree views.

How it works:

1. Define a widget on the form view:

    .. code:: xml

        <field name="image_test" widget="image_popup" class="oe_avatar"/>

2. You can also define a widget on the tree view:

    .. code:: xml

        <field name="image_test" widget="image_popup" class="ot_image"/>

  The `ot_image` CSS class resizes the image for the tree view (you can use your own class).

In the edit mode it works as a standard image widget.


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
