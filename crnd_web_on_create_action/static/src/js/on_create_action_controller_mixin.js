/* eslint-disable */
odoo.define("crnd_web_on_create_action.onCreateActionControllerMixin", function (require) {
    "use strict";

    var onCreateActionControllerMixin = {

        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            if (params.onCreateActionName) {
                this.onCreateActionName = params.onCreateActionName;
            }
        },

        onCreateAction: function (record) {
            var self = this;
            var cact = this.getParent().actionService.currentController.action;
            if (cact.context.active_id && cact.context.active_model) {
                this.do_action(
                    self.onCreateActionName,
                    {
                        'additional_context': {
                            'active_model': cact.context.active_model,
                            'active_id': cact.context.active_id,
                        },
                    }
                );
            } else {
                this.do_action(self.onCreateActionName)
            }
        },
    };

    return onCreateActionControllerMixin;
});
