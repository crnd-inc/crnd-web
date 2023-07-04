from odoo import models, fields


class CarBrand(models.Model):
    _name = 'car.rental.brand'
    _description = 'Car Brand'

    name = fields.Char(
        string='Brand Name',
        required=True)
    car_ids = fields.One2many(
        comodel_name='car.rental.car',
        inverse_name='brand_id',
        string='Cars'
    )
