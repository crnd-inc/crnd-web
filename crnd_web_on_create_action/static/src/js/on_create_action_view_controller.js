import { ListController } from '@web/views/list/list_controller';
import { KanbanController } from '@web/views/kanban/kanban_controller';
import { FormController } from '@web/views/form/form_controller';
import { useViewButtonHandler } from "@web/views/view_button/view_button_hook";
import { patch } from "@web/core/utils/patch";
import { pick } from "@web/core/utils/objects";

const onCreateActionControllerMixin = {
    onCreateAction() {
        if (this.props.archInfo.onCreateActionParams) {
            this.onCreateActionViewButtonHandler({
                clickParams: this.props.archInfo.onCreateActionParams,
                getResParams: () => pick(this.model.root, "context", "evalContext", "resModel", "resId", "resIds"),
            });
            return true;
        }
        return false;
    }
};

for (const ViewController of [ListController, KanbanController]) {
    patch(ViewController.prototype, {
        ...onCreateActionControllerMixin,
        setup() {
            super.setup(...arguments);
            this.onCreateActionViewButtonHandler = useViewButtonHandler();
        },
        async createRecord() {
            if (!this.onCreateAction()) {
                await super.createRecord(...arguments);
            }
        }
    });
}

patch(FormController.prototype, {
    ...onCreateActionControllerMixin,
    setup() {
        super.setup(...arguments);
        this.onCreateActionViewButtonHandler = useViewButtonHandler();
    },
    async create() {
        if (!this.onCreateAction()) {
            await super.create(...arguments);
        }
    }
});
