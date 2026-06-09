/** @odoo-module **/

import { Component } from "@odoo/owl";

/**
 * Plan Ruler Component
 * Ruler tool for measuring distances
 */
export class PlanRuler extends Component {
    static template = "yodoo_plan_view.Ruler";
    static props = {
        points: Array,
        distance: Number,
        scaleCoefficient: Number,
        color: String,
        width: Number,
    };

    get distanceInMeters() {
        if (!this.props.scaleCoefficient || this.props.scaleCoefficient === 0) {
            return null;
        }
        return (this.props.distance / this.props.scaleCoefficient).toFixed(2);
    }

    get midPoint() {
        if (this.props.points.length !== 2) return null;
        const [x1, y1] = this.props.points[0];
        const [x2, y2] = this.props.points[1];
        return [(x1 + x2) / 2, (y1 + y2) / 2];
    }
}
