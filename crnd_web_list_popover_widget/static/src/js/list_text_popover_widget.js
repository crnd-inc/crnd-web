/** @odoo-module **/

import fieldRegistry from 'web.field_registry';
import { FieldText } from 'web.basic_fields';
import DynamicPopoverMixin from './list_popover_mixin'

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

fieldRegistry.add('list.dynamic_popover_text', DynamicTextPopover);
// Add to registry with old name for backward compatibility.
// It should be removed in 13.0 version.
fieldRegistry.add('list.dynamic_popover', DynamicTextPopover);

export default DynamicTextPopover;
