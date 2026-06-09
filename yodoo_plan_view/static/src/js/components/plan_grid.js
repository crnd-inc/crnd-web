/** @odoo-module **/

import { Component } from "@odoo/owl";

/**
 * Plan Grid Component
 * SVG grid pattern (based on yodoo_diagram)
 */
export class PlanGrid extends Component {
    static template = "yodoo_plan_view.Grid";
    static props = {
        show: Boolean,
        size: Number,
        color: String,
        width: Number,
        height: Number,
    };

    get patternId() {
        return `grid-pattern-${this.props.size}`;
    }
}
