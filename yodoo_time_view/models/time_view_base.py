# -*- coding: utf-8 -*-

import copy
import json
import logging
from lxml import etree as ET
from odoo import api, models
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class TimeViewBaseMixin(models.AbstractModel):
    """Base mixin for all time-based views

    Provides universal configuration and API for Timeline and Gantt views.
    """
    _name = 'time.view.base.mixin'
    _description = 'Time View Base Mixin'

    # Universal configuration for all time views
    _time_view_config = {
        'events': [
            {
                'key': 'default',
                'type': 'base',
                'source': 'self_fields',
                'start_field': 'datetime_start',
                'stop_field': 'datetime_stop',
                'color_field': 'color',
                'timestamp_fields': [],
                'marker_fields': [],
            }
        ],
        'form': {
            'string': 'Time View',
            'default_scale': 'week',
            'allowed_scales': ['day', 'week', 'month', 'year'],
            'color': '#3498db',
            'default_group_by': None,
            'drag_drop': True,
            'resize': True,
            'create': True,
            'edit': True,
            'delete': True,
            'per_view': {
                'timeline': {
                    'drag_drop': True,
                    'resize': True,
                },
                'gantt': {
                    'drag_drop': True,
                    'resize': True,
                    'show_progress': True,
                }
            }
        },
        'layers': {
            # Toolbar scale buttons visibility
            'toolbar': {
                'scales': ['day', 'week', 'month', 'year'],
                'show_today': True,
                'show_zoom': True,
            },
            # Built-in background layer options (always available)
            'background': {
                'weekends': False,      # show weekends highlight by default
                'work_hours': False,    # show work hours by default
                'night': False,         # show night (20:00-08:00) by default
                # Work hours window — used by BackgroundLayer JS
                # work_hours_days uses Python weekday: 0=Mon, 1=Tue, ..., 6=Sun
                'work_hours_start': 9,
                'work_hours_end': 18,
                'work_hours_days': [0, 1, 2, 3, 4],  # Mon–Fri
                # Custom periods from model (list of dicts or False)
                # Each: {name, label, type, model, domain, color, opacity}
                'custom': [],
            },
            # Built-in markers layer options (always available)
            'markers': {
                'current_time': True,   # show "Now" marker by default
                # Custom markers from model (list of dicts or False)
                # Each: {name, label, type, model, domain, color, icon}
                'custom': [],
            },
        },
    }

    @api.model
    def _get_time_view_config(self):
        """Return time view configuration for this model.

        Override this method in your model to provide dynamic configuration
        (e.g. conditionally add events based on installed modules, user
        groups, or record state).

        The base implementation returns a deep copy of the class-level
        _time_view_config dict so the caller may safely modify the result
        without affecting the class attribute.

        Returns:
            dict: Time view configuration
        """
        return copy.deepcopy(self._time_view_config)

    # Supported event types
    SUPPORTED_EVENT_TYPES = [
        'unit',      # Single event (point in time)
        'marker',    # Marker (vertical line)
        'base',      # Base event (interval)
        'multi',     # Multi-event (multiple intervals)
        'process',   # Process (with progress)
        'histogram',  # Histogram
    ]

    # Supported scales
    SUPPORTED_SCALES = {
        'hour': {
            'format': 'YYYY-MM-DD HH:mm',
            'step': 3600000,  # 1 hour in ms
            'label': 'Hour'
        },
        'day': {
            'format': 'YYYY-MM-DD',
            'step': 86400000,  # 1 day in ms
            'label': 'Day'
        },
        'week': {
            'format': 'YYYY-[W]WW',
            'step': 604800000,  # 1 week in ms
            'label': 'Week'
        },
        'month': {
            'format': 'YYYY-MM',
            'step': 2592000000,  # 1 month in ms (approx)
            'label': 'Month'
        },
        'year': {
            'format': 'YYYY',
            'step': 31536000000,  # 1 year in ms
            'label': 'Year'
        }
    }

    @api.model
    def get_view_layers_config(self, view_type=None):
        """Return layers configuration for JS controller.

        Merges defaults -> model layers -> per_view override for view_type.
        Returns a JSON-serializable dict consumed by TimeBaseController.

        Args:
            view_type (str): 'gantt' or 'timeline'

        Returns:
            dict: Layers configuration for background and markers layers
        """
        defaults = {
            'toolbar': {
                'scales': ['day', 'week', 'month', 'year'],
                'show_today': True,
                'show_zoom': True,
            },
            'background': {
                'weekends': False,
                'work_hours': False,
                'night': False,
                'show_weekends': True,
                'show_work_hours': True,
                'show_night': True,
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
        }

        def _merge(config, layers):
            for section in ('toolbar', 'background', 'markers'):
                if section not in layers:
                    continue
                src = dict(layers[section])
                custom = src.pop('custom', None)
                config[section].update(src)
                if custom is not None:
                    config[section]['custom'] = custom

        tv_config = self._get_time_view_config()
        model_layers = tv_config.get('layers', {})
        config = copy.deepcopy(defaults)
        config['timestamp_style'] = 'both'

        # 1. Apply model-level layers
        _merge(config, model_layers)
        if 'timestamp_style' in model_layers:
            config['timestamp_style'] = model_layers['timestamp_style']

        # 2. Apply per_view override for this specific view_type
        if view_type:
            per_view = model_layers.get('per_view', {}).get(view_type, {})
            _merge(config, per_view)
            if 'timestamp_style' in per_view:
                config['timestamp_style'] = per_view['timestamp_style']

        # 3. Resolve custom bg/marker items via overridable methods
        #    Each custom entry gets its 'items' list populated here.
        for entry in config['background']['custom']:
            entry['items'] = self._get_custom_bg_items(
                entry.get('key', ''), view_type)
        for entry in config['markers']['custom']:
            entry['items'] = self._get_custom_mk_items(
                entry.get('key', ''), view_type)

        # Expose events config so JS can detect related sources without RPC
        config['events_config'] = tv_config.get('events', [])

        return config

    @api.model
    def _get_custom_bg_items(self, key, view_type=None):
        """Return pre-generated background period items for a custom layer key.

        Override in your model to provide actual data.
        Each item: {start, end, className} — dates as ISO strings.

        Args:
            key (str): custom layer key from _time_view_config
            view_type (str): 'gantt' or 'timeline'

        Returns:
            list[dict]: list of background period items
        """
        return []

    @api.model
    def _get_custom_mk_items(self, key, view_type=None):
        """Return pre-generated marker items for a custom marker key.

        Override in your model to provide actual data.
        Each item: {id, timestamp, label, color, className} — as ISO string.

        Args:
            key (str): custom marker key from _time_view_config
            view_type (str): 'gantt' or 'timeline'

        Returns:
            list[dict]: list of marker items
        """
        return []

    @api.model
    def get_views(  # pylint: disable=too-many-locals
            self, views, options=None):
        """Override to inject layer_options into gantt/timeline arch.

        Called on the record model, so self._name is the actual model.
        """
        result = super().get_views(views, options=options)
        for v_type, v_data in result.get('views', {}).items():
            if v_type not in ('gantt', 'timeline'):
                continue
            try:
                layers = self.get_view_layers_config(view_type=v_type)
                if not layers:
                    continue
                arch_str = v_data.get('arch', '')
                if not arch_str:
                    continue
                root = ET.fromstring(arch_str)
                # Arch attribute wins over _time_view_config per_view setting.
                ts_style_arch = root.get('timestamp_style')
                if ts_style_arch:
                    layers['timestamp_style'] = ts_style_arch
                root.set('layer_options', json.dumps(layers))

                # Collect timestamp_fields so Odoo includes them in the model's
                # field metadata (props.fields) so the model fetches them.
                # Inject <field> elements — the standard Odoo mechanism.
                tv_config = self._get_time_view_config()
                existing = {f.get('name') for f in root.findall('.//field')}
                extra = []
                for ev in tv_config.get('events', []):
                    for tf in ev.get('timestamp_fields', []):
                        fname = tf.get('field') if isinstance(tf, dict) else tf
                        if fname and fname not in extra:
                            extra.append(fname)
                for fname in extra:
                    if fname not in existing:
                        ET.SubElement(root, 'field', name=fname)
                if extra:
                    root.set('extra_fields', ','.join(extra))

                v_data['arch'] = ET.tostring(root, encoding='unicode')
            except Exception as e:
                _logger.warning(
                    "yodoo_time_view: failed to inject layer_options"
                    " for %s/%s: %s", self._name, v_type, e
                )
        return result

    @api.model
    def _validate_time_view_config(self, config):
        """Validate time view configuration

        Args:
            config (dict): Configuration to validate

        Raises:
            ValidationError: If configuration is invalid
        """
        if not isinstance(config, dict):
            raise ValidationError(
                self.env._("Time view configuration must be a dictionary"))

        if 'events' not in config:
            raise ValidationError(
                self.env._(
                    "Time view configuration must contain 'events' key"))

        if not isinstance(config['events'], list) or not config['events']:
            raise ValidationError(
                self.env._("Time view events must be a non-empty list"))

        # Validate each event
        for event in config['events']:
            self._validate_event_config(event)

        # Validate form config
        if 'form' in config:
            self._validate_form_config(config['form'])

    @api.model
    def _validate_event_config(self, event):
        """Validate event configuration

        Args:
            event (dict): Event configuration

        Raises:
            ValidationError: If configuration is invalid
        """
        required_fields = ['key', 'type', 'source']
        for field in required_fields:
            if field not in event:
                raise ValidationError(
                    self.env._(
                        "Event configuration must contain '%(field)s' field",
                        field=field))

        # Validate event type
        if event['type'] not in self.SUPPORTED_EVENT_TYPES:
            raise ValidationError(
                self.env._(
                    "Unsupported event type '%(type)s'."
                    " Supported types: %(supported)s",
                    type=event['type'],
                    supported=', '.join(self.SUPPORTED_EVENT_TYPES)))

        # Validate data source
        if event['source'] == 'self_fields':
            if 'start_field' not in event:
                raise ValidationError(
                    self.env._(
                        "Event with 'self_fields' source must have"
                        " 'start_field'"))
        elif event['source'] not in ['related', 'computed']:
            raise ValidationError(
                self.env._(
                    "Unsupported event source '%(source)s'",
                    source=event['source']))

    @api.model
    def _validate_form_config(self, form_config):
        """Validate form configuration

        Args:
            form_config (dict): Form configuration

        Raises:
            ValidationError: If configuration is invalid
        """
        if 'default_scale' in form_config:
            if form_config['default_scale'] not in self.SUPPORTED_SCALES:
                raise ValidationError(
                    self.env._(
                        "Unsupported default scale '%(scale)s'."
                        " Supported: %(supported)s",
                        scale=form_config['default_scale'],
                        supported=', '.join(self.SUPPORTED_SCALES.keys())))

        if 'allowed_scales' in form_config:
            for scale in form_config['allowed_scales']:
                if scale not in self.SUPPORTED_SCALES:
                    raise ValidationError(
                        self.env._(
                            "Unsupported allowed scale '%(scale)s'."
                            " Supported: %(supported)s",
                            scale=scale,
                            supported=', '.join(
                                self.SUPPORTED_SCALES.keys())))

    @api.model
    def get_time_view_data(self, records, view_type='timeline'):
        """Get data for the time view

        Args:
            records (list|recordset): Record IDs or recordset to display
            view_type (str): View type ('timeline' or 'gantt')

        Returns:
            dict: Data for the time view
        """
        if records and isinstance(records[0], int):
            records = self.browse(records)
        config = self._get_time_view_config()

        # Get data only for related events (self_fields are rendered by view)
        events_data = []
        for event_config in config['events']:
            if event_config.get('source') != 'related':
                continue
            event_data = self._get_event_data(records, event_config, view_type)
            events_data.extend(event_data)

        # Build result
        result = {
            'events': events_data,
            'config': config,
            'view_type': view_type,
            'scales': self.SUPPORTED_SCALES,
        }

        # Add groups if grouping is set
        if config['form'].get('default_group_by'):
            result['groups'] = self._get_group_data(
                records, config['form']['default_group_by'])

        return result

    @api.model
    def _get_event_data(self, records, event_config, view_type):
        """Get data for a specific event

        Args:
            records (recordset): Records
            event_config (dict): Event configuration
            view_type (str): View type

        Returns:
            list: Event data
        """
        if event_config['source'] == 'self_fields':
            return self._get_self_fields_event_data(
                records, event_config, view_type)
        if event_config['source'] == 'related':
            return self._get_related_event_data(
                records, event_config, view_type)
        if event_config['source'] == 'computed':
            return self._get_computed_event_data(
                records, event_config, view_type)
        return []

    @api.model
    def _get_self_fields_event_data(  # pylint: disable=too-many-locals
            self, records, event_config, view_type):
        """Get event data from model fields

        Args:
            records (recordset): Records
            event_config (dict): Event configuration
            view_type (str): View type

        Returns:
            list: Event data
        """
        tv_config = self._get_time_view_config()
        events = []
        start_field = event_config['start_field']
        stop_field = event_config.get('stop_field')
        color_field = event_config.get('color_field')

        for record in records:
            event_data = {
                'id': f"{record.id}_{event_config['key']}",
                'name': record.display_name or str(record.id),
                'start': getattr(record, start_field),
                'type': event_config['type'],
            }

            # Add end if present
            if stop_field and getattr(record, stop_field):
                event_data['end'] = getattr(record, stop_field)

            # Add color if present
            if color_field and getattr(record, color_field):
                event_data['color'] = getattr(record, color_field)

            # Add group if present
            group_by = (event_config.get('group_by') or
                        tv_config['form'].get('default_group_by'))
            if group_by and hasattr(record, group_by):
                group_value = getattr(record, group_by)
                if group_value:
                    event_data['group'] = (
                        group_value.id if hasattr(group_value, 'id')
                        else group_value)

            # Add progress for Gantt
            if view_type == 'gantt' and hasattr(record, 'progress'):
                event_data['progress'] = record.progress

            # Add timestamps
            if 'timestamp_fields' in event_config:
                timestamps = []
                for ts_config in event_config['timestamp_fields']:
                    ts_field = ts_config['field']
                    if hasattr(record, ts_field) and getattr(record, ts_field):
                        timestamps.append({
                            'name': ts_config['name'],
                            'timestamp': getattr(record, ts_field)
                        })
                event_data['timestamps'] = timestamps

            # Add markers
            if 'marker_fields' in event_config:
                markers = []
                for marker_config in event_config['marker_fields']:
                    marker_field = marker_config['field']
                    if (hasattr(record, marker_field)
                            and getattr(record, marker_field)):
                        markers.append({
                            'name': marker_config['name'],
                            'timestamp': getattr(record, marker_field),
                            'icon': marker_config.get('icon', '📍'),
                            'color': marker_config.get('color', '#ff0000')
                        })
                event_data['markers'] = markers

            events.append(event_data)

        return events

    @api.model
    def _get_related_event_data(  # pylint: disable=too-many-locals
            self, records, event_config, view_type):
        """Get event data from related models

        Args:
            records (recordset): Records
            event_config (dict): Event configuration
            view_type (str): View type

        Returns:
            list: Event data
        """
        related_model_name = event_config.get('model')
        if not related_model_name or related_model_name not in self.env:
            return []

        domain_template = list(event_config.get('domain', []))
        ref_field = event_config.get('domain_ref_field')
        start_field = event_config.get('start_field')
        stop_field = event_config.get('stop_field')

        if not start_field:
            return []

        events = []
        for record in records:
            domain = self._resolve_related_domain(
                domain_template, record, ref_field)
            related_records = self.env[related_model_name].search(domain)
            for rel in related_records:
                start = getattr(rel, start_field, None)
                if not start:
                    continue
                item = {
                    'id': 'rel_%s_%s' % (event_config['key'], rel.id),
                    'name': rel.display_name or str(rel.id),
                    'start': start,
                    'type': event_config.get('type', 'unit'),
                    'source_key': event_config['key'],
                    'group_key': event_config.get('group_key'),
                    'parent_record_id': record.id,
                }
                if stop_field:
                    end = getattr(rel, stop_field, None)
                    if end:
                        item['end'] = end
                color_field = event_config.get('color_field')
                if color_field:
                    color_val = getattr(rel, color_field, None)
                    if color_val:
                        item['color'] = str(color_val)
                events.append(item)
        return events

    @api.model
    def _resolve_related_domain(self, domain_template, record, ref_field):
        """Substitute ref_field value from record into domain placeholders."""
        if not ref_field:
            return domain_template
        ref_value = getattr(record, ref_field, None)
        ref_id = ref_value.id if hasattr(ref_value, 'id') else ref_value
        resolved = []
        placeholder = '__%s__' % ref_field
        for condition in domain_template:
            if isinstance(condition, (list, tuple)) and len(condition) == 3:
                field, op, val = condition
                if val == placeholder:
                    val = ref_id
                resolved.append((field, op, val))
            else:
                resolved.append(condition)
        return resolved

    @api.model
    def _get_computed_event_data(self, records, event_config, view_type):
        return []

    @api.model
    def _get_group_data(self, records, group_by_field):
        """Get grouping data

        Args:
            records (recordset): Records
            group_by_field (str): Field to group by

        Returns:
            list: Group data
        """
        groups = {}

        for record in records:
            if hasattr(record, group_by_field):
                group_value = getattr(record, group_by_field)
                if group_value:
                    group_id = (group_value.id if hasattr(group_value, 'id')
                                else str(group_value))
                    group_name = (group_value.name
                                  if hasattr(group_value, 'name')
                                  else str(group_value))

                    if group_id not in groups:
                        groups[group_id] = {
                            'id': group_id,
                            'name': group_name,
                            'count': 0
                        }

                    groups[group_id]['count'] += 1

        return list(groups.values())

    def _auto_init(self):
        res = super()._auto_init()
        if '_time_view_config' in type(self).__dict__:
            try:
                self._validate_time_view_config(self._time_view_config)
            except Exception as e:
                _logger.error(
                    "Invalid _time_view_config in %s: %s", self._name, e)
        return res
