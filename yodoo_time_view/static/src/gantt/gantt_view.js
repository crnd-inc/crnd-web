/** @odoo-module **/

import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { RelationalModel } from "@web/model/relational_model/relational_model";
import { TimeArchParser } from "../core/time_arch_parser";
import { GanttController } from "./gantt_controller";
import { TimeRenderer } from "../core/time_renderer";

export const GanttView = {
    type: "gantt",
    display_name: _t("Gantt"),
    icon: "fa fa-tasks",
    multiRecord: true,
    Model: RelationalModel,
    ArchParser: TimeArchParser,
    Controller: GanttController,
    Renderer: TimeRenderer,

    props: (genericProps, view) => {
        const { arch, relatedModels, resModel } = genericProps;
        const archInfo = new view.ArchParser().parse(arch, relatedModels, resModel);
        // If action didn't pass groupBy - use defaultGroupBy from arch
        // This ensures grouping is shown in SearchView and can be cancelled
        const groupBy =
            genericProps.groupBy?.length
                ? genericProps.groupBy
                : archInfo.defaultGroupBy
                ? [archInfo.defaultGroupBy]
                : [];
        return {
            ...genericProps,
            groupBy,
            Model: view.Model,
            Renderer: view.Renderer,
            archInfo,
        };
    },
};

registry.category("views").add("gantt", GanttView);
