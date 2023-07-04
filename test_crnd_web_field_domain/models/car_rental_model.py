from odoo import models, fields


class CarModel(models.Model):
    _name = 'car.rental.model'
    _description = 'Car Model'

    name = fields.Char(
        string='Model Name',
        required=True
    )
    brand_id = fields.Many2one(
        comodel_name='car.rental.brand',
        string='Brand',
        required=True
    )
    car_ids = fields.One2many(
        comodel_name='car.rental.car',
        inverse_name='model_id',
        string='Cars'
    )
