/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { DiagramPlusModel } from "./diagram_model";
import { DiagramPlusController } from "./diagram_controller";
import { DiagramPlusRenderer } from "./diagram_renderer";
import { DiagramPlusArchParser } from "./diagram_arch_parser";
const viewRegistry = registry.category("views");


/**
 * Diagram View
 */
export const DiagramPlusView = {
    display_name: _t('DiagramPlus'),
    type: 'diagram_plus',
    icon: 'fa-code-fork',
    multiRecord: false,
    searchable: false,
    withSearchPanel: false,
    withSearchBar: false,
    Controller: DiagramPlusController,
    Renderer: DiagramPlusRenderer,
    Model: DiagramPlusModel,
    ArchParser: DiagramPlusArchParser,
    buttonTemplate: "DiagramPlusView.buttons",
    props: (genericProps, view) => {
        const { ArchParser } = view;
        const { arch, resModel, resId, fields} = genericProps;
        let archInfo = new ArchParser().parse(arch, resModel, resId, fields);
        return {
            ...genericProps,
            modelParams: archInfo,
            Model: view.Model,
            Renderer: view.Renderer,
            buttonTemplate: view.buttonTemplate,
        };
    },
};

viewRegistry.add('diagram_plus', DiagramPlusView);
