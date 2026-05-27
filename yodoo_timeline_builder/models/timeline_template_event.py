# -*- coding: utf-8 -*-
from odoo import api, fields, models

EVENT_TYPE_SELECTION = [
    ('range', 'Range Bar'),
    ('background', 'Background Shading'),
]


class YodooTimelineTemplateEvent(models.Model):
    """Related-event overlay configuration for a Timeline Builder template.

    Each record defines one layer of related data (e.g. timesheet periods,
    SLA bars) that is rendered on top of the main timeline rows.
    """

    _name = 'yodoo.timeline.template.event'
    _description = 'Yodoo Timeline Template Event'
    _order = 'sequence, id'

    template_id = fields.Many2one(
        'yodoo.timeline.template',
        required=True,
        ondelete='cascade',
    )
    sequence = fields.Integer(default=10)

    key = fields.Char(
        required=True,
        help='Unique technical identifier for this event layer.',
    )
    label = fields.Char(
        required=True,
        help='Human-readable name shown in toolbar toggle button.',
    )
    event_type = fields.Selection(
        EVENT_TYPE_SELECTION,
        string='Type',
        required=True,
        default='range',
    )

    # Source model
    source_model_id = fields.Many2one(
        'ir.model',
        required=True,
        ondelete='cascade',
        domain=[('transient', '=', False)],
    )
    source_model_name = fields.Char(
        related='source_model_id.model',
        string='Model Name',
        store=True,
        readonly=True,
    )

    # Domain linking source records back to parent records.
    # e.g. [('request_id', '=', '__id__')]
    # '__id__' is substituted with the parent record id at runtime.
    domain = fields.Char(
        string='Filter Domain',
        default='[]',
        help='Domain applied to the source model to find related records. '
             'Use "__id__" as placeholder for the parent record id, e.g. '
             '[("request_id", "=", "__id__")].',
    )
    domain_ref_field = fields.Char(
        string='Reference Field',
        help='Field on the source model that links to the parent record id '
             '(used for efficient batch loading).',
    )

    # Date fields on the source model
    date_start_field_id = fields.Many2one(
        'ir.model.fields',
        string='Start Date Field',
        required=True,
        ondelete='cascade',
        domain="[('model_id', '=', source_model_id),"
               " ('ttype', 'in', ['date', 'datetime'])]",
    )
    date_stop_field_id = fields.Many2one(
        'ir.model.fields',
        string='Stop Date Field',
        ondelete='set null',
        domain="[('model_id', '=', source_model_id),"
               " ('ttype', 'in', ['date', 'datetime'])]",
    )
    color_field_id = fields.Many2one(
        'ir.model.fields',
        ondelete='set null',
        domain="[('model_id', '=', source_model_id)]",
    )

    # Rendering options
    overlay = fields.Boolean(
        string='Overlay on Main Row',
        default=False,
        help='Render these items on the same row as the parent record bar '
             'instead of in a separate sub-row.',
    )
    open_form = fields.Boolean(
        string='Double-click Opens Form',
        default=False,
        help='Double-clicking a related item opens its form view.',
    )

    # Toolbar toggle button
    toolbar_button = fields.Boolean(
        string='Show Toolbar Button',
        default=True,
        help='Show a toggle button in the toolbar to show/hide this layer.',
    )
    toolbar_icon = fields.Char(
        string='Button Icon',
        default='fa-circle',
        help='FontAwesome icon class for the toolbar button.',
    )
    toolbar_active = fields.Boolean(
        string='Active by Default',
        default=True,
        help='Whether this layer is visible when the view first loads.',
    )

    @api.depends('key', 'label')
    def _display_name_field(self):
        for rec in self:
            rec.display_name = (
                '%s (%s)' % (rec.label, rec.key)
                if rec.key else rec.label
            )

    def _build_event_config(self):
        """Return a _time_view_config-compatible event dict for this record."""
        self.ensure_one()
        ec = {
            'key': self.key,
            'source': 'related',
            'type': self.event_type,
            'model': self.source_model_name,
            'domain': self.domain or '[]',
            'domain_ref_field': self.domain_ref_field or '',
            'start_field': self.date_start_field_id.name,
            'group_key': self.key,
        }
        if self.date_stop_field_id:
            ec['stop_field'] = self.date_stop_field_id.name
        if self.color_field_id:
            ec['color_field'] = self.color_field_id.name
        if self.overlay:
            ec['overlay'] = True
        if self.open_form:
            ec['open_form'] = True
        if self.toolbar_button:
            ec['toolbar_button'] = {
                'label': self.label,
                'icon': self.toolbar_icon or 'fa-circle',
                'active': self.toolbar_active,
            }
        return ec
