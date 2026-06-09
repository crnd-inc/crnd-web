from odoo import models, fields


class CinemaSeat(models.Model):
    """Місце в кінозалі"""
    _name = 'cinema.seat'
    _description = 'Cinema Seat'

    name = fields.Char(string='Seat Number', required=True)
    row = fields.Char()
    seat_number = fields.Integer(string='Seat Number in Row')
    hall_id = fields.Many2one(
        'cinema.hall', required=True, ondelete='cascade')
    seat_type = fields.Selection([
        ('standard', 'Standard'),
        ('vip', 'VIP'),
        ('disabled', 'For Disabled'),
    ], default='standard')

    polygon_id = fields.Many2one('plan.polygon', string='Plan Polygon')

    booking_ids = fields.One2many(
        'cinema.booking', 'seat_id', string='Bookings')

    def action_open_on_plan(self):
        """Відкрити план залу з виділенням цього місця"""
        self.ensure_one()
        if not self.hall_id:
            return False

        return {
            'name': f'{self.hall_id.name} - План залу',
            'res_model': 'cinema.hall',
            'type': 'ir.actions.act_window',
            'views': [(False, 'plan')],
            'view_mode': 'plan',
            'res_id': self.hall_id.id,
            'target': 'current',
            'context': {
                'selected_polygon_id': (
                    self.polygon_id.id if self.polygon_id else None),
            },
        }
