from odoo import models, fields


class Floor(models.Model):
    """
    Модель Поверх (Floor)
    Використовує plan.view.mixin для відображення плану поверху
    """
    _name = 'building.floor'
    _description = 'Building Floor'
    _inherit = 'plan.view.mixin'
    _order = 'sequence, name'

    name = fields.Char(
        string='Floor Name',
        required=True,
        help='e.g., Ground Floor, 1st Floor, 2nd Floor'
    )
    sequence = fields.Integer(default=10)

    building_name = fields.Char(
        string='Building',
        help='Building name'
    )

    floor_number = fields.Integer(
        help='Floor number (0 = Ground, 1 = 1st, etc.)'
    )

    total_area = fields.Float(
        string='Total Area (m²)',
        compute='_compute_total_area',
        store=True
    )

    room_ids = fields.One2many(
        'building.room',
        'floor_id',
        string='Rooms'
    )
    room_count = fields.Integer(
        compute='_compute_room_count'
    )

    notes = fields.Text()

    def _compute_total_area(self):
        """Обчислити загальну площу з полігонів"""
        for record in self:
            total = sum(record.plan_polygon_ids.mapped('area_meters'))
            record.total_area = total

    def _compute_room_count(self):
        """Підрахувати кількість приміщень"""
        for record in self:
            record.room_count = len(record.room_ids)

    def get_plan_related_objects(self):
        self.ensure_one()
        return [
            {
                'id': room.id,
                'name': room.name,
                'model': 'building.room',
                'roomNumber': room.room_number or False,
                'roomType': room.room_type or False,
            }
            for room in self.room_ids
        ]

    def action_view_rooms(self):
        """Відкрити список приміщень"""
        self.ensure_one()
        return {
            'name': f'{self.name} - Rooms',
            'type': 'ir.actions.act_window',
            'res_model': 'building.room',
            'view_mode': 'list,form',
            'domain': [('floor_id', '=', self.id)],
            'context': {'default_floor_id': self.id},
        }
