odoo.define("crnd_web_action_readonly.ActionManager", function (require) {
    "use strict";

    require('web.ActionManager').include({

        _handleAction: function (action) {
            if (action.type === "ir.actions.readonly") {
                var actModel = action.context.active_model;
                var currentController = this.getCurrentController();

                if (this.currentDialogController &&
                    this.currentDialogController.widget.modelName ===
                    actModel) {
                    return this.currentDialogController.widget.update({
                        mode: 'readonly',
                    });
                } else if (currentController &&
                    currentController.widget.modelName === actModel) {
                    return currentController.widget.update({
                        mode: 'readonly',
                    });
                }

                return $.Deferred().resolve();
            }
            return this._super.apply(this, arguments);
        },
    });
});
