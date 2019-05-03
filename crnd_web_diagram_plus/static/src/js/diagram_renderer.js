odoo.define('web_diagram_plus.DiagramPlusRenderer', function (require) {
"use strict";

var AbstractRenderer = require('web.AbstractRenderer');

/**
 * Diagram Renderer
 *
 * The diagram renderer responsability is to render a diagram view, that is, a
 * set of (labelled) nodes and edges.  To do that, it uses the Raphael.js
 * library.
 */
var DiagramPlusRenderer = AbstractRenderer.extend({
    template: 'DiagramPlusView',
    /**
     * @override
     * @returns {Deferred}
     */
    start: function () {
        var $header = this.$el.filter('.o_diagram_plus_header');
        _.each(this.state.labels, function (label) {
            $header.append($('<span>').html(label));
        });
        this.$diagram_container = this.$el.filter('.o_diagram_plus');

        return this._super.apply(this, arguments);
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * @override
     * @returns {Deferred}
     */
    _render: function () {
        var self = this;
        var nodes  = this.state.nodes;
        var edges  = this.state.edges;
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
            node_size_x: 110,
            node_size_y: 80,
            connector_active_color: "#FFF",
            connector_radius: 4,

            close_button_radius: 8,
            close_button_color: "#333",
            close_button_x_color: "#FFF",

            gray: "#DCDCDC",
            white: "#FFF",

            viewport_margin: 50
        };

        // remove previous diagram
        this.$diagram_container.empty();

        // for the node and edge's label to be correctly positioned, the diagram
        // must be rendered directly in the DOM, so we render it in a fake
        // element appended in the body, and then move it to this widget's $el
        var $div = $('<div>')
                        .css({position: 'absolute', top: -10000, right: -10000})
                        .appendTo($('body'));
        var r  = new Raphael($div[0], '100%','100%');
        var graph  = new CuteGraphPlus(r, style, this.$diagram_container[0]);
        _.each(nodes, function (node) {
            var n = new CuteNodePlus(
                graph,
                node.x + 50,  // FIXME the +50 should be in the layout algorithm
                node.y + 50,
                CuteGraphPlus.wordwrap(node.name, 14),
                node.shape === 'rectangle' ? 'rect' : 'circle',
                ['white', 'gray'].includes(node.color) ? style[node.color] : node.color,
                node.fgcolor === false ? style.node_label_color : node.fgcolor);

            n.id = node.id;
            id_to_node[node.id] = n;
        });
        _.each(edges, function (edge) {
            var e =  new CuteEdgePlus(
                graph,
                CuteGraphPlus.wordwrap(edge.signal, 32),
                id_to_node[edge.s_id],
                id_to_node[edge.d_id] || id_to_node[edge.s_id]);  // WORKAROUND
            e.id = edge.id;
        });

        // move the renderered diagram to the widget's $el
        $div.contents().appendTo(this.$diagram_container);
        $div.remove();

        CuteNodePlus.double_click_callback = function (cutenode) {
            self.trigger_up('edit_node', {id: cutenode.id});
        };
        CuteNodePlus.destruction_callback = function (cutenode) {
            self.trigger_up('remove_node', {id: cutenode.id});
            // return a rejected deferred to prevent the library from removing
            // the node directly,as the diagram will be redrawn once the node is
            // deleted
            return $.Deferred().reject();
        };
        CuteEdgePlus.double_click_callback = function (cuteedge) {
            self.trigger_up('edit_edge', {id: cuteedge.id});
        };

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
            // return a rejected deferred to prevent the library from removing
            // the edge directly, as the diagram will be redrawn once the edge
            // is deleted
            return $.Deferred().reject();
        };
        return this._super.apply(this, arguments);
    },
});

return DiagramPlusRenderer;

});
