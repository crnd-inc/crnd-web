/** @odoo-module **/

import fieldRegistry from 'web.field_registry';
import FieldHtml from 'web_editor.field.html';
import DynamicPopoverMixin from './list_popover_mixin';

var DynamicHtmlPopover = FieldHtml.extend(DynamicPopoverMixin, {

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

fieldRegistry.add('list.dynamic_popover_html', DynamicHtmlPopover);

export default DynamicHtmlPopover;
