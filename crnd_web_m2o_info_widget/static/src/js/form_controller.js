odoo.define('web.M2OInfoWidgetFormController', function (require) {
    "use strict";

    var FormController = require('web.FormController');

    FormController.include({
        on_detach_callback: function () {
            if (this.modelName === 'request.request') {
                $.each($('body').children(), function (index, value) {
                    if (value.id && value.id.indexOf('popover') >= 0) {
                        value.remove();
                    }
                });
            }
            this._super.apply(this, arguments);
        },
    });
});
