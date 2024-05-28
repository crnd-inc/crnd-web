from odoo import models, fields

from .development_stage import DEFAULT_BG_COLOR, DEFAULT_LABEL_COLOR


class DevelopmentStageType(models.Model):
    _name = 'development.stage.type'

    name = fields.Char()
    bg_color = fields.Char(
        default=DEFAULT_BG_COLOR,
        string="Backgroung Color")
    label_color = fields.Char(
        default=DEFAULT_LABEL_COLOR)
    development_ids = fields.One2many(
        comodel_name='development.development',
        inverse_name='development_stage_type_id',
        readonly=True)
