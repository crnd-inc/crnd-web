# -*- coding: utf-8 -*-

from .time_view_base import TimeViewBaseMixin


class TimelineMixin(TimeViewBaseMixin):
    """Mixin for attaching Timeline view to a model.

    Configure via _time_view_config on your model.
    Fields (datetime_start, datetime_stop, color) come from gantt.mixin
    if your model also inherits it, or must be declared on the model directly.
    """

    _name = 'timeline.mixin'
    _inherit = ['time.view.base.mixin']
    _description = 'Timeline View Mixin'
