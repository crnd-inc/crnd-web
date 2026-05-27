Yodoo Time View — Test Data
============================

.. |badge_license| image:: https://img.shields.io/badge/licence-LGPL--3-blue.png
   :target: http://www.gnu.org/licenses/lgpl-3.0-standalone.html
   :alt: License: LGPL-3

|badge_license|

Demo and test data for the ``yodoo_time_view`` module.

Installs sample records, demo background periods, and time markers so that
Timeline and Gantt views can be explored and tested immediately after
installation without manually creating records.

Also serves as a reference implementation showing how to integrate a model
with ``timeline.mixin`` and ``gantt.mixin``, including:

* static ``_time_view_config`` class attribute
* dynamic ``_get_time_view_config()`` override (e.g. activating extra
  timestamp markers in debug mode)
* custom background period items via ``_get_custom_bg_items()``
* custom marker items via ``_get_custom_mk_items()``

Usage
-----

Install this module together with ``yodoo_time_view`` (demo data included).
Open **Time View Test → Records** to see the Timeline and Gantt views with
all features enabled.

Bug Tracker
-----------

Bugs are tracked on `GitHub Issues <https://github.com/crnd-inc/crnd-web/issues>`_.

Credits
-------

Authors
~~~~~~~

* Center of Research and Development

Maintainers
~~~~~~~~~~~

This module is maintained by `Center of Research and Development <https://crnd.pro>`_.
