CRND Many2one Info Widget
=========================


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

CRND Web M2O widget provide to display additional info about field.

Read the `Website Service Desk <https://crnd.pro/doc-bureaucrat-itsm/11.0/en/Website_Service_Desk_eng/>`__ Module Guide for more information.

Usage
'''''

Simple example for internal usage:

    .. code:: xml

       <field name="widget_partner_id"
              placeholder="Partner..."
              widget="m2o_info"
              options="{
                  'info_fields': [
                      'name', 'commercial_company_name', 'website',
                      'email', 'phone', 'mobile']}"/>

Another example of usage, using method that have to return all needed info on destination model:

    .. code:: python

        class ResPartner(models.Model):
            _inherit = 'res.partner'

            def helper_many2one_info(self):
                self.ensure_one()
                res = []
                read_fields = [
                    'name', 'commercial_company_name', 'website',
                    'email', 'phone', 'mobile'
                ]
                for field_name in read_fields:
                    res += [{
                        'value': self[field_name],
                        'string': self._fields[field_name].get_description(
                            self.env)['string'],
                        'name': field_name,
                    }]
                return res

    .. code:: xml

        <field name="widget_partner_id"
              placeholder="Partner..."
              widget="m2o_info"
              options="{'info_method': 'helper_many2one_info'}"/>


Also, you can use simple helper function on python side to compute field info.
With this function, example above could be rewritten as:

    .. code:: python

        from odoo.addons.crnd_web_m2o_info_widget import helper_get_many2one_info_data

        class ResPartner(models.Model):
            _inherit = 'res.partner'

            def helper_many2one_info(self):
                return helper_get_many2one_info_data(self, [
                    'name', 'commercial_company_name', 'website',
                    'email', 'phone', 'mobile'
                ])


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
