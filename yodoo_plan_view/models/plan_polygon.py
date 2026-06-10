import logging
import json

from odoo import fields, models, api

_logger = logging.getLogger(__name__)


class PlanPolygon(models.Model):
    """
    Модель для зберігання полігонів на плані.
    Кожен полігон може бути прив'язаний до запису іншої моделі.
    """
    _name = 'plan.polygon'
    _description = 'Plan Polygon'
    _order = 'sequence, id'

    name = fields.Char(
        compute='_compute_name',
        store=True
    )
    sequence = fields.Integer(default=10)

    # Прив'язка до плану
    plan_id = fields.Reference(
        selection='_selection_plan_models',
        required=True,
        index=True
    )
    plan_model = fields.Char(
        compute='_compute_plan_model',
        store=True
    )

    # Координати полігону (JSON array of [x, y] points)
    points = fields.Text(
        required=True,
        help='JSON array of polygon points: [[x1,y1], [x2,y2], ...]'
    )

    # Центроїд (для відображення інформації)
    centroid_x = fields.Float(
        compute='_compute_centroid',
        store=True
    )
    centroid_y = fields.Float(
        compute='_compute_centroid',
        store=True
    )

    # Площа (обчислюється автоматично)
    area_pixels = fields.Float(
        string='Area (pixels²)',
        compute='_compute_area',
        store=True
    )
    area_meters = fields.Float(
        string='Area (m²)',
        compute='_compute_area_meters',
        store=True
    )

    # Прив'язка до запису (generic Many2one)
    related_model = fields.Char(
        help='Model name of the related record'
    )
    related_id = fields.Integer(
        string='Related Record ID',
        help='ID of the related record'
    )
    related_name = fields.Char(
        string='Related Record',
        compute='_compute_related_name',
        store=True
    )

    # Стиль відображення
    fill_color = fields.Char(
        default='#3498db',
        help='Polygon fill color (hex)'
    )
    stroke_color = fields.Char(
        default='#2980b9',
        help='Polygon border color (hex)'
    )
    stroke_width = fields.Integer(
        default=2,
        help='Border width in pixels'
    )
    opacity = fields.Float(
        default=0.5,
        help='Fill opacity (0.0 - 1.0)'
    )

    # Label position and text
    label_x = fields.Float(
        string='Label X Position',
        help='X coordinate for label position (defaults to centroid_x)'
    )
    label_y = fields.Float(
        string='Label Y Position',
        help='Y coordinate for label position (defaults to centroid_y)'
    )
    label_text = fields.Char(
        compute='_compute_label_text',
        help='Text to display on polygon label'
    )

    @api.model
    def _selection_plan_models(self):
        """Повернути список моделей, які мають plan.view.mixin"""
        # pylint: disable=no-search-all
        ir_models = self.env['ir.model'].search([], limit=None)
        result = []
        for model in ir_models:
            try:
                model_obj = self.env[model.model]
                if hasattr(model_obj, '_inherit'):
                    inherits = model_obj._inherit
                    if isinstance(inherits, str):
                        inherits = [inherits]
                    if 'plan.view.mixin' in (inherits or []):
                        result.append((model.model, model.name))
            except Exception:
                _logger.debug(
                    'Skipping model %s in plan selection', model.model)
        return result

    @api.depends('plan_id')
    def _compute_plan_model(self):
        """Обчислити модель плану"""
        for record in self:
            if record.plan_id:
                record.plan_model = record.plan_id._name
            else:
                record.plan_model = False

    @api.depends('related_model', 'related_id', 'plan_id')
    def _compute_name(self):
        """Обчислити назву полігону"""
        for record in self:
            if record.related_model and record.related_id:
                try:
                    related = self.env[record.related_model].browse(
                        record.related_id)
                    if related.exists():
                        record.name = related.display_name
                    else:
                        record.name = f'Polygon #{record.id or "New"}'
                except Exception:
                    record.name = f'Polygon #{record.id or "New"}'
            else:
                record.name = f'Polygon #{record.id or "New"}'

    @api.depends('related_model', 'related_id')
    def _compute_related_name(self):
        """Отримати назву пов'язаного запису"""
        for record in self:
            if record.related_model and record.related_id:
                try:
                    related = self.env[record.related_model].browse(
                        record.related_id)
                    if related.exists():
                        record.related_name = related.display_name
                    else:
                        record.related_name = False
                except Exception:
                    record.related_name = False
            else:
                record.related_name = False

    @api.depends('name', 'related_name', 'related_model', 'related_id')
    def _compute_label_text(self):
        """Обчислити текст для label"""
        for record in self:
            if not record.related_model or not record.related_id:
                record.label_text = ''
                continue

            # For building.room, show room_number if available
            if record.related_model == 'building.room':
                try:
                    room = self.env['building.room'].browse(record.related_id)
                    if room.exists() and room.room_number:
                        record.label_text = room.room_number
                    else:
                        record.label_text = record.related_name or ''
                except Exception:
                    record.label_text = ''
            # For cinema.seat, show seat name (A1, B2, etc.)
            elif record.related_model == 'cinema.seat':
                try:
                    seat = self.env['cinema.seat'].browse(record.related_id)
                    if seat.exists() and seat.name:
                        record.label_text = seat.name
                    else:
                        record.label_text = record.related_name or ''
                except Exception:
                    record.label_text = ''
            else:
                record.label_text = record.related_name or ''

    @api.depends('points')
    def _compute_centroid(self):
        """Обчислити центроїд полігону"""
        for record in self:
            if record.points:
                try:
                    points = json.loads(record.points)
                    if points and len(points) >= 3:
                        # Support both formats: [{x,y}] and [[x,y]]
                        if isinstance(points[0], dict):
                            x_coords = [p['x'] for p in points]
                            y_coords = [p['y'] for p in points]
                        else:
                            x_coords = [p[0] for p in points]
                            y_coords = [p[1] for p in points]
                        record.centroid_x = sum(x_coords) / len(x_coords)
                        record.centroid_y = sum(y_coords) / len(y_coords)
                    else:
                        record.centroid_x = 0.0
                        record.centroid_y = 0.0
                except Exception:
                    record.centroid_x = 0.0
                    record.centroid_y = 0.0
            else:
                record.centroid_x = 0.0
                record.centroid_y = 0.0

    @api.depends('points')
    def _compute_area(self):
        """Обчислити площу полігону (Shoelace formula)"""
        for record in self:
            if record.points:
                try:
                    points = json.loads(record.points)
                    if points and len(points) >= 3:
                        # Shoelace formula
                        area = 0.0
                        n = len(points)
                        for i in range(n):
                            j = (i + 1) % n
                            area += points[i][0] * points[j][1]
                            area -= points[j][0] * points[i][1]
                        record.area_pixels = abs(area) / 2.0
                    else:
                        record.area_pixels = 0.0
                except Exception:
                    record.area_pixels = 0.0
            else:
                record.area_pixels = 0.0

    @api.depends('area_pixels', 'plan_id')
    def _compute_area_meters(self):
        """Обчислити площу в метрах квадратних"""
        for record in self:
            if record.area_pixels and record.plan_id:
                plan_obj = record.plan_id
                coeff = getattr(plan_obj, 'plan_scale_coefficient', 0)
                if coeff:
                    # pixels² / (pixels/meter)² = meters²
                    record.area_meters = record.area_pixels / (coeff * coeff)
                else:
                    record.area_meters = 0.0
            else:
                record.area_meters = 0.0

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        for record in records:
            record._compute_centroid()
            record._compute_label_text()
            if record.centroid_x or record.centroid_y or record.label_text:
                record.write({
                    'centroid_x': record.centroid_x,
                    'centroid_y': record.centroid_y,
                    'label_text': record.label_text,
                })
        return records

    def action_open_related(self):
        """Відкрити пов'язаний запис"""
        self.ensure_one()
        if not self.related_model or not self.related_id:
            return False

        return {
            'type': 'ir.actions.act_window',
            'res_model': self.related_model,
            'res_id': self.related_id,
            'view_mode': 'form',
            'target': 'current',
        }
