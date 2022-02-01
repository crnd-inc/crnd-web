odoo.define("crnd_web_action_editable.ActionManager", function (require) {
    "use strict";

    require('web.ActionManager').include({

        _handleAction: function (action) {
            if (action.type === "ir.actions.view.editable") {
                var actModel = action.context.active_model;
                var currentController = this.getCurrentController();
                var currentDialogController =
                    this.getCurrentControllerInDialog();

                if (currentDialogController.widget.modelName === actModel) {
                    return currentDialogController.widget.update({
                        mode: 'edit',
                    });
                } else if (currentController.widget.modelName === actModel) {
                    return currentController.widget.update({
                        mode: 'edit',
                    });
                }

                return $.Deferred().resolve();
            }
            return this._super.apply(this, arguments);
        },
    });
});
