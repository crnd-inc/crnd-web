/** @odoo-module */

import { registry } from "@web/core/registry";
import { MapModel } from "./map_model_owl";
import { MapArchParser } from "./map_arch_parser_owl";
import { MapController } from "./map_controller_owl";
import { MapRenderer } from "./map_renderer_owl";

export const mapView = {
    type: "crnd_map_view",
    display_name: "CR&D Map View",
    icon: "fa fa-map",
    multiRecord: true,
    searchMenuTypes: ["filter", "comparison", "favorite"],
    Controller: MapController,
    Renderer: MapRenderer,
    ArchParser: MapArchParser,
    Model: MapModel,

    props: (genericProps, view) => {
        const { ArchParser } = view;
        const { arch, relatedModels, resModel } = genericProps;
        const archInfo = new MapArchParser().parse(arch, relatedModels, resModel);

        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            archInfo: archInfo,
        };
    },
};

registry.category("views").add("crnd_map_view", mapView);
