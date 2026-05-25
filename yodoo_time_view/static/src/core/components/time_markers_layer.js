/** @odoo-module **/

/**
 * TimeMarkersLayer - Time markers layer.
 *
 * Manages built-in "Now" marker (current time, auto-updating every 60s)
 * and custom markers passed from Python mixin via layerOptions.
 *
 * Usage:
 *   const ml = new TimeMarkersLayer(adapter, layerOptions.markers);
 *   ml.toggle('current_time');
 *   ml.setCustomMarkers([...]);
 *   ml.refresh();
 */
export class TimeMarkersLayer {
    /**
     * @param {object} adapter - YodooVisTimelineAdapter instance
     * @param {object} options - markers section from layerOptions
     *   {current_time: bool, custom: []}
     */
    constructor(adapter, options = {}) {
        this.adapter = adapter;

        this.state = {
            current_time: options.current_time !== false,
        };

        this._customConfigs = options.custom || [];
        this._customItems = [];

        this._updateInterval = 60000;
        this._updateTimer = null;
        this._startAutoUpdate();
    }

    /**
     * Toggle a built-in marker on/off and refresh.
     * @param {'current_time'} key
     */
    toggle(key) {
        if (key in this.state) {
            this.state[key] = !this.state[key];
            this.refresh();
        }
    }

    /**
     * Set custom marker items.
     * Each item: { id, timestamp, color, label, className }
     */
    setCustomMarkers(items) {
        this._customItems = items || [];
        this.refresh();
    }

    /**
     * Rebuild and push all active markers to the adapter.
     */
    refresh() {
        if (!this.adapter) return;
        const markers = [];

        if (this.state.current_time) {
            markers.push({
                id: '__now__',
                timestamp: new Date(),
                className: 'o_vis_marker_now',
                label: 'Now',
                color: '#e74c3c',
            });
        }

        for (const cm of this._customItems) {
            markers.push(cm);
        }

        this.adapter.setMarkers(markers);
    }

    _startAutoUpdate() {
        if (this._updateTimer) clearInterval(this._updateTimer);
        this._updateTimer = setInterval(() => {
            if (this.state.current_time) this.refresh();
        }, this._updateInterval);
    }

    destroy() {
        if (this._updateTimer) {
            clearInterval(this._updateTimer);
            this._updateTimer = null;
        }
    }
}
