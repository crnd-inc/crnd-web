/** @odoo-module */

import { Layout } from "@web/search/layout";
import { useService, useBus } from "@web/core/utils/hooks";
import { Component } from "@odoo/owl";
import { standardViewProps } from "@web/views/standard_view_props";
import { useModel } from "@web/views/model";
import { ControlPanel } from "@web/search/control_panel/control_panel";

export class MapController extends Component {
    setup() {
        this.actionService = useService("action");
        this.model = useModel(this.props.Model, {
            resModel: this.props.resModel,
            fields: this.props.fields,
            archInfo: this.props.archInfo,
        });
        useBus(this.env.searchModel, 'open_record', this._onOpenRecord)
    }

    _onOpenRecord(event) {
        var self = this;
        const options = {
            onClose: async () => {
                await self.model.load(self.model.searchParams);
                self.env.searchModel.trigger('update_map');
            },
        };
        this.actionService.doAction({
            type:'ir.actions.act_window',
            res_model: this.props.resModel,
            res_id: parseInt(event.detail.id),
            views: [[false, 'form']],
            view_mode: 'form',
            view_type: 'form',
            target: 'new',
        }, options);
    }

}

MapController.template = 'crnd_web_map_view.main';
MapController.components = { Layout, ControlPanel };
MapController.props = {
    ...standardViewProps,
    Model: Function,
    Renderer: Function,
    archInfo: Object,
};
