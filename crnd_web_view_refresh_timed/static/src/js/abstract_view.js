odoo.define('crnd_web_view_refresh_timed.AbstractView', function (require) {
    "use strict";

    require('web.AbstractView').include({

        init: function () {
            this._super.apply(this, arguments);

            var self = this;
            if (this.arch.attrs.class) {
                var classList = this.arch.attrs.class.split(' ');
                classList.forEach(function (className) {
                    self._checkRefreshClass(className);
                });
            }
        },

        // This method checks if the class name matches the format
        // "crnd-refresh-every-XT", where "X" is time interval (numbers 0-9)
        // and "T" is time dimensions ("s" - seconds, "m" - minutes).
        // And then compute the value in milliseconds, which is passed to the
        // controller parameters
        _checkRefreshClass: function (className) {
            var refreshClass = 'crnd-refresh-every-';
            if (className.includes(refreshClass)) {
                var time = className.substring(refreshClass.length);
                var interval = time.slice(0, -1);
                var dimension = time.slice(-1);
                if ((dimension === 's' || dimension === 'm') &&
                    (/^\d+$/).test(interval)) {
                    var dCoefficient = 1;
                    if (dimension === 'm') {
                        dCoefficient = 60;
                    }
                    this.controllerParams.crndViewRefreshInterval =
                        parseInt(interval, 10) * dCoefficient * 1000;
                }
            }
        }
    });
});
