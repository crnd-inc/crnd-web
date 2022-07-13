/** @odoo-module **/

import { registry } from "@web/core/registry";
import * as legacyEnv from "web.env";

export const nothing = (env, action) => {
    const params = action.params || {};
    return params.next;
};

export const reloadView = (env, action) => {
    const params = action.params || {};
    legacyEnv.bus.trigger('crnd_act_view_reload_c', action)
    return params.next;
};

export const readonlyViewMode = (env, action) => {
    const params = action.params || {};
    legacyEnv.bus.trigger('crnd_act_view_mode_readonly_c', action)
    return params.next;
};

export const editViewMode = (env, action) => {
    const params = action.params || {};
    legacyEnv.bus.trigger('crnd_act_view_mode_edit_c', action)
    return params.next;
};

registry.category('actions').add('crnd_act_nothing', nothing);
registry.category('actions').add('crnd_act_view_reload', reloadView);
registry.category('actions').add('crnd_act_view_mode_readonly', readonlyViewMode);
registry.category('actions').add('crnd_act_view_mode_edit', editViewMode);

