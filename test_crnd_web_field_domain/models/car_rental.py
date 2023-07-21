from odoo import models, fields, api


class CarRental(models.Model):
    _name = 'car.rental'
    _description = 'Car Rental'

    customer_id = fields.Many2one(
        comodel_name='res.partner',
        string='Customer',
        required=True
    )
    car_id = fields.Many2one(
        comodel_name='car.rental.car',
        string='Car',
        required=True
    )
    car_id_field_domain = fields.Char()
    rental_date = fields.Date(
        required=True
    )
    return_date = fields.Date(
        required=True
    )
    total_cost = fields.Float(
        compute='_compute_total_cost'
    )

    @api.depends('rental_date', 'return_date', 'car_id')
    def _compute_total_cost(self):
        for rental in self:
            if all([rental.return_date, rental.rental_date]):
                days_rented = (rental.return_date - rental.rental_date).days
                rental.total_cost = rental.car_id.rental_price * days_rented
            else:
                rental.total_cost = 0
