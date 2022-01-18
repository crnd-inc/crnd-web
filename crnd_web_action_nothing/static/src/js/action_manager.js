odoo.define("crnd_web_action_nothing.ActionManager", function(require) {
    "use strict";

    require('web.ActionManager').include({
        // Simple action that do nothing.
        // This is required to prevent closing wizard window
        _handleAction: function(action, options) {
            if (action.type === "ir.actions.nothing") {
                return Promise.resolve();
            }
            return this._super.apply(this, arguments);
        },
    });
});
