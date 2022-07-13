/** @odoo-module **/

import BasicController from 'web.BasicController';
import env from "web.env";

BasicController.include({

    start: async function (parent, model, renderer, params) {
        env.bus.on('crnd_act_view_reload_c', null, this._onReloadViewC.bind(this));
        env.bus.on('crnd_act_view_mode_readonly_c', null, this._onReadonlyViewModeC.bind(this));
        env.bus.on('crnd_act_view_mode_edit_c', null, this._onEditViewModeC.bind(this));
        await this._super(...arguments);
    },

    _onReloadViewC (action) {
        if (this.modelName === action.context.active_model) {
            this.reload();
        }
    },

    _onReadonlyViewModeC (action) {
        if (this.modelName === action.context.active_model) {
            this.update({ mode: 'readonly' });
        }
    },

    _onEditViewModeC (action) {
        if (this.modelName === action.context.active_model) {
            this.update({ mode: 'edit' });
        }
    },
});
