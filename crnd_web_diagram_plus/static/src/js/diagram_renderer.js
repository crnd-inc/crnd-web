/** @odoo-module **/

import AbstractRenderer from 'web.AbstractRenderer';
import {
    Graph as CuteGraphPlus,
    GraphNode as CuteNodePlus,
    GraphEdge as CuteEdgePlus,
    wordwrap as CuteGraphPlus_wordwrap,
} from './graph';

/**
 * Diagram Renderer
 *
 * The diagram renderer responsability is to render a diagram view,
 * that is, a set of (labelled) nodes and edges.
 * To do that, it uses the Raphael.js
 * library.
 */
var DiagramPlusRenderer = AbstractRenderer.extend({
    template: 'DiagramPlusView',

    /**
        * @override
        */
    init: function () {
        this._super.apply(this, arguments);
        this.node_size_x = 110;
        this.node_size_y = 80;
        this.diagram_padding = 20;
        this.diagram_in_dom = false;
        this.diagram_offset = this.state.auto_layout ? 50 : 0;
        this.diagram_readonly = this.state.diagram_readonly;
    },

    /**
     * @override
     * @returns {Promise}
     */
    start: function () {
        var $header = this.$el.filter('.o_diagram_plus_header');
        _.each(this.state.labels, function (label) {
            $header.append($('<span>').html(label));
        });
        this.$diagram_container = this.$el.filter('.o_diagram_plus');

        return this._super.apply(this, arguments);
    },

    on_attach_callback: function () {
        this._super.apply(this, arguments);
        this.diagram_in_dom = true;
        this.align_diagram();
    },

    on_detach_callback: function () {
        this._super.apply(this, arguments);
        this.diagram_in_dom = false;
    },

    /* eslint-disable */
    align_diagram: function () {
        if (!this.auto_layout) {
            // Alignment of the diagram to the left and if it has a height
            // less than the height of the container, then in the center,
            // else to the top
            var nodes = this.state.nodes;

            var array_of_x = Object.values(nodes).map(function (node) {
                return node.x;
            });
            var array_of_y = Object.values(nodes).map(function (node) {
                return node.y;
            });

            var min_x = Math.min.apply(Math, array_of_x);
            var min_y = Math.min.apply(Math, array_of_y);
            var max_y = Math.max.apply(Math, array_of_y);

            var diagram_height = Math.abs(max_y - min_y) +
                this.node_size_y + 2 * this.diagram_padding;
            var d_container_height = this.$diagram_container.height();

            var tr_x = this.node_size_x / 2 + this.diagram_padding - min_x;
            var tr_y = 0;
            if (d_container_height >= diagram_height) {
                var d_h_offset = (d_container_height -
                    diagram_height - this.node_size_y) / 2
                tr_y = this.node_size_y + d_h_offset - min_y;
            } else {
                tr_y = this.node_size_y - min_y;
            }

            this.graph.translate_graph(tr_x, tr_y);
        }
    },
    /* eslint-enable */

    // --------------------------------------------------------------------
    // Private
    // --------------------------------------------------------------------

    /**
     * @override
     * @returns {Promise}
     */
    _render: function () {
        var self = this;
        var nodes = this.state.nodes;
        var edges = this.state.edges;
        var id_to_node = {};
        var style = {
            edge_color: "#A0A0A0",
            edge_label_color: "#555",
            edge_label_font_size: 10,
            edge_width: 2,
            edge_spacing: 100,
            edge_loop_radius: 100,

            node_label_color: "#333",
            node_label_font_size: 12,
            node_outline_color: "#333",
            node_outline_width: 1,
            node_selected_color: "#0097BE",
            node_selected_width: 2,
            node_size_x: this.node_size_x,
            node_size_y: this.node_size_y,
            connector_active_color: "#FFF",
            connector_radius: 4,

            close_button_radius: 8,
            close_button_color: "#333",
            close_button_x_color: "#FFF",

            gray: "#DCDCDC",
            white: "#FFF",

            viewport_margin: 50,
        };

        // Remove previous diagram
        this.$diagram_container.empty();

        // For the node and edge's label to be correctly positioned,
        // the diagram must be rendered directly in the DOM,
        // so we render it in a fake element appended in the body,
        // and then move it to this widget's $el
        var $div = $('<div>').css(
            {
                position: 'absolute',
                top: -10000,
                right: -10000,
            }
        ).appendTo($('body'));
        // eslint-disable-next-line no-undef
        var r = new Raphael($div[0], '100%', '100%');
        this.graph = new CuteGraphPlus(
            r, style, this.$diagram_container[0], this.diagram_readonly);
        _.each(nodes, function (node) {
            var n = new CuteNodePlus(
                self.graph,
                // FIXME the +50 should be in the layout algorithm
                node.x + self.diagram_offset,
                node.y + self.diagram_offset,
                CuteGraphPlus_wordwrap(node.name, 14),
                node.shape === 'rectangle' ? 'rect' : 'circle',
                node.color === 'white' || node.color === 'gray'
                    ? style[node.color] : node.color,
                node.fgcolor === false
                    ? style.node_label_color : node.fgcolor,
                node.highlight_node_color,
            );

            n.id = node.id;
            id_to_node[node.id] = n;
        });
        _.each(edges, function (edge) {
            var e = new CuteEdgePlus(
                self.graph,
                CuteGraphPlus_wordwrap(edge.signal, 32),
                id_to_node[edge.s_id],
                // WORKAROUND
                id_to_node[edge.d_id] || id_to_node[edge.s_id]);
            e.id = edge.id;
        });

        // Move the renderered diagram to the widget's $el
        $div.contents().appendTo(this.$diagram_container);
        $div.remove();

        CuteNodePlus.double_click_callback = function (cutenode) {
            self.trigger_up('edit_node', {id: cutenode.id});
        };

        CuteNodePlus.destruction_callback = function (cutenode) {
            self.trigger_up('remove_node', {id: cutenode.id});
            // Return a rejected promise to prevent the library
            // from removing the node directly,
            // as the diagram will be redrawn once the node is deleted
            return Promise.reject();
        };

        CuteNodePlus.drag_up_callback = function (cutenode) {
            if (!self.state.auto_layout) {
                self.trigger_up('change_node_position', {node: cutenode});
            }
        };

        CuteEdgePlus.double_click_callback = function (cuteedge) {
            self.trigger_up('edit_edge', {id: cuteedge.id});
        };

        // eslint-disable-next-line no-unused-vars
        CuteEdgePlus.creation_callback = function (node_start, node_end) {
            return {label: ''};
        };

        CuteEdgePlus.new_edge_callback = function (cuteedge) {
            self.trigger_up('add_edge', {
                source_id: cuteedge.get_start().id,
                dest_id: cuteedge.get_end().id,
            });
        };
        CuteEdgePlus.destruction_callback = function (cuteedge) {
            self.trigger_up('remove_edge', {id: cuteedge.id});
            // Return a rejected promise to prevent the library from
            // removing the edge directly,
            // as the diagram will be redrawn once the edge is deleted
            return Promise.reject();
        };

        if (this.diagram_in_dom) {
            this.align_diagram();
        }

        return this._super.apply(this, arguments);
    },
});

export default DiagramPlusRenderer;
