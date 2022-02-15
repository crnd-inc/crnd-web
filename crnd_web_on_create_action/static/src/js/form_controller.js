odoo.define("crnd_web_on_create_action.FormController", function (require) {
    "use strict";

    var onCreateActionControllerMixin =
        require('crnd_web_on_create_action.onCreateActionControllerMixin');

    require('web.FormController').include(onCreateActionControllerMixin);

    require('web.FormController').include({

        _onCreate: function () {
            if (this.onCreateActionName) {
                var record = this.model.get(this.handle);
                this.onCreateAction(record);
            } else {
                this._super.apply(this, arguments);
            }
        },
    });
});
