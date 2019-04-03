Full Float Time Widget
======================

.. |badge2| image:: https://img.shields.io/badge/license-LGPL--3-blue.png
    :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
    :alt: License: LGPL-3

.. |badge3| image:: https://img.shields.io/badge/powered%20by-yodoo.systems-00a09d.png
    :target: https://yodoo.systems

.. |badge5| image:: https://img.shields.io/badge/maintainer-CR&D-purple.png
    :target: https://crnd.pro/

.. |badge6| image:: https://img.shields.io/badge/GitHub-CRnD_Web_Full_Float_Time_Widget-green.png
    :target: https://github.com/crnd-inc/crnd-web/tree/11.0/crnd_web_float_full_time_widget


|badge2| |badge5| |badge6|

Widget consists of two parts: Float Time Duration and Float Full Time.

1. Float Time Duration

    Widget implies: the integer part of a float represents seconds, the fractional part represents milliseconds.

    For example: 94225.22 => 94225 seconds and 22 milliseconds.

    Full template is: 0d 00:00:00.000 where Dd hh:mm:ss,msc are:

    * D - days, d - literal (days, can be translated), h - hours, m - minutes, s - seconds, msc - milliseconds.

    For example: 1d 02:10:25,220 to float 94225.22.

    Widget has the following options:

    * round_off - true, display template without milliseconds (false by default),

    * time_only - true, display template without days (false by default).

    For example:

    * round_off: false, time_only: false:

        edit mode:

        0d 00:00:00.000 (94225.22 to template 1d 02:10:25,220, 44439.999 to template 0d 12:20:39,999)

        normal mode:

        0d 00:00:00.000 (94225.22 to template 1d 02:10:25,220, 44439.999 to template 12:20:39,999)

    * round_off: true, time_only: false: 0d 00:00:00 (94225.22 to template 1d 02:10:25)

        edit mode:

        0d 00:00:00 (94225.22 to template 1d 02:10:25, 44439.999 to template 0d 12:20:39)

        normal mode:

        0d 00:00:00 (94225.22 to template 1d 02:10:25, 44439.999 to template 12:20:39)

    * round_off: true, time_only: true: 00:00:00 (94225.22 to template 26:10:25)

    * round_off: false, time_only: true: 00:00:00,000 (94225.22 to template 26:10:25,220)

    It simplifies operations with time.

2. Float Full Time

    Widget based on Float Time Duration widget.

    Represents a float as a twenty-four hours time.

    Widget restricts inappropriate input.

    Data can be from 00:00:00,000 to 23:59:59,999 and only positive value.

    It has the same options, but time_only always is true (except days).

    It can be used for marking the time of start or stop any process.

    It means that it will contains the number of seconds from the start of the day.

    For example:

    * 00:00:00,000 in float 0 (midnight)

    * start_at = 01:22:30,220 (in float 4950.22 seconds from midnight)

    * stop_at = 04:45:15,560 (in float 17115.56 seconds from midnight)

    It simplifies operations with time.

How it works:

Float Time Duration

1. Define the 'float' field in the model:

    .. code:: python

        duration = fields.Float()

2. Define the Float Time Duration widget on the form or tree view:

    .. code:: xml

        <field name="duration" widget="float_time_duration" options="{'round_off': True, 'time_only': True}"/>

Float Full Time

1. Define a field 'float' in the model:

    .. code:: python

        start_at = fields.Float()

2. Define a widget Float Full Time on the form or tree view:

    .. code:: xml

        <field name="start_at" widget="float_full_time" options="{'round_off': True}"/>

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

