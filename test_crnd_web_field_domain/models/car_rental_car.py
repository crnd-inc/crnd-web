from odoo import models, fields


class Car(models.Model):
    _name = 'car.rental.car'
    _description = 'Car'

    name = fields.Char(
        string='Car Name',
        required=True)
    brand_id = fields.Many2one(
        comodel_name='car.rental.brand',
        string='Brand',
        required=True)
    model_id = fields.Many2one(
        comodel_name='car.rental.model',
        string='Model',
        required=True
    )
    fuel_type_id = fields.Many2one(
        comodel_name='car.rental.fuel_type',
        string='Fuel Type',
        required=True
    )
    transmission_id = fields.Many2one(
        comodel_name='car.rental.transmission',
        string='Transmission'
    )
    year = fields.Char()
    color = fields.Char()
    rental_price = fields.Float()
    rental_ids = fields.One2many(
        comodel_name='car.rental',
        inverse_name='car_id'
        )
    brand_id_field_domain = fields.Char()
