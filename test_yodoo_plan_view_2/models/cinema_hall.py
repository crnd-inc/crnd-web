from odoo import models, fields, api


class CinemaHall(models.Model):
    """Кінозал з планом розміщення місць"""
    _name = 'cinema.hall'
    _description = 'Cinema Hall'
    _inherit = ['plan.view.mixin']

    name = fields.Char(string='Hall Name', required=True)
    capacity = fields.Integer(
        compute='_compute_capacity',
        store=True
    )

    # Relations
    seat_ids = fields.One2many('cinema.seat', 'hall_id', string='Seats')
    session_ids = fields.One2many(
        'cinema.session',
        'hall_id',
        string='Sessions'
    )

    @api.depends('seat_ids')
    def _compute_capacity(self):
        for record in self:
            record.capacity = len(record.seat_ids)

    def get_plan_related_objects(self):
        self.ensure_one()
        return [
            {
                'id': seat.id,
                'name': seat.name,
                'model': 'cinema.seat',
                'row': seat.row or False,
                'seatType': seat.seat_type or False,
            }
            for seat in self.seat_ids
        ]

    def action_open_plan_view(self):
        self.ensure_one()
        return {
            'name': f'План залу: {self.name}',
            'res_model': 'cinema.hall',
            'type': 'ir.actions.act_window',
            'views': [(False, 'plan')],
            'view_mode': 'plan',
            'res_id': self.id,
            'target': 'current',
        }
