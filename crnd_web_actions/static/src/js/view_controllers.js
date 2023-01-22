/** @odoo-module **/

import { FormController } from '@web/views/form/form_controller';
import { KanbanController } from '@web/views/kanban/kanban_controller';
import { ListController } from '@web/views/list/list_controller';
import { patch } from "@web/core/utils/patch";
import { useSetupView } from "@web/views/view_hook";

for (let ViewController of [FormController, KanbanController, ListController]) {
    patch(
        ViewController.prototype,
        'crnd_web_actions',
        {
            setup() {
                this._super(...arguments)
                useSetupView({
                    getLocalState: () => ({ model: this.model }),
                });
            },
        },
    );
}
