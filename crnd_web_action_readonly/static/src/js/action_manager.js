odoo.define("crnd_web_action_readonly.ActionManager", function (require) {
    "use strict";

    require('web.ActionManager').include({

        _handleAction: function (action) {
            if (action.type === "ir.actions.readonly") {
                var actModel = action.context.active_model;
                var currentController = this.getCurrentController();
                var currentDialogController =
                    this.getCurrentControllerInDialog();

                if (currentDialogController.widget.modelName === actModel) {
                    return currentDialogController.widget._setMode('readonly');
                } else if (currentController.widget.modelName === actModel) {
                    return currentController.widget._setMode('readonly');
                }

                return $.Deferred().resolve();
            }
            return this._super.apply(this, arguments);
        },
    });
});
