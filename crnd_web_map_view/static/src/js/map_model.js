odoo.define("crnd_web_map_view.MapModel", function (require) {
    "use strict";

    var AbstractModel = require("web.AbstractModel");

    var MapModel = AbstractModel.extend({

        init: function (parent, params = {}) {
            this._super.apply(this, arguments);
        },

        async __load(params) {
            this.data = {};

            this.domain = params.domain;
            this.modelName = params.modelName;
            this.latitudeField = params.latitude_field;
            this.longitudeField = params.longitude_field;
            this.title_field = params.title_field;
            this.params = params;

            return await this.loadData(params);
        },

        async __reload(id, params) {
            if (params.domain) {
                this.domain = params.domain;
            }

            var res = await this.loadData();
            this.trigger_up('update_map');
            return res;
        },

        async loadData() {
            var domain = [
                [this.latitudeField, '!=', false],
                [this.longitudeField, '!=', false],
            ]
            var full_domain = this.domain.concat(domain);

            this.data = await this._rpc({
                model: this.modelName,
                method: 'search_read',
                domain: full_domain,
            })
       }
    });

    return MapModel;

});
