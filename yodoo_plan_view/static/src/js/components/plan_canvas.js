/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useState, useRef } from "@odoo/owl";
import { PlanToolbar } from "./plan_toolbar";
import { PlanZoom } from "./plan_zoom";
import { PlanGrid } from "./plan_grid";
import { PlanRuler } from "./plan_ruler";

/**
 * Plan Canvas Component
 * Main canvas for displaying and editing floor plans
 */
export class PlanCanvas extends Component {
    static template = "yodoo_plan_view.Canvas";
    static components = {
        PlanToolbar,
        PlanZoom,
        PlanGrid,
        PlanRuler,
    };
    static props = {
        data: Object,
        editMode: Boolean,
        selectedTool: String,
        onSave: Function,
        onCancel: Function,
        onToolSelect: Function,
    };

    setup() {
        this.canvasRef = useRef("canvas");
        this.svgRef = useRef("svg");
        this.imageRef = useRef("image");
        
        this.state = useState({
            // Image dimensions
            imageWidth: 0,
            imageHeight: 0,
            imageLoaded: false,
            
            // Zoom & Pan
            zoom: 1.0,
            panX: 0,
            panY: 0,
            
            // Grid
            showGrid: this.props.data.showGrid || false,
            gridSize: this.props.data.gridSize || 20,
            snapToGrid: this.props.data.snapToGrid || false,
            
            // Polygons (working copy)
            polygons: JSON.parse(JSON.stringify(this.props.data.polygons || [])),
            selectedPolygonId: null,
            
            // Drawing state
            newPolygonPoints: [],
            isDrawing: false,
            
            // Ruler state
            rulerPoints: [],
            rulerDistance: 0,
            
            // Mouse state
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
        });

        onMounted(() => {
            this.initCanvas();
        });

        onWillUnmount(() => {
            this.cleanup();
        });
    }

    initCanvas() {
        const canvas = this.canvasRef.el;
        if (!canvas) return;

        // Load image
        if (this.props.data.image) {
            const img = new Image();
            img.onload = () => {
                this.state.imageWidth = img.width;
                this.state.imageHeight = img.height;
                this.state.imageLoaded = true;
                console.log('[PlanCanvas] Image loaded:', img.width, 'x', img.height);
            };
            img.src = `data:image/png;base64,${this.props.data.image}`;
        }

        // Add event listeners
        this.addEventListeners();
    }

    cleanup() {
        // Remove event listeners
        this.removeEventListeners();
    }

    addEventListeners() {
        const svg = this.svgRef.el;
        if (!svg) return;

        svg.addEventListener('click', this.onSvgClick.bind(this));
        svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        svg.addEventListener('mousemove', this.onMouseMove.bind(this));
        svg.addEventListener('mouseup', this.onMouseUp.bind(this));
        svg.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    }

    removeEventListeners() {
        const svg = this.svgRef.el;
        if (!svg) return;

        svg.removeEventListener('click', this.onSvgClick.bind(this));
        svg.removeEventListener('mousedown', this.onMouseDown.bind(this));
        svg.removeEventListener('mousemove', this.onMouseMove.bind(this));
        svg.removeEventListener('mouseup', this.onMouseUp.bind(this));
        svg.removeEventListener('wheel', this.onWheel.bind(this));
    }

    /**
     * Get mouse coordinates relative to SVG
     */
    getMouseCoords(event) {
        const svg = this.svgRef.el;
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        
        let x = svgP.x;
        let y = svgP.y;
        
        // Snap to grid if enabled
        if (this.state.snapToGrid && this.props.editMode) {
            const gridSize = this.state.gridSize;
            x = Math.round(x / gridSize) * gridSize;
            y = Math.round(y / gridSize) * gridSize;
        }
        
        return { x, y };
    }

    /**
     * SVG Click Handler
     */
    onSvgClick(event) {
        if (!this.props.editMode) return;

        const coords = this.getMouseCoords(event);
        const tool = this.props.selectedTool;

        if (tool === 'draw') {
            this.addPointToNewPolygon(coords);
        } else if (tool === 'ruler') {
            this.addRulerPoint(coords);
        }
    }

