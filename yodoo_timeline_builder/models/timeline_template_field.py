# -*- coding: utf-8 -*-
from odoo import api, fields, models

ROLE_SELECTION = [
    ('groupby', 'Group By'),
    ('search', 'Search / Filter'),
    ('tooltip', 'Tooltip'),
]


class YodooTimelineTemplateField(models.Model):
    """Configuration of model fields used for grouping, search, or tooltip
    in a Yodoo Timeline Builder template."""

    _name = 'yodoo.timeline.template.field'
    _description = 'Yodoo Timeline Template Field'
    _order = 'sequence, id'

    template_id = fields.Many2one(
        'yodoo.timeline.template',
        required=True,
        ondelete='cascade',
    )
    sequence = fields.Integer(default=10)

    field_id = fields.Many2one(
        'ir.model.fields',
        required=True,
        ondelete='cascade',
        domain="[('model_id', '=', parent.base_model_id),"
               " ('ttype', 'not in', ['binary', 'one2many', 'many2many'])]",
    )
    label = fields.Char(
        help='Display label. Defaults to field description if empty.',
    )
    role = fields.Selection(
        ROLE_SELECTION,
        required=True,
        default='search',
    )

    # Computed helpers
    field_name = fields.Char(
        related='field_id.name',
        string='Field Name',
        store=False,
    )
    field_ttype = fields.Char(
        compute='_compute_field_ttype',
        string='Field Type',
        store=False,
    )

    @api.depends('field_id')
    def _compute_field_ttype(self):
        for rec in self:
            rec.field_ttype = rec.field_id.ttype if rec.field_id else False

    @api.onchange('field_id')
    def _onchange_field_id(self):
        if self.field_id and not self.label:
            self.label = self.field_id.field_description

    def _get_display_label(self):
        """Return label with fallback to field description."""
        self.ensure_one()
        return (self.label
                or (self.field_id.field_description if self.field_id else '')
                or '')
