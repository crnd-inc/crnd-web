from odoo import models, fields


class TestMapWizard(models.TransientModel):
    _name = 'test.map.wizard'

    name = fields.Char()
    location_ids = fields.Many2many('test.map.view')

    def action_test_map_wizard(self):
        self.ensure_one()
        action = self.env.ref(
            'test_crnd_web_map_view.action_test_map_view_only').read()[0]
        action['domain'] = [('id', 'in', self.location_ids.ids)]
        action['target'] = 'new'
        return action
