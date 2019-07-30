odoo.define('crnd_web_list_popover_widget.DynamicPopover', function (require) {
    "use strict";
    var registry = require('web.field_registry');
    var basic_fields = require('web.basic_fields');

    var DynamicPopover = basic_fields.FieldText.extend({
        // IE do not supports webkit, and we detected IE <=10, 11, 12
        className: navigator.userAgent.search(/(MSIE|Trident|Edge)/) > -1
            ? 'o_popover_ie' : 'o_popover',

        events: _.extend({}, basic_fields.FieldText.prototype.events, {
            'mouseover': '_show_popover',
            'mousedown': '_destroy_popover',
        }),

        _show_popover: function (event) {
            if (this.mode !== 'edit') {
                $(event.currentTarget).popover({
                    content: this.value,
                    trigger: 'hover',
                    placement: 'auto',
                    container: 'body',
                    html: false,
                    animation: true,
                }).popover('show');
            }
        },

        _destroy_popover: function (event) {
            $(event.currentTarget).popover('destroy');
        },

        init: function () {
            this._super.apply(this, arguments);
            this.maxWidth = this.nodeOptions.max_width;
            this.lineClamp = this.nodeOptions.line_clamp;
        },

        start: function () {
            var style = {
                "max-width": this.maxWidth ? this.maxWidth : '300px',
                "-webkit-line-clamp": this.lineClamp ? this.lineClamp : '1',
            };
            this.$el = this.$el.css(style);
            return this._super();
        },

    });

    registry.add('dynamic_popover', DynamicPopover);
    return DynamicPopover;
});
