/** @odoo-module **/

import { ListArchParser } from '@web/views/list/list_arch_parser';
import { KanbanArchParser } from '@web/views/kanban/kanban_arch_parser';
import { FormArchParser } from '@web/views/form/form_arch_parser';
import { patch } from "@web/core/utils/patch";

const onCreateActionParserMixin = {
    parse(arch, models, modelName) {
        let archInfo = this._super(...arguments);
        const xmlDoc = this.parseXML(arch);
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
};

for (let ViewParser of [ListArchParser, KanbanArchParser, FormArchParser]) {
    patch(ViewParser.prototype, 'crnd_web_on_create_action', onCreateActionParserMixin);
}
