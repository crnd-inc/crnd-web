odoo.define("crnd_web_actions.ClientActions", function (require) {
    "use strict";

    var core = require('web.core');
    // eslint-disable-next-line no-empty-function, no-unused-vars
    function nothing (parent, action) {}

    function reloadView (parent, action) {
        var actModel = action.context.active_model;
        var currentController = parent.getCurrentController();

        if (parent.currentDialogController &&
            parent.currentDialogController.widget.modelName === actModel) {
            parent.currentDialogController.widget.reload();
        } else if (currentController &&
            currentController.widget.modelName === actModel) {
            currentController.widget.reload();
        }
    }

    function readonlyViewMode (parent, action) {
        var actModel = action.context.active_model;
        var currentController = parent.getCurrentController();

        if (parent.currentDialogController &&
            parent.currentDialogController.widget.modelName === actModel) {
            parent.currentDialogController.widget.update({mode: 'readonly'});
        } else if (currentController &&
            currentController.widget.modelName === actModel) {
            currentController.widget.update({mode: 'readonly'});
        }
    }

    function editViewMode (parent, action) {
        var actModel = action.context.active_model;
        var currentController = parent.getCurrentController();

        if (parent.currentDialogController &&
            parent.currentDialogController.widget.modelName === actModel) {
            parent.currentDialogController.widget.update({mode: 'edit'});
        } else if (parent.getCurrentController() &&
            parent.getCurrentController().widget.modelName === actModel) {
            currentController.widget.update({mode:'edit'});
        }
    }

    core.action_registry.add('crnd_act_nothing', nothing);
    core.action_registry.add('crnd_act_view_reload', reloadView);
    core.action_registry.add('crnd_act_view_mode_readonly', readonlyViewMode);
    core.action_registry.add('crnd_act_view_mode_edit', editViewMode);
});
