import itertools

from operator import itemgetter
from lxml import etree

from odoo import models, fields, api, tools, _
from odoo.tools.safe_eval import safe_eval

from ..utils import str2bool
from ..tools.graph import Graph


class IrUiView(models.Model):
    # pylint: disable=too-many-locals
    # pylint: disable=too-many-branches
    # pylint: disable=translation-positional-used
    # pylint: disable=too-many-statements

    _inherit = 'ir.ui.view'

    type = fields.Selection(selection_add=[('diagram_plus', 'DiagramPlus')])

    @api.model
    def postprocess_and_fields(self, model, node, view_id):
        """
            Rewrited for diagram_plus.
            Almost Copy+Paste+Edit of original Odoo's method.
        """
        if node.tag != 'diagram_plus':
            return super(IrUiView, self).postprocess_and_fields(
                model, node, view_id)

        _fields = {}
        color_fields = {}

        # Auto layout have to be enabled by default, but could be disabled
        # with attribute on node
        auto_layout = str2bool(node.attrib.get('auto_layout'), True)
        if model not in self.env:
            self.raise_view_error(
                _('Model not found: %(model)s') % dict(model=model), view_id)
        Model = self.env[model]

        is_base_model = self.env.context.get('base_model_name', model) == model

        if node.getchildren()[0].tag == 'node':
            node_model = self.env[node.getchildren()[0].get('object')]
            node_fields = node_model.fields_get(None)
            # we have to get the fields of color attributes if assigned
            color_fields = node_model.fields_get([
                node.getchildren()[0].get('bg_color_field'),
                node.getchildren()[0].get('fg_color_field'),
            ])
            _fields.update(color_fields)
            _fields.update(node_fields)
            if (not node.get("create") and
                    not node_model.check_access_rights(
                        'create', raise_exception=False) or
                    not self._context.get("create", True) and
                    is_base_model):
                node.set("create", 'false')
            if not auto_layout:
                d_position_field = \
                    node.getchildren()[0].get('d_position_field', False)
                if not d_position_field:
                    message = _(
                        "Field d_position_field must be present in"
                        " diagram_plus[node], because set auto_layout='False'"
                    )
                    self.raise_view_error(message, view_id)
                if d_position_field not in node_fields:
                    message = _(
                        "Field `%(field_name)s` does not exist"
                    ) % dict(field_name=d_position_field)
                    self.raise_view_error(message, view_id)

        if node.getchildren()[1].tag == 'arrow':
            arrow_fields = self.env[
                node.getchildren()[1].get('object')].fields_get(None)
            _fields.update(arrow_fields)

        node = self.add_on_change(model, node)

        attrs_fields = []
        if self.env.context.get('check_field_names'):
            editable = self.env.context.get('view_is_editable', True)
            attrs_fields = self.get_attrs_field_names(node, Model, editable)

        fields_def = self.postprocess(model, node, view_id, False, _fields)
        arch = etree.tostring(node, encoding="unicode").replace('\t', '')
        for k in list(_fields):
            if k not in fields_def:
                del _fields[k]
        # Ensure there are color fields
        for c_f in color_fields:
            if c_f not in _fields:
                message = _(
                    "Field `%(field_name)s` must be present in"
                    " diagram_plus[node][field], because it present in"
                    " diagram_plus[node], but is missing."
                ) % dict(field_name=c_f)
                self.raise_view_error(message, view_id)
        for field in fields_def:
            if field in _fields:
                _fields[field].update(fields_def[field])
            else:
                message = _(
                    "Field `%(field_name)s` does not exist"
                ) % dict(field_name=field)
                self.raise_view_error(message, view_id)

        missing = [item for item in attrs_fields if item[0] not in _fields]
        if missing:
            msg_lines = []
            msg_fmt = _("Field %r used in attributes must be"
                        " present in view but is missing:")
            line_fmt = _(" - %r in %s=%r")
            for name, lines in itertools.groupby(
                    sorted(missing), itemgetter(0)):
                if msg_lines:
                    msg_lines.append("")
                msg_lines.append(msg_fmt % name)
                for line in lines:
                    msg_lines.append(line_fmt % line)
            self.raise_view_error("\n".join(msg_lines), view_id)

        return arch, _fields

    @api.model
    def crnd_diagram_plus_graph_get(self, record_id, model, node_obj, conn_obj,
                                    src_node, des_node, label, scale):
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

        Model = self.sudo().env[model]
        Node = self.sudo().env[node_obj]

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

        g = Graph(nodes, transitions, no_ancester)
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
