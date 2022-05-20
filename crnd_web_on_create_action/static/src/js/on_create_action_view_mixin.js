/* eslint-disable */
odoo.define("crnd_web_on_create_action.onCreateActionViewMixin", function (require) {
    "use strict";

    var onCreateActionViewMixin = {

        init: function () {
            var self = this;
            this._super.apply(this, arguments);

            var onCreateActionNameClass = 'on-create-action-name-';
            if (this.arch.attrs.class) {
                var classList = this.arch.attrs.class.split(' ');
                classList.forEach(function (className) {
                    if (className.includes(onCreateActionNameClass)) {
                        var name = className.substring(onCreateActionNameClass.length);
                        if (name.length) {
                            self.controllerParams.onCreateActionName = name;
                        }
                    }
                });
            }
        },
    };

    return onCreateActionViewMixin;
});
