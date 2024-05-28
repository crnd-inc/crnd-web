from odoo import models, fields, _


class Development(models.Model):
    _name = 'development.development'
    _description = "The development"

    name = fields.Char()
    development_type_id = fields.Many2one(
        comodel_name='development.type',
        string='Development Type')
    development_stage_id = fields.Many2one(
        comodel_name='development.stage',
        string='Development Stage')
    development_stage_type_id = fields.Many2one(
        comodel_name='development.stage.type',
        related="development_stage_id.type_id",
        string="Development Stage Type")

    def action_development_development_diagram(self):
        self.ensure_one()
        current_stage_id = self.development_stage_id.id
        highlight_color = (self.sudo().development_type_id.
                           current_stage_highlight_color)
        action = self.env['generic.mixin.get.action'].get_action_by_xmlid(
            'test_crnd_web_diagram.development_type_action',
            name=_('Workflow: %(development_name)s') % {
                'development_name': self.display_name,
            },
            context={'highlight_node_id': current_stage_id,
                     'highlight_node_color': highlight_color,
                     'diagram_readonly': True},
        )
        action.update({
            'res_model': 'development.type',
            'res_id': self.development_type_id.id,
            'views': [(False, 'diagram_plus')],
        })
        return action
