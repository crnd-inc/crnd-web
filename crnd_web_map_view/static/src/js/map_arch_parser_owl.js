/** @odoo-module **/

import { XMLParser } from "@web/core/utils/xml";
export class MapParseArchError extends Error {}

export class MapArchParser extends XMLParser {
    parse(arch, models, modelName) {
        var latitude_field;
        var longitude_field;
        var title_field;
        var marker_popup_info_fields;
        var max_search_zoom;

        this.visitXML(arch, (node) => {
            switch (node.tagName) {
                case "crnd_map_view": {
                    if (!node.hasAttribute("latitude_field")) {
                        throw new MapParseArchError(
                            `Map view has not defined "latitude_field" attribute.`
                        );
                    }
                    else {
                        latitude_field = node.getAttribute("latitude_field");
                    }
                    if (!node.hasAttribute("longitude_field")) {
                        throw new MapParseArchError(
                            `Map view has not defined "longitude_field" attribute.`
                        );
                    }
                    else {
                        longitude_field = node.getAttribute("longitude_field");
                    }
                    if (!node.hasAttribute("title_field")) {
                        throw new MapParseArchError(
                            `Map view has not defined "title_field" attribute.`
                        );
                    }
                    else {
                        title_field = node.getAttribute("title_field");
                    }
                }
            }
        });

        return {
            latitude_field: latitude_field,
            longitude_field: longitude_field,
            title_field: title_field,
        };

    }
}