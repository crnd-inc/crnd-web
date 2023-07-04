from odoo import models, fields


class CarFuelType(models.Model):
    _name = 'car.rental.fuel_type'
    _description = 'Car Fuel Type'

    name = fields.Char(
        string='Fuel Type',
        required=True
    )
    car_ids = fields.One2many(
        comodel_name='car.rental.car',
        inverse_name='fuel_type_id',
        string='Cars'
    )
