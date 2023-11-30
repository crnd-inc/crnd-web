/** @odoo-module */

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { Component } from "@odoo/owl";
import {onMounted} from "@odoo/owl";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";

export class SelectGeolocationPopover extends Component {
    setup () {
        this.dialogService = useService("dialog");
        this.orm = useService("orm");
        this.mapId = this.props.mapId
        this.record = this.props.record
        this.options = this.props.options
        this.showPopover = this.props.showPopover
        this.value = this.props.value
        this.readonly = this.props.readonly

        onMounted(async () => {
            var loader = this.get_loader();
            var api_key = await this.get_map_api_key();
            if (api_key) {
                loader({key: api_key, v: 'weekly'})
                await this.initMap();
            }
            else {
                await this.get_error_warning('Google map API key is required!');
            }
        });
    }

    async _saveGeolocation () {
        if (!this.newGeolocation) {
            this.newGeolocation = await this._getGeolocation();
        }
        this.props.value = JSON.stringify(this.newGeolocation);
        this.__owl__.parent.props.update(this.props.value)
        this._closeMapPopover ();
    }

    _closeMapPopover () {
        this.props.showPopover = false
        this.__owl__.parent.props.update(this.props.value)
        this.__owl__.parent.render()
    }

    get_loader() {
        var loader = (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))});
        return loader;
    }

    async get_map_api_key() {
        var api_key = await this.orm.call('ir.config_parameter','get_param',['base_geolocalize.google_map_api_key'])
        return api_key;
    }

    async get_map_config () {
            var position_center = await this._getGeolocation();
            var res = {
                position_center: position_center,
                zoom: this.record.data[this.options.zoom] ? this.record.data[this.options.zoom] : 10,
            }
            return res;
        }

    async _createMarker () {
        let self = this;
        if (!this.props.readonly) {
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
    }

    get_default_geolocation() {
        return {
            latitude: 41.1533320,
            longitude: 20.1683310,
        }
    }

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
                self.get_error_warning(error.message);
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
    }

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
    }

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

        }

    async _saveData (name, value){
        var changes = {};
        changes[name] = value;
        this.trigger_up('field_changed', {
            dataPointID: this.dataPointID,
            changes: changes,
        });
    }

    async get_error_warning(text) {
        await this.dialogService.add(AlertDialog, {
                body: this.env._t(text),
                confirm: () => {},
            });
    }
}

SelectGeolocationPopover.template="crnd_web_widget_select_geolocation.map_field_widget_popover"
SelectGeolocationPopover.props = {
    ...standardFieldProps,
    record: {type: Object},
    options: {type: Object},
    mapId: {type: String},
    showPopover: {type: Boolean},
    value: {type: String},
    readonly: {type: Boolean}
}


export class SelectGeolocationWidget extends Component {
    setup() {
    }

    async _onClickGeoButton(e) {
            e.stopPropagation();
            this.props.mapId = new Date().getTime().toString();
            this.props.showPopover = true;
            this.render()
        }
}

SelectGeolocationWidget.template = "crnd_web_widget_select_geolocation.select_geolocation_widget";
SelectGeolocationWidget.supportedTypes = ["char"];
SelectGeolocationWidget.components = {
    SelectGeolocationPopover,
};
SelectGeolocationWidget.props = {
    ...standardFieldProps,
    options: {type: Object},
    showPopover: {type: Boolean},
};
SelectGeolocationWidget.extractProps = ({attrs} ) => {
    return {
        options: attrs['options'],
        showPopover: false,
    };
};

registry.category("fields").add("select_geolocation", SelectGeolocationWidget);
