odoo.define('crnd_web_list_popover_widget.DynamicTextPopover', function (require) {
    "use strict";
    var Registry = require('web.field_registry');
    var FieldText = require('web.basic_fields').FieldText;
    var DynamicPopoverMixin = require(
        'crnd_web_list_popover_widget.DynamicPopoverMixin').DynamicPopoverMixin;

    var DynamicTextPopover = FieldText.extend(DynamicPopoverMixin, {

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

    Registry.add('list.dynamic_popover_text', DynamicTextPopover);
    // Add to registry with old name for backward compatibility.
    // It should be removed in 13.0 version.
    Registry.add('list.dynamic_popover', DynamicTextPopover);
    return DynamicTextPopover;
});
