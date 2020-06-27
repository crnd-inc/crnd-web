odoo.define('muk_web_client.channel', function (require) {
    "use strict";

    var WebClient = require('web.WebClient');

    WebClient.include({
        init: function () {
            this._super.apply(this, arguments);
            this.bus_channels = {};
        },
        bus_declare_channel: function (channel, method) {
            if (!(channel in this.bus_channels)) {
                this.bus_channels[channel] = method;
                this.call('bus_service', 'addChannel', channel);
            }
        },
        bus_delete_channel: function (channel) {
            this.call('bus_service', 'deleteChannel', channel);
            this.bus_channels = _.omit(this.bus_channels, channel);
        },
        show_application: function () {
            var res = this._super.apply(this, arguments);
            this.call('bus_service', 'onNotification',
                this, this.bus_notification);
            this.call('bus_service', 'startPolling');
            return res;
        },
        bus_notification: function (notifications) {
            _.each(notifications, function (notification) {
                var channel = notification[0];
                var message = notification[1];
                if (channel in this.bus_channels) {
                    this.bus_channels[channel](message);
                }
            }, this);
        },
        destroy: function () {
            _.each(this.bus_channels, function (method, channel) {
                this.bus_delete_channel(channel);
            }, this);
            this.call('bus_service', 'stopPolling');
            this._super.apply(this, arguments);
        },
    });

});
