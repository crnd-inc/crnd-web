odoo.define("crnd_web_on_create_action.ListController", function (require) {
    "use strict";

    var onCreateActionControllerMixin =
        require('crnd_web_on_create_action.onCreateActionControllerMixin');

    require('web.ListController').include(onCreateActionControllerMixin);

    require('web.ListController').include({

        _onCreateRecord: function (ev) {
            if (this.onCreateActionName) {
                ev.stopPropagation();
                this.onCreateAction();
            } else {
                this._super.apply(this, arguments);
            }
        },
    });
});
