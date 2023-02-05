/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Tooltip } from '@web/core/tooltip/tooltip'

const { onMounted, useRef } = owl;

patch(Tooltip.prototype, 'crnd_web_list_tooltip', {
   setup() {
       this._super(...arguments);
       onMounted(this.onMounted);
       this.cwltTooltipRef = useRef('cwlt_tooltip_ref');
   },

   onMounted() {
       if (this.props.info?.type !== 'html' || !this.props.info?.value) {
           return;
       }
       if (!this.cwltTooltipRef.el) {
           return;
       }
       const htmlFieldValueContainer = this.cwltTooltipRef.el.querySelector('.html_field_value_container');
       if (!htmlFieldValueContainer) {
           return;
       }
       htmlFieldValueContainer.innerHTML = this.props.info.value;
   },
});
