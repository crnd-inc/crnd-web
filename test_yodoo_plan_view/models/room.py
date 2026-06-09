from odoo import models, fields, api


class Room(models.Model):
    """
    Модель Приміщення (Room)
    Багато приміщень на одному поверсі
    """
    _name = 'building.room'
    _description = 'Building Room'
    _order = 'floor_id, room_number'

    name = fields.Char(
        string='Room Name',
        required=True,
        help='e.g., Office 101, Conference Room A'
    )

    room_number = fields.Char(
        string='Room Number',
        help='Room number or code'
    )

    floor_id = fields.Many2one(
        'building.floor',
        string='Floor',
        required=True,
        ondelete='cascade'
    )

    room_type = fields.Selection([
        ('office', 'Office'),
        ('meeting', 'Meeting Room'),
        ('kitchen', 'Kitchen'),
        ('bathroom', 'Bathroom'),
        ('storage', 'Storage'),
        ('corridor', 'Corridor'),
        ('other', 'Other'),
    ], string='Room Type', default='office')

    area = fields.Float(
        string='Area (m²)',
        help='Room area in square meters'
    )

    capacity = fields.Integer(
        string='Capacity',
        help='Maximum number of people'
    )

    notes = fields.Text(string='Notes')

    # Зв'язок з полігоном на плані
    polygon_id = fields.Many2one(
        'plan.polygon',
        string='Plan Polygon',
        help='Polygon representing this room on floor plan'
    )

    @api.model
    def create(self, vals):
        """При створенні приміщення створити полігон на плані"""
        room = super().create(vals)

        # Якщо є floor_id, можна автоматично створити порожній полігон
        if room.floor_id:
            # plan_id тепер Reference поле - формат: 'model,id'
            plan_reference = f'building.floor,{room.floor_id.id}'
            polygon = self.env['plan.polygon'].create({
                'plan_id': plan_reference,
                'points': '[]',  # Порожній, буде заповнено в UI
                'related_model': 'building.room',
                'related_id': room.id,
            })
            room.polygon_id = polygon.id

        return room

    def action_open_on_plan(self):
        """Відкрити план поверху з виділенням цього приміщення"""
        self.ensure_one()
        if not self.floor_id:
            return False

        return {
            'name': f'{self.floor_id.name} - Plan',
            'res_model': 'building.floor',
            'type': 'ir.actions.act_window',
            'views': [(False, 'plan')],
            'view_mode': 'plan',
            'res_id': self.floor_id.id,
            'target': 'current',
            'context': {
                'selected_polygon_id': self.polygon_id.id if self.polygon_id else None,
            },
        }
