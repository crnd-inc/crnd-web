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
            var bg_color = record.data[nodeOptions.field_bg_color];
            $td.css('background-color', bg_color);
        }
        if (nodeOptions.field_label_color) {
            var label_color = record.data[nodeOptions.field_label_color];
            $td.css('color', label_color);
        }
        if (nodeOptions.field_label_color_expression) {
            var expression = nodeOptions.field_label_color_expression;
            var ctx = _.extend({}, record.data, pyUtils.context());
            var label_color = this._getColorBasedOnExpression(ctx, expression);
            $td.css('color', label_color);
        }
        if (nodeOptions.field_bg_color_expression) {
            var expression = nodeOptions.field_bg_color_expression;
            var ctx = _.extend({}, record.data, pyUtils.context());
            var bg_color = this._getColorBasedOnExpression(ctx, expression)
            $td.css('background-color', bg_color);
        }
        return $td;
    },
    _getColorBasedOnExpression: function (ctx, expr) {
        // Split the expression into conditions
        var conditions = expr.split(';');

        // Iterate through conditions
        for (var i = 0; i < conditions.length; i++) {
            var condition = conditions[i].trim();

            // Split each condition into color and statement
            var [color, statement] = condition.split(':');

            // Parse statement to evaluate it
            statement = py.parse(py.tokenize(statement.trim()));

            // Evaluate the statement
            if (py.evaluate(statement, ctx).toJSON()){
                return color;
            }
        }

        // Return false if no condition is met
        return false;
    },
});
