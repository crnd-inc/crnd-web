from odoo import models, fields


class CarTransmission(models.Model):
    _name = 'car.rental.transmission'
    _description = 'Car Transmission'

    name = fields.Char(
        string='Transmission Type',
        required=True
    )
    car_ids = fields.One2many(
        comodel_name='car.rental.car',
        inverse_name='transmission_id',
        string='Cars'
    )
