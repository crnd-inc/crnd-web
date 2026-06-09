from odoo import models, fields, api


class CinemaSession(models.Model):
    """Сеанс показу фільму"""
    _name = 'cinema.session'
    _description = 'Cinema Session'

    name = fields.Char(string='Session Name', required=True)
    movie_name = fields.Char(string='Movie Name', required=True)
    hall_id = fields.Many2one('cinema.hall', string='Hall', required=True)
    start_time = fields.Datetime(string='Start Time', required=True)
    end_time = fields.Datetime(string='End Time')
    price = fields.Float(string='Ticket Price')

    # Relations
    booking_ids = fields.One2many(
        'cinema.booking',
        'session_id',
        string='Bookings'
    )
    available_seats = fields.Integer(
        string='Available Seats',
        compute='_compute_available_seats'
    )

    @api.depends('booking_ids', 'booking_ids.state', 'hall_id.seat_ids')
    def _compute_available_seats(self):
        for record in self:
            total_seats = len(record.hall_id.seat_ids)
            booked_seats = len(
                record.booking_ids.filtered(
                    lambda b: b.state == 'confirmed'
                )
            )
            record.available_seats = total_seats - booked_seats

    def action_open_booking(self):
        """Відкрити форму бронювання місць для сеансу"""
        self.ensure_one()
        if not self.hall_id:
            return False

        return {
            'name': f'Бронювання: {self.name}',
            'res_model': 'cinema.hall',
            'type': 'ir.actions.act_window',
            'views': [(False, 'plan')],
            'view_mode': 'plan',
            'res_id': self.hall_id.id,
            'target': 'current',
            'context': {
                'booking_mode': True,
                'booking_model': 'cinema.booking',
                'booking_related_field': 'session_id',
                'booking_related_id': self.id,
                'booking_object_field': 'seat_id',
                'booking_state_field': 'state',
                'booking_state_value': 'confirmed',
                'booking_customer_field': 'customer_name',
                'session_name': self.name,
            },
        }
