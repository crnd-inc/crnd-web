import itertools
from operator import itemgetter
from lxml import etree

from ..tools.view_validation import get_attrs_field_names
from odoo import models, fields, api, _


class IrUiView(models.Model):
    # pylint: disable=too-many-locals
    # pylint: disable=too-many-branches

    _inherit = 'ir.ui.view'

    type = fields.Selection(
        selection_add=[('diagram_plus', 'DiagramPlus')],
        ondelete={'diagram_plus': 'cascade'}
    )

    def _postprocess_tag_diagram_plus(self, node, name_manager, node_info):
        _fields = {}
        color_fields = {}
        attrs = {}

        views = {}
        for child in node:
            if child.tag == 'node':
                node_model = child.get('object')

                for node_field in child:
                    if node_field.tag == 'field':
                        child.remove(node_field)
                        xarch, sub_name_manager = self.with_context(
                            base_model_name=name_manager.Model._name,
                        )._postprocess_view(
                            node_field, node_model, name_manager.validate,
                            editable=node_info['editable'],
                        )
                    views[node_field.tag] = {
                        'arch': xarch,
                        'fields': sub_name_manager.available_fields,
                    }

            if child.tag == 'arrow':
                arrow_model = child.get('object')

                for arrow_field in child:
                    if arrow_field.tag == 'field':
                        child.remove(arrow_field)
                        xarch_ar, sub_ar_name_manager = self.with_context(
                            base_model_name=name_manager.Model._name,
                        )._postprocess_view(
                            arrow_field, arrow_model, name_manager.validate,
                            editable=node_info['editable'],
                        )
                    views[arrow_field.tag] = {
                        'arch': xarch_ar,
                        'fields': sub_ar_name_manager.available_fields,
                    }
        attrs['views'] = views
        name_manager.has_field(node.get('name'), attrs)

    def _validate_tag_diagram_plus(self, node, name_manager, node_info):
        pass
