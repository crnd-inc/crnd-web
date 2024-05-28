from odoo import models, fields, _


class DevelopmentType(models.Model):
    _name = 'development.type'
    _description = "Development type"

    name = fields.Char()
    stage_ids = fields.One2many(
        comodel_name='development.stage',
        inverse_name='development_type_id',
        string='Stages',
        copy=False,
        readonly=True)
    route_ids = fields.One2many(
        comodel_name='development.stage.route',
        inverse_name='development_type_id',
        string='Stage Routes',
        readonly=True)
    development_ids = fields.One2many(
        comodel_name='development.development',
        inverse_name='development_type_id',
        string='Developments',
        readonly=True)
    current_stage_highlight_color = fields.Char(
        default='rgba(0,91,187,1)',
        help='The color to highlight the current stage on flow')

    def action_development_type_diagram(self):
        self.ensure_one()
        action = self.env['generic.mixin.get.action'].get_action_by_xmlid(
            'test_crnd_web_diagram.development_type_action',
            name=_('Workflow: %(type_name)s') % {
                'type_name': self.display_name,
            },
            context={'default_development_type_id': self.id},
        )
        action.update({
            'res_model': 'development.type',
            'res_id': self.id,
            'views': [(False, 'diagram_plus'), (False, 'form')],
        })
        return action
