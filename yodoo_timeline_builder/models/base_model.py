# -*- coding: utf-8 -*-
import json
import logging
from lxml import etree as ET
from odoo import api, models

_logger = logging.getLogger(__name__)


class Base(models.AbstractModel):
    """Base model extensions for yodoo_timeline_builder.

    Applied to all models so that dynamically generated timeline/gantt views
    work on arbitrary models that do not inherit timeline.mixin.
    """

    _inherit = 'base'

    # ── get_views override ──────────────────────────────────────────────────

    @api.model
    def get_views(self, views, options=None):
        """Inject layer_options from yodoo.timeline.template into arch.

        When the arch root element carries ``yodoo_template_id="<id>"``,
        look up the template, build layer_options from its config and set
        it as a JSON attribute.  The JS TimeArchParser reads this attribute
        in exactly the same way as for mixin-based models.
        """
        result = super().get_views(views, options=options)
        for v_type, v_data in result.get('views', {}).items():
            if v_type not in ('gantt', 'timeline'):
                continue
            arch_str = v_data.get('arch', '')
            if not arch_str:
                continue
            try:
                root = ET.fromstring(arch_str)
            except ET.XMLSyntaxError:
                continue
            template_id_str = root.get('yodoo_template_id')
            if not template_id_str:
                # Not a builder-generated view — leave unchanged
                continue
            try:
                template_id = int(template_id_str)
                template = self.env['yodoo.timeline.template'].sudo().browse(
                    template_id)
                if not template.exists():
                    continue
                layer_options = template._build_layer_options()
                root.set('layer_options', json.dumps(layer_options))

                # Inject extra_fields so the arch parser fetches tooltip fields
                tooltip_fnames = (
                    template.field_ids
                    .filtered(lambda f: f.role == 'tooltip')
                    .sorted('sequence')
                    .mapped('field_id.name')
                )
                if tooltip_fnames:
                    root.set('extra_fields', ','.join(tooltip_fnames))

                v_data['arch'] = ET.tostring(root, encoding='unicode')
            except Exception as exc:
                _logger.warning(
                    'yodoo_timeline_builder: failed to inject layer_options'
                    ' for template %s on model %s: %s',
                    template_id_str, self._name, exc,
                )
        return result

    # ── get_time_view_data fallback ─────────────────────────────────────────

    @api.model
    def get_time_view_data(self, records, view_type='timeline'):
        """Fallback implementation for models without timeline.mixin.

        Models that inherit time.view.base.mixin have their own
        get_time_view_data higher in the MRO, so this fallback only
        runs for plain models used through the builder.

        When the action context carries ``yodoo_template_id``, related
        events configured on the template are loaded and returned.
        """
        template_id = self.env.context.get('yodoo_template_id')
        if not template_id:
            return {
                'events': [],
                'config': {},
                'view_type': view_type,
                'scales': {},
            }
        try:
            Template = self.env['yodoo.timeline.template'].sudo()
            template = Template.browse(int(template_id))
            if not template.exists():
                return {
                    'events': [],
                    'config': {},
                    'view_type': view_type,
                    'scales': {},
                }
            # records may arrive as a list of ints or a list of dicts
            if (isinstance(records, (list, tuple))
                    and records
                    and isinstance(records[0], int)):
                record_ids = list(records)
            else:
                record_ids = [
                    r['id'] if isinstance(r, dict) else int(r)
                    for r in (records or [])
                ]
            events = Template._get_related_events(
                template, record_ids, view_type)
            return {
                'events': events,
                'config': {},
                'view_type': view_type,
                'scales': {},
            }
        except Exception as exc:
            _logger.warning(
                'yodoo_timeline_builder: get_time_view_data error: %s', exc)
            return {
                'events': [],
                'config': {},
                'view_type': view_type,
                'scales': {},
            }
