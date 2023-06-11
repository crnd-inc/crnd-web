/** @odoo-module */

import { useService, useBus } from "@web/core/utils/hooks";
import {
    Component,
    onMounted,
    onWillUpdateProps,
} from "@odoo/owl";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

export class MapRenderer extends Component {
    setup() {

        this.mapId = new Date().getTime().toString();
        this.data = this.get_map_data();
        this.markers = [];
        this.dialogService = useService("dialog");
        useBus(this.env.searchModel, 'update_map', this.updateMap)

        onMounted(async () => {
            var loader = this.get_loader();
            var api_key = await this.get_map_api_key();
            if (api_key) {
                loader({key: api_key, v: 'weekly'})
                await this.initMap();
            }
            else {
                await this.dialogService.add(AlertDialog, {
                    body: this.env._t('Google map API key is required!'),
                    confirm: () => {},
                });
            }
        });

        onWillUpdateProps(() => {
            this.updateMap();
        });
    }

    get_loader() {
        var loader = (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))});
        return loader;
    }

    async get_map_api_key() {
        var api_key = await this.env.searchModel.orm.call('ir.config_parameter', 'get_param', [], {key: 'base_geolocalize.google_map_api_key'});
        return api_key;
    }

    get_map_data() {
        var res = []
        for (let x of Object.entries(this.props.model.data)) {
            res.push({
                id: x[1]['id'],
                lat: x[1][this.props.archInfo['latitude_field']] ? x[1][this.props.archInfo['latitude_field']]: 0,
                lng: x[1][this.props.archInfo['longitude_field']] ? x[1][this.props.archInfo['longitude_field']]: 0,
                title: x[1][this.props.archInfo['title_field']] ? x[1][this.props.archInfo['title_field']]: '',
            });
        }
        return res;
    }

    get_map_config() {
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
    }

    async initMap() {
      var map_config = this.get_map_config();
      const { Map } = await google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
      this.Map = Map;
      this.AdvancedMarkerElement = AdvancedMarkerElement;

      this.map = new this.Map(document.getElementById(this.mapId), {
        zoom: map_config['zoom'],
        center: map_config['position_center'],
        mapId: this.mapId,
      });

      this.load_markers();
    }

    load_markers() {
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
                self.env.searchModel.trigger('open_record', {id: event.id})
              });
            this.markers.push(marker);
        }
    }

    delete_markers() {
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];
    }

    updateMap() {
        this.data = this.get_map_data();
        this.delete_markers();
        this.load_markers();
    }

}

MapRenderer.template = 'crnd_web_map_view.mapRenderer';
