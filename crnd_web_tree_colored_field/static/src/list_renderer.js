/** @odoo-module **/

import { ListRenderer } from '@web/views/list/list_renderer';
import { patch } from "@web/core/utils/patch";
import pyUtils from 'web.py_utils';

const FIELD_BG_COLOR_PARAM = 'field_bg_color';
const FIELD_LABEL_COLOR_PARAM = 'field_label_color';
const FIELD_BG_COLOR_EXPRESSION = 'field_bg_color_expression';
const FIELD_LABEL_COLOR_EXPRESSION = 'field_label_color_expression';

patch(ListRenderer.prototype, 'crnd_web_tree_colored_field', {
    getCellColorStyle(column, record) {
        let style = '';
        const fieldBgColor = column.options[FIELD_BG_COLOR_PARAM];
        if (fieldBgColor) {
            const bgColor = record.data[fieldBgColor];
            if (bgColor) {
                style += `background-color: ${bgColor};`;
            }
        }
        const fieldLabelColor = column.options[FIELD_LABEL_COLOR_PARAM];
        if (fieldLabelColor) {
            const labelColor = record.data[fieldLabelColor];
            if (labelColor) {
                style += `color: ${labelColor};`;
            }
        }
        const fieldBgColorExpression = column.options[FIELD_BG_COLOR_EXPRESSION];
        if (fieldBgColorExpression) {
            var expression = column.options[FIELD_BG_COLOR_EXPRESSION];
            var ctx = _.extend({}, record.data, pyUtils.context());
            var bgColor = this._getColorBasedOnExpression(ctx, expression)
            if (bgColor) {
                style += `background-color: ${bgColor};`;
            }
        }
        const fieldLabelColorExpression = column.options[FIELD_LABEL_COLOR_EXPRESSION];
        if (fieldLabelColorExpression) {
            var expression = column.options[FIELD_LABEL_COLOR_EXPRESSION];
            var ctx = _.extend({}, record.data, pyUtils.context());
            var labelColor = this._getColorBasedOnExpression(ctx, expression)
            if (labelColor) {
                style += `color: ${labelColor};`;
            }
        }
        return style;
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
