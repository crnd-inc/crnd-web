odoo.define('crnd_web_list_popover_widget.DynamicCharPopover', function (require) {
    "use strict";
    var Registry = require('web.field_registry');
    var FieldChar = require('web.basic_fields').FieldChar;
    var DynamicPopoverMixin = require(
        'crnd_web_list_popover_widget.DynamicPopoverMixin').DynamicPopoverMixin;

    var DynamicCharPopover = FieldChar.extend(DynamicPopoverMixin, {

        init: function () {
            this._super.apply(this, arguments);
            DynamicPopoverMixin.init.call(this, arguments);
        },

        start: function () {
            DynamicPopoverMixin.start.call(this);
            return this._super();
        },

        destroy: function () {
            DynamicPopoverMixin.destroy.call(this);
            this._super.apply(this, arguments);
        },

    });

    Registry.add('list.dynamic_popover_char', DynamicCharPopover);
    return DynamicCharPopover;
});
