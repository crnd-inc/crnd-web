/** @odoo-module **/

import { ListRenderer } from '@web/views/list/list_renderer';
import { patch } from "@web/core/utils/patch";

function getFieldInfo(column, record) {
    const type = record.fields[column.name].type;
    const value = record.data[column.name];
    return { type, value };
}

patch(ListRenderer.prototype, 'crnd_web_list_tooltip', {
    getTooltipTemplate(column, record) {
        const { type, value } = getFieldInfo(column, record);
        if (type === 'html' && value) {
            return 'crnd_web_list_tooltip.HtmlFieldTooltip';
        }
        return false;
    },

    getHtmlTooltipInfo(column, record) {
        const { type, value } = getFieldInfo(column, record);
        if (type === 'html' && value) {
            return JSON.stringify({ type, value });
        }
        return false;
    },
});
