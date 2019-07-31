odoo.define('crnd_web_list_popover_widget.DynamicPopover', function (require) {
    "use strict";
    var registry = require('web.field_registry');
    var basic_fields = require('web.basic_fields');

    var DynamicPopover = basic_fields.FieldText.extend({
        template: 'DynamicPopoverTemplate',

        init: function () {
            this._super.apply(this, arguments);
            this.maxWidth = this.nodeOptions.max_width;
            this.lineClamp = this.nodeOptions.line_clamp;
            // IE do not supports webkit, and we detected IE <=10, 11, 12
            this.isIE = navigator.userAgent.search(/(MSIE|Trident|Edge)/) > -1;
        },

        start: function () {
            this.$el.popover({container: this.$el});
            return this._super();
        },

    });

    registry.add('dynamic_popover', DynamicPopover);
    return DynamicPopover;
});
