odoo.define("crnd_web_on_create_action.ListView", function (require) {
    "use strict";

    var onCreateActionViewMixin =
        require('crnd_web_on_create_action.onCreateActionViewMixin');

    require('web.ListView').include(onCreateActionViewMixin);
});
