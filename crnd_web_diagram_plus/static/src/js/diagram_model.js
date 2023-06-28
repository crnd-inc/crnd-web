/** @odoo-module **/

import AbstractModel from 'web.AbstractModel';

/**
 * DiagramModel
 */
var DiagramPlusModel = AbstractModel.extend({
    // --------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------

    /**
     * @override
     * @returns {Object}
     */
    get: function () {
        return $.extend(true, {}, {
            labels: this.labels,
            nodes: this.datanodes,
            edges: this.edges,
            node_model: this.node_model,
            parent_field: this.parent_field,
            res_id: this.res_id,
            connector_model: this.connector_model,
            connectors: this.connectors,
            auto_layout: this.auto_layout,
            // to be able get readonly value from renderer
            diagram_readonly: this.diagram_readonly,
        });
    },

    /**
     * @override
     * @param {Object} params
     * @returns {Promise}
     */
    load: function (params) {
        this.modelName = params.modelName;
        this.res_id = params.res_id;
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
        // fetch from context, passed through action following values
        this.highlight_node_id = params.context.highlight_node_id;
        this.highlight_node_color = params.context.highlight_node_color;
        this.diagram_readonly = params.context.diagram_readonly;

        return this._fetchDiagramInfo();
    },
    reload: function () {
        return this._fetchDiagramInfo();
    },

    // --------------------------------------------------------------------
    // Private
    // --------------------------------------------------------------------

    /**
     * @private
     * @param {any} record
     * @returns {Promise}
     */
    _fetchDiagramInfo: function () {
        var self = this;
        return this._rpc({
            route: '/web_diagram_plus/diagram/get_diagram_info',
            params: {
                id: this.res_id,
                model: this.modelName,
                node: this.node_model,
                connector: this.connector_model,
                src_node: this.connectors.attrs.source,
                des_node: this.connectors.attrs.destination,
                label: this.connectors.attrs.label || false,
                bgcolor: this.nodes.attrs.bgcolor,
                bg_color_field: this.nodes.attrs.bg_color_field,
                fg_color_field: this.nodes.attrs.fg_color_field,
                shape: this.nodes.attrs.shape,
                visible_nodes: this.visible_nodes,
                invisible_nodes: this.invisible_nodes,
                node_fields_string: this.node_fields_string,
                connector_fields_string: this.connector_fields_string,
                auto_layout: this.auto_layout,
                d_position_field: this.nodes.attrs.d_position_field,
                calc_auto_layout: self.calc_auto_layout,
                // In order to assign a highlight color to a specific node,
                // pass variables to the controller, enabling the identification
                // of the highlight node. Once the highlight node is determined,
                // the assigned highlight color can be applied to it.
                // Additionally, include the "diagram" readonly attribute to prevent
                // controller from executing write actions when in readonly mode.
                highlight_node_id: this.highlight_node_id,
                highlight_node_color: this.highlight_node_color,
                diagram_readonly: this.diagram_readonly,
            },
        }).then(function (data) {
            self.calc_auto_layout = false;
            self.datanodes = data.nodes;
            self.edges = data.conn;
            self.parent_field = data.parent_field;
        });
    },
});

export default DiagramPlusModel;
