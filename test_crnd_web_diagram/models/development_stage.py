from odoo import models, fields, api


DEFAULT_BG_COLOR = 'rgba(120,120,120,1)'
DEFAULT_LABEL_COLOR = 'rgba(255,255,255,1)'


class DevelopmentStage(models.Model):
    _name = 'development.stage'
    _description = "The stage of development"

    name = fields.Char()
    type_id = fields.Many2one(
        comodel_name='development.stage.type',
        string="Development Stage Type",
        index=True,
        ondelete="restrict")
    development_type_id = fields.Many2one(
        comodel_name='development.type')
    route_in_ids = fields.One2many(
        comodel_name='development.stage.route',
        inverse_name='stage_to_id',
        string='Incoming routes',
        readonly=True)
    route_out_ids = fields.One2many(
        comodel_name='development.stage.route',
        inverse_name='stage_from_id',
        string='Outgoing routes',
        readonly=True)
    development_ids = fields.One2many(
        comodel_name='development.development',
        inverse_name='development_stage_id',
        string='Developments',
        readonly=True)
    diagram_position = fields.Char(
        readonly=True)
    bg_color = fields.Char(
        default=DEFAULT_BG_COLOR,
        string="Background Color")
    label_color = fields.Char(
        default=DEFAULT_LABEL_COLOR)

    # Custom colors
    use_custom_colors = fields.Boolean(
        help="Select colors from the palette manually")
    res_bg_color = fields.Char(
        compute='_compute_custom_colors', readonly=True,
        string="Backgroung Color")
    res_label_color = fields.Char(
        compute='_compute_custom_colors',
        readonly=True, string="Label Color")

    @api.depends('bg_color', 'label_color', 'type_id', 'use_custom_colors')
    def _compute_custom_colors(self):
        for rec in self:
            if rec.use_custom_colors:
                rec.res_bg_color = rec.bg_color
                rec.res_label_color = rec.label_color
            elif rec.type_id:
                rec.res_bg_color = rec.type_id.bg_color
                rec.res_label_color = rec.type_id.label_color
            else:
                rec.res_bg_color = DEFAULT_BG_COLOR
                rec.res_label_color = DEFAULT_LABEL_COLOR
