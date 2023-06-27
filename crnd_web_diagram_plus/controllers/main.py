import json
import logging
import odoo.http as http

from odoo.tools.safe_eval import safe_eval

from ..utils import str2bool

_logger = logging.getLogger(__name__)


class DiagramPlusView(http.Controller):

    def _diagram_plus_view__find_nodes(self, diagram_id,
                                       diagram_model,
                                       node_model):
        """ Find nodes for diagram

            :param int diagram_id: ID of record in diagram model to search
                nodes for
            :param str diagram_model: name of diagram model
            :param str node_model: name of model for diagram nodes
            :return recordset: nodes related diagram
        """
        fields = http.request.env['ir.model.fields'].sudo()
        field = fields.search([('model', '=', diagram_model),
                               ('relation', '=', node_model),
                               ('ttype', '=', 'one2many')])
        node_act = http.request.env[node_model]
        return node_act.search(
            [(field.relation_field, '=', diagram_id)])

    # Just Copy+Paste+Edit of original Odoo's method
    # pylint: disable=redefined-builtin,too-many-locals,too-many-statements
    # pylint: disable=too-many-branches
    @http.route('/web_diagram_plus/diagram/get_diagram_info',
                type='json', auth='user')
    def get_diagram_info(self, id, model, node, connector,
                         src_node, des_node, label, **kw):
        visible_node_fields = kw.get('visible_node_fields', [])
        invisible_node_fields = kw.get('invisible_node_fields', [])
        node_fields_string = kw.get('node_fields_string', [])
        connector_fields = kw.get('connector_fields', [])
        connector_fields_string = kw.get('connector_fields_string', [])
        diagram_readonly = kw.get('diagram_readonly', False)

        bgcolors = {}
        shapes = {}
        bgcolor = kw.get('bgcolor', '')
        bg_color_field = kw.get('bg_color_field', '')
        fg_color_field = kw.get('fg_color_field', '')
        shape = kw.get('shape', '')
        auto_layout = str2bool(kw.get('auto_layout'), True)
        d_position_field = kw.get('d_position_field', False)
        calc_auto_layout = str2bool(kw.get('calc_auto_layout'), False)

        init_view = False
        x_offset = 50
        y_offset = 50

        if bgcolor:
            for color_spec in bgcolor.split(';'):
                if color_spec:
                    colour, color_state = color_spec.split(':')
                    bgcolors[colour] = color_state

        if shape:
            for shape_spec in shape.split(';'):
                if shape_spec:
                    shape_colour, shape_color_state = shape_spec.split(':')
                    shapes[shape_colour] = shape_color_state

        ir_view = http.request.env['ir.ui.view']
        graphs = ir_view.crnd_diagram_plus_graph_get(
            int(id), model, node, connector, src_node, des_node,
            label, (140, 180))
        nodes = {}
        isolate_nodes = {}
        if not auto_layout and not calc_auto_layout:
            nodes_data = self._diagram_plus_view__find_nodes(
                diagram_id=id, diagram_model=model, node_model=node)
            for n in nodes_data:
                if n[d_position_field]:
                    nodes[str(n.id)] = {
                        'name': n.name,
                        'x': json.loads(n[d_position_field])['x'],
                        'y': json.loads(n[d_position_field])['y'],
                    }
                else:
                    isolate_nodes[n.id] = {
                        'name': n.name,
                    }
        if not nodes:
            init_view = True
            nodes = graphs['nodes']
            isolate_nodes = {}
            for blnk_node in graphs['blank_nodes']:
                isolate_nodes[blnk_node['id']] = blnk_node

        transitions = graphs['transitions']

        if auto_layout or calc_auto_layout:
            y = [
                t['y']
                for t in nodes.values()
                if t['x'] == 20
                if t['y']
            ]
        else:
            y = [
                t['y']
                for t in nodes.values()
                if t['y']
            ]
        x = [
            t['x']
            for t in nodes.values()
            if t['x']
        ]
        # pylint: disable=consider-using-ternary
        y_max = max(y) if y else 120
        x_min = min(x) - x_offset \
            if x and not auto_layout and not calc_auto_layout else 20

        connectors = {}
        list_tr = []

        for tr in transitions:
            list_tr.append(tr)
            connectors.setdefault(tr, {
                'id': int(tr),
                's_id': transitions[tr][0],
                'd_id': transitions[tr][1]
            })

        connector_model = http.request.env[connector]
        data_connectors = connector_model.search(
            [('id', 'in', list_tr)]).read(connector_fields)

        for tr in data_connectors:
            transition_id = str(tr['id'])
            _sourceid, label = graphs['label'][transition_id]
            t = connectors[transition_id]
            t.update(
                source=tr[src_node][1],
                destination=tr[des_node][1],
                options={},
                signal=label
            )

            for i, fld in enumerate(connector_fields):
                t['options'][connector_fields_string[i]] = tr[fld]

        # CRND FIX: restrict field by type (move computation to separate meth)
        search_acts = self._diagram_plus_view__find_nodes(
            diagram_id=id, diagram_model=model, node_model=node)
        # CRND FIX END
        data_acts = search_acts.read(
            invisible_node_fields + visible_node_fields)

        for act in data_acts:
            n = nodes.get(str(act['id']))
            if not n:
                n = isolate_nodes.get(act['id'], {})
                y_max += 140
                n.update(
                    x=x_min + (
                        0 if auto_layout or calc_auto_layout else x_offset),
                    y=y_max)
                nodes[act['id']] = n

            n.update(
                id=act['id'],
                color='white',
                options={}
            )
            # -- CRND FIX: to set color of node bg and fg
            if not bg_color_field:
                for color, expr in bgcolors.items():
                    if safe_eval(expr, act):
                        n['color'] = color
            else:
                n['color'] = act[bg_color_field]
            n['fgcolor'] = act.get(fg_color_field, False)
            # --

            for shape, expr in shapes.items():
                if safe_eval(expr, act):
                    n['shape'] = shape

            for i, fld in enumerate(visible_node_fields):
                n['options'][node_fields_string[i]] = act[fld]

        if init_view and not auto_layout:
            for key, n in nodes.items():
                n.update(
                    x=int(n['x']) + x_offset,
                    y=int(n['y']) + y_offset,
                )
                if not auto_layout and not diagram_readonly:
                    http.request.env[node].browse([int(key)]).write({
                        d_position_field: json.dumps({
                            'x': n['x'],
                            'y': n['y'],
                        })
                    })

        _id, name = http.request.env[model].sudo().browse([id]).name_get()[0]
        highlight_node_id = kw.get('highlight_node_id')
        if highlight_node_id:
            highlight_node = nodes.get(str(highlight_node_id))
            highlight_color = kw.get('highlight_node_color', False)
            highlight_node['highlight_node_color'] = highlight_color
        return dict(nodes=nodes,
                    conn=connectors,
                    display_name=name,
                    parent_field=graphs['node_parent_field'])