    /**
     * Add point to new polygon
     */
    addPointToNewPolygon(coords) {
        this.state.newPolygonPoints.push([coords.x, coords.y]);
        this.state.isDrawing = true;
    }

    /**
     * Finish drawing polygon
     */
    finishPolygon() {
        if (this.state.newPolygonPoints.length < 3) {
            console.warn('[PlanCanvas] Need at least 3 points for polygon');
            this.state.newPolygonPoints = [];
            this.state.isDrawing = false;
            return;
        }

        // Create new polygon
        const settings = this.props.data.settings;
        const newPolygon = {
            id: null, // Will be assigned on save
            points: this.state.newPolygonPoints,
            fill_color: settings.default_fill_color || '#3498db',
            stroke_color: settings.default_stroke_color || '#2980b9',
            stroke_width: settings.default_stroke_width || 2,
            opacity: settings.default_opacity || 0.5,
        };

        this.state.polygons.push(newPolygon);
        this.state.newPolygonPoints = [];
        this.state.isDrawing = false;
    }

    /**
     * Cancel drawing
     */
    cancelDrawing() {
        this.state.newPolygonPoints = [];
        this.state.isDrawing = false;
    }

    /**
     * Add ruler point
     */
    addRulerPoint(coords) {
        this.state.rulerPoints.push([coords.x, coords.y]);
        
        if (this.state.rulerPoints.length === 2) {
            // Calculate distance
            const [x1, y1] = this.state.rulerPoints[0];
            const [x2, y2] = this.state.rulerPoints[1];
            const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            this.state.rulerDistance = distance;
        }
    }

    /**
     * Clear ruler
     */
    clearRuler() {
        this.state.rulerPoints = [];
        this.state.rulerDistance = 0;
    }

    /**
     * Mouse down handler
     */
    onMouseDown(event) {
        if (this.props.selectedTool === 'pan' || event.button === 1) {
            this.state.isDragging = true;
            this.state.dragStartX = event.clientX - this.state.panX;
            this.state.dragStartY = event.clientY - this.state.panY;
        }
    }

    /**
     * Mouse move handler
     */
    onMouseMove(event) {
        if (this.state.isDragging) {
            this.state.panX = event.clientX - this.state.dragStartX;
            this.state.panY = event.clientY - this.state.dragStartY;
        }
    }

    /**
     * Mouse up handler
     */
    onMouseUp(event) {
        this.state.isDragging = false;
    }

    /**
     * Wheel handler for zoom
     */
    onWheel(event) {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            
            const delta = -event.deltaY;
            const zoomFactor = delta > 0 ? 1.1 : 0.9;
            
            this.state.zoom = Math.max(0.1, Math.min(5.0, this.state.zoom * zoomFactor));
        }
    }

    /**
     * Toggle grid
     */
    toggleGrid() {
        this.state.showGrid = !this.state.showGrid;
    }

    /**
     * Toggle snap to grid
     */
    toggleSnapToGrid() {
        this.state.snapToGrid = !this.state.snapToGrid;
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.state.zoom = Math.min(5.0, this.state.zoom * 1.2);
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.state.zoom = Math.max(0.1, this.state.zoom / 1.2);
    }

    /**
     * Reset zoom
     */
    resetZoom() {
        this.state.zoom = 1.0;
        this.state.panX = 0;
        this.state.panY = 0;
    }

    /**
     * Save changes
     */
    async save() {
        await this.props.onSave(this.state.polygons);
    }

    /**
     * Cancel changes
     */
    cancel() {
        this.props.onCancel();
    }

    /**
     * Select polygon
     */
    selectPolygon(polygonId) {
        this.state.selectedPolygonId = polygonId;
    }

    /**
     * Delete selected polygon
     */
    deleteSelectedPolygon() {
        if (this.state.selectedPolygonId !== null) {
            this.state.polygons = this.state.polygons.filter(
                p => p.id !== this.state.selectedPolygonId
            );
            this.state.selectedPolygonId = null;
        }
    }
}
