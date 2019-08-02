odoo.define('crnd_web_list_popover_widget.DynamicPopover', function (require) {
    "use strict";
    var registry = require('web.field_registry');
    var basic_fields = require('web.basic_fields');

    var DynamicPopover = basic_fields.FieldText.extend({

        events: _.extend({}, basic_fields.FieldText.prototype.events, {
            'mousedown': 'popover_hide',
        }),

        init: function () {
            this._super.apply(this, arguments);
            this.maxWidth = this.nodeOptions.max_width;
            this.lineClamp = this.nodeOptions.line_clamp;
            this.placement = this.nodeOptions.placement || "auto";
            this.animation = this.nodeOptions.animation || false;
            this.allow_html = this.nodeOptions.allow_html || false;
            // IE do not supports webkit, and we detected IE <=10, 11, 12
            this.isIE = navigator.userAgent.search(/(MSIE|Trident|Edge)/) > -1;
        },

        popover_init: function () {
            var style = {
                "max-width": this.maxWidth,
                "-webkit-line-clamp": this.lineClamp,
            };
            this.$el = this.$el.css(style).addClass(
                this.isIE ? 'o_popover_widget_ie' : 'o_popover_widget');
            this.$el.popover({
                content: this.value,
                trigger: 'hover',
                placement: this.placement,
                container: 'body',
                html: this.allow_html,
                animation: this.animation,
            });
        },

        popover_destroy: function () {
            $('div.popover').popover('destroy');
        },

        popover_hide: function () {
            $('div.popover').popover('hide');
        },

        destroy: function () {
            this.popover_destroy();
            this._super.apply(this, arguments);
        },

        start: function () {
            if (this.mode === 'readonly') {
                this.popover_init();
            }
            return this._super();
        },

    });

    registry.add('dynamic_popover', DynamicPopover);
    return DynamicPopover;
});
