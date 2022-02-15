/* eslint-disable */
odoo.define("crnd_web_on_create_action.onCreateActionControllerMixin", function (require) {
    "use strict";

    var onCreateActionControllerMixin = {

        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            if (params.onCreateActionName) {
                this.onCreateActionName = params.onCreateActionName;
                this.onCreateActionType = params.onCreateActionType;
            }
        },

        onCreateAction: function (record) {
            var self = this;
            this.trigger_up('button_clicked', {
                attrs: {
                    'name': self.onCreateActionName,
                    'type': self.onCreateActionType,
                },
                record: record,
            });
        },
    };

    return onCreateActionControllerMixin;
});
