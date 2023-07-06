odoo.define("crnd_web_map_view.MapController", function (require) {
    "use strict";

    var AbstractController = require("web.AbstractController");
    var core = require("web.core");

    var _t = core._t;

    var MapController = AbstractController.extend({
        custom_events: _.extend({}, AbstractController.prototype.custom_events, {
            open_record: "_onOpenRecord",
            get_map_data: "_onGetMapData",
            update_map: "_onUpdateMap",

        }),

        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            this.model = model;
            this.renderer = renderer;
            this.params = params;
        },

        _onUpdateMap() {
            this.renderer.updateMap();
        },

        _onGetMapData(event) {
            event.map_data = this.get_map_data();
        },

        get_map_data() {
            var res = []
            for (let x of Object.entries(this.model.data)) {
                res.push({
                    id: x[1]['id'],
                    lat: x[1][this.model.params['latitude_field']] ? x[1][this.model.params['latitude_field']]: 0,
                    lng: x[1][this.model.params['longitude_field']] ? x[1][this.model.params['longitude_field']]: 0,
                    title: x[1][this.model.params['title_field']] ? x[1][this.model.params['title_field']]: '',
                });
            }
            return res;
        },

        _onOpenRecord(event) {
            var self = this;
            const options = {
                on_close: async () => {
                    await self.model.load(self.model.params);
                    self.trigger_up('update_map');
                },
            };
            this.do_action({
                type:'ir.actions.act_window',
                res_model: this.model.modelName,
                res_id: parseInt(event.data.id),
                flags: {mode: 'edit',},
                context: {create: false},
                views: [[false, 'form']],
                view_mode: 'form',
                view_type: 'form',
                target: 'new',
            }, options);
        },
    });
    return MapController;
});
