odoo.define("crnd_web_on_create_action.onCreateActionViewMixin", function (require) {
    "use strict";

    var onCreateActionViewMixin = {

        init: function () {
            var self = this;
            this._super.apply(this, arguments);

            if (this.arch.attrs.class) {
                var action = {};
                var classList = this.arch.attrs.class.split(' ');
                classList.forEach(function (className) {
                    var res = self.checkOnCreateActionClasses(className);
                    if (res) {
                        action[res[0]] = res[1];
                    }
                });
                if (action.name && action.type) {
                    this.controllerParams.onCreateActionName = action.name;
                    this.controllerParams.onCreateActionType = action.type;
                }
            }
        },

        // This method checks if the class name matches the format
        // "on-create-action-name-NAME" or "on-create-action-type-TYPE",
        // where "NAME" is action name and "TYPE" is action type
        checkOnCreateActionClasses: function (className) {
            var onCreateActionNameClass = 'on-create-action-name-';
            var onCreateActionTypeClass = 'on-create-action-type-';
            if (className.includes(onCreateActionNameClass)) {
                var name = className.substring(onCreateActionNameClass.length);
                if (name.length) {
                    return ['name', name];
                }
            } else if (className.includes(onCreateActionTypeClass)) {
                var type = className.substring(onCreateActionTypeClass.length);
                if (type === 'action' || type === 'object') {
                    return ['type', type];
                }
            }
            return false;
        },
    };

    return onCreateActionViewMixin;
});
