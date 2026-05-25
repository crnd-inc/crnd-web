/** @odoo-module **/

import { Component } from "@odoo/owl";

export class TimeRenderer extends Component {
    static template = "yodoo_time_view.TimeRenderer";
}

TimeRenderer.props = {
    model: Object,
    archInfo: Object,
};
