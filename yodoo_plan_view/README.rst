Yodoo Plan View
===============

Interactive floor plan visualization for Odoo 18.

Features
========

* **Interactive Floor Plans**: Display raster (PNG/JPG) or vector (SVG) backgrounds
* **Polygon Drawing**: Draw and edit polygons to represent rooms, zones, or areas
* **Record Linking**: Link polygons to any Odoo model records
* **Measurements**: Calculate areas and distances with scale calibration
* **Zoom & Pan**: Smooth zoom controls with Ctrl+Scroll support
* **Grid System**: Optional snap-to-grid with customizable size
* **Point "0"**: Origin marker for coordinate reference
* **Ruler Tool**: Calibrate scale by measuring known distances

Usage
=====

1. Add ``plan.view.mixin`` to your model
2. Define a plan view in XML
3. Use the plan view to visualize and edit floor plans

Example
-------

.. code-block:: python

    class Floor(models.Model):
        _name = 'building.floor'
        _inherit = 'plan.view.mixin'
        
        name = fields.Char(required=True)
        building_id = fields.Many2one('building', required=True)

.. code-block:: xml

    <record id="view_floor_plan" model="ir.ui.view">
        <field name="name">building.floor.plan</field>
        <field name="model">building.floor</field>
        <field name="arch" type="xml">
            <plan>
                <field name="image"/>
                <field name="scale_coefficient"/>
            </plan>
        </field>
    </record>

Maintainer
==========

This module is maintained by the Center of Research & Development company.

For any questions contact us at info@crnd.pro
