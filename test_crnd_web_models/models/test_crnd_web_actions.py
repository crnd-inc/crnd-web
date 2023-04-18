from odoo import models, fields


class TestCrndWebActions(models.Model):
    _name = 'test.crnd.web.actions'
    _description = 'Test model for crnd_web_actions'

    title = fields.Char()

    def action_reload(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'crnd_act_nothing'/'crnd_act_view_reload',
        }
