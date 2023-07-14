odoo.define('crnd_web_map_view.MapView', function (require) {
    "use strict";


    var AbstractView = require('web.AbstractView');
    var viewRegistry = require('web.view_registry');
    var core = require("web.core");
    var MapController = require('crnd_web_map_view.MapController');
    var MapRenderer = require('crnd_web_map_view.MapRenderer');
    var MapModel = require('crnd_web_map_view.MapModel');

    var _lt = core._lt;

    var MapView = AbstractView.extend({
        display_name: _lt("CR&D Map View"),
        icon: "fa fa-map",
        config: _.extend({}, AbstractView.prototype.config, {
            Model: MapModel,
            Controller: MapController,
            Renderer: MapRenderer,
        }),
        searchMenuTypes: ['filter', 'comparison', 'favorite'],

        init: function (viewInfo, params) {
            this._super.apply(this, arguments);
            this.latitudeField = this.arch.attrs.latitude_field;
            this.longitudeField = this.arch.attrs.longitude_field;
            this.title_field = this.arch.attrs.title_field;
            this.loadParams = {
                ...this.loadParams,
                ...{
                    latitude_field: this.latitudeField,
                    longitude_field: this.longitudeField,
                    title_field: this.title_field,
                }
            };
         },

        viewType: 'crnd_map_view',
    });

    viewRegistry.add('crnd_map_view', MapView);
    return MapView;
});
