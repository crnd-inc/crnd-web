/** @odoo-module **/

/**
 * Label Drag Mixin
 * Provides functionality for dragging polygon labels
 */
export const LabelDragMixin = {
    setupLabelDrag() {
        this.labelDragState = {
            isDragging: false,
            draggedPolygonId: null,
            startX: 0,
            startY: 0,
            labelStartX: 0,
            labelStartY: 0,
        };
    },

    onLabelMouseDown(polygon, ev) {
        if (!this.state.editModeEnabled) return;
        
        ev.stopPropagation();
        ev.preventDefault();
        
        const svg = ev.currentTarget.closest('svg');
        const pt = svg.createSVGPoint();
        pt.x = ev.clientX;
        pt.y = ev.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        
        this.labelDragState.isDragging = true;
        this.labelDragState.draggedPolygonId = polygon.id;
        this.labelDragState.startX = svgP.x;
        this.labelDragState.startY = svgP.y;
        this.labelDragState.labelStartX = polygon.labelX || polygon.centroidX;
        this.labelDragState.labelStartY = polygon.labelY || polygon.centroidY;
        
        console.log('[LabelDragMixin] Label drag started:', polygon.id);
    },

    onLabelMouseMove(ev) {
        if (!this.labelDragState.isDragging) return;
        
        ev.stopPropagation();
        ev.preventDefault();
        
        const svg = ev.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = ev.clientX;
        pt.y = ev.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        
        const dx = svgP.x - this.labelDragState.startX;
        const dy = svgP.y - this.labelDragState.startY;
        
        // Update label position in state
        const polygon = this.state.data.polygons.find(
            p => p.id === this.labelDragState.draggedPolygonId
        );
        if (polygon) {
            polygon.labelX = this.labelDragState.labelStartX + dx;
            polygon.labelY = this.labelDragState.labelStartY + dy;
        }
    },

    async onLabelMouseUp(ev) {
        if (!this.labelDragState.isDragging) return;
        
        ev.stopPropagation();
        ev.preventDefault();
        
        const polygonId = this.labelDragState.draggedPolygonId;
        const polygon = this.state.data.polygons.find(p => p.id === polygonId);
        
        if (polygon) {
            console.log('[LabelDragMixin] Saving label position:', {
                id: polygonId,
                labelX: polygon.labelX,
                labelY: polygon.labelY,
            });
            
            // Save to server
            try {
                await this.props.model.orm.call(
                    'plan.polygon',
                    'write',
                    [[polygonId], {
                        label_x: polygon.labelX,
                        label_y: polygon.labelY,
                    }]
                );
                console.log('[LabelDragMixin] Label position saved');
            } catch (error) {
                console.error('[LabelDragMixin] Error saving label position:', error);
            }
        }
        
        this.labelDragState.isDragging = false;
        this.labelDragState.draggedPolygonId = null;
    },
};
