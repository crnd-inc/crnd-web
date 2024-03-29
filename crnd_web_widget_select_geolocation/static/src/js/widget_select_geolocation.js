odoo.define('generic_location_geolocalize.MapWidget', function (require) {
    "use strict";

    const AbstractField = require('web.AbstractField');
    const fieldRegistry = require('web.field_registry');
    const { qweb } = require('web.core');
    var core = require("web.core");

    var _t = core._t;

    var SelectGeolocationWidget = AbstractField.extend({
        supportedFieldTypes: ['char'],
        template: 'select_geolocation_widget',
        events: _.extend({}, AbstractField.prototype.events, {
            click: '_onClickGeoButton',
        }),

        init: function(parent, name, record, options) {
            this._super.apply(this, arguments);
            this.record = record;
            this.parent = parent;
            this.options = this.nodeOptions;
            this.data = this.recordData;
            this.navigator_pos = false;
        },

        async _onClickGeoButton(e) {
            e.stopPropagation();
            this.mapId = new Date().getTime().toString();
            let body = document.querySelector('body');
            let popoverTemplate = document.createElement('template');
            popoverTemplate.innerHTML = qweb.render('crnd_web_widget_select_geolocation.map_field_widget_popover', {'mapId': this.mapId, 'readonly_mode': this.mode === 'readonly'});
            body.appendChild(popoverTemplate.content);
            this.mapPopover = document.querySelector('div.map_field_widget_wrapper');
            this.mapContainer = document.querySelector('div.map_container');
            this.closeBtn = document.querySelector('button.close_map_popover_btn');
            this.saveBtn = document.querySelector('button.save_geolocation_btn')
            this.closeBtn.addEventListener('click', this._closeMapPopover.bind(this));
            if (this.saveBtn) {
                this.saveBtn.addEventListener('click', this._saveGeolocation.bind(this));
            }

            var loader = this.get_loader();
            this.api_key = await this.get_map_api_key();
            if (this.api_key) {
                loader({key: this.api_key, v: 'weekly'});
                this.initMap();
            }
            else {
                this.get_error_warning('Google map API key is required!', true);
            }
        },

        get_error_warning: function (text, sticky) {
            this.do_notify(_t('Warning'), _t(text), sticky, 'bg-danger');
        },

        async _saveGeolocation () {
            if (!this.newGeolocation) {
                this.newGeolocation = await this._getGeolocation();
            }
            this._setValue(JSON.stringify(this.newGeolocation));
            this._closeMapPopover ();
        },

        async _saveData (name, value){
            var changes = {};
            changes[name] = value;
            this.trigger_up('field_changed', {
                dataPointID: this.dataPointID,
                changes: changes,
            });
        },

        _closeMapPopover () {
            this.closeBtn.removeEventListener('click', this._closeMapPopover);
            this.mapPopover.remove();
        },

        async _createMarker () {
            let self = this;
            if (this.mode === 'edit') {
                this.marker = new google.maps.Marker({
                    position: await this._getGeolocation(),
                    map: this.map,
                    draggable: true,
                });

                google.maps.event.addListener(this.marker, 'dragend', function (event) {
                    self.newGeolocation = {
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng(),
                    };
                });
            }
            else {
                this.marker = new google.maps.Marker({
                    position: await this._getGeolocation(),
                    map: this.map,
                    draggable: false,
                });
            }
        },

        get_default_geolocation: function () {
            return {
                latitude: 41.1533320,
                longitude: 20.1683310,
            }
        },

        async get_current_geolocation() {
            var self = this;
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                position => {
                    self.navigator_pos = position.coords;
                    if (self.navigator_pos) {
                        resolve(self.navigator_pos);
                    } else {
                        resolve(self.set_default_geolocation());
                    }
                },
                   error => {
                    console.log(error)
                    self.get_error_warning(error.message, true);
                    self.navigator_pos = self.get_default_geolocation();
                    resolve(self.navigator_pos);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0,
                }
                );
            });
        },

        async _getGeolocation () {
            var pos;
            if (!this.value) {
                if (!self.navigator_pos) {
                    self.navigator_pos = await this.get_current_geolocation();
                }
                if (self.navigator_pos) {
                    pos = {
                        lat: self.navigator_pos['latitude'],
                        lng: self.navigator_pos['longitude'],
                    }
                }
            }
            else {
                pos = JSON.parse(this.value);
            }
            return pos
        },

        get_loader: function() {
            var loader = (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))});
            return loader;
        },

        async get_map_api_key() {
            var api_key = await this._rpc({
                model: 'ir.config_parameter',
                method: 'get_param',
                args: ['base_geolocalize.google_map_api_key'],
            })
            return api_key;
        },

        async get_map_config () {
            var position_center = await this._getGeolocation();
            var res = {
                position_center: position_center,
                zoom: this.record.data[this.options.zoom] ? this.record.data[this.options.zoom] : 10,
            }
            return res;
        },

        async initMap() {
            var map_config = await this.get_map_config();
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            this.Map = Map;
            this.AdvancedMarkerElement = AdvancedMarkerElement;
            this.mapElement = $('#' + this.mapId);
            this.map = new this.Map(this.mapElement[0], {
                zoom: map_config['zoom'],
                center: map_config['position_center'],
                mapId: this.mapId,
            });
            await this._createMarker();

        },
    });

    fieldRegistry.add('select_geolocation', SelectGeolocationWidget);

    return {
        SelectGeolocationWidget: SelectGeolocationWidget,
    };
});
