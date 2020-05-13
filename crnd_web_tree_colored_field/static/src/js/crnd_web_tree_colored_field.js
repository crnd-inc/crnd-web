odoo.define('crnd_web_tree_colored_field', function (require) {
    'use strict';
    var ListRenderer = require('web.ListRenderer');
    var pyUtils = require("web.py_utils");

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
                var bg_color = record.data[nodeOptions.field_bg_color];
                $td.css('background-color', bg_color);
            }
            if (nodeOptions.field_label_color) {
                var label_color = record.data[nodeOptions.field_label_color];
                $td.css('color', label_color);
            }
            return $td;
        },
    });
});
