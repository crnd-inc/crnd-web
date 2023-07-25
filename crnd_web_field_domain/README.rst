CRND Web Field Domain
=====================
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

CRND Web Field Domain enables the integration of custom domain fields with Odoo domains. By utilizing this feature, users can define and implement a custom text field within a model, which can serve as an additional domain for other fields.

To begin using the field domain functionality, follow these steps:

Step 1: Create the text field in the model within the desired model, add a text field that will act as the custom domain field. This field will hold the domain filter criteria in string format.

Example: ``author_domain_field = fields.Char(default="[('is_company', '=', False)]", compute='_compute_author_domain_field')``

Step 2: Define the field in the view options
Next, specify this custom domain field in the view options to associate it with the target field. This will link the custom domain to the particular field, enabling the domain filtering based on the custom field's criteria.

Example: ``<field name="author_id" options="{'domain_field': 'author_domain_field'}"/>``

This module is part of the Bureaucrat ITSM project.
You can try it by the references below.

Launch your own ITSM system in 60 seconds:
''''''''''''''''''''''''''''''''''''''''''

Create your own `Bureaucrat ITSM <https://yodoo.systems/saas/templates>`__ database

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
