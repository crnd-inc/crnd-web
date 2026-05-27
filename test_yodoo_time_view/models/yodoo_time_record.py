# -*- coding: utf-8 -*-

from datetime import datetime, timedelta, timezone
from odoo import api, fields, models


class YodooTimeViewTestRecord(models.Model):
    _name = "yodoo.time.view.test.record"
    _description = "Yodoo Time View Test Record"
    _inherit = [
        'gantt.mixin',
        'timeline.mixin',
    ]

    _time_view_config = {
        'events': [
            {
                'key': 'demo_interval',
                'type': 'base',
                'source': 'self_fields',
                'start_field': 'datetime_start',
                'stop_field': 'datetime_stop',
                'color_field': 'color',
                'timestamp_fields': [
                    {
                        'field': 'datetime_3', 'name': "Third Date",
                        'color': 'inherit', 'lighten': 0, 'active': True,
                    },
                    {
                        'field': 'datetime_4', 'name': "Fourth Date",
                        'color': 'inherit', 'lighten': 0.35, 'active': True,
                    },
                    {
                        'field': 'datetime_5', 'name': "Fifth Date",
                        'color': 'inherit', 'lighten': 0.6, 'active': False,
                    },
                ],
                'tooltip_fields': [
                    {'field': 'record_type', 'label': "Type"},
                    {'field': 'kind', 'label': "Category"},
                ],
                'marker_fields': [
                    {
                        'field': 'datetime_5',
                        'name': "Completion",
                        'icon': '🏁',
                        'color': '#9b59b6',
                    },
                ],
            },
            {
                'key': 'bg_periods',
                'source': 'related',
                'model': 'yodoo.time.view.background.period',
                'domain': [('active', '=', True)],
                'start_field': 'date_start',
                'stop_field': 'date_stop',
                'type': 'background',
                'group_key': 'periods',
            },
        ],
        'form': {
            'string': 'Timeline View',
            'default_scale': 'week',
            'allowed_scales': ['day', 'week', 'month'],
            'color': '#3498db',
            'default_group_by': 'kind',
            'per_view': {
                'timeline': {
                    'drag_drop': True,
                    'resize': True,
                },
            },
        },
        'layers': {
            'toolbar': {
                'scales': ['day', 'week', 'month', 'year'],
                'show_today': True,
                'show_zoom': True,
            },
            'background': {
                'weekends': False,
                'work_hours': False,
                'night': False,
                'work_hours_start': 8,
                'work_hours_end': 20,
                'work_hours_days': [0, 1, 2, 3, 4],
                'custom': [
                    {
                        'key': 'lunch_break',
                        'label': 'Lunch Break',
                        'active': False,
                    },
                ],
            },
            'markers': {
                'current_time': True,
                'custom': [
                    {
                        'key': 'gmt_now',
                        'label': 'GMT Now',
                        'active': False,
                    },
                ],
            },
            'per_view': {
                'gantt': {
                    'timestamp_style': 'segments',
                    'background': {
                        'show_night': False,
                    },
                },
                'timeline': {
                    'timestamp_style': 'markers',
                    'toolbar': {
                        'scales': ['week', 'month'],
                        'show_zoom': False,
                    },
                },
            },
        },
    }

    name = fields.Char(required=True)
    record_type = fields.Selection(
        selection=[
            ("type_alpha", "Type Alpha"),
            ("type_beta", "Type Beta"),
            ("type_gamma", "Type Gamma"),
            ("type_delta", "Type Delta"),
            ("type_epsilon", "Type Epsilon"),
        ],
        required=True,
        default="type_alpha",
    )
    kind = fields.Selection(
        selection=[
            ("kind_class_a", "Class A"),
            ("kind_class_b", "Class B"),
            ("kind_class_c", "Class C"),
            ("kind_class_d", "Class D"),
        ],
        string="Category",
        required=True,
        default="kind_class_a",
        help="Category for alternative grouping",
    )
    # Additional dates for multi-event timeline
    datetime_3 = fields.Datetime(string="Third Date")
    datetime_4 = fields.Datetime(string="Fourth Date")
    datetime_5 = fields.Datetime(string="Fifth Date")

    @api.model
    def _get_time_view_config(self):
        """Dynamic config: activate datetime_5 timestamp in debug mode."""
        config = super()._get_time_view_config()
        # In debug mode make the 'Fifth Date' timestamp active so developers
        # can easily see all available timestamp markers during testing.
        if not self.env.context.get('debug'):
            return config
        for event in config.get('events', []):
            if event.get('key') != 'demo_interval':
                continue
            for ts in event.get('timestamp_fields', []):
                if ts.get('field') == 'datetime_5':
                    ts['active'] = True
        return config

    @api.model
    def _get_custom_bg_items(self, key, view_type=None):
        if key == 'lunch_break':
            items = []
            now = datetime.now()
            range_start = now - timedelta(days=60)
            range_end = now + timedelta(days=60)
            d = range_start.replace(hour=0, minute=0, second=0, microsecond=0)
            while d < range_end:
                if d.weekday() < 5:  # Monday–Friday
                    items.append({
                        'start': d.replace(
                            hour=12, minute=0, second=0).isoformat(),
                        'end': d.replace(
                            hour=13, minute=0, second=0).isoformat(),
                        'className': 'o_vis_bg_lunch',
                        'type': 'background',
                    })
                d += timedelta(days=1)
            return items
        return []

    @api.model
    def _get_custom_mk_items(self, key, view_type=None):
        if key == 'gmt_now':
            now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
            return [{
                'id': '__gmt_now__',
                'timestamp': now_utc.isoformat(),
                'label': 'GMT',
                'color': '#2980b9',
                'className': 'o_vis_marker_gmt',
            }]
        return []
