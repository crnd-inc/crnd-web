/** @odoo-module **/

import { Component } from "@odoo/owl";

/**
 * Plan Polygon Component
 * Renders a single polygon
 */
export class PlanPolygon extends Component {
    static template = "yodoo_plan_view.Polygon";
    static props = {
        polygon: Object,
        selected: Boolean,
        editMode: Boolean,
        onSelect: Function,
        onPointMove: Function,
    };

    get pointsString() {
        return this.props.polygon.points
            .map(p => `${p[0]},${p[1]}`)
            .join(' ');
    }

    get centroid() {
        const points = this.props.polygon.points;
        if (!points || points.length === 0) return [0, 0];
        
        const x = points.reduce((sum, p) => sum + p[0], 0) / points.length;
        const y = points.reduce((sum, p) => sum + p[1], 0) / points.length;
        return [x, y];
    }

    onClick(event) {
        event.stopPropagation();
        this.props.onSelect(this.props.polygon.id);
    }
}
