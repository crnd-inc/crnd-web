/** @odoo-module **/

import { ListController } from '@web/views/list/list_controller';
import { KanbanController } from '@web/views/kanban/kanban_controller';
import { FormController } from '@web/views/form/form_controller';
import { patch } from "@web/core/utils/patch";
import { pick } from "@web/core/utils/objects";

const onCreateActionControllerMixin = {
    onCreateAction() {
        if (this.props.archInfo.onCreateActionParams) {
            this.env.onClickViewButton({
                clickParams: this.props.archInfo.onCreateActionParams,
                getResParams: () => pick(this.model.root, "context", "evalContext", "resModel", "resId", "resIds"),
                beforeExecuteAction: this.beforeExecuteActionButton.bind(this),
            });
            return true;
        }
        return false;
    }
};

for (let ViewController of [ListController, KanbanController]) {
    patch(ViewController.prototype, 'crnd_web_on_create_action', {
        ...onCreateActionControllerMixin,
        ...{
            async createRecord() {
                if (!this.onCreateAction()) {
                    await this._super(...arguments);
                }
            }
        },
    });
}

patch(FormController.prototype, 'crnd_web_on_create_action', {
    ...onCreateActionControllerMixin,
    ...{
        async create() {
            if (!this.onCreateAction()) {
                await this._super(...arguments);
            }
        }
    },
});