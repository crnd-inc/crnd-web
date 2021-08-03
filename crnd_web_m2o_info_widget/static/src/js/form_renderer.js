odoo.define('web.M2OInfoWidgetFormRenderer', function (require) {
    "use strict";

    var FormRenderer = require('web.FormRenderer');

    FormRenderer.include({
        on_detach_callback: function () {
            // Destroy all popovers
            _.each(this.getChildren(), function (wid) {
                if (wid.popover_initialized && wid._destroyPopover) {
                    wid._destroyPopover();
                }
            });
            this._super.apply(this, arguments);
        },
    });
});
