odoo.define('crnd_web_view_refresh_timed.AbstractController', function (require) {
    "use strict";

    require('web.AbstractController').include({

        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            if (params.crndViewRefreshInterval) {
                this.crndViewRefreshInterval = params.crndViewRefreshInterval;
            }
        },

        start: function () {
            if (this.crndViewRefreshInterval) {
                this._setCRnDRefreshViewTimer();
            }
            return this._super.apply(this, arguments);
        },

        update: function (params, options) {
            var reload = options && 'reload' in options
                ? options.reload : true;
            if (this._crndViewRefreshTimer && reload) {
                this._setCRnDRefreshViewTimer(true);
            }

            return this._super.apply(this, arguments);
        },

        _setCRnDRefreshViewTimer: function (cancelPrevTimer) {
            if (cancelPrevTimer) {
                clearTimeout(this._crndViewRefreshTimer);
            }
            this._crndViewRefreshTimer = setTimeout(this.reload.bind(this),
                this.crndViewRefreshInterval);
        },
    });
});
