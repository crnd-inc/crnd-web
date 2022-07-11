odoo.define("crnd_web_on_create_action.FormView", function (require) {
    "use strict";

    var onCreateActionViewMixin =
        require('crnd_web_on_create_action.onCreateActionViewMixin');

    require('web.FormView').include(onCreateActionViewMixin);
});
