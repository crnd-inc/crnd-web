from odoo import models, fields, api
from odoo.exceptions import ValidationError


class CinemaBooking(models.Model):
    """Бронювання місця на сеанс"""
    _name = 'cinema.booking'
    _description = 'Cinema Booking'

    name = fields.Char(string='Booking Reference', required=True, default='New')
    session_id = fields.Many2one('cinema.session', string='Session', required=True)
    seat_id = fields.Many2one('cinema.seat', string='Seat', required=True)
    customer_name = fields.Char(string='Customer Name')
    customer_phone = fields.Char(string='Customer Phone')
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ], string='State', default='draft')
    
    @api.constrains('session_id', 'seat_id', 'state')
    def _check_seat_availability(self):
        for record in self:
            if record.state == 'confirmed':
                # Check if seat is already booked for this session
                existing = self.search([
                    ('session_id', '=', record.session_id.id),
                    ('seat_id', '=', record.seat_id.id),
                    ('state', '=', 'confirmed'),
                    ('id', '!=', record.id),
                ])
                if existing:
                    raise ValidationError(f'Seat {record.seat_id.name} is already booked for this session!')
    
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('cinema.booking') or 'New'
        return super().create(vals_list)
