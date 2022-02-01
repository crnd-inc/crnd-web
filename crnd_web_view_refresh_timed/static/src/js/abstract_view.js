odoo.define('crnd_web_view_refresh_timed.AbstractView', function (require) {
    "use strict";

    require('web.AbstractView').include({

        init: function () {
            this._super.apply(this, arguments);

            var self = this;
            if (this.arch.attrs.class) {
                var classList = this.arch.attrs.class.split(' ');
                var refreshClass = 'crnd-refresh-every-';
                classList.forEach(function (className) {
                    if (className.includes(refreshClass)) {
                        var time = className.substring(refreshClass.length);
                        var interval = time.slice(0, -1);
                        var dimension = time.slice(-1);
                        if ((dimension === 's' || dimension === 'm') &&
                            /^\d+$/.test(interval)) {
                            var dCoefficient = 1;
                            if (dimension === 'm') dCoefficient = 60;
                            self.controllerParams.crndViewRefreshInterval =
                                parseInt(interval) * dCoefficient * 1000;
                        }
                    }
                });
            }
        },

    });
});
