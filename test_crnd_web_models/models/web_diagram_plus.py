from odoo import models, fields

DEFAULT_BG_COLOR = 'rgba(120,120,120,1)'
DEFAULT_LABEL_COLOR = 'rgba(255,255,255,1)'


class WebDiagramPlus(models.Model):
    _name = 'web.diagram.plus'
    _description = 'Web Diagram Plus'

    name = fields.Char()

    node_ids = fields.One2many(
        'web.diagram.plus.node', 'web_diagram_id', string='Arrows', copy=True)
    arrow_ids = fields.One2many(
        'web.diagram.plus.node', 'web_diagram_id', string='Arrows', copy=True)


class WebDiagramPlusNode(models.Model):
    _name = 'web.diagram.plus.node'
    _description = 'Web Diagram Plus Node'

    name = fields.Char()

    res_bg_color = fields.Char(
        default=DEFAULT_BG_COLOR, string="Backgroung Color")
    res_label_color = fields.Char(
        default=DEFAULT_LABEL_COLOR)

    arrow_in_ids = fields.One2many(
        'web.diagram.plus.arrow', 'node_to_id', 'Incoming Arrows')
    arrow_out_ids = fields.One2many(
        'web.diagram.plus.arrow', 'node_from_id', 'Outgoing Arrows')
    web_diagram_id = fields.Many2one(
        'web.diagram.plus', 'Web Diagram', ondelete='cascade',
        required=True, index=True)


class WebDiagramPlusArrow(models.Model):
    _name = 'web.diagram.plus.arrow'
    _description = 'Web Diagram Plus Arrow'

    name = fields.Char()

    node_from_id = fields.Many2one(
        'web.diagram.plus.node', 'From', ondelete='restrict',
        required=True, index=True, track_visibility='onchange')
    node_to_id = fields.Many2one(
        'web.diagram.plus.node', 'To', ondelete='restrict',
        required=True, index=True)
    web_diagram_id = fields.Many2one(
        'web.diagram.plus', 'Web Diagram', ondelete='cascade',
        required=True, index=True, track_visibility='onchange')
