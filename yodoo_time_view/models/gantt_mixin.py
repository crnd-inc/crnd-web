# -*- coding: utf-8 -*-

from odoo import api, fields, models
from odoo.exceptions import ValidationError


class GanttMixin(models.AbstractModel):
    """Mixin for attaching Gantt view to a model.

    Provides fields (datetime_start, datetime_stop, color, progress)
    and Gantt-specific defaults via _time_view_config.
    Inherits get_views() and layer injection from TimeViewBaseMixin.
    """

    _name = 'gantt.mixin'
    _inherit = ['time.view.base.mixin']
    _description = 'Gantt View Mixin'

    datetime_start = fields.Datetime(
        string='Start Date',
        required=True,
        help="Start date and time for Gantt view"
    )
    datetime_stop = fields.Datetime(
        string='End Date',
        help="End date and time for Gantt view"
    )
    color = fields.Char(
        default='#3498db',
        help="Color for the task in Gantt (HEX format)"
    )
    progress = fields.Float(
        string='Progress (%)',
        default=0.0,
        help="Percentage of completion (0-100)"
    )

    @api.constrains('progress')
    def _check_progress_range(self):
        for record in self:
            if record.progress < 0 or record.progress > 100:
                raise ValidationError(
                    self.env._("Progress must be between 0 and 100"))
