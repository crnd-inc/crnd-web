from odoo import models, fields, api

DEFAULT_BG_COLOR = 'rgba(120,120,120,1)'
DEFAULT_LABEL_COLOR = 'rgba(255,255,255,1)'


class WebDiagramPlus(models.Model):
    _name = 'web.diagram.plus'
    _description = 'Web Diagram Plus'

    name = fields.Char(required=True)

    node_ids = fields.One2many(
        'web.diagram.plus.node', 'web_diagram_id', string='Nodes', copy=True)
    arrow_ids = fields.One2many(
        'web.diagram.plus.arrow', 'web_diagram_id', string='Arrows', copy=True)

    @api.model
    def get_action_by_xmlid(self, xmlid, context=None, domain=None):
        action = self.env.ref(xmlid)
        assert isinstance(  # nosec
            self.env[action._name], type(self.env['ir.actions.actions']))
        action = action.read()[0]
        if context is not None:
            action['context'] = context
        if domain is not None:
            action['domain'] = domain

        return action

    def action_web_diagram_plus(self):
        self.ensure_one()
        action = self.get_action_by_xmlid(
            'test_crnd_web_models.action_web_diagram_plus_model',
            context={'default_web_diagram_id': self.id},
        )
        action.update({
            'res_model': 'web.diagram.plus',
            'res_id': self.id,
            'views': [(False, 'diagram_plus'), (False, 'form')],
        })
        return action


class WebDiagramPlusNode(models.Model):
    _name = 'web.diagram.plus.node'
    _description = 'Web Diagram Plus Node'

    name = fields.Char(required=True)

    web_diagram_id = fields.Many2one(
        'web.diagram.plus', 'Web Diagram', ondelete='cascade',
        required=True, index=True)

    res_bg_color = fields.Char(
        default=DEFAULT_BG_COLOR, string="Backgroung Color")
    res_label_color = fields.Char(
        default=DEFAULT_LABEL_COLOR)

    arrow_in_ids = fields.One2many(
        'web.diagram.plus.arrow', 'to_node_id', 'Incoming Arrows')
    arrow_out_ids = fields.One2many(
        'web.diagram.plus.arrow', 'from_node_id', 'Outgoing Arrows')


class WebDiagramPlusArrow(models.Model):
    _name = 'web.diagram.plus.arrow'
    _description = 'Web Diagram Plus Arrow'

    name = fields.Char(required=True)

    web_diagram_id = fields.Many2one(
        'web.diagram.plus', 'Web Diagram', ondelete='cascade',
        required=True, index=True, track_visibility='onchange')

    from_node_id = fields.Many2one(
        'web.diagram.plus.node', 'From', ondelete='restrict',
        required=True, index=True, track_visibility='onchange')
    to_node_id = fields.Many2one(
        'web.diagram.plus.node', 'To', ondelete='restrict',
        required=True, index=True)
