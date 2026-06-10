/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { PlanModel } from "./plan_model";
import { PlanController } from "./plan_controller";
import { PlanRenderer } from "./plan_renderer";
import { PlanArchParser } from "./plan_arch_parser";

const viewRegistry = registry.category("views");

/**
 * Plan View - Interactive floor plans with polygons
 * Based on yodoo_diagram architecture adapted for plan visualization
 */
export const planView = {
    display_name: _t('Plan'),
    type: 'plan',
    icon: 'fa-map',
    multiRecord: false,
    searchable: true,
    withSearchPanel: true,
    withSearchBar: true,
    Controller: PlanController,
    Renderer: PlanRenderer,
    Model: PlanModel,
    ArchParser: PlanArchParser,
    
    props: (genericProps, view) => {
        const { ArchParser } = view;
        const { arch, resModel, resId, fields, context } = genericProps;
        const archInfo = new ArchParser().parse(arch, resModel, resId, fields);
        
        return {
            ...genericProps,
            modelParams: {
                ...archInfo,
                resModel,
                resId,
                context,
            },
            Model: view.Model,
            Renderer: view.Renderer,
        };
    },
};

viewRegistry.add('plan', planView);
