import logging

from odoo import models, fields, api, _, tools
from odoo.tools.safe_eval import safe_eval

from ..tools.graph import graph

_logger = logging.getLogger(__name__)


class IrUiView(models.Model):
    # pylint: disable=too-many-locals
    # pylint: disable=too-many-branches
    # pylint: disable=translation-positional-used

    _inherit = 'ir.ui.view'

    type = fields.Selection(
        selection_add=[('diagram_plus', 'DiagramPlus')],
        ondelete={'diagram_plus': 'cascade'}
    )

    def _postprocess_tag_node(self, node, name_manager, node_info):
        if node.get('bg_color_field'):
            name_manager.has_field(node.get('bg_color_field'), {})
        if node.get('fg_color_field'):
            name_manager.has_field(node.get('fg_color_field'), {})
        for child in node:
            if child.tag == 'field':
                name_manager.has_field(child.get('name'), {})
                node.remove(child)

    def _postprocess_tag_arrow(self, node, name_manager, node_info):
        if node.get('source'):
            name_manager.has_field(node.get('source'), {})
        if node.get('destination'):
            name_manager.has_field(node.get('destination'), {})
        for child in node:
            if child.tag == 'field':
                name_manager.has_field(child.get('name'), {})
                node.remove(child)

    def _postprocess_tag_diagram_plus(self, node, name_manager, node_info):
        # Here we store children in node_info, because we need to avoid futher
        # post-processing of arrow/node nodes in context of diagram model.
        node_info['children'] = []
        for child in node:
            if child.tag == 'arrow':
                self.with_context(
                    base_model_name=name_manager.model._name,
                )._postprocess_view(
                    child, child.get('object'),
                    editable=node_info['editable'],
                )
            elif child.tag == 'node':
                sub_name_manager = self.with_context(
                    base_model_name=name_manager.model._name,
                )._postprocess_view(
                    child, child.get('object'),
                    editable=node_info['editable'],
                )
                has_create_access = sub_name_manager.model.check_access_rights(
                    'create', raise_exception=False)
                if not node.get('create') and not has_create_access:
                    node.set('create', 'false')

    def _validate_tag_diagram_plus(self, node, name_manager, node_info):
        for child in node:
            if child.tag not in ("arrow", "node"):
                msg = _(
                    "Only 'node' and 'arrow' tags allowed in "
                    "'diagram_plus_view', but %(tag_name)s found.",
                ) % {'tag_name': child.tag}
                self.handle_view_error(msg)

    @api.model
    def graph_get(self, record_id, model, node_obj, conn_obj, src_node,
                  des_node, label, scale):
        def rec_name(rec):
            return (rec.name if 'name' in rec else
                    rec.x_name if 'x_name' in rec else
                    None)

        nodes = []
        nodes_name = []
        transitions = []
        start = []
        tres = {}
        labels = {}
        no_ancester = []
        blank_nodes = []

        Model = self.env[model]
        Node = self.env[node_obj]

        # pylint: disable=too-many-nested-blocks
        for model_key, model_value in Model._fields.items():
            if model_value.type == 'one2many':
                if model_value.comodel_name == node_obj:
                    _Node_Field = model_key
                    _Model_Field = model_value.inverse_name
                for node_key, node_value in Node._fields.items():
                    if node_value.type == 'one2many':
                        if node_value.comodel_name == conn_obj:
                            # _Source_Field = "Incoming Arrows"
                            # (connected via des_node)
                            if node_value.inverse_name == des_node:
                                _Source_Field = node_key
                            # _Destination_Field = "Outgoing Arrows"
                            # (connected via src_node)
                            if node_value.inverse_name == src_node:
                                _Destination_Field = node_key

        record = Model.browse(record_id)
        for line in record[_Node_Field]:
            if line[_Source_Field] or line[_Destination_Field]:
                nodes_name.append((line.id, rec_name(line)))
                nodes.append(line.id)
            else:
                blank_nodes.append({'id': line.id, 'name': rec_name(line)})

            if 'flow_start' in line and line.flow_start:
                start.append(line.id)
            elif not line[_Source_Field]:
                no_ancester.append(line.id)

            for t in line[_Destination_Field]:
                transitions.append((line.id, t[des_node].id))
                tres[str(t['id'])] = (line.id, t[des_node].id)
                label_string = ""
                if label:
                    for lbl in safe_eval(label):
                        if (tools.ustr(lbl) in t and
                                tools.ustr(t[lbl]) == 'False'):
                            label_string += ' '
                        else:
                            label_string = (
                                label_string + " " + tools.ustr(t[lbl]))
                labels[str(t['id'])] = (line.id, label_string)

        g = graph(nodes, transitions, no_ancester)
        g.process(start)
        g.scale(*scale)
        result = g.result_get()
        results = {}
        for node_id, node_name in nodes_name:
            results[str(node_id)] = result[node_id]
            results[str(node_id)]['name'] = node_name
        return {'nodes': results,
                'transitions': tres,
                'label': labels,
                'blank_nodes': blank_nodes,
                'node_parent_field': _Model_Field}
