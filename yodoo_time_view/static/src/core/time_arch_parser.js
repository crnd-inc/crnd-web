/** @odoo-module **/

import { visitXML } from "@web/core/utils/xml";
import { Field } from "@web/views/fields/field";

export class TimeArchParser {
    parse(arch, models, modelName) {
        const archInfo = {
            dateStart: null,
            dateStop: null,
            dateDelay: null,
            defaultGroupBy: null,
            color: null,
            mode: "week",
            fields: {},
            activeFields: {},
            string: "Timeline",
        };

        const fieldNextIds = {};
        const fieldNodes = {};

        const rootNode = arch;

        archInfo.dateStart = rootNode.getAttribute("date_start") || null;
        archInfo.dateStop = rootNode.getAttribute("date_stop") || null;
        archInfo.dateDelay = rootNode.getAttribute("date_delay") || null;
        archInfo.defaultGroupBy = rootNode.getAttribute("default_group_by") || null;
        archInfo.color = rootNode.getAttribute("color") || null;
        archInfo.mode = rootNode.getAttribute("mode") || "week";
        archInfo.string = rootNode.getAttribute("string") || "Timeline";

        // Parse layer_options injected by get_view() from Python mixin
        const layerOptionsRaw = rootNode.getAttribute("layer_options");
        try {
            archInfo.layerOptions = layerOptionsRaw ? JSON.parse(layerOptionsRaw) : null;
        } catch (e) {
            archInfo.layerOptions = null;
        }

        const modelFields = (models[modelName] && models[modelName].fields) || {};
        const addAttrField = (fname) => {
            if (!fname || !(fname in modelFields) || (fname in fieldNextIds)) return;
            const fakeNode = arch.ownerDocument ? arch.ownerDocument.createElement("field") : document.createElement("field");
            fakeNode.setAttribute("name", fname);
            try {
                const fieldInfo = Field.parseFieldNode(fakeNode, models, modelName, "list");
                fieldNextIds[fname] = 0;
                fieldNodes[`${fname}_0`] = fieldInfo;
            } catch (e) {
                // field not supported - skip
            }
        };

        addAttrField(archInfo.dateStart);
        addAttrField(archInfo.dateStop);
        addAttrField(archInfo.dateDelay);
        addAttrField(archInfo.defaultGroupBy);
        addAttrField(archInfo.color);
        addAttrField("display_name");

        // Parse extra_fields injected by Python mixin for timestamp_fields
        const extraFieldsRaw = rootNode.getAttribute("extra_fields") || "";
        const extraFields = extraFieldsRaw
            ? extraFieldsRaw.split(",").map(f => f.trim()).filter(Boolean)
            : [];
        for (const fname of extraFields) {
            addAttrField(fname);
        }
        archInfo.extraFields = extraFields;

        visitXML(arch, (node) => {
            if (node.tagName === "field") {
                const fieldInfo = Field.parseFieldNode(node, models, modelName, "list");
                const fname = fieldInfo.name;
                if (!(fname in fieldNextIds)) {
                    fieldNextIds[fname] = 0;
                }
                const fieldId = `${fname}_${fieldNextIds[fname]++}`;
                fieldNodes[fieldId] = fieldInfo;
            }
        });

        archInfo.fieldNodes = fieldNodes;
        archInfo.widgetNodes = {};

        return archInfo;
    }
}
