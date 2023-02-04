/** @odoo-module **/

import { ListRenderer } from '@web/views/list/list_renderer';
import { patch } from "@web/core/utils/patch";

const FIELD_BG_COLOR_PARAM = 'field_bg_color';
const FIELD_LABEL_COLOR_PARAM = 'field_label_color';

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
        return style;
    }
});
