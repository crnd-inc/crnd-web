odoo.define('crnd_web_tree_colored_field', function (require) {
    'use strict';
    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({

        _renderBodyCell: function (record, node) {
            var $td = this._super.apply(this, arguments);
            var name = node.attrs.name;
            var bg_color = record.data.stage_bg_color;
            var label_color = record.data.stage_label_color;

            if (name === 'stage_id') {
                $td.css('background-color', bg_color);
                $td.css('color', label_color);
            }
            return $td;
        },
    });
});
