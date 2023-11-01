CRND Web Widget Select Geolocation
==================================

.. |badge2| image:: https://img.shields.io/badge/license-LGPL--3-blue.png
    :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
    :alt: License: LGPL-3

.. |badge3| image:: https://img.shields.io/badge/powered%20by-yodoo.systems-00a09d.png
    :target: https://yodoo.systems

.. |badge5| image:: https://img.shields.io/badge/maintainer-CR&D-purple.png
    :target: https://crnd.pro/


|badge2| |badge5|

This addon adds a widget that allows you to select or view a geolocation on a map. Wdget has two reauired options:
'latitude_field' and 'longitude_field' and additional options 'readonly' and 'zoom'.
Fields defined in 'latitude_field', 'longitude_field', should be present in view definition

Usage
'''''

Example:

    .. code:: xml

        <record id="test_select_geolocation_form_view" model="ir.ui.view">
            <field name="model">model.name</field>
            <field name="arch" type="xml">
                <form>
                    <sheet>
                        <group>
                            <group>
                                <field name="name"/>
                                <field name="latitude"/>
                                <field name="longitude"/>
                                <field name="point" widget="select_geolocation" options="{'latitude_field': 'latitude', 'longitude_field': 'longitude', 'readonly': '1', 'zoom': 12}"/>
                            </group>

                            <group></group>

                        </group>

                    </sheet>

                </form>

            </field>

        </record>


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
