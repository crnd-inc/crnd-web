from odoo import models, fields, api
from odoo.exceptions import ValidationError


class CinemaBooking(models.Model):
    """Бронювання місця на сеанс"""
    _name = 'cinema.booking'
    _description = 'Cinema Booking'

    name = fields.Char(
        string='Booking Reference', required=True, default='New')
    session_id = fields.Many2one('cinema.session', required=True)
    seat_id = fields.Many2one('cinema.seat', required=True)
    customer_name = fields.Char()
    customer_phone = fields.Char()
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ], default='draft')

    @api.constrains('session_id', 'seat_id', 'state')
    def _check_seat_availability(self):
        for record in self:
            if record.state == 'confirmed':
                existing = self.search([
                    ('session_id', '=', record.session_id.id),
                    ('seat_id', '=', record.seat_id.id),
                    ('state', '=', 'confirmed'),
                    ('id', '!=', record.id),
                ])
                if existing:
                    raise ValidationError(self.env._(
                        'Seat %s is already booked for this session!',
                        record.seat_id.name,
                    ))

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = (
                    self.env['ir.sequence'].next_by_code('cinema.booking')
                    or 'New'
                )
        return super().create(vals_list)
