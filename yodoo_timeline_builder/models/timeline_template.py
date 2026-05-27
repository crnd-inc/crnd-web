# -*- coding: utf-8 -*-
import json
import logging
from datetime import date, datetime
from odoo import api, fields, models

_logger = logging.getLogger(__name__)


class YodooTimelineTemplate(models.Model):
    """Dynamic Timeline / Gantt report template.

    Stores complete view configuration (model, date fields, groupby, related
    events, toolbar options, access groups) and auto-creates an ir.actions.client
    + menu item on save — similar to yodoo.report.template.
    """

    _name = 'yodoo.timeline.template'
    _description = 'Yodoo Timeline Template'
    _order = 'name'

    name = fields.Char(string='Name', required=True)
    active = fields.Boolean(default=True)

    # ── Data source ───────────────────────────────────────────────────────────

    base_model_id = fields.Many2one(
        'ir.model',
        string='Base Model',
        required=True,
        ondelete='cascade',
        domain=[('transient', '=', False)],
    )
    base_model_name = fields.Char(
        related='base_model_id.model',
        string='Model Name',
        store=True,
        readonly=True,
    )

    # ── View type ─────────────────────────────────────────────────────────────

    view_type = fields.Selection(
        [('timeline', 'Timeline'), ('gantt', 'Gantt')],
        string='View Type',
        required=True,
        default='timeline',
    )

    # ── Date / color fields ───────────────────────────────────────────────────

    date_start_field_id = fields.Many2one(
        'ir.model.fields',
        string='Start Date Field',
        required=True,
        ondelete='cascade',
        domain="[('model_id', '=', base_model_id),"
               " ('ttype', 'in', ['date', 'datetime'])]",
    )
    date_stop_field_id = fields.Many2one(
        'ir.model.fields',
        string='Stop Date Field',
        ondelete='set null',
        domain="[('model_id', '=', base_model_id),"
               " ('ttype', 'in', ['date', 'datetime'])]",
    )
    color_field_id = fields.Many2one(
        'ir.model.fields',
        string='Color Field',
        ondelete='set null',
        domain="[('model_id', '=', base_model_id)]",
        help='Field containing a CSS colour string (e.g. type_color).',
    )

    # ── Columns: groupby / search / tooltip fields ─────────────────────────

    field_ids = fields.One2many(
        'yodoo.timeline.template.field',
        'template_id',
        string='Fields',
        copy=True,
    )

    # ── Related event overlays ────────────────────────────────────────────────

    event_ids = fields.One2many(
        'yodoo.timeline.template.event',
        'template_id',
        string='Related Events',
        copy=True,
    )

    # ── Default domain filter ─────────────────────────────────────────────────

    domain = fields.Char(
        string='Default Domain',
        default='[]',
        help='Domain applied when opening the timeline.',
    )

    # ── Scale / toolbar ───────────────────────────────────────────────────────

    default_scale = fields.Selection(
        [('day', 'Day'), ('week', 'Week'),
         ('month', 'Month'), ('year', 'Year')],
        string='Default Scale',
        default='week',
    )

    # ── Background layer defaults ──────────────────────────────────────────────

    bg_weekends = fields.Boolean(
        string='Show Weekends',
        default=True,
        help='Highlight weekend columns when the view opens.',
    )
    bg_work_hours = fields.Boolean(
        string='Show Work Hours',
        default=False,
        help='Highlight work-hour bands when the view opens.',
    )

    # ── Access control ────────────────────────────────────────────────────────

    group_ids = fields.Many2many(
        'res.groups',
        'yodoo_timeline_template_group_rel',
        'template_id',
        'group_id',
        string='User Groups',
        help='Only users in these groups can access this report. '
             'Leave empty for all users.',
    )
    parent_menu_id = fields.Many2one(
        'ir.ui.menu',
        string='Parent Menu',
        help='Where to place the auto-generated menu item.',
        copy=False,
    )
    menu_id = fields.Many2one(
        'ir.ui.menu',
        string='Menu Item',
        readonly=True,
        copy=False,
    )
    action_id = fields.Many2one(
        'ir.actions.client',
        string='Action',
        readonly=True,
        copy=False,
    )

    # ── Stat / summary helpers ────────────────────────────────────────────────

    groupby_count = fields.Integer(
        compute='_compute_field_counts',
        string='Group By Fields',
    )
    search_count = fields.Integer(
        compute='_compute_field_counts',
        string='Search Fields',
    )
    event_count = fields.Integer(
        compute='_compute_event_count',
        string='Event Overlays',
    )

    @api.depends('field_ids.role')
    def _compute_field_counts(self):
        for rec in self:
            rec.groupby_count = len(
                rec.field_ids.filtered(lambda f: f.role == 'groupby'))
            rec.search_count = len(
                rec.field_ids.filtered(lambda f: f.role == 'search'))

    @api.depends('event_ids')
    def _compute_event_count(self):
        for rec in self:
            rec.event_count = len(rec.event_ids)

    # ── Auto-create menu + client action ──────────────────────────────────────

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        for rec in records:
            rec._create_or_update_menu()
        return records

    def write(self, vals):
        res = super().write(vals)
        rebuild_keys = (
            'name', 'base_model_id', 'parent_menu_id', 'group_ids',
            'view_type',
        )
        if any(k in vals for k in rebuild_keys):
            for rec in self:
                rec._create_or_update_menu()
        return res

    def unlink(self):
        for rec in self:
            rec._delete_menu()
        return super().unlink()

    def _get_parent_menu(self):
        self.ensure_one()
        if self.parent_menu_id:
            return self.parent_menu_id
        return self.env.ref(
            'yodoo_timeline_builder.menu_yodoo_timelines_root',
            raise_if_not_found=False,
        )

    def _create_or_update_menu(self):
        self.ensure_one()
        parent_menu = self._get_parent_menu()
        if not parent_menu:
            return

        action_vals = {
            'name': self.name,
            'type': 'ir.actions.client',
            'tag': 'yodoo_timeline_builder',
            'context': json.dumps({'yodoo_timeline_template_id': self.id}),
        }

        if self.action_id:
            self.action_id.sudo().write(action_vals)
            action = self.action_id
        else:
            action = self.env['ir.actions.client'].sudo().create(action_vals)
            self.with_context(no_recompute=True).write({'action_id': action.id})

        menu_vals = {
            'name': self.name,
            'parent_id': parent_menu.id,
            'action': 'ir.actions.client,%d' % action.id,
            'sequence': 10,
        }

        if self.group_ids:
            menu_vals['groups_id'] = [(6, 0, self.group_ids.ids)]
        else:
            default_group = self.env.ref(
                'yodoo_timeline_builder.group_user',
                raise_if_not_found=False,
            )
            if default_group:
                menu_vals['groups_id'] = [(6, 0, [default_group.id])]

        if self.menu_id:
            self.menu_id.sudo().write(menu_vals)
        else:
            menu = self.env['ir.ui.menu'].sudo().create(menu_vals)
            self.with_context(no_recompute=True).write({'menu_id': menu.id})

    def _delete_menu(self):
        self.ensure_one()
        if self.menu_id:
            self.menu_id.sudo().unlink()
        if self.action_id:
            self.action_id.sudo().unlink()

    # ── Open action shortcut ──────────────────────────────────────────────────

    def action_open_timeline(self):
        self.ensure_one()
        if not self.action_id:
            self._create_or_update_menu()
        if not self.action_id:
            return False
        return {
            'type': 'ir.actions.client',
            'tag': self.action_id.tag,
            'name': self.name,
            'context': {'yodoo_timeline_template_id': self.id},
            'target': 'current',
        }

    # ── Config / data API for JS ───────────────────────────────────────────────

    @api.model
    def get_builder_config(self, template_id):
        """Return full configuration dict for the JS TimelineBuilderAction.

        Called once on mount; contains all static config so the component
        can set itself up without additional round-trips.
        """
        template = self.browse(template_id)
        template.ensure_one()

        groupby_fields = template.field_ids.filtered(
            lambda f: f.role == 'groupby').sorted('sequence')
        search_fields = template.field_ids.filtered(
            lambda f: f.role == 'search').sorted('sequence')
        tooltip_fields = template.field_ids.filtered(
            lambda f: f.role == 'tooltip').sorted('sequence')

        # Build the flat list of field names to pass to search_read
        fetch = ['id', 'display_name',
                 template.date_start_field_id.name]
        if template.date_stop_field_id:
            fetch.append(template.date_stop_field_id.name)
        if template.color_field_id:
            fetch.append(template.color_field_id.name)
        for f in groupby_fields:
            if f.field_id.name not in fetch:
                fetch.append(f.field_id.name)
        for f in tooltip_fields:
            if f.field_id.name not in fetch:
                fetch.append(f.field_id.name)

        # Build events_config list (compatible with layerOptions.events_config)
        events_config = [ev._build_event_config() for ev in template.event_ids]
        # Add the mandatory self_fields event so JS knows start/stop/color
        events_config.insert(0, {
            'key': 'main',
            'source': 'self_fields',
            'type': 'base',
            'start_field': template.date_start_field_id.name,
            'stop_field': (template.date_stop_field_id.name
                           if template.date_stop_field_id else None),
            'color_field': (template.color_field_id.name
                            if template.color_field_id else None),
            'tooltip_fields': [
                {
                    'field': f.field_id.name,
                    'label': f._get_display_label(),
                }
                for f in tooltip_fields
            ],
        })

        layer_options = {
            'toolbar': {
                'scales': ['day', 'week', 'month', 'year'],
                'show_today': True,
                'show_zoom': True,
            },
            'background': {
                'weekends': template.bg_weekends,
                'show_weekends': True,
                'work_hours': template.bg_work_hours,
                'show_work_hours': True,
                'night': False,
                'show_night': False,
                'work_hours_start': 9,
                'work_hours_end': 18,
                'work_hours_days': [0, 1, 2, 3, 4],
                'custom': [],
            },
            'markers': {
                'current_time': True,
                'show_current_time': True,
                'custom': [],
            },
            'events_config': events_config,
            'timestamp_style': 'markers',
        }

        return {
            'id': template.id,
            'name': template.name,
            'model': template.base_model_name,
            'domain': json.loads(template.domain or '[]'),
            'view_type': template.view_type,
            'default_scale': template.default_scale or 'week',
            'date_start': template.date_start_field_id.name,
            'date_stop': (template.date_stop_field_id.name
                          if template.date_stop_field_id else None),
            'color': (template.color_field_id.name
                      if template.color_field_id else None),
            'fields_to_fetch': list(dict.fromkeys(fetch)),
            'groupby_fields': [f.field_id.name for f in groupby_fields],
            'search_fields': [
                {
                    'key': f.field_id.name,
                    'label': f._get_display_label(),
                    'ttype': f.field_id.ttype,
                }
                for f in search_fields
            ],
            'layer_options': layer_options,
        }

    @api.model
    def get_builder_data(self, template_id, domain_override, filters,
                         view_type='timeline'):
        """Fetch records and related events for the JS component.

        Returns:
            dict with keys:
              records  – list of flat dicts (id, display_name, date fields, …)
              events   – list of related event dicts (same shape as
                         time_view_base._get_related_event_data output)
        """
        template = self.browse(template_id)
        template.ensure_one()

        config = self.get_builder_config(template_id)

        # Build final domain
        base_domain = json.loads(template.domain or '[]')
        from odoo.osv.expression import AND
        domain = AND([base_domain, domain_override or []])

        # Apply inline filter bar conditions
        if filters:
            filter_clauses = self._filters_to_domain(filters, config)
            if filter_clauses:
                domain = AND([domain, filter_clauses])

        # Fetch records (cap at 2000 for performance)
        Model = self.env[template.base_model_name]
        raw_records = Model.sudo().search_read(
            domain, config['fields_to_fetch'], limit=2000)

        # Serialize all values to JSON-safe types
        records = [self._serialize_record(r) for r in raw_records]

        # Fetch related events
        all_ids = [r['id'] for r in records]
        events = self._get_related_events(template, all_ids, view_type)

        return {
            'records': records,
            'events': events,
        }

    # ── Helpers ───────────────────────────────────────────────────────────────

    @api.model
    def _serialize_record(self, rec_dict):
        """Convert ORM-returned values to JSON-serializable primitives."""
        result = {}
        for k, v in rec_dict.items():
            if isinstance(v, (date, datetime)):
                result[k] = v.isoformat()
            elif isinstance(v, (list, tuple)) and len(v) == 2:
                # Many2one (id, display_name) tuple
                result[k] = v
            else:
                result[k] = v
        return result

    @api.model
    def _filters_to_domain(self, filters, config):
        """Convert filter-bar filter list to an Odoo domain list."""
        search_field_map = {
            f['key']: f for f in config.get('search_fields', [])
        }
        clauses = []
        for flt in filters:
            key = flt.get('key')
            op = flt.get('operator', '=')
            val = flt.get('value', '')
            if not key:
                continue
            field_info = search_field_map.get(key, {})
            ttype = field_info.get('ttype', 'char')

            if op == 'is_set':
                clauses.append((key, '!=', False))
            elif op == 'is_not_set':
                clauses.append((key, '=', False))
            elif op == 'contains':
                clauses.append((key, 'ilike', val))
            elif op == 'not_contains':
                clauses.append((key, 'not ilike', val))
            else:
                # Numeric / direct operators
                if ttype in ('integer', 'float', 'monetary'):
                    try:
                        val = float(val)
                    except (TypeError, ValueError):
                        continue
                clauses.append((key, op, val))
        return clauses

    @api.model
    def _get_related_events(self, template, record_ids, view_type):
        """Load related events from all configured event overlays.

        Mirrors the logic of time_view_base._get_related_event_data so the
        returned items have the same shape expected by the JS controller.
        """
        if not record_ids:
            return []

        events = []
        for ev_cfg in template.event_ids:
            source_model_name = ev_cfg.source_model_name
            if not source_model_name or source_model_name not in self.env:
                continue

            try:
                raw_domain = json.loads(ev_cfg.domain or '[]')
            except Exception:
                raw_domain = []

            start_field = ev_cfg.date_start_field_id.name
            stop_field = (ev_cfg.date_stop_field_id.name
                          if ev_cfg.date_stop_field_id else None)
            color_field = (ev_cfg.color_field_id.name
                           if ev_cfg.color_field_id else None)
            ref_field = ev_cfg.domain_ref_field or 'id'

            RelModel = self.env[source_model_name]

            for parent_id in record_ids:
                # Substitute '__id__' placeholder in domain
                domain = self._resolve_event_domain(
                    raw_domain, ref_field, parent_id)
                try:
                    fetch_fields = ['id', 'display_name', start_field]
                    if stop_field:
                        fetch_fields.append(stop_field)
                    if color_field:
                        fetch_fields.append(color_field)
                    rel_records = RelModel.sudo().search_read(
                        domain, list(dict.fromkeys(fetch_fields)))
                except Exception as e:
                    _logger.warning(
                        'yodoo_timeline_builder: event %s error: %s',
                        ev_cfg.key, e)
                    continue

                for rel in rel_records:
                    start = rel.get(start_field)
                    if not start:
                        continue
                    item = {
                        'id': 'rel_%s_%s' % (ev_cfg.key, rel['id']),
                        'name': rel.get('display_name') or '',
                        'start': (start.isoformat()
                                  if hasattr(start, 'isoformat') else start),
                        'type': ev_cfg.event_type,
                        'source_key': ev_cfg.key,
                        'group_key': ev_cfg.key,
                        'parent_record_id': parent_id,
                    }
                    if stop_field:
                        end = rel.get(stop_field)
                        if end:
                            item['end'] = (end.isoformat()
                                           if hasattr(end, 'isoformat')
                                           else end)
                    if color_field:
                        color_val = rel.get(color_field)
                        if color_val:
                            item['color'] = str(color_val)
                    if ev_cfg.open_form:
                        item['open_form'] = True
                        item['rel_model'] = source_model_name
                        item['rel_id'] = rel['id']
                    events.append(item)

        return events

    @api.model
    def _resolve_event_domain(self, domain_template, ref_field, parent_id):
        """Substitute '__id__' placeholder with the actual parent record id."""
        placeholder = '__id__'
        resolved = []
        for cond in domain_template:
            if isinstance(cond, (list, tuple)) and len(cond) == 3:
                f, op, val = cond
                if val == placeholder:
                    val = parent_id
                resolved.append((f, op, val))
            else:
                resolved.append(cond)
        return resolved
