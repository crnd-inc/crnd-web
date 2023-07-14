from odoo import models, fields


class TestMapView(models.Model):
    _name = 'test.map.view'

    name = fields.Char()
    latitude = fields.Float(digits=(10, 7))
    longitude = fields.Float(digits=(10, 7))
