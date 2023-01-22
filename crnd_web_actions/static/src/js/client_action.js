/** @odoo-module **/

import { registry } from "@web/core/registry";

const CRND_NOTHING_ACTION = 'crnd_act_nothing';
const CRND_RELOAD_VIEW_ACTION = 'crnd_act_view_reload';

export function getControllerModel(controller) {
    const localState = controller.getLocalState();
    if (localState.model) {
        return localState.model;
    } else {
        console.error('The model is not represented in the controller\'s local state')
    }
    return false;
}

const nothing = (env, action) => {
    const params = action.params || {};
    return params.next;
};

const reloadView = (env, action) => {
    const params = action.params || {};
    const model = getControllerModel(env.services.action.currentController);
    if (model) {
        model.load();
    }
    return params.next;
};

registry.category('actions').add(CRND_NOTHING_ACTION, nothing);
registry.category('actions').add(CRND_RELOAD_VIEW_ACTION, reloadView);
