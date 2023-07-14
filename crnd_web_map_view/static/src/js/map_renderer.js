odoo.define("crnd_web_map_view.MapRenderer", function (require) {
    "use strict";

    var AbstractRenderer = require("web.AbstractRenderer");
    var core = require("web.core");
    var Dialog = require("web.Dialog");

    var _t = core._t;

    var MapRenderer = AbstractRenderer.extend({
        template: "crnd_web_map_view.mapRenderer",

        init: function (parent, state, params) {
            this._super.apply(this, arguments);
            this.mapId = new Date().getTime().toString();
            this.data = [];
            this.markers = [];
        },

        async willStart() {
            var loader = this.get_loader();
            this.api_key = await this.get_map_api_key();
            if (this.api_key) {
                loader({key: this.api_key, v: 'weekly'})

            }
            else {
                Dialog.alert(this, _t('Google map API key is required!'), {
                        title: _t('Warning'),
                    });
            }
        },

        async start() {
            if (this.api_key) {
                var new_data = this.trigger_up('get_map_data', {data: []});
                this.data = new_data.map_data;
                await this.initMap();
            }
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

        get_map_config: function() {
            if (this.data.length == 0) {
                return {
                    position_center: {lat: 0, lng: 0},
                    zoom: 3
                }
            }

            var max_lat = this.data[0]['lat'];
            var min_lat = this.data[0]['lat'];
            var max_lng = this.data[0]['lng'];
            var min_lng = this.data[0]['lng'];
            for (let x of Object.entries(this.data)) {
                max_lat = x[1]['lat'] > max_lat? x[1]['lat']: max_lat;
                min_lat = x[1]['lat'] < min_lat? x[1]['lat']: min_lat;
                max_lng = x[1]['lng'] > max_lng? x[1]['lng']: max_lng;
                min_lng = x[1]['lng'] < min_lng? x[1]['lng']: min_lng;
            }
            var lat = (Math.abs(max_lat) - Math.abs(min_lat)) / 2;
            var lng = (Math.abs(max_lng) - Math.abs(min_lng)) / 2;
            var res = {
                position_center: {lat: lat, lng: lng},
                zoom: 3
            }
            return res;
        },

        async initMap() {
          var map_config = this.get_map_config();
          const { Map } = await google.maps.importLibrary("maps");
          const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
          this.Map = Map;
          this.AdvancedMarkerElement = AdvancedMarkerElement;

          this.map = new this.Map(this.el.querySelector('.map'), {
            zoom: map_config['zoom'],
            center: map_config['position_center'],
            mapId: this.mapId,
          });

          this.load_markers();
        },

        load_markers: function() {
            var marker;
            var self = this;
            for (let [id, position] of Object.entries(this.data)) {
                marker = new this.AdvancedMarkerElement({
                  map: this.map,
                  position: {lat: position['lat'], lng: position['lng']},
                  title: position['title'],
                });
                marker.metadata = {id: position['id']};
                marker.addListener("click", async (event) => {
                    event.id = position['id'];
                    self.trigger_up('open_record', {id: event.id})
                  });
                this.markers.push(marker);
            }
        },

        delete_markers() {
            for (let i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(null);
            }
            this.markers = [];
        },

        updateMap() {
            var new_data = this.trigger_up('get_map_data', {data: []});
            this.data = new_data.map_data;
            this.delete_markers();
            this.load_markers();
        },

    });
    return MapRenderer;
});
