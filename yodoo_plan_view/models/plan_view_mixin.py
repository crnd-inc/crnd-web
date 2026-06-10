from odoo import fields, models


class PlanViewMixin(models.AbstractModel):
    """
    Mixin для моделей, які мають план view.
    Додає поля для зображення плану та налаштувань.
    """
    _name = 'plan.view.mixin'
    _description = 'Plan View Mixin'

    # Зображення плану (растр або SVG)
    plan_image = fields.Binary(
        help='Background image for the plan (PNG, JPG, or SVG)'
    )
    plan_image_filename = fields.Char(string='Image Filename')

    # Тип зображення
    plan_image_type = fields.Selection([
        ('raster', 'Raster (PNG/JPG)'),
        ('svg', 'Vector (SVG)'),
    ], string='Image Type', default='raster')

    # SVG контент (якщо vector)
    plan_svg_content = fields.Text(
        string='SVG Content',
        help='SVG XML content for vector backgrounds'
    )

    # Масштаб (коефіцієнт для перетворення пікселів у метри)
    plan_scale_coefficient = fields.Float(
        string='Scale Coefficient',
        default=1.0,
        help='Pixels per meter. Set using the ruler tool.'
    )

    # Налаштування відображення
    plan_show_grid = fields.Boolean(
        string='Show Grid',
        default=False,
        help='Display grid overlay'
    )
    plan_grid_size = fields.Integer(
        string='Grid Size',
        default=20,
        help='Grid cell size in pixels'
    )
    plan_snap_to_grid = fields.Boolean(
        string='Snap to Grid',
        default=False,
        help='Snap polygon points to grid'
    )

    # Точка початку координат
    plan_origin_x = fields.Float(
        string='Origin X',
        default=0.0,
        help='X coordinate of origin point (0,0)'
    )
    plan_origin_y = fields.Float(
        string='Origin Y',
        default=0.0,
        help='Y coordinate of origin point (0,0)'
    )
    plan_show_origin = fields.Boolean(
        string='Show Origin',
        default=True,
        help='Display origin point marker'
    )

    # Полігони (Computed)
    plan_polygon_ids = fields.Many2many(
        'plan.polygon',
        compute='_compute_plan_polygons',
        string='Polygons'
    )

    def _compute_plan_polygons(self):
        """Обчислити полігони для цього плану"""
        for record in self:
            # Знайти всі полігони, де plan_id посилається на цей запис
            reference = f'{record._name},{record.id}'
            polygons = self.env['plan.polygon'].search([
                ('plan_id', '=', reference)
            ])
            record.plan_polygon_ids = polygons

    def get_plan_related_objects(self):
        """Return list of objects displayed in the plan sidebar.

        Override in concrete models to provide child records.
        Expected format: [{'id': int, 'name': str, 'model': str, ...}, ...]
        """
        self.ensure_one()
        return []

    def action_open_plan(self):
        """Відкрити plan view для цього запису"""
        self.ensure_one()
        return {
            'name': f'{self.display_name} - Plan',
            'res_model': self._name,
            'type': 'ir.actions.act_window',
            'views': [(False, 'plan')],
            'view_mode': 'plan',
            'res_id': self.id,
            'target': 'current',
        }
