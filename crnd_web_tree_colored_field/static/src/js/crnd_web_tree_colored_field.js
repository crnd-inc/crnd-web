odoo.define('crnd_web_tree_colored_field', function (require) {
    'use strict';
    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({

        _renderBodyCell: function (record, node) {
            var $td = this._super.apply(this, arguments);
            var bodyOptions = node.attrs.options;

            if (!node.attrs.options) {
                return $td;
            }
            if (node.tag !== 'field') {
                return $td;
            }
            var splited_options = bodyOptions.split(',');

            for (var i=0, len=splited_options.length; i<len; ++i) {
                var pair = splited_options[i];
                pair = pair.replace('{', '');
                pair = pair.replace('}', '');
                pair = pair.split(':');
                var param = pair[0].trim();
                var value = pair[1].trim();
                value = value.replace("'", '');
                value = value.replace("'", '');
                if (param === "'field_bg_color'") {
                    var bg_color = record.data[value];
                    $td.css('background-color', bg_color);
                }
                if (param === "'field_label_color'") {
                    var label_color = record.data[value];
                    $td.css('color', label_color);
                }
            }
            return $td;
        },
    });
});
