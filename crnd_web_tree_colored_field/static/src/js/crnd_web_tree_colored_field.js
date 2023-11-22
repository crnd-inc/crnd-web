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
            if (nodeOptions.field_label_color_expression) {
                var expression = nodeOptions.field_label_color_expression;
                var label_color = this._getColorBasedOnExpression(record.data, expression);
                $td.css('color', label_color);
            }
            if (nodeOptions.field_bg_color_expression) {
                var expression = nodeOptions.field_bg_color_expression;
                var bg_color = this._getColorBasedOnExpression(record.data, expression)
                $td.css('background-color', bg_color);
            }
            return $td;
        },
        _getColorBasedOnExpression: function (obj, expr) {
            // Split the expression into conditions
            var conditions = expr.split(';');

            // Iterate through conditions
            for (var i = 0; i < conditions.length; i++) {
                var condition = conditions[i].trim();

                // Split each condition into color and expression
                var [color, statement] = condition.split(':');

                // Remove leading and trailing spaces from the statement
                statement = statement.trim();

                // Evaluate the expression
                if (this._checkCondition(obj, statement)) {
                    return color;
                }
            }

            // Return false if no condition is met
            return false;
        },
        _checkCondition: function (obj, statement) {

            // Split the statement into property, operator, and value
            var [property, operator, value] = statement.split(/(===|!==|==|!=)/);

            // Remove leading and trailing spaces
            property = property.trim();
            operator = operator.trim();
            value = value.trim();

            // Remove both single and double quotes around the value if present
            value = value.replace(/^['"]|['"]$/g, '');

            // Check if the property exists and evaluate the condition based on the operator
            if (obj.hasOwnProperty(property)) {
                switch (operator) {
                    case '===':
                        return obj[property] === value;
                    case '!==':
                        return obj[property] !== value;
                    case '==':
                        return obj[property] == value;
                    case '!=':
                        return obj[property] != value;
                    default:
                        // Default to '===' if the operator is not recognized
                        return obj[property] === value;
                }
            }

            // Return false if the property doesn't exist
            return false;
        }
    });
});
