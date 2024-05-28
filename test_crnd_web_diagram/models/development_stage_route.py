from odoo import models, fields


class DevelopmentStageRoute(models.Model):
    _name = 'development.stage.route'
    _description = 'The development stage route'

    name = fields.Char()
    stage_from_id = fields.Many2one(
        comodel_name='development.stage',
        string="Stage from")
    stage_to_id = fields.Many2one(
        comodel_name='development.stage',
        string="Stage to")
    development_type_id = fields.Many2one(
        comodel_name='development.type',
        string="Development type")
