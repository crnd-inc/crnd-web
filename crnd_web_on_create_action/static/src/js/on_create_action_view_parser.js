/** @odoo-module **/

import { ListArchParser } from '@web/views/list/list_arch_parser';
import { KanbanArchParser } from '@web/views/kanban/kanban_arch_parser';
import { FormArchParser } from '@web/views/form/form_arch_parser';
import { patch } from "@web/core/utils/patch";

[ListArchParser, KanbanArchParser, FormArchParser].forEach((ViewParser) => {
    patch(ViewParser.prototype, {
        parse(arch, models, modelName) {
            let archInfo = super.parse(...arguments);
            const xmlDoc = archInfo.xmlDoc;
            const actionName = xmlDoc.getAttribute('on_create_action_name');
            const actionType = xmlDoc.getAttribute('on_create_action_type');
            if (actionName && actionType) {
                archInfo = {
                    ...archInfo,
                    onCreateActionParams: {
                        name: actionName,
                        type: actionType,
                    },
                }
            }
            return archInfo;
        }
    });
})
