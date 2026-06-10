/** @odoo-module **/

import { Component } from "@odoo/owl";

/**
 * Plan Zoom Component
 * Zoom controls (based on yodoo_diagram)
 */
export class PlanZoom extends Component {
    static template = "yodoo_plan_view.Zoom";
    static props = {
        zoom: Number,
        onZoomIn: Function,
        onZoomOut: Function,
        onZoomReset: Function,
    };

    get zoomPercent() {
        return Math.round(this.props.zoom * 100);
    }
}
