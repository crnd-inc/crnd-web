odoo.define('crnd_web_list_popover_widget.DynamicHtmlPopover', function (require) {
    "use strict";
    var Registry = require('web.field_registry');
    var FieldTextHtmlSimple =
        require('web_editor.backend').FieldTextHtmlSimple;
    var DynamicPopoverMixin = require(
        'crnd_web_list_popover_widget.DynamicPopoverMixin');

    var DynamicHtmlPopover = FieldTextHtmlSimple.extend(DynamicPopoverMixin, {

        init: function () {
            this._super.apply(this, arguments);
            DynamicPopoverMixin.init.call(this, arguments);
            this.allow_html = this.nodeOptions.allow_html || false;
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
