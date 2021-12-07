/** @odoo-module **/

import ListRenderer from 'web.ListRenderer';
import pyUtils from 'web.py_utils';

ListRenderer.include({

    _renderBodyCell: function (record, node) {
        var $td = this._super.apply(this, arguments);

        if (!node.attrs.options) {
            return $td;
        }
        if (node.tag !== 'field') {
            return $td;
        }

        var nodeOptions = pyUtils.py_eval(node.attrs.options);
        if (nodeOptions.field_bg_color) {
            $td.css('background-color', nodeOptions.field_bg_color);
        }
        if (nodeOptions.field_label_color) {
            $td.css('color', nodeOptions.field_label_color);
        }
        return $td;
    },
});
