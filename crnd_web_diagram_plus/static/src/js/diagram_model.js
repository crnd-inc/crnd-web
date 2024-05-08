/** @odoo-module **/
import {KeepLast, Race} from "@web/core/utils/concurrency";
import {Model} from "@web/model/model";
import { useService } from "@web/core/utils/hooks";
/**
 * DiagramModel
 */
export class DiagramPlusModel extends Model {
    setup(params) {
        this.rpc = useService('rpc');
        this.keepLast = new KeepLast();
        this.race = new Race();
        this.params = params;
        const _fetchDiagramInfo = this._fetchDiagramInfo.bind(this);
        this._fetchDiagramInfo = (...args) => {
            return this.race.add(_fetchDiagramInfo(...args));
        };
    }
    get() {
        let data = $.extend(true, {}, {
            labels: this.labels,
            nodes: this.datanodes,
            edges: this.edges,
            node_model: this.node_model,
            parent_field: this.parent_field,
            resId: this.resId,
            connector_model: this.connector_model,
            connectors: this.connectors,
            auto_layout: this.auto_layout,
            diagram_readonly: this.diagram_readonly,
        });
        return data;
    }

    async load(searchParams) {
        let {params} = this;
        this.blocks = [{'name': 'one'}, {'name': 'two'}, {'name': 'three'}];
        this.searchParams = searchParams;
        this.modelName = params.resModel;
        this.res_id = params.resId;
        this.node_model = params.node_model;
        this.connector_model = params.connector_model;
        this.connectors = params.connectors;
        this.nodes = params.nodes;
        this.visible_nodes = params.visible_nodes;
        this.invisible_nodes = params.invisible_nodes;
        this.node_fields_string = params.node_fields_string;
        this.connector_fields_string = params.connector_fields_string;
        this.labels = params.labels;
        this.auto_layout = params.auto_layout;
        this.diagram_readonly = searchParams.context.diagram_readonly;
        this.active_actions = params.activeActions;
        // fetch from context, passed through action following values
        this.highlight_node_id = searchParams.context.highlight_node_id;
        this.highlight_node_color = searchParams.context.highlight_node_color;
        await this._fetchDiagramInfo();
    }

    async reload() {
        await this._fetchDiagramInfo();
         this.blocks = [{'name': 'one'}, {'name': 'two'}, {'name': 'three'}, {'name': 'four'}];
    }

    getFetchParams() {
        let {source, destination, label} = this.connectors.attributes;
        let {bgcolor, bg_color_field, fg_color_field, shape, d_position_field} = this.nodes.attributes;
        let fetchParams = {
            id: this.res_id,
            model: this.modelName,
            node: this.node_model,
            connector: this.connector_model,
            src_node: source?.value,
            des_node: destination?.value,
            label: label?.value,
            bgcolor: bgcolor?.value,
            bg_color_field: bg_color_field?.value,
            fg_color_field: fg_color_field?.value,
            shape: shape?.value,
            d_position_field: d_position_field?.value,
            visible_nodes: this.visible_nodes,
            invisible_nodes: this.invisible_nodes,
            node_fields_string: this.node_fields_string,
            connector_fields_string: this.connector_fields_string,
            auto_layout: this.auto_layout,
            calc_auto_layout: this.calc_auto_layout || false,
            diagram_readonly: this.diagram_readonly,
            // In order to assign a highlight color to a specific node,
            // pass variables to the controller, enabling the identification
            // of the highlight node. Once the highlight node is determined,
            // the assigned highlight color can be applied to it.
            // Additionally, include the "diagram" readonly attribute to prevent
            // controller from executing write actions when in readonly mode.
            highlight_node_id: this.highlight_node_id,
            highlight_node_color: this.highlight_node_color,
        }
        return fetchParams;
    }
    async _loadDiagramInfo() {
        let params = this.getFetchParams();
        return this.rpc('/web_diagram_plus/diagram/get_diagram_info', params)
    }

    async _fetchDiagramInfo() {
        let data = await this.keepLast.add(this._loadDiagramInfo());
        this.calc_auto_layout = false;
        this.datanodes = data.nodes;
        this.edges = data.conn;
        this.parent_field = data.parent_field;
    }
}
