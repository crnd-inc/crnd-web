/** @odoo-module **/

/**
 * BackgroundLayer - Background layer for time-based views.
 *
 * Manages built-in backgrounds (weekends, work hours, night)
 * and custom periods passed from the Python mixin via layerOptions.
 *
 * Built-in layers are generated only within the visible timeline range
 * and expand automatically when the user scrolls to new dates.
 *
 * Usage:
 *   const bg = new BackgroundLayer(adapter, layerOptions.background);
 *   adapter.on('rangechanged', bg._rangeChangedHandler);
 *   bg.refresh();
 *   bg.toggle('weekends');
 *   bg.setCustomPeriods([...]);
 */
export class BackgroundLayer {
    /**
     * @param {object} adapter - YodooVisTimelineAdapter instance
     * @param {object} options - background section from layerOptions
     *   {weekends, work_hours, night, custom}
     */
    constructor(adapter, options = {}) {
        this.adapter = adapter;

        // Built-in toggle state — initialized from mixin config
        this.state = {
            weekends:   Boolean(options.weekends),
            work_hours: Boolean(options.work_hours),
            night:      Boolean(options.night),
        };

        this._customConfigs = options.custom || [];
        this._customItems = [];

        // Configurable work hours window.
        // Python weekday: 0=Mon..4=Fri → JS getDay: 1=Mon..5=Fri → (py+1)%7
        const pyDays = options.work_hours_days ?? [0, 1, 2, 3, 4];
        this._whDays  = new Set(pyDays.map(d => (d + 1) % 7));
        this._whStart = options.work_hours_start ?? 9;
        this._whEnd   = options.work_hours_end   ?? 18;

        // Cache of generated built-in items per active flag
        this._cache = null;        // { weekends: [], work_hours: [], night: [] }
        this._cachedRange = null;  // { start: Date, end: Date }
        this._padDays = 30;        // generate this many days beyond visible range

        // Bound handler for adapter rangechanged event
        this._rangeChangedHandler = (props) => this._onRangeChanged(props);
    }

    /**
     * Toggle a built-in layer on/off and refresh.
     * @param {'weekends'|'work_hours'|'night'} key
     */
    toggle(key) {
        if (!(key in this.state)) return;
        this.state[key] = !this.state[key];
        this._cache = null;  // invalidate cache so next refresh rebuilds
        this.refresh();
    }

    /**
     * Set custom period items (list of vis-timeline background items).
     * Each item: { id, start, end, className }
     */
    setCustomPeriods(items) {
        this._customItems = items || [];
        this._pushToAdapter();
    }

    /**
     * Rebuild and push all active background items to the adapter.
     * Generates only within visible range ± padDays.
     * @param {Date} [rangeStart]
     * @param {Date} [rangeEnd]
     */
    refresh(rangeStart, rangeEnd) {
        if (!this.adapter) return;

        const visRange = this.adapter.getRange?.();
        const toDate = (v) => {
            if (v instanceof Date && Number.isFinite(v.getTime())) return v;
            const n = Number(v);
            return Number.isFinite(n) ? new Date(n) : null;
        };
        const vStart = toDate(rangeStart) || toDate(visRange?.start) || new Date(Date.now() - 60 * 86400000);
        const vEnd   = toDate(rangeEnd)   || toDate(visRange?.end)   || new Date(Date.now() + 60 * 86400000);

        const genStart = new Date(vStart.getTime() - this._padDays * 86400000);
        const genEnd   = new Date(vEnd.getTime()   + this._padDays * 86400000);

        // Rebuild only if we've scrolled outside the cached range
        const needsRebuild = !this._cache || !this._cachedRange ||
            genStart < this._cachedRange.start ||
            genEnd   > this._cachedRange.end;

        if (needsRebuild) {
            this._buildCache(genStart, genEnd);
        }

        this._pushToAdapter();
    }

    _buildCache(start, end) {
        this._cache = { weekends: [], work_hours: [], night: [] };
        const d = new Date(start);
        d.setHours(0, 0, 0, 0);
        let id = 1;

        while (d < end) {
            const dow = d.getDay();
            const isWeekend = dow === 0 || dow === 6;

            if (this.state.weekends && isWeekend) {
                this._cache.weekends.push({
                    id: id++,
                    start: new Date(d),
                    end: new Date(d.getTime() + 86400000),
                    type: 'background',
                    className: 'o_vis_bg_weekend',
                });
            }
            if (this.state.work_hours && this._whDays.has(dow)) {
                const ws = new Date(d); ws.setHours(this._whStart, 0, 0, 0);
                const we = new Date(d); we.setHours(this._whEnd,   0, 0, 0);
                this._cache.work_hours.push({ id: id++, start: ws, end: we, type: 'background', className: 'o_vis_bg_workhours' });
            }
            if (this.state.night) {
                const n1s = new Date(d);
                const n1e = new Date(d); n1e.setHours(8, 0, 0, 0);
                this._cache.night.push({ id: id++, start: n1s, end: n1e, type: 'background', className: 'o_vis_bg_night' });
                const n2s = new Date(d); n2s.setHours(20, 0, 0, 0);
                const n2e = new Date(d.getTime() + 86400000); n2e.setHours(0, 0, 0, 0);
                this._cache.night.push({ id: id++, start: n2s, end: n2e, type: 'background', className: 'o_vis_bg_night' });
            }

            d.setDate(d.getDate() + 1);
        }

        this._cachedRange = { start: new Date(start), end: new Date(end) };
    }

    _pushToAdapter() {
        if (!this.adapter) return;
        const items = [
            ...(this._cache?.weekends   || []),
            ...(this._cache?.work_hours || []),
            ...(this._cache?.night      || []),
            ...this._customItems,
        ];
        this.adapter.setBackgrounds(items);
    }

    // Called by adapter rangechanged — expand generation if near edges
    _onRangeChanged(props) {
        if (!this._cachedRange) return;
        const buffer = this._padDays / 2 * 86400000;
        const nearStart = props.start < new Date(this._cachedRange.start.getTime() + buffer);
        const nearEnd   = props.end   > new Date(this._cachedRange.end.getTime()   - buffer);
        if (nearStart || nearEnd) {
            this.refresh(props.start, props.end);
        }
    }

    destroy() {
        // Handler is removed externally via adapter.off('rangechanged', bg._rangeChangedHandler)
    }
}
