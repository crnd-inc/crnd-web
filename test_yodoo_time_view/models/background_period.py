# -*- coding: utf-8 -*-

from datetime import timedelta

from odoo import api, fields, models
from odoo.exceptions import ValidationError


class YodooTimeViewBackgroundPeriod(models.Model):
    """Background periods for time-based views

    Defines different types of background periods:
    - weekend: Weekends
    - holiday: Public holidays
    - work_shift: Work shifts
    - daylight: Day/Night periods
    - season: Seasons
    - custom: Custom periods
    """

    _name = 'yodoo.time.view.background.period'
    _description = 'Yodoo Time View Background Period'
    _order = 'date_start, name'

    name = fields.Char(
        required=True,
        help="Period name"
    )

    type = fields.Selection([
        ('weekend', 'Weekend'),
        ('holiday', 'Holiday'),
        ('work_shift', 'Work Shift'),
        ('daylight', 'Daylight'),
        ('season', 'Season'),
        ('custom', 'Custom'),
    ],
        required=True,
        default='custom',
        help="Type of background period"
    )

    date_start = fields.Datetime(
        string='Start Date',
        required=True,
        help="Period start date and time"
    )

    date_stop = fields.Datetime(
        string='End Date',
        required=True,
        help="Period end date and time"
    )

    color = fields.Char(
        default='#3498db',
        help="Background color in HEX format"
    )

    opacity = fields.Float(
        default=0.3,
        help="Background opacity (0.0 - 1.0)"
    )

    active = fields.Boolean(
        default=True,
        help="Whether the period is active"
    )

    description = fields.Text(
        help="Period description"
    )

    recurring = fields.Boolean(
        default=False,
        help="Whether the period recurs"
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

    @api.constrains('date_start', 'date_stop')
    def _check_date_range(self):
        """Validate date range"""
        for record in self:
            if record.date_start and record.date_stop:
                if record.date_stop <= record.date_start:
                    raise ValidationError(
                        self.env._("End date must be after start date"))

    @api.constrains('opacity')
    def _check_opacity_range(self):
        """Validate opacity range"""
        for record in self:
            if record.opacity < 0.0 or record.opacity > 1.0:
                raise ValidationError(
                    self.env._("Opacity must be between 0.0 and 1.0"))

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

    @api.depends('date_start', 'date_stop')
    def _compute_duration(self):
        """Compute period duration"""
        for record in self:
            if record.date_start and record.date_stop:
                delta = record.date_stop - record.date_start
                record.duration_hours = delta.total_seconds() / 3600.0
            else:
                record.duration_hours = 0

    duration_hours = fields.Float(
        string='Duration (Hours)',
        compute='_compute_duration',
        store=True,
        help="Period duration in hours"
    )

    def _compute_display_name(self):
        for record in self:
            record.display_name = (
                f"{record.name}"
                f" ({record.date_start.strftime('%Y-%m-%d')})"
            )

    @api.model
    def generate_weekend_periods(self, start_date, end_date):
        """Generate weekend periods for a date range"""
        periods = []
        current = start_date

        while current <= end_date:
            day_of_week = current.weekday()  # 0 = Monday, 6 = Sunday

            # Saturday (5) or Sunday (6)
            if day_of_week >= 5:
                weekend_start = current.replace(
                    hour=0, minute=0, second=0, microsecond=0)
                weekend_end = current.replace(
                    hour=23, minute=59, second=59, microsecond=999999)

                periods.append({
                    'name': f"Weekend {current.strftime('%Y-%m-%d')}",
                    'type': 'weekend',
                    'date_start': weekend_start,
                    'date_stop': weekend_end,
                    'color': '#ff6b6b',
                    'opacity': 0.2,
                })

            current += timedelta(days=1)

        return periods

    @api.model
    def get_active_periods_in_range(self, start_date, end_date,
                                    period_type=None):
        """Get active periods within a date range"""
        domain = [
            ('active', '=', True),
            '|', '|',
            '&', ('date_start', '<=', end_date),
            ('date_stop', '>=', start_date),
            '&', ('date_start', '>=', start_date),
            ('date_stop', '<=', end_date),
        ]

        if period_type:
            domain.append(('type', '=', period_type))

        return self.search(domain)
