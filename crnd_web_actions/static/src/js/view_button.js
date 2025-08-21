/** @odoo-module **/

import { ViewButton } from "@web/views/view_button/view_button";
import { patch } from "@web/core/utils/patch";
import { getControllerModel } from './client_action';
import { evaluateExpr } from "@web/core/py_js/py";

const FORCE_RELOAD = 'force_reload';

patch(
    ViewButton.prototype,
    {
        onClick(ev) {
            const context = this.clickParams.context
                ? evaluateExpr(this.clickParams.context, this.props.record?.evalContext || {})
                : {};
            if (context[FORCE_RELOAD] !== undefined && context[FORCE_RELOAD] === false) {
                const model = getControllerModel(this.env.services.action.currentController);
                if (model && model.root.isDirty) {
                    console.log('The model is in edit mode. Reload not possible');
                    return;
                }
            }
            super.onClick(...arguments);
        }
    },
);
