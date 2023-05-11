CRND Web View Refresh Timed
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

CRND Web View Refresh Timed is designed to automatically reload the view (tree, form and kanban)
after a certain period of time, if the "crnd-refresh-every-XT" class is specified in the view definition,
where "X" is an integer, a time interval and "T" is the dimension of the time interval ("s" - seconds, "m" - minutes)

For example, in xml definition add class to tag:

    .. code:: xml

        <record model="ir.ui.view" id="view_your_model_kanban">
            <field name="model">your.model</field>
            <field name="arch" type="xml">
                <kanban class="crnd-refresh-every-10s">
                    <field name="name"/>
                    <field name="code"/>
                </kanban>
            </field>
        </record>

        <record model="ir.ui.view" id="view_your_model_form">
            <field name="model">your.model</field>
            <field name="arch" type="xml">
                <form class="crnd-refresh-every-2m">
                    <field name="name"/>
                    <field name="code"/>
                </form>
            </field>
        </record>

        <record model="ir.ui.view" id="view_your_model_tree">
            <field name="model">your.model</field>
            <field name="arch" type="xml">
                <tree class="crnd-refresh-every-25s">
                    <field name="name"/>
                    <field name="code"/>
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
