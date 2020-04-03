import itertools
from operator import itemgetter
from lxml import etree

from odoo.tools.view_validation import get_attrs_field_names
from odoo import models, fields, api, _


class IrUiView(models.Model):
    # pylint: disable=too-many-locals
    # pylint: disable=too-many-branches

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
        if node.getchildren()[1].tag == 'arrow':
            arrow_fields = self.env[
                node.getchildren()[1].get('object')].fields_get(None)
            _fields.update(arrow_fields)

        node = self.add_on_change(model, node)

        attrs_fields = []
        if self.env.context.get('check_field_names'):
            editable = self.env.context.get('view_is_editable', True)
            attrs_fields = get_attrs_field_names(
                self.env, node, Model, editable)

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
