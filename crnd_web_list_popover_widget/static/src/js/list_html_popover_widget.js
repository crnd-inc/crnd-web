odoo.define('crnd_web_list_popover_widget.DynamicHtmlPopover', function (require) {
    "use strict";
    var Registry = require('web.field_registry');
    var FieldTextHtmlSimple = require('web_editor.field.html');
    var DynamicPopoverMixin = require(
        'crnd_web_list_popover_widget.DynamicPopoverMixin').DynamicPopoverMixin;

    var DynamicHtmlPopover = FieldTextHtmlSimple.extend(DynamicPopoverMixin, {

        init: function () {
            this._super.apply(this, arguments);
            DynamicPopoverMixin.init.call(this, arguments);
            this.allow_html = true;
        },

        get_popover_content: function () {
            // Reject default data for an empty HTML field,
            // because we should not see an empty popover
            if (this.value === '<p><br></p>' ||
                this.value === '<p><br/></p>') {
                return '';
            }
            return DynamicPopoverMixin.get_popover_content.call(this);
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

    Registry.add('list.dynamic_popover_html', DynamicHtmlPopover);
    return DynamicHtmlPopover;
});
