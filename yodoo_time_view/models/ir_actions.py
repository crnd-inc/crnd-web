# -*- coding: utf-8 -*-

from odoo import fields, models


class IrActionsActWindowView(models.Model):
    """Allow new view modes in window actions."""

    _inherit = 'ir.actions.act_window.view'

    view_mode = fields.Selection(
        selection_add=[
            ('gantt', 'Gantt'),
            ('timeline', 'Timeline'),
        ],
        ondelete={
            'gantt': 'cascade',
            'timeline': 'cascade',
        }
    )
