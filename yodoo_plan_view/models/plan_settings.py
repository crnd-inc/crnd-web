from odoo import models, fields, api, _
from odoo.exceptions import UserError


class PlanSettings(models.Model):
    """
    Налаштування для Plan View.
    Базовано на yodoo_diagram settings з адаптацією для планів.
    """
    _name = 'plan.settings'
    _description = 'Plan View Settings'

    name = fields.Char(
        required=True,
        translate=True,
        default='Default Settings'
    )

    # Grid Settings
    grid_enabled = fields.Boolean(
        string='Enable Grid',
        default=False,
        help='Show grid overlay'
    )
    grid_size = fields.Integer(
        string='Grid Cell Size',
        default=20,
        help='Size of grid cells in pixels'
    )
    grid_color = fields.Char(
        string='Grid Color',
        default='#E0E0E0',
        help='Color of grid lines (hex)'
    )
    grid_snap = fields.Boolean(
        string='Snap to Grid',
        default=False,
        help='Automatically snap polygon points to grid'
    )

    # Polygon Style Settings
    default_fill_color = fields.Char(
        string='Default Fill Color',
        default='#3498db',
        help='Default polygon fill color (hex)'
    )
    default_stroke_color = fields.Char(
        string='Default Stroke Color',
        default='#2980b9',
        help='Default polygon border color (hex)'
    )
    default_stroke_width = fields.Integer(
        string='Default Stroke Width',
        default=2,
        help='Default border width in pixels'
    )
    default_opacity = fields.Float(
        string='Default Opacity',
        default=0.5,
        help='Default fill opacity (0.0 - 1.0)'
    )

    # Highlight Settings (for selected polygons)
    highlight_fill_color = fields.Char(
        string='Highlight Fill Color',
        default='#e74c3c',
        help='Fill color for selected polygon'
    )
    highlight_stroke_color = fields.Char(
        string='Highlight Stroke Color',
        default='#c0392b',
        help='Stroke color for selected polygon'
    )
    highlight_stroke_width = fields.Integer(
        string='Highlight Stroke Width',
        default=3,
        help='Stroke width for selected polygon'
    )

    # Point/Vertex Settings
    point_radius = fields.Integer(
        string='Point Radius',
        default=5,
        help='Radius of polygon vertex points in pixels'
    )
    point_color = fields.Char(
        string='Point Color',
        default='#ffffff',
        help='Color of vertex points'
    )
    point_stroke_color = fields.Char(
        string='Point Stroke Color',
        default='#2c3e50',
        help='Stroke color of vertex points'
    )
    point_stroke_width = fields.Integer(
        string='Point Stroke Width',
        default=2,
        help='Stroke width of vertex points'
    )

    # Ruler/Measurement Settings
    ruler_color = fields.Char(
        string='Ruler Color',
        default='#e67e22',
        help='Color of ruler line'
    )
    ruler_width = fields.Integer(
        string='Ruler Width',
        default=3,
        help='Width of ruler line in pixels'
    )
    measurement_font_size = fields.Integer(
        string='Measurement Font Size',
        default=14,
        help='Font size for measurements'
    )
    measurement_color = fields.Char(
        string='Measurement Color',
        default='#2c3e50',
        help='Color of measurement text'
    )

    # Origin Point Settings
    origin_color = fields.Char(
        string='Origin Point Color',
        default='#e74c3c',
        help='Color of origin (0,0) marker'
    )
    origin_size = fields.Integer(
        string='Origin Point Size',
        default=8,
        help='Size of origin marker in pixels'
    )

    # Label Settings
    label_font_size = fields.Integer(
        string='Label Font Size',
        default=12,
        help='Font size for polygon labels'
    )
    label_font_family = fields.Char(
        string='Label Font Family',
        default='Arial',
        help='Font family for labels'
    )
    label_color = fields.Char(
        string='Label Color',
        default='#2c3e50',
        help='Color of polygon labels'
    )
    show_area_labels = fields.Boolean(
        string='Show Area Labels',
        default=True,
        help='Display area on polygon centroids'
    )

    # Context (для model-specific settings)
    context_model = fields.Many2one(
        'ir.model',
        string='Context Model',
        help='Model for context-specific settings. '
             'Leave empty for default settings.'
    )

    active = fields.Boolean(default=True)

    # SQL Constraints
    _sql_constraints = [
        ('unique_context_model',
         'UNIQUE(context_model)',
         'Only one settings record per model is allowed!'),
    ]

    @api.constrains('active')
    def _check_unique_default_settings(self):
        """Перевірка унікальності default settings"""
        for record in self:
            if not record.context_model and record.active:
                other_defaults = self.search([
                    ('id', '!=', record.id),
                    ('context_model', '=', False),
                    ('active', '=', True)
                ])
                if other_defaults:
                    raise UserError(_(
                        'Only one active default settings record '
                        '(without context_model) is allowed!'
                    ))
            if not record.context_model and not record.active:
                raise UserError(_(
                    'At least one active default plan settings must exist!'
                ))

    @api.model
    def get_settings_for_model(self, model_name=None):
        """
        Отримати налаштування для моделі.
        Якщо є model-specific - повертає їх, інакше default.
        """
        # Спочатку шукаємо default
        default_settings = self.sudo().search([
            ('context_model', '=', False),
            ('active', '=', True)
        ], limit=1)

        if not model_name:
            return default_settings or self._create_default_settings()

        # Шукаємо model-specific
        model_record = self.env['ir.model'].sudo().search([
            ('model', '=', model_name)
        ], limit=1)

        if model_record:
            model_settings = self.sudo().search([
                ('context_model', '=', model_record.id),
                ('active', '=', True)
            ], limit=1)
            if model_settings:
                return model_settings

        return default_settings or self._create_default_settings()

    def _create_default_settings(self):
        """Створити default settings"""
        return self.sudo().create({
            'name': 'Default Settings',
            'grid_enabled': False,
            'grid_size': 20,
            'grid_color': '#E0E0E0',
            'grid_snap': False,
            'default_fill_color': '#3498db',
            'default_stroke_color': '#2980b9',
            'default_stroke_width': 2,
            'default_opacity': 0.5,
            'highlight_fill_color': '#e74c3c',
            'highlight_stroke_color': '#c0392b',
            'highlight_stroke_width': 3,
            'point_radius': 5,
            'point_color': '#ffffff',
            'point_stroke_color': '#2c3e50',
            'point_stroke_width': 2,
            'ruler_color': '#e67e22',
            'ruler_width': 3,
            'measurement_font_size': 14,
            'measurement_color': '#2c3e50',
            'origin_color': '#e74c3c',
            'origin_size': 8,
            'label_font_size': 12,
            'label_font_family': 'Arial',
            'label_color': '#2c3e50',
            'show_area_labels': True,
        })
