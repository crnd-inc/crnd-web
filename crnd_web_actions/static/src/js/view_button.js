/** @odoo-module **/

import { ViewButton } from "@web/views/view_button/view_button";
import { patch } from "@web/core/utils/patch";
import { getControllerModel } from './client_action';
import { eval_domains_and_contexts } from 'web.py_utils';

const FORCE_RELOAD = 'force_reload';

patch(
    ViewButton.prototype,
    'crnd_web_actions',
    {
        onClick(ev) {
            const context = this.clickParams.context
                ? eval_domains_and_contexts({ contexts: [this.clickParams.context] }).context
                : {};
            if (context[FORCE_RELOAD] !== undefined && context[FORCE_RELOAD] === false) {
                const model = getControllerModel(this.env.services.action.currentController);
                if (model && model.root.isDirty) {
                    console.log('The model is in edit mode. Reload not possible');
                    return;
                }
            }
            this._super(...arguments);
        }
    },
);
