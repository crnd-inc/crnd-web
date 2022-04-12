CRND web tree colored field
===========================

.. |badge2| image:: https://img.shields.io/badge/license-LGPL--3-blue.png
    :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
    :alt: License: LGPL-3

.. |badge3| image:: https://img.shields.io/badge/powered%20by-yodoo.systems-00a09d.png
    :target: https://yodoo.systems

.. |badge5| image:: https://img.shields.io/badge/maintainer-CR&D-purple.png
    :target: https://crnd.pro/

.. |badge4| image:: https://img.shields.io/badge/docs-Website_Service_Desk-yellowgreen.png
    :target: https://crnd.pro/doc-bureaucrat-itsm/11.0/en/Website_Service_Desk_eng/


|badge2| |badge4| |badge5|

CRND Web Tree Colored Field widget provide to display tree cell with color from another field.

Read the `Website Service Desk <https://crnd.pro/doc-bureaucrat-itsm/11.0/en/Website_Service_Desk_eng/>`__ Module Guide for more information.

Usage
'''''

Simple example for internal usage:

    .. code:: py

        line_bg_color = fields.Char('rgba(R,G,B[,A])')
        line_label_color = fields.Char('rgba(R,G,B[,A])')

    .. code:: xml

        <record id="some_id" model="ir.ui.view">
            <field name="model">model.name</field>
            <field name="arch" type="xml">
                <tree>
                    <field name="colored_field"
                           options="{
                               'field_bg_color': 'line_bg_color',
                               'field_label_color': 'line_label_color'}"/>
                    <field name="line_bg_color" invisible="1"/>
                    <field name="line_label_color" invisible="1"/>
                </tree>
            </field>
        </record>

This module is part of the Bureaucrat ITSM project.
You can try it by the references below.

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
