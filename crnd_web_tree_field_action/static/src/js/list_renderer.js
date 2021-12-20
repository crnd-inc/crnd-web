odoo.define('crnd_web_tree_field_action.ListRenderer', function (require) {
    'use strict';

    var ListRenderer = require('web.ListRenderer');
    var pyUtils = require('web.py_utils');

    ListRenderer.include({

        _renderBodyCell: function (record, node, colIndex, options) {
            var $td = this._super.apply(this, arguments);

            if (options.mode !== 'readonly') {
                return $td;
            }

            if (!record.res_id) {
                return $td;
            }

            if (node.tag !== 'field') {
                return $td;
            }

            if (!node.attrs.options) {
                return $td;
            }

            var nodeOptions = pyUtils.py_eval(node.attrs.options);
            if (!nodeOptions.on_click) {
                return $td;
            }

            if (!(nodeOptions.on_click.action && nodeOptions.on_click.type)) {
                return $td;
            }

            if (nodeOptions.on_click.type === 'action' ||
                nodeOptions.on_click.type === 'object') {
                var self = this;
                $td.on("click", function (e) {
                    e.stopPropagation();
                    self.trigger_up('button_clicked', {
                        attrs: {
                            'name': nodeOptions.on_click.action,
                            'type': nodeOptions.on_click.type,
                        },
                        record: record,
                    });
                });
            }

            return $td;
        },
    });
});
