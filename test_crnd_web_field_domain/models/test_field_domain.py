from odoo import models, fields


class TestMapView(models.Model):
    _name = 'test.field.domain.table'

    name = fields.Char()
    user_id = fields.Many2one('res.users')
    user_domain = fields.Char()
    user1_id = fields.Many2one('res.users')
    user_ids = fields.Many2many('res.users')
    users_domain = fields.Char()

