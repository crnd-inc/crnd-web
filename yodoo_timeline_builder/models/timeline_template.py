# -*- coding: utf-8 -*-
import json
import logging
from datetime import date, datetime
from lxml import etree as ET
from odoo import api, fields, models
from odoo.osv.expression import AND

_logger = logging.getLogger(__name__)


class YodooTimelineTemplate(models.Model):
    """Dynamic Timeline / Gantt report template.

    Stores complete view configuration (model, date fields, groupby, related
    events, toolbar options, access groups) and auto-creates an
    ir.ui.view (timeline arch), ir.ui.view (search arch),
    ir.actions.act_window and ir.ui.menu on save.
    End-users get the standard Odoo search bar with filters, group-by and
    favourites for free.
    """

    _name = 'yodoo.timeline.template'
    _description = 'Yodoo Timeline Template'
    _order = 'name'

    name = fields.Char(required=True)
    active = fields.Boolean(default=True)

    # ── Data source ─────────────────────────────────────────────────────────

    base_model_id = fields.Many2one(
        'ir.model',
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

    # ── View type ───────────────────────────────────────────────────────────

    view_type = fields.Selection(
        [('timeline', 'Timeline'), ('gantt', 'Gantt')],
        required=True,
        default='timeline',
    )

    # ── Date / color fields ─────────────────────────────────────────────────

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
        ondelete='set null',
        domain="[('model_id', '=', base_model_id)]",
        help='Field containing a CSS colour string (e.g. type_color).',
    )

    # ── Columns: groupby / search / tooltip fields ──────────────────────────

    field_ids = fields.One2many(
        'yodoo.timeline.template.field',
        'template_id',
        string='Fields',
        copy=True,
    )

    # ── Related event overlays ──────────────────────────────────────────────

    event_ids = fields.One2many(
        'yodoo.timeline.template.event',
        'template_id',
        string='Related Events',
        copy=True,
    )

    # ── Default domain filter ───────────────────────────────────────────────

    domain = fields.Char(
        string='Default Domain',
        default='[]',
        help='Domain applied when opening the timeline.',
    )

    # ── Scale / toolbar ─────────────────────────────────────────────────────

    default_scale = fields.Selection(
        [('day', 'Day'), ('week', 'Week'),
         ('month', 'Month'), ('year', 'Year')],
        default='week',
    )

    # ── Background layer defaults ───────────────────────────────────────────

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

    # ── Access control ──────────────────────────────────────────────────────

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
        help='Where to place the auto-generated menu item.',
        copy=False,
    )

    # ── Auto-generated records (read-only) ──────────────────────────────────

    view_id = fields.Many2one(
        'ir.ui.view',
        string='Timeline View',
        readonly=True,
        copy=False,
        ondelete='set null',
    )
    search_view_id = fields.Many2one(
        'ir.ui.view',
        readonly=True,
        copy=False,
        ondelete='set null',
    )
    action_id = fields.Many2one(
        'ir.actions.act_window',
        readonly=True,
        copy=False,
        ondelete='set null',
    )
    menu_id = fields.Many2one(
        'ir.ui.menu',
        string='Menu Item',
        readonly=True,
        copy=False,
        ondelete='set null',
    )

    # ── Stat / summary helpers ──────────────────────────────────────────────

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

    # ── ORM hooks ───────────────────────────────────────────────────────────

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
            'view_type', 'date_start_field_id', 'date_stop_field_id',
            'color_field_id', 'default_scale', 'domain', 'field_ids',
        )
        if any(k in vals for k in rebuild_keys):
            for rec in self:
                rec._create_or_update_menu()
        return res

    def unlink(self):
        for rec in self:
            rec._delete_generated_records()
        return super().unlink()

    # ── Generated-record helpers ────────────────────────────────────────────

    def _get_parent_menu(self):
        self.ensure_one()
        if self.parent_menu_id:
            return self.parent_menu_id
        return self.env.ref(
            'yodoo_timeline_builder.menu_yodoo_timelines_root',
            raise_if_not_found=False,
        )

    def _build_timeline_arch(self):
        """Build the minimal timeline/gantt arch XML string.

        layer_options is NOT embedded here — it is injected at runtime by
        base.get_views() using the template's current config, so any change
        to bg/event settings is reflected immediately without rebuilding
        the ir.ui.view record.
        """
        self.ensure_one()
        groupby_fields = (
            self.field_ids
            .filtered(lambda f: f.role == 'groupby')
            .sorted('sequence')
        )
        root = ET.Element(self.view_type)
        root.set('string', self.name)
        root.set('date_start', self.date_start_field_id.name)
        if self.date_stop_field_id:
            root.set('date_stop', self.date_stop_field_id.name)
        if self.color_field_id:
            root.set('color', self.color_field_id.name)
        if groupby_fields:
            root.set('default_group_by', groupby_fields[0].field_id.name)
        root.set('mode', self.default_scale or 'week')
        # Marker picked up by base.get_views() to inject layer_options
        root.set('yodoo_template_id', str(self.id))
        return ET.tostring(root, encoding='unicode')

    def _build_search_arch(self):
        """Build the search view arch XML string from configured fields."""
        self.ensure_one()
        root = ET.Element('search')
        root.set('string', self.name)

        search_fields = (
            self.field_ids
            .filtered(lambda f: f.role == 'search')
            .sorted('sequence')
        )
        for f in search_fields:
            ET.SubElement(root, 'field',
                          name=f.field_id.name,
                          string=f._get_display_label())

        groupby_fields = (
            self.field_ids
            .filtered(lambda f: f.role == 'groupby')
            .sorted('sequence')
        )
        if groupby_fields:
            grp = ET.SubElement(root, 'group',
                                expand='0', string='Group By')
            for f in groupby_fields:
                fname = f.field_id.name
                flt = ET.SubElement(grp, 'filter',
                                    string=f._get_display_label(),
                                    name='group_%s' % fname)
                flt.set('context', '{"group_by": "%s"}' % fname)

        return ET.tostring(root, encoding='unicode')

    def _create_or_update_timeline_view(self):
        """Create or update the generated timeline ir.ui.view."""
        self.ensure_one()
        arch = self._build_timeline_arch()
        view_vals = {
            'name': 'yodoo.timeline.builder.%d' % self.id,
            'type': self.view_type,
            'model': self.base_model_name,
            'mode': 'primary',
            'active': True,
            'arch_base': arch,
            'yodoo_template_id': str(self.id),
        }
        if self.group_ids:
            view_vals['groups_id'] = [(6, 0, self.group_ids.ids)]

        IrView = self.env['ir.ui.view'].sudo()
        if self.view_id and self.view_id.exists():
            self.view_id.write(view_vals)
            return self.view_id
        view = IrView.create(view_vals)
        self.with_context(no_recompute=True).write({'view_id': view.id})
        return view

    def _create_or_update_search_view(self):
        """Create or update the generated search ir.ui.view."""
        self.ensure_one()
        arch = self._build_search_arch()
        view_vals = {
            'name': 'yodoo.timeline.builder.%d.search' % self.id,
            'type': 'search',
            'model': self.base_model_name,
            'mode': 'primary',
            'active': True,
            'arch_base': arch,
            'yodoo_template_id': 's%d' % self.id,
        }

        IrView = self.env['ir.ui.view'].sudo()
        if self.search_view_id and self.search_view_id.exists():
            self.search_view_id.write(view_vals)
            return self.search_view_id
        view = IrView.create(view_vals)
        self.with_context(no_recompute=True).write({'search_view_id': view.id})
        return view

    def _create_or_update_action(self, timeline_view, search_view):
        """Create or update the generated ir.actions.act_window."""
        self.ensure_one()
        view_mode = '%s,list,form' % self.view_type
        context_str = "{'yodoo_template_id': %d}" % self.id
        domain_str = self.domain or '[]'

        action_vals = {
            'name': self.name,
            'res_model': self.base_model_name,
            'view_mode': view_mode,
            'domain': domain_str,
            'context': context_str,
            'search_view_id': search_view.id,
            'yodoo_template_id': str(self.id),
        }

        IrAction = self.env['ir.actions.act_window'].sudo()
        if self.action_id and self.action_id.exists():
            self.action_id.write(action_vals)
            action = self.action_id
        else:
            action = IrAction.create(action_vals)
            self.with_context(no_recompute=True).write(
                {'action_id': action.id})

        # Set explicit view for the timeline/gantt mode so Odoo uses our arch
        ActWindowView = self.env['ir.actions.act_window.view'].sudo()
        existing = ActWindowView.search([
            ('act_window_id', '=', action.id),
            ('view_mode', '=', self.view_type),
        ])
        if existing:
            existing.write({'view_id': timeline_view.id, 'sequence': 1})
        else:
            ActWindowView.create({
                'act_window_id': action.id,
                'view_mode': self.view_type,
                'view_id': timeline_view.id,
                'sequence': 1,
            })

        return action

    def _create_or_update_menu_item(self, parent_menu, action):
        """Create or update the generated ir.ui.menu."""
        self.ensure_one()
        menu_vals = {
            'name': self.name,
            'parent_id': parent_menu.id,
            'action': 'ir.actions.act_window,%d' % action.id,
            'sequence': 10,
            'yodoo_template_id': str(self.id),
        }

        group_ids = self.group_ids.ids
        if not group_ids:
            default_group = self.env.ref(
                'yodoo_timeline_builder.group_user',
                raise_if_not_found=False,
            )
            if default_group:
                group_ids = [default_group.id]

        if group_ids:
            menu_vals['groups_id'] = [(6, 0, group_ids)]

        IrMenu = self.env['ir.ui.menu'].sudo()
        if self.menu_id and self.menu_id.exists():
            self.menu_id.write(menu_vals)
        else:
            menu = IrMenu.create(menu_vals)
            self.with_context(no_recompute=True).write({'menu_id': menu.id})

    def _create_or_update_menu(self):
        """Orchestrate creation / update of all auto-generated records."""
        self.ensure_one()
        parent_menu = self._get_parent_menu()
        if not parent_menu:
            return

        timeline_view = self._create_or_update_timeline_view()
        search_view = self._create_or_update_search_view()
        action = self._create_or_update_action(timeline_view, search_view)
        self._create_or_update_menu_item(parent_menu, action)

    def _delete_generated_records(self):
        """Delete all auto-generated records for this template."""
        self.ensure_one()
        if self.menu_id and self.menu_id.exists():
            self.menu_id.sudo().unlink()
        if self.action_id and self.action_id.exists():
            self.action_id.sudo().unlink()
        if self.view_id and self.view_id.exists():
            self.view_id.sudo().unlink()
        if self.search_view_id and self.search_view_id.exists():
            self.search_view_id.sudo().unlink()

    # ── Open action shortcut ────────────────────────────────────────────────

    def action_open_timeline(self):
        """Open the timeline/gantt view for this template."""
        self.ensure_one()
        if not self.action_id or not self.action_id.exists():
            self._create_or_update_menu()
        if not self.action_id:
            return False
        return {
            'type': 'ir.actions.act_window',
            'name': self.name,
            'res_model': self.base_model_name,
            'view_mode': '%s,list,form' % self.view_type,
            'domain': self.domain or '[]',
            'context': {'yodoo_template_id': self.id},
            'target': 'current',
        }

    # ── layer_options builder (used by base.get_views) ──────────────────────

    def _build_layer_options(self):
        """Build the layer_options dict consumed by the JS TimeBaseController.

        Called at view-load time by base.get_views(), so background and event
        settings are always up-to-date without rebuilding the arch record.
        """
        self.ensure_one()

        tooltip_fields = (
            self.field_ids
            .filtered(lambda f: f.role == 'tooltip')
            .sorted('sequence')
        )

        # Main self_fields event (mandatory)
        events_config = [{
            'key': 'main',
            'source': 'self_fields',
            'type': 'base',
            'start_field': self.date_start_field_id.name,
            'stop_field': (self.date_stop_field_id.name
                           if self.date_stop_field_id else None),
            'color_field': (self.color_field_id.name
                            if self.color_field_id else None),
            'tooltip_fields': [
                {
                    'field': f.field_id.name,
                    'label': f._get_display_label(),
                }
                for f in tooltip_fields
            ],
        }]

        # Related / overlay events
        for ev in self.event_ids:
            events_config.append(ev._build_event_config())

        return {
            'toolbar': {
                'scales': ['day', 'week', 'month', 'year'],
                'show_today': True,
                'show_zoom': True,
            },
            'background': {
                'weekends': self.bg_weekends,
                'show_weekends': True,
                'work_hours': self.bg_work_hours,
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

    # ── Related-events data (called from base.get_time_view_data) ───────────

    @api.model
    def _get_related_events(  # pylint: disable=too-many-locals,too-many-branches
            self, template, record_ids, view_type):
        """Load related events from all configured event overlays.

        Returns a list of event dicts compatible with the JS controller's
        expected format.
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

            RelModel = self.env[source_model_name]

            for parent_id in record_ids:
                domain = self._resolve_event_domain(
                    raw_domain, ev_cfg.domain_ref_field or 'id', parent_id)
                try:
                    fetch_fields = ['id', 'display_name', start_field]
                    if stop_field:
                        fetch_fields.append(stop_field)
                    if color_field:
                        fetch_fields.append(color_field)
                    rel_records = RelModel.sudo().search_read(
                        domain, list(dict.fromkeys(fetch_fields)))
                except Exception as exc:
                    _logger.warning(
                        'yodoo_timeline_builder: event %s error: %s',
                        ev_cfg.key, exc)
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
        """Substitute ``__id__`` placeholder with the actual parent id."""
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

    # ── Legacy API kept for compatibility ───────────────────────────────────

    @api.model
    def get_builder_config(self, template_id):
        """Return full configuration dict (legacy JS API, kept for compat)."""
        template = self.browse(template_id)
        template.ensure_one()

        groupby_fields = template.field_ids.filtered(
            lambda f: f.role == 'groupby').sorted('sequence')
        search_fields = template.field_ids.filtered(
            lambda f: f.role == 'search').sorted('sequence')
        tooltip_fields = template.field_ids.filtered(
            lambda f: f.role == 'tooltip').sorted('sequence')

        fetch = ['id', 'display_name', template.date_start_field_id.name]
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
            'layer_options': template._build_layer_options(),
        }

    @api.model
    def get_builder_data(self, template_id, domain_override, filters,
                         view_type='timeline'):
        """Fetch records and related events (legacy JS API)."""
        template = self.browse(template_id)
        template.ensure_one()

        config = self.get_builder_config(template_id)

        base_domain = json.loads(template.domain or '[]')
        domain = AND([base_domain, domain_override or []])

        if filters:
            filter_clauses = self._filters_to_domain(filters, config)
            if filter_clauses:
                domain = AND([domain, filter_clauses])

        Model = self.env[template.base_model_name]
        raw_records = Model.sudo().search_read(
            domain, config['fields_to_fetch'], limit=2000)
        records = [self._serialize_record(r) for r in raw_records]

        all_ids = [r['id'] for r in records]
        events = self._get_related_events(template, all_ids, view_type)

        return {'records': records, 'events': events}

    @api.model
    def _serialize_record(self, rec_dict):
        """Convert ORM values to JSON-serializable primitives."""
        result = {}
        for k, v in rec_dict.items():
            if isinstance(v, (date, datetime)):
                result[k] = v.isoformat()
            else:
                result[k] = v
        return result

    @api.model
    def _filters_to_domain(self, filters, config):
        """Convert inline filter list to an Odoo domain list."""
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
            ttype = search_field_map.get(key, {}).get('ttype', 'char')
            if op == 'is_set':
                clauses.append((key, '!=', False))
            elif op == 'is_not_set':
                clauses.append((key, '=', False))
            elif op == 'contains':
                clauses.append((key, 'ilike', val))
            elif op == 'not_contains':
                clauses.append((key, 'not ilike', val))
            else:
                if ttype in ('integer', 'float', 'monetary'):
                    try:
                        val = float(val)
                    except (TypeError, ValueError):
                        continue
                clauses.append((key, op, val))
        return clauses
