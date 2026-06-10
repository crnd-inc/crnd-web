/** @odoo-module **/

import { Component, onWillStart, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { LabelDragMixin } from "./plan_label_mixin";

/**
 * Plan Renderer
 * Main component that renders the plan canvas
 */
export class PlanRenderer extends Component {
    static template = "yodoo_plan_view.Renderer";
    static props = {
        "*": true,
    };

    setup() {
        this.state = useState({
            data: null,
            loading: true,
            zoom: 1.0,
            imageWidth: 0,
            imageHeight: 0,
            // Drawing state
            drawMode: false,
            editMode: false,
            currentTool: 'select', // select, draw, edit
            currentPolygon: [], // Points being drawn
            tempPolygons: [], // Temporary polygons before save
            // Selection state
            hoveredPolygonId: null,
            selectedPolygonId: null,
            selectedObjectId: null,
            // Edit state
            editingPolygonId: null,
            editingPoints: [],
            draggedPointIndex: null,
            // Mode
            editModeEnabled: false,
            // UI state
            sidebarVisible: true,
            // Pan/Drag to scroll state
            isPanning: false,
            panStartX: 0,
            panStartY: 0,
            scrollStartX: 0,
            scrollStartY: 0,
            // Attach object dialog state
            showAttachDialog: false,
            attachDialogPolygonId: null,
            // Booking state
            bookingMode: false,
            selectedBookingObjects: [],
            bookingCustomerName: '',
            // Style settings
            settings: {
                selectedFillColor: '#ffc107',      // Жовтий колір заливки для виділеного
                selectedStrokeColor: '#ff9800',    // Помаранчевий колір обводки для виділеного
                selectedOpacity: 0.7,              // Прозорість виділеного
                selectedStrokeWidth: 4,            // Товщина обводки виділеного
                hoveredOpacity: 0.6,               // Прозорість при hover
                hoveredStrokeWidth: 3,             // Товщина обводки при hover
                normalOpacity: 0.5,                // Нормальна прозорість
                normalStrokeWidth: 2,              // Нормальна товщина обводки
            },
        });

        onWillStart(async () => {
            await this.loadData();
        });

        onMounted(() => {
            if (this.props.onMounted) {
                this.props.onMounted(this);
            }
            
            // Initialize label drag functionality
            LabelDragMixin.setupLabelDrag.call(this);
            
            // Add keyboard shortcut Ctrl+D
            this.onKeyDown = this.onKeyDown.bind(this);
            document.addEventListener('keydown', this.onKeyDown);
        });
        
        onWillUnmount(() => {
            document.removeEventListener('keydown', this.onKeyDown);
        });
    }

    onKeyDown(ev) {
        // Ctrl+D - start draw mode
        if (ev.ctrlKey && ev.key === 'd') {
            ev.preventDefault();
            this.startDrawMode();
        }
        // Delete key - delete selected polygon
        else if (ev.key === 'Delete' && this.state.selectedPolygonId) {
            ev.preventDefault();
            this.deletePolygon();
        }
    }

    onImageLoad(ev) {
        this.state.imageWidth = ev.target.naturalWidth;
        this.state.imageHeight = ev.target.naturalHeight;
    }

    onImageDragStart(ev) {
        // Prevent ghost image when trying to drag
        ev.preventDefault();
        return false;
    }

    onWheel(ev) {
        // Ctrl + Wheel = Zoom
        if (ev.ctrlKey) {
            ev.preventDefault();
            
            const delta = ev.deltaY;
            const zoomSpeed = 0.1;
            
            if (delta < 0) {
                // Scroll up - zoom in
                this.state.zoom = Math.min(this.state.zoom + zoomSpeed, 5.0);
            } else {
                // Scroll down - zoom out
                this.state.zoom = Math.max(this.state.zoom - zoomSpeed, 0.1);
            }
        }
        // Shift + Wheel = horizontal scroll (браузер обробляє автоматично)
        // Wheel = vertical scroll (браузер обробляє автоматично)
    }

    zoomIn() {
        this.state.zoom = Math.min(this.state.zoom + 0.1, 5.0);
    }

    zoomOut() {
        this.state.zoom = Math.max(this.state.zoom - 0.1, 0.1);
    }

    resetZoom() {
        this.state.zoom = 1.0;
    }

    toggleEditMode() {
        this.state.editModeEnabled = !this.state.editModeEnabled;
        if (!this.state.editModeEnabled) {
            // Exit edit mode - reset tools
            this.state.currentTool = 'select';
            this.state.drawMode = false;
            this.state.editingPolygonId = null;
            this.state.editingPoints = [];
        }
        console.log('[PlanRenderer] Edit mode:', this.state.editModeEnabled);
    }

    toggleSidebar() {
        this.state.sidebarVisible = !this.state.sidebarVisible;
        console.log('[PlanRenderer] Sidebar visible:', this.state.sidebarVisible);
    }

    // Pan/Drag to scroll handlers
    onCanvasMouseDown(ev) {
        // Only pan if not in draw/edit mode and not clicking on buttons
        if (this.state.editModeEnabled || ev.target.tagName === 'BUTTON' || ev.target.closest('button')) {
            return;
        }
        
        this.state.isPanning = true;
        this.state.panStartX = ev.clientX;
        this.state.panStartY = ev.clientY;
        
        const container = ev.currentTarget;
        this.state.scrollStartX = container.scrollLeft;
        this.state.scrollStartY = container.scrollTop;
        
        ev.preventDefault();
    }

    onCanvasMouseMove(ev) {
        if (!this.state.isPanning) return;
        
        const deltaX = ev.clientX - this.state.panStartX;
        const deltaY = ev.clientY - this.state.panStartY;
        
        const container = ev.currentTarget;
        container.scrollLeft = this.state.scrollStartX - deltaX;
        container.scrollTop = this.state.scrollStartY - deltaY;
    }

    onCanvasMouseUp(ev) {
        this.state.isPanning = false;
    }

    onCanvasMouseLeave(ev) {
        this.state.isPanning = false;
    }

    // Attach object to polygon
    attachObjectToPolygon() {
        if (!this.state.selectedPolygonId) {
            return;
        }
        
        this.state.showAttachDialog = true;
        this.state.attachDialogPolygonId = this.state.selectedPolygonId;
        console.log('[PlanRenderer] Opening attach dialog for polygon:', this.state.selectedPolygonId);
    }

    async attachObject(objectId) {
        if (!this.state.attachDialogPolygonId) {
            return;
        }
        
        try {
            const polygonId = this.state.attachDialogPolygonId;
            const polygon = this.state.data.polygons.find(p => p.id === polygonId);
            if (!polygon) {
                console.error('[PlanRenderer] Polygon not found:', polygonId);
                return;
            }
            
            // Step 1: Clear polygon if objectId = null
            if (!objectId) {
                await this.props.model.orm.call(
                    'plan.polygon',
                    'write',
                    [[polygonId], {
                        related_model: false,
                        related_id: false,
                    }]
                );
                console.log('[PlanRenderer] Polygon unbound:', polygonId);
            } else {
                // Step 2: Unbind object from its previous polygon (if any)
                const existingPolygon = this.state.data.polygons?.find(
                    p => p.relatedId === objectId
                );
                if (existingPolygon && existingPolygon.id !== polygonId) {
                    await this.props.model.orm.call(
                        'plan.polygon',
                        'write',
                        [[existingPolygon.id], {
                            related_model: false,
                            related_id: false,
                        }]
                    );
                }

                // Step 3: Attach object to polygon
                const newObject = this.state.data.relatedObjects?.find(o => o.id === objectId);
                const relatedModel = newObject ? newObject.model : null;

                await this.props.model.orm.call(
                    'plan.polygon',
                    'write',
                    [[polygonId], {
                        related_model: relatedModel,
                        related_id: objectId,
                    }]
                );

                console.log('[PlanRenderer] Object attached:', objectId, 'model:', relatedModel, 'to polygon:', polygonId);
            }
            
            // Reload data
            await this.props.model.load();
            this.state.data = this.props.model.root;
            
            // Close dialog
            this.state.showAttachDialog = false;
            this.state.attachDialogPolygonId = null;
            
        } catch (error) {
            console.error('[PlanRenderer] Error attaching object:', error);
            alert('Помилка при прив\'язці об\'єкта: ' + error.message);
        }
    }

    cancelAttach() {
        this.state.showAttachDialog = false;
        this.state.attachDialogPolygonId = null;
    }

    /**
     * Convert polygon points array to SVG points string
     */
    getPolygonPoints(polygon) {
        if (!polygon.points || polygon.points.length === 0) {
            return '';
        }
        return polygon.points.map(p => {
            // Support both array format [x, y] and object format {x, y}
            if (Array.isArray(p)) {
                return `${p[0]},${p[1]}`;
            }
            return `${p.x},${p.y}`;
        }).join(' ');
    }

    /**
     * Start draw mode
     */
    startDrawMode() {
        if (!this.state.drawMode) {
            this.state.drawMode = true;
            this.state.currentTool = 'draw';
            this.state.currentPolygon = [];
            this.state.tempPolygons = [];
            console.log('[PlanRenderer] Draw mode started');
        }
    }

    /**
     * Handle SVG click for drawing
     */
    onSvgClick(ev) {
        if (this.state.currentTool !== 'draw') return;
        
        // Get click position relative to SVG
        const svg = ev.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / this.state.zoom;
        const y = (ev.clientY - rect.top) / this.state.zoom;
        
        this.state.currentPolygon.push({ x, y });
        console.log('[PlanRenderer] Point added:', { x, y }, 'Total points:', this.state.currentPolygon.length);
    }

    /**
     * Handle SVG double click - finish and save
     */
    async onSvgDblClick(ev) {
        if (this.state.currentTool !== 'draw') return;
        
        ev.preventDefault();
        console.log('[PlanRenderer] Double click - finishing polygon');
        
        // Finish current polygon
        this.finishCurrentPolygon();
        
        // Save all polygons
        if (this.state.tempPolygons.length > 0) {
            await this.savePolygons();
        }
    }

    /**
     * Handle SVG context menu (right click) - cancel
     */
    onSvgContextMenu(ev) {
        if (this.state.currentTool === 'draw') {
            ev.preventDefault();
            console.log('[PlanRenderer] Right click - canceling drawing');
            this.cancelDrawing();
        }
    }

    /**
     * Finish current polygon
     */
    finishCurrentPolygon() {
        if (this.state.currentPolygon.length >= 3) {
            this.state.tempPolygons.push({
                id: `temp_${Date.now()}`,
                points: [...this.state.currentPolygon],
                fillColor: '#3498db',
                strokeColor: '#2980b9',
                strokeWidth: 2,
                opacity: 0.5,
            });
        }
        this.state.currentPolygon = [];
    }

    /**
     * Cancel current polygon
     */
    cancelDrawing() {
        this.state.currentPolygon = [];
        this.state.drawMode = false;
        this.state.currentTool = 'select';
    }

    /**
     * Save all temporary polygons
     */
    async savePolygons() {
        if (this.state.tempPolygons.length === 0) {
            return;
        }
        
        console.log('[PlanRenderer] Saving polygons:', this.state.tempPolygons);
        console.log('[PlanRenderer] resModel:', this.props.resModel, 'resId:', this.props.resId);
        
        try {
            // Save each polygon to server
            for (const tempPoly of this.state.tempPolygons) {
                // Calculate centroid for label positioning
                const centroid = this.calculateCentroid(tempPoly.points);
                
                const vals = {
                    plan_id: `${this.props.resModel},${this.props.resId}`,
                    points: JSON.stringify(tempPoly.points),
                    centroid_x: centroid.x,
                    centroid_y: centroid.y,
                    fill_color: tempPoly.fillColor,
                    stroke_color: tempPoly.strokeColor,
                    stroke_width: tempPoly.strokeWidth,
                    opacity: tempPoly.opacity,
                    name: `Polygon ${new Date().toLocaleTimeString()}`,
                };
                
                console.log('[PlanRenderer] Creating polygon with vals:', vals);
                
                const result = await this.props.model.orm.call(
                    'plan.polygon',
                    'create',
                    [vals]
                );
                
                console.log('[PlanRenderer] Polygon created with ID:', result);
            }
            
            // Reload data to show saved polygons
            await this.props.model.load();
            this.state.data = this.props.model.root;
            
            // Clear temp polygons and exit draw mode
            this.state.tempPolygons = [];
            this.state.drawMode = false;
            this.state.currentTool = 'select';
            
            console.log('[PlanRenderer] Polygons saved successfully');
        } catch (error) {
            console.error('[PlanRenderer] Error saving polygons:', error);
            alert(`Помилка збереження: ${error.message || error}`);
        }
    }

    /**
     * Calculate centroid of polygon
     */
    calculateCentroid(points) {
        if (points.length === 0) return { x: 0, y: 0 };
        
        let sumX = 0, sumY = 0;
        for (const point of points) {
            sumX += point.x;
            sumY += point.y;
        }
        
        return {
            x: sumX / points.length,
            y: sumY / points.length
        };
    }

    /**
     * Handle polygon mouse enter
     */
    onPolygonMouseEnter(polygon) {
        // Allow hover in edit mode or select mode
        if (this.state.editModeEnabled || this.state.currentTool === 'select') {
            this.state.hoveredPolygonId = polygon.id;
        }
    }

    /**
     * Handle polygon mouse leave
     */
    onPolygonMouseLeave() {
        this.state.hoveredPolygonId = null;
    }

    /**
     * Set edit mode enabled
     */
    setEditModeEnabled(enabled) {
        this.state.editModeEnabled = enabled;
        if (!enabled) {
            this.state.selectedPolygonId = null;
        }
    }

    /**
     * Handle polygon click
     */
    onPolygonClick(polygon, ev) {
        ev.stopPropagation();
        console.log('[PlanRenderer] Polygon clicked:', polygon.id, 'editMode:', this.state.editModeEnabled, 'bookingMode:', this.state.bookingMode);
        
        // Booking mode - toggle selection
        if (this.state.bookingMode) {
            this.toggleBookingSelection(polygon);
            return;
        }
        
        if (this.state.editModeEnabled) {
            // Edit mode - select polygon
            if (this.state.selectedPolygonId === polygon.id) {
                this.state.selectedPolygonId = null;
                this.state.selectedObjectId = null;
                console.log('[PlanRenderer] Polygon deselected');
            } else {
                this.state.selectedPolygonId = polygon.id;
                
                // Find and select related object
                if (polygon.relatedModel && polygon.relatedId) {
                    const relatedObj = this.state.data.relatedObjects?.find(obj => obj.id === polygon.relatedId);
                    if (relatedObj) {
                        this.state.selectedObjectId = relatedObj.id;
                        console.log('[PlanRenderer] Related object selected:', relatedObj.id);
                    }
                } else {
                    this.state.selectedObjectId = null;
                }
                
                console.log('[PlanRenderer] Polygon selected:', polygon.id);
            }
            // Notify controller about selection change
            if (this.props.onSelectionChange) {
                this.props.onSelectionChange(this.state.selectedPolygonId);
            }
        } else {
            // View mode - select polygon and object
            this.state.selectedPolygonId = polygon.id;
            
            // Find and select related object
            if (polygon.relatedModel && polygon.relatedId) {
                const relatedObj = this.state.data.relatedObjects?.find(obj => obj.id === polygon.relatedId);
                if (relatedObj) {
                    this.state.selectedObjectId = relatedObj.id;
                }
            }
        }
    }

    /**
     * Handle object click from sidebar
     */
    onObjectClick(obj) {
        console.log('[PlanRenderer] Object clicked:', obj);

        this.state.selectedObjectId = obj.id;

        const polygon = this.state.data.polygons?.find(
            p => p.relatedModel === obj.model && p.relatedId === obj.id
        );
        if (polygon) {
            this.state.selectedPolygonId = polygon.id;
            if (this.props.onSelectionChange) {
                this.props.onSelectionChange(polygon.id);
            }
        } else {
            this.state.selectedPolygonId = null;
            console.log('[PlanRenderer] Object has no polygon');
        }
    }

    /**
     * Handle object double click from sidebar - open form
     */
    onObjectDblClick(obj) {
        console.log('[PlanRenderer] Object double clicked:', obj);

        if (obj.model && obj.id) {
            this.env.services.action.doAction({
                type: 'ir.actions.act_window',
                res_model: obj.model,
                res_id: obj.id,
                views: [[false, 'form']],
                target: 'new',
            });
        }
    }

    /**
     * Start editing polygon
     */
    startEditPolygon(polygon) {
        this.state.editingPolygonId = polygon.id;
        this.state.editingPoints = JSON.parse(JSON.stringify(polygon.points));
        this.state.currentTool = 'edit';
        this.state.draggedPointIndex = null;
        console.log('[PlanRenderer] Started editing polygon:', polygon.id, 'points:', this.state.editingPoints);
    }

    /**
     * Handle point mouse down - start dragging
     */
    onPointMouseDown(pointIndex, ev) {
        ev.stopPropagation();
        this.state.draggedPointIndex = pointIndex;
        console.log('[PlanRenderer] Started dragging point:', pointIndex);
    }

    /**
     * Handle SVG mouse move - drag point
     */
    onSvgMouseMove(ev) {
        if (this.state.draggedPointIndex !== null && this.state.editingPolygonId) {
            const svg = ev.currentTarget;
            const rect = svg.getBoundingClientRect();
            const x = (ev.clientX - rect.left) / this.state.zoom;
            const y = (ev.clientY - rect.top) / this.state.zoom;
            
            this.state.editingPoints[this.state.draggedPointIndex] = { x, y };
        }
    }

    /**
     * Handle mouse up - stop dragging
     */
    onSvgMouseUp(ev) {
        if (this.state.draggedPointIndex !== null) {
            console.log('[PlanRenderer] Stopped dragging point:', this.state.draggedPointIndex);
            this.state.draggedPointIndex = null;
        }
    }

    /**
     * Save edited polygon
     */
    async saveEditedPolygon() {
        if (!this.state.editingPolygonId) return;
        
        try {
            const centroid = this.calculateCentroid(this.state.editingPoints);
            
            await this.props.model.orm.call(
                'plan.polygon',
                'write',
                [[this.state.editingPolygonId], {
                    points: JSON.stringify(this.state.editingPoints),
                    centroid_x: centroid.x,
                    centroid_y: centroid.y,
                }]
            );
            
            // Reload data
            await this.props.model.load();
            this.state.data = this.props.model.root;
            
            // Exit edit mode
            this.state.editingPolygonId = null;
            this.state.editingPoints = [];
            this.state.currentTool = 'select';
            
            console.log('[PlanRenderer] Polygon updated successfully');
        } catch (error) {
            console.error('[PlanRenderer] Error updating polygon:', error);
            alert(`Помилка оновлення: ${error.message || error}`);
        }
    }

    /**
     * Cancel editing
     */
    cancelEdit() {
        this.state.editingPolygonId = null;
        this.state.editingPoints = [];
        this.state.currentTool = 'select';
    }

    /**
     * Delete selected polygon
     */
    async deletePolygon() {
        if (!this.state.selectedPolygonId) {
            alert('Виберіть полігон для видалення');
            return;
        }
        
        if (!confirm('Видалити цей полігон?')) {
            return;
        }
        
        try {
            await this.props.model.orm.call(
                'plan.polygon',
                'unlink',
                [[this.state.selectedPolygonId]]
            );
            
            // Reload data
            await this.props.model.load();
            this.state.data = this.props.model.root;
            
            this.state.selectedPolygonId = null;
            
            console.log('[PlanRenderer] Polygon deleted successfully');
        } catch (error) {
            console.error('[PlanRenderer] Error deleting polygon:', error);
            alert(`Помилка видалення: ${error.message || error}`);
        }
    }

    /**
     * Handle polygon double click - open related object form
     */
    onPolygonDblClick(polygon, ev) {
        ev.stopPropagation();
        
        // Open related object form if exists
        if (polygon.relatedModel && polygon.relatedId) {
            console.log('[PlanRenderer] Opening form for:', polygon.relatedModel, polygon.relatedId);
            this.env.services.action.doAction({
                type: 'ir.actions.act_window',
                res_model: polygon.relatedModel,
                res_id: polygon.relatedId,
                views: [[false, 'form']],
                target: 'new',
            });
        } else {
            console.log('[PlanRenderer] Polygon has no related object');
        }
    }

    /**
     * Get polygon style based on state
     */
    getPolygonStyle(polygon) {
        const isHovered = this.state.hoveredPolygonId === polygon.id;
        const isSelected = this.state.selectedPolygonId === polygon.id;
        const settings = this.state.settings;
        
        let fillColor = polygon.fillColor || '#3498db';
        let strokeColor = polygon.strokeColor || '#2980b9';
        let opacity = polygon.opacity || settings.normalOpacity;
        let strokeWidth = polygon.strokeWidth || settings.normalStrokeWidth;
        
        // Booking mode styling
        if (this.state.bookingMode && polygon.relatedId) {
            const bookedObjects = this.state.data?.bookedObjects || [];
            const selectedObjects = this.state.selectedBookingObjects || [];
            
            // Booked - red
            if (bookedObjects.includes(polygon.relatedId)) {
                fillColor = '#e74c3c';
                strokeColor = '#c0392b';
                opacity = 0.7;
            }
            // Selected for booking - yellow/orange
            else if (selectedObjects.includes(polygon.relatedId)) {
                fillColor = '#f39c12';
                strokeColor = '#e67e22';
                opacity = 0.8;
                strokeWidth = 3;
            }
            // Available - green
            else {
                fillColor = '#27ae60';
                strokeColor = '#229954';
                opacity = 0.6;
            }
        }
        // Normal mode styling
        else {
            if (isSelected) {
                fillColor = settings.selectedFillColor;
                strokeColor = settings.selectedStrokeColor;
                opacity = settings.selectedOpacity;
                strokeWidth = settings.selectedStrokeWidth;
            } else if (isHovered) {
                opacity = settings.hoveredOpacity;
                strokeWidth = settings.hoveredStrokeWidth;
            }
        }
        
        return { fillColor, strokeColor, opacity, strokeWidth };
    }

    async loadData() {
        if (this.props.model && typeof this.props.model.load === 'function') {
            try {
                await this.props.model.load();
                this.state.data = this.props.model.root;
                
                // Set booking mode from model
                if (this.props.model.bookingMode) {
                    this.state.bookingMode = true;
                }
            } catch (error) {
                console.error('[PlanRenderer] Error loading data:', error);
            }
        }
        
        this.state.loading = false;
    }

    get hasImage() {
        return this.state.data && this.state.data.image;
    }

    get imageUrl() {
        if (!this.hasImage) return null;
        
        const imageType = this.state.data.imageType;
        let mimeType = 'image/png';
        
        if (imageType === 'svg') {
            mimeType = 'image/svg+xml';
        } else if (imageType === 'raster') {
            // Визначаємо тип за першими байтами base64
            const firstChars = this.state.data.image.substring(0, 10);
            if (firstChars.startsWith('iVBORw0KGgo')) {
                mimeType = 'image/png';
            } else if (firstChars.startsWith('/9j/')) {
                mimeType = 'image/jpeg';
            }
        }
        
        return `data:${mimeType};base64,${this.state.data.image}`;
    }

    // Label drag methods from mixin
    onLabelMouseDown(polygon, ev) {
        return LabelDragMixin.onLabelMouseDown.call(this, polygon, ev);
    }

    onLabelMouseMove(ev) {
        return LabelDragMixin.onLabelMouseMove.call(this, ev);
    }

    onLabelMouseUp(ev) {
        return LabelDragMixin.onLabelMouseUp.call(this, ev);
    }

    // ============ Booking Mode Methods ============

    /**
     * Toggle object selection for booking
     */
    toggleBookingSelection(polygon) {
        if (!this.state.bookingMode || !polygon.relatedId) return;

        const bookedObjects = this.state.data?.bookedObjects || [];
        
        // Can't select already booked objects
        if (bookedObjects.includes(polygon.relatedId)) {
            return;
        }

        const selectedObjects = this.state.selectedBookingObjects;
        const index = selectedObjects.indexOf(polygon.relatedId);

        if (index > -1) {
            selectedObjects.splice(index, 1);
        } else {
            selectedObjects.push(polygon.relatedId);
        }
    }

    /**
     * Get selected objects info for display
     */
    getSelectedBookingInfo() {
        if (!this.state.bookingMode) return [];

        const selectedObjects = this.state.selectedBookingObjects;
        const relatedObjects = this.state.data?.relatedObjects || [];

        return selectedObjects.map(objectId => {
            const obj = relatedObjects.find(o => o.id === objectId);
            return obj || { id: objectId, name: `Object ${objectId}` };
        });
    }

    /**
     * Clear booking selection
     */
    clearBookingSelection() {
        this.state.selectedBookingObjects = [];
    }

    /**
     * Create bookings for selected objects
     */
    async createBookings() {
        if (!this.state.bookingMode || this.state.selectedBookingObjects.length === 0) {
            return;
        }

        const customerName = this.state.bookingCustomerName.trim();
        if (!customerName) {
            this.env.services.notification.add('Будь ласка, введіть ім\'я клієнта', {
                type: 'warning',
            });
            return;
        }

        try {
            const config = this.props.model.bookingConfig;
            const selectedObjects = this.state.selectedBookingObjects;

            // Create booking records
            const bookingPromises = selectedObjects.map(objectId => {
                const vals = {
                    [config.relatedField]: config.relatedId,
                    [config.objectField]: objectId,
                    [config.stateField]: config.stateValue,
                };
                
                if (config.customerField) {
                    vals[config.customerField] = customerName;
                }

                return this.props.model.orm.create(config.model, [vals]);
            });

            await Promise.all(bookingPromises);

            // Reload booked objects
            this.state.data.bookedObjects = await this.props.model.loadBookedObjects();

            // Clear selection
            this.clearBookingSelection();
            this.state.bookingCustomerName = '';

            // Show success message
            this.env.services.notification.add(
                `Успішно заброньовано ${selectedObjects.length} місць!`,
                { type: 'success' }
            );

        } catch (error) {
            console.error('[PlanRenderer] Error creating bookings:', error);
            this.env.services.notification.add(
                `Помилка при бронюванні: ${error.message || 'Невідома помилка'}`,
                { type: 'danger' }
            );
        }
    }
}
