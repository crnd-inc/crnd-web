# -*- coding: utf-8 -*-

from odoo import api, fields, models


class IrUIView(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(
        selection_add=[
            ('gantt', 'Gantt'),
            ('timeline', 'Timeline'),
        ],
        ondelete={
            'gantt': 'cascade',
            'timeline': 'cascade',
        }
    )

    @api.model
    def _get_view_info(self):
        """Provide metadata (icon, label) for new view types."""
        view_info = super()._get_view_info()
        view_info['gantt'] = {
            'icon': 'fa fa-tasks',
            'name': 'Gantt',
        }
        view_info['timeline'] = {
            'icon': 'fa fa-clock-o',
            'name': 'Timeline',
        }
        return view_info
