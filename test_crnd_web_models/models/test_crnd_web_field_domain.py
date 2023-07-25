from odoo import models, fields


class CarRental(models.Model):
    _name = 'test.car.rental'
    _description = 'Car Rental'

    customer_id = fields.Many2one(
        comodel_name='res.partner',
        string='Customer',
        required=True
    )
    car_id = fields.Many2one(
        comodel_name='test.car.rental.car',
        string='Car',
        required=True
    )
    car_id_field_domain = fields.Char()

class CarBrand(models.Model):
    _name = 'test.car.rental.brand'
    _description = 'Car Brand'

    name = fields.Char(
        string='Brand Name',
        required=True)
    car_ids = fields.One2many(
        comodel_name='test.car.rental.car',
        inverse_name='brand_id',
        string='Cars'
    )

class CarModel(models.Model):
    _name = 'test.car.rental.model'
    _description = 'Car Model'

    name = fields.Char(
        string='Model Name',
        required=True
    )
    brand_id = fields.Many2one(
        comodel_name='test.car.rental.brand',
        string='Brand',
        required=True
    )
    car_ids = fields.One2many(
        comodel_name='test.car.rental.car',
        inverse_name='model_id',
        string='Cars'
    )

class Car(models.Model):
    _name = 'test.car.rental.car'
    _description = 'Car'

    name = fields.Char(
        string='Car Name',
        required=True)
    brand_id = fields.Many2one(
        comodel_name='test.car.rental.brand',
        string='Brand',
        required=True)
    model_id = fields.Many2one(
        comodel_name='test.car.rental.model',
        string='Model',
        required=True
    )
    brand_id_field_domain = fields.Char()
