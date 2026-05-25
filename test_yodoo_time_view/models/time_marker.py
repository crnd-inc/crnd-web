# -*- coding: utf-8 -*-

from datetime import timedelta

from odoo import api, fields, models
from odoo.exceptions import ValidationError


class YodooTimeViewTimeMarker(models.Model):
    """Time markers for time-based views

    Defines different types of time markers:
    - current_time: Current time indicator
    - deadline: Deadlines
    - milestone: Important events
    - breakpoint: Break periods
    - custom: Custom markers
    """

    _name = 'yodoo.time.view.time.marker'
    _description = 'Yodoo Time View Time Marker'
    _order = 'timestamp, name'

    name = fields.Char(
        required=True,
        help="Marker name"
    )

    type = fields.Selection([
        ('current_time', 'Current Time'),
        ('deadline', 'Deadline'),
        ('milestone', 'Milestone'),
        ('breakpoint', 'Breakpoint'),
        ('custom', 'Custom'),
    ],
        required=True,
        default='custom',
        help="Type of time marker"
    )

    timestamp = fields.Datetime(
        required=True,
        help="Marker timestamp"
    )

    color = fields.Char(
        default='#e74c3c',
        help="Marker color in HEX format"
    )

    width = fields.Integer(
        default=2,
        help="Marker line width in pixels"
    )

    style = fields.Selection([
        ('solid', 'Solid'),
        ('dashed', 'Dashed'),
        ('dotted', 'Dotted'),
    ],
        default='solid',
        help="Marker line style"
    )

    show_label = fields.Boolean(
        default=True,
        help="Whether to show the marker label"
    )

    label = fields.Char(
        help="Marker label text"
    )

    label_position = fields.Selection([
        ('top', 'Top'),
        ('bottom', 'Bottom'),
    ],
        default='top',
        help="Label position"
    )

    icon = fields.Char(
        help="Marker icon (emoji or icon class)"
    )

    description = fields.Text(
        help="Marker description"
    )

    active = fields.Boolean(
        default=True,
        help="Whether the marker is active"
    )

    recurring = fields.Boolean(
        default=False,
        help="Whether the marker recurs"
    )

    recurring_type = fields.Selection([
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ],
        help="Recurrence type"
    )

    recurring_day = fields.Integer(
        help="Day for recurrence (0-6 for weekly, 1-31 for monthly)"
    )

    recurring_hour = fields.Integer(
        default=0,
        help="Hour for recurrence (0-23)"
    )

    recurring_minute = fields.Integer(
        default=0,
        help="Minute for recurrence (0-59)"
    )

    @api.constrains('width')
    def _check_width_range(self):
        """Validate width range"""
        for record in self:
            if record.width < 1 or record.width > 10:
                raise ValidationError(
                    self.env._("Width must be between 1 and 10 pixels"))

    @api.constrains('recurring_day')
    def _check_recurring_day(self):
        """Validate recurring day"""
        for record in self:
            if (record.recurring_type == 'weekly'
                    and (record.recurring_day < 0
                         or record.recurring_day > 6)):
                raise ValidationError(
                    self.env._(
                        "For weekly recurring, day must be between"
                        " 0 (Sunday) and 6 (Saturday)"))
            if (record.recurring_type == 'monthly'
                    and (record.recurring_day < 1
                         or record.recurring_day > 31)):
                raise ValidationError(
                    self.env._(
                        "For monthly recurring, day must be"
                        " between 1 and 31"))

    @api.constrains('recurring_hour', 'recurring_minute')
    def _check_recurring_time(self):
        """Validate recurring time"""
        for record in self:
            if record.recurring_hour < 0 or record.recurring_hour > 23:
                raise ValidationError(
                    self.env._("Recurring hour must be between 0 and 23"))
            if record.recurring_minute < 0 or record.recurring_minute > 59:
                raise ValidationError(
                    self.env._("Recurring minute must be between 0 and 59"))

    def _compute_display_name(self):
        for record in self:
            record.display_name = (
                f"{record.name}"
                f" ({record.timestamp.strftime('%Y-%m-%d %H:%M')})"
            )

    @api.model
    def create_current_time_marker(self):
        """Create a current time marker"""
        now = fields.Datetime.now()
        return self.create({
            'name': 'Current Time',
            'type': 'current_time',
            'timestamp': now,
            'color': '#e74c3c',
            'width': 2,
            'show_label': True,
            'label': 'Now',
            'recurring': True,
            'recurring_type': 'daily',
        })

    @api.model
    def create_deadline_marker(self, name, timestamp, **kwargs):
        """Create a deadline marker"""
        defaults = {
            'type': 'deadline',
            'color': '#e67e22',
            'width': 3,
            'style': 'dashed',
            'show_label': True,
            'icon': '⚠️',
        }
        defaults.update(kwargs)

        return self.create({
            'name': name,
            'timestamp': timestamp,
            **defaults
        })

    @api.model
    def create_milestone_marker(self, name, timestamp, **kwargs):
        """Create a milestone marker"""
        defaults = {
            'type': 'milestone',
            'color': '#27ae60',
            'width': 2,
            'show_label': True,
            'icon': '🎯',
        }
        defaults.update(kwargs)

        return self.create({
            'name': name,
            'timestamp': timestamp,
            **defaults
        })

    @api.model
    def create_breakpoint_marker(self, name, timestamp, **kwargs):
        """Create a breakpoint marker"""
        defaults = {
            'type': 'breakpoint',
            'color': '#95a5a6',
            'width': 1,
            'style': 'dotted',
            'show_label': True,
            'icon': '⏸️',
        }
        defaults.update(kwargs)

        return self.create({
            'name': name,
            'timestamp': timestamp,
            **defaults
        })

    @api.model
    def get_active_markers_in_range(self, start_date, end_date,
                                    marker_type=None):
        """Get active markers within a date range"""
        domain = [
            ('active', '=', True),
            ('timestamp', '>=', start_date),
            ('timestamp', '<=', end_date),
        ]

        if marker_type:
            domain.append(('type', '=', marker_type))

        return self.search(domain)

    @api.model
    def generate_recurring_markers(self, start_date, end_date,
                                   recurring_config):
        """Generate recurring markers within a date range"""
        markers = []
        current = start_date

        while current <= end_date:
            should_add = False

            if recurring_config['type'] == 'daily':
                should_add = True
            elif recurring_config['type'] == 'weekly':
                if recurring_config.get('day') is not None:
                    should_add = (
                        current.weekday() == recurring_config['day'])
            elif recurring_config['type'] == 'monthly':
                if recurring_config.get('day') is not None:
                    should_add = current.day == recurring_config['day']
            elif recurring_config['type'] == 'yearly':
                if (recurring_config.get('month') is not None
                        and recurring_config.get('day') is not None):
                    should_add = (
                        current.month == recurring_config['month']
                        and current.day == recurring_config['day'])

            if should_add:
                marker_time = current.replace(
                    hour=recurring_config.get('hour', 0),
                    minute=recurring_config.get('minute', 0),
                    second=0,
                    microsecond=0
                )

                if marker_time >= start_date and marker_time <= end_date:
                    markers.append({
                        'timestamp': marker_time,
                        'recurring': True,
                        'recurring_type': recurring_config['type'],
                        'recurring_day': recurring_config.get('day'),
                        'recurring_hour': recurring_config.get('hour', 0),
                        'recurring_minute': recurring_config.get('minute', 0),
                    })

            current += timedelta(days=1)

        return markers
