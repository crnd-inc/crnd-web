/** @odoo-module **/

import { Component } from "@odoo/owl";

/**
 * Plan Toolbar Component
 * Toolbar with drawing tools
 */
export class PlanToolbar extends Component {
    static template = "yodoo_plan_view.Toolbar";
    static props = {
        editMode: Boolean,
        selectedTool: String,
        onToolSelect: Function,
        onSave: Function,
        onCancel: Function,
        onToggleGrid: Function,
        onToggleSnap: Function,
    };

    selectTool(tool) {
        this.props.onToolSelect(tool);
    }
}
