/** @odoo-module **/

import {
    Graph as CuteGraphPlus,
    GraphNode as CuteNodePlus,
    GraphEdge as CuteEdgePlus,
    wordwrap as CuteGraphPlus_wordwrap,
} from '../../lib/js/graph';
import {
    Component,
    onMounted,
    onWillUnmount,
    useState
} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";

/**
 * Diagram Renderer
 *
 * The diagram renderer responsability is to render a diagram view,
 * that is, a set of (labelled) nodes and edges.
 * To do that, it uses the Raphael.js
 * library.
 */

export class DiagramPlusRenderer extends Component {
    setup() {
        this.uiService = useService("ui");
        this.model = this.props.model;
        this.node_size_x = 110;
        this.node_size_y = 80;
        this.diagram_padding = 20;
        this.diagram_in_dom = false;
        this.diagram_offset = this.props.model.auto_layout ? 50 : 0;
        this.diagram_readonly = this.props.model.diagram_readonly;
        this.state = useState({
            uuid: this.props.uuid,
            nodes: this.props.model.datanodes,
            edges: this.props.model.edges,
            labels: this.props.model.labels,
            auto_layout: this.props.model.auto_layout,
        });
        this.events
        onMounted(async () => {
            await Promise.resolve();
            this.$el = $(this.uiService.activeElement).find('.o_diagram_plus_view');
            this.$diagram_container = this.$el.find('.o_diagram_plus');
            this.renderChart()
        });
        onWillUnmount(() => {
            this.diagram_in_dom = false;
        });
    }
    renderChart() {
        let self = this;
        let {nodes, edges} = this.state;
        let id_to_node = {};
        let style = this.getDiagramStyle();
        // Remove previous diagram
        this.$diagram_container.empty();
        let $div = $('<div>').css(
            {
                position: 'absolute',
                top: -10000,
                right: -10000,
            }
        ).appendTo($('body'));
        let r = new Raphael($div[0], '100%', '100%');
        this.graph = new CuteGraphPlus(
            r, style, this.$diagram_container[0], this.diagram_readonly);
        Object.entries(nodes).forEach(function (item) {
            let node = item[1];
            let n = new CuteNodePlus(
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
        Object.entries(edges).forEach(function (item) {
            let edge = item[1];
            let e = new CuteEdgePlus(
                self.graph,
                CuteGraphPlus_wordwrap(edge.signal, 32),
                id_to_node[edge.s_id],
                // WORKAROUND
                id_to_node[edge.d_id] || id_to_node[edge.s_id]
            );
            e.id = edge.id;
        });
        $div.contents().appendTo(this.$diagram_container);
        $div.remove();

        CuteNodePlus.destruction_callback = function (cutenode) {
            let {remove_node} = self.env.custom_events
            remove_node(cutenode.id);
            return new Promise(() => {});
        };
        CuteNodePlus.double_click_callback = function (cutenode) {
            let {edit_node} = self.env.custom_events
            edit_node(cutenode.id);
        };
        CuteNodePlus.drag_up_callback = function (cutenode) {
            if (!self.state.auto_layout) {
                let {change_node_position} = self.env.custom_events
                change_node_position(cutenode);
            }
        };
        CuteEdgePlus.new_edge_callback = function (cuteedge) {
            let {add_edge} = self.env.custom_events
            add_edge({
                source_id: cuteedge.get_start().id,
                dest_id: cuteedge.get_end().id,
            });
            return new Promise(() => {});
        };
        CuteEdgePlus.destruction_callback = function (cuteedge) {
            let {remove_edge} = self.env.custom_events
            remove_edge(cuteedge.id);
            return new Promise(() => {});
        };

        CuteEdgePlus.double_click_callback = function (cuteedge) {
            let {edit_edge} = self.env.custom_events
            edit_edge(cuteedge.id);
        };

        CuteEdgePlus.creation_callback = function (node_start, node_end) {
            return {label: ''};
        };

        this.diagram_in_dom = true;
        this.align_diagram();
    }

    getDiagramStyle() {
        return {
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
    }

    align_diagram() {
        if (!this.auto_layout) {
            // Alignment of the diagram to the left and if it has a height
            // less than the height of the container, then in the center,
            // else to the top
            let nodes = this.state.nodes;

            let array_of_x = Object.values(nodes).map(function (node) {
                return node.x;
            });
            let array_of_y = Object.values(nodes).map(function (node) {
                return node.y;
            });

            let min_x = Math.min.apply(Math, array_of_x);
            let min_y = Math.min.apply(Math, array_of_y);
            let max_y = Math.max.apply(Math, array_of_y);

            let diagram_height = Math.abs(max_y - min_y) +
                this.node_size_y + 2 * this.diagram_padding;
            let d_container_height = this.$diagram_container.height();

            let tr_x = this.node_size_x / 2 + this.diagram_padding - min_x;
            let tr_y = 0;
            if (d_container_height >= diagram_height) {
                let d_h_offset = (d_container_height -
                    diagram_height - this.node_size_y) / 2
                tr_y = this.node_size_y + d_h_offset - min_y;
            } else {
                tr_y = this.node_size_y - min_y;
            }

            this.graph.translate_graph(tr_x, tr_y);
        }
    }
}

DiagramPlusRenderer.template = "DiagramPlusView";
DiagramPlusRenderer.components = {};
DiagramPlusRenderer.props = ['model']
