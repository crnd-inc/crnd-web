/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { useModel } from "@web/model/model";
import { PlanRenderer } from "./plan_renderer";

/**
 * Plan Controller
 * Handles toolbar actions and edit mode
 */
export class PlanController extends Component {
    static template = "yodoo_plan_view.Controller";
    static components = { Layout, PlanRenderer };
    static props = {
        "*": true,
    };

    setup() {
        this.action = useService("action");
        this.model = useModel(this.props.Model, this.props.modelParams);
        this.renderer = null;
        this.state = useState({
            editModeEnabled: false,
            selectedPolygonId: null,
            editingPolygonId: null,
        });
    }

    onRendererMounted(renderer) {
        this.renderer = renderer;
    }

    onSelectionChange(polygonId) {
        console.log('[Controller] Selection changed:', polygonId);
        this.state.selectedPolygonId = polygonId;
    }

    toggleEditMode() {
        this.state.editModeEnabled = !this.state.editModeEnabled;
        if (this.renderer) {
            this.renderer.setEditModeEnabled(this.state.editModeEnabled);
        }
    }

    /**
     * Open form view of current record
     */
    onClickEdit() {
        this.action.doAction({
            type: 'ir.actions.act_window',
            res_model: this.props.resModel,
            res_id: this.props.resId,
            views: [[false, 'form']],
            target: 'current',
        });
    }

    zoomIn() {
        if (this.renderer) this.renderer.zoomIn();
    }

    zoomOut() {
        if (this.renderer) this.renderer.zoomOut();
    }

    resetZoom() {
        if (this.renderer) this.renderer.resetZoom();
    }

    startDrawMode() {
        if (this.renderer) this.renderer.startDrawMode();
    }

    finishPolygon() {
        if (this.renderer) this.renderer.finishCurrentPolygon();
    }

    cancelDrawing() {
        if (this.renderer) this.renderer.cancelDrawing();
    }

    savePolygons() {
        if (this.renderer) this.renderer.savePolygons();
    }

    get isDrawMode() {
        return this.renderer && this.renderer.state && this.renderer.state.drawMode;
    }

    get hasTempPolygons() {
        return this.renderer && this.renderer.state && this.renderer.state.tempPolygons && this.renderer.state.tempPolygons.length > 0;
    }

    get hasSelectedPolygon() {
        return !!this.state.selectedPolygonId;
    }

    get isEditingPolygon() {
        return !!this.state.editingPolygonId;
    }
    
    get selectedPolygonId() {
        return this.state.selectedPolygonId;
    }

    startEditPolygon() {
        if (this.renderer && this.renderer.state.selectedPolygonId) {
            const polygon = this.renderer.state.data.polygons.find(
                p => p.id === this.renderer.state.selectedPolygonId
            );
            if (polygon) {
                this.renderer.startEditPolygon(polygon);
                this.state.editingPolygonId = polygon.id;
                console.log('[Controller] Started editing:', polygon.id);
            }
        }
    }

    saveEditedPolygon() {
        if (this.renderer) {
            this.renderer.saveEditedPolygon();
            this.state.editingPolygonId = null;
        }
    }

    cancelEdit() {
        if (this.renderer) {
            this.renderer.cancelEdit();
            this.state.editingPolygonId = null;
        }
    }

    deletePolygon() {
        if (this.renderer) this.renderer.deletePolygon();
    }
}
