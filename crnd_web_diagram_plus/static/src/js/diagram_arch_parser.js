/** @odoo-module **/

import {visitXML} from "@web/core/utils/xml";
import {archParseBoolean, getActiveActions} from "@web/views/utils";

export class DiagramPlusArchParser {
    parse(xmlDoc, resModel, resId, fields = {}) {
        let archInfo = {
            fields, fieldAttrs: {},
            groupBy: [],
            measures: [],
            domain: [],
            resModel,
            resId,
        };
        let self = this;

        visitXML(xmlDoc, (node) => {
            if (node.tagName === 'diagram_plus') {
                let labels = Array.from(node.children)
                    .filter(child => child.tagName === 'LABEL')
                    .map(label => label.getAttribute('string'));
                archInfo = Object.assign(archInfo, {
                    activeActions: getActiveActions(node),
                    labels: labels,
                    auto_layout: 'auto_layout' in node.attributes ? archParseBoolean(node.attributes.auto_layout.value) : true,
                });
            } else if (node.tagName === 'node') {
                let invisible_nodes = [];
                let visible_nodes = [];
                let node_fields_string = [];
                Array.from(node.children).forEach(function (child) {
                    if (child.getAttribute('invisible') === '1') {
                        invisible_nodes.push(child.getAttribute('name'));
                    } else {
                        let fieldString = fields[child.getAttribute('name')]?.string || self.toTitleCase(child.getAttribute('name'));
                        visible_nodes.push(child.getAttribute('name'));
                        node_fields_string.push(fieldString);
                    }
                });

                archInfo = Object.assign(archInfo, {
                    nodes: node,
                    node_model: node.attributes.object.value,
                    invisible_nodes,
                    visible_nodes,
                    node_fields_string,
                });
            } else if (node.tagName === 'arrow') {
                let connector_fields_string = Array.from(node.children).map(function (conn) {
                    return fields[conn.getAttribute('name')]?.string || self.toTitleCase(conn.getAttribute('name'));
                });
                archInfo = Object.assign(archInfo, {
                    connectors: node,
                    connector_model: node.attributes.object.value,
                    connector_fields_string
                });
            }
        });

        return archInfo;
    }

    toTitleCase(str) {
        return str.replace(/\b\w/g, function (txt) {
            return txt.toUpperCase();
        });
    }

}
