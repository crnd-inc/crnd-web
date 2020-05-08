odoo.define('crnd_web_tree_colored_field', function (require) {
    'use strict';
    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({

        _renderBodyCell: function (record, node) {
            var $td = this._super.apply(this, arguments);

            if (!node.attrs.options) {
                return $td;
            }
            if (node.tag !== 'field') {
                return $td;
            }
            var nodeOptions = JSON.parse((node.attrs || {})
                .options.replace(/'/g, '"') || "{}");

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
