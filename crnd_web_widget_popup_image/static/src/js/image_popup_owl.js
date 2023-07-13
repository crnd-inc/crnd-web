/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from"@web/views/fields/standard_field_props";

export class MyNewWidget extends Component {

    get_url() {
        var model = this.props.record.resModel;
        var id = this.props.record.resId;
        var field = this.props.name;
        var url = `web/image/${model}/${id}/${field}`
        return url;
    }

    popup() {
        var url = this.get_url();
        $.magnificPopup.open({
            items: {src: url},
            type:'image',
            closeOnContentClick: true,
        });
    }

    onClickImage() {
        event.stopPropagation();
        return this.popup();
    }
}
MyNewWidget.template = 'crnd_web_widget_popup_image.ImagePopup';
MyNewWidget.supportedTypes = ["binary"];
MyNewWidget.props = {
	...standardFieldProps,
};

registry.category("fields").add("image_popup", MyNewWidget);
