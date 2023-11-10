import json
from odoo import models, fields, api


class TestMapView(models.Model):
    _name = 'test.map.view'

    name = fields.Char()
    latitude = fields.Float(digits=(10, 7))
    longitude = fields.Float(digits=(10, 7))

    point_draggable_json = fields.Char(
        compute='_compute_point_draggable_json',
        inverse='_inverse_point_draggable_json')
    point_readonly_json = fields.Char(
        compute='_compute_point_readonly_json')

    point_simple_json = fields.Char(readonly=False)

    @api.depends('latitude', 'longitude')
    def _compute_point_draggable_json(self):
        for rec in self:
            if rec.latitude and rec.longitude:
                rec.point_draggable_json = json.dumps({
                    'lat': round(rec.latitude, 5),
                    'lng': round(rec.longitude, 5)
                }, ensure_ascii=False)
            else:
                rec.point_draggable_json = False

    def _inverse_point_draggable_json(self):
        for rec in self:
            geolocation = json.loads(rec.point_draggable_json)
            rec.latitude = geolocation['lat']
            rec.longitude = geolocation['lng']

    @api.depends('latitude', 'longitude')
    def _compute_point_readonly_json(self):
        for rec in self:
            if rec.latitude and rec.longitude:
                rec.point_readonly_json = json.dumps({
                    'lat': round(rec.latitude, 5),
                    'lng': round(rec.longitude, 5)
                }, ensure_ascii=False)
            else:
                rec.point_readonly_json = False
