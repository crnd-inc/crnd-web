/** @odoo-module **/

/**
 * YodooVisTimelineAdapter - Custom adapter for vis-timeline
 *
 * Provides direct integration with vis-timeline.
 */
export class YodooVisTimelineAdapter {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            height: '100%',
            orientation: { axis: 'top', item: 'top' },
            stack: true,
            showCurrentTime: true,
            showMajorLabels: true,
            showMinorLabels: true,
            zoomable: true,
            moveable: true,
            selectable: true,
            multiselect: false,
        };
        Object.assign(this.options, options);

        this.timeline = null;
        this.items = null;
        this.groups = null;
        this.markers = [];

        // Map of eventName → handler. Supports multiple handlers via arrays for once().
        this.eventHandlers = new Map();
        this.isInitialized = false;

        // Timestamp marker overlay: {itemId: [{tsMs, color, label}]}
        this._tsMarkerMap = {};
        this._tsOverlay = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        if (typeof vis === 'undefined') {
            throw new Error(
                'vis-timeline library not loaded. ' +
                'Check that vis-timeline-graph2d.js is included in assets.'
            );
        }

        this.items = new vis.DataSet();
        this.groups = new vis.DataSet();
        // All item content is internally generated — allow style attributes fully.
        // FilterXSS by default strips 'style' entirely; css:false disables the
        // nested FilterCSS pass so position/left/transform are preserved.
        const xssOptions = {
            filterOptions: {
                whiteList: {
                    span: ['class', 'style', 'title'],
                    div:  ['class', 'style', 'title'],
                    i:    ['class', 'style'],
                },
                css: false,
            },
        };
        this.timeline = new vis.Timeline(
            this.container,
            this.items,
            this.groups,
            { ...this.options, xss: xssOptions }
        );

        this._setupEventHandlers();
        this.isInitialized = true;
    }

    _setupEventHandlers() {
        if (!this.timeline) return;
        const events = [
            'select', 'click', 'doubleClick', 'contextMenu',
            'itemover', 'itemout', 'groupover', 'groupout',
            'rangechange', 'rangechanged', 'timechange', 'timechanged',
            'dragstart', 'dragover', 'drop', 'add', 'edit', 'remove',
        ];
        events.forEach(eventName => {
            this.timeline.on(eventName, (properties) => {
                this._handleTimelineEvent(eventName, properties);
            });
        });
        // Redraw timestamp marker overlay after every vis-timeline render cycle.
        this.timeline.on('changed', () => this._updateTsMarkerOverlay());
    }

    /**
     * Store timestamp marker data for overlay rendering.
     * markerMap: { [itemId]: [{tsMs, color, label}] }
     * Overlay is redrawn on the next 'changed' event (after vis-timeline layout).
     */
    setTsMarkers(markerMap) {
        this._tsMarkerMap = markerMap || {};
    }

    /**
     * Redraw the timestamp marker overlay.
     * Uses vis-timeline's internal item/group .top coordinates (same system as item positioning)
     * plus the current time window to compute exact pixel X positions — no % math.
     */
    _updateTsMarkerOverlay() {
        const itemSet = this.timeline?.itemSet;
        if (!itemSet) return;

        const centerContent = this.container.querySelector('.vis-panel.vis-center .vis-content');
        if (!centerContent) return;

        if (!this._tsOverlay) {
            this._tsOverlay = document.createElement('div');
            this._tsOverlay.className = 'yodoo-ts-marker-overlay';
            centerContent.appendChild(this._tsOverlay);
        }

        this._tsOverlay.innerHTML = '';

        const keys = Object.keys(this._tsMarkerMap);
        if (!keys.length) return;

        const range = this.timeline.getWindow();
        const winStart = range.start.getTime();
        const winEnd   = range.end.getTime();
        const winMs    = winEnd - winStart;
        const panelW   = centerContent.offsetWidth;
        if (!panelW || !winMs) return;

        const buf = [];
        for (const idStr of keys) {
            // vis-timeline stores items with the original id as key (numeric keys coerced to string)
            const item = itemSet.items[idStr];
            if (!item || item.top == null) continue;

            // group.top: px from content top to group start; item.top: px within group
            const groupTop = item.parent?.top ?? 0;
            const cy = groupTop + item.top + (item.height || 28) / 2;

            for (const { tsMs, color, label } of this._tsMarkerMap[idStr]) {
                const x = (tsMs - winStart) / winMs * panelW;
                if (x < -10 || x > panelW + 10) continue;
                buf.push(
                    `<span class="o_ts_marker_item" title="${label}" ` +
                    `style="left:${x.toFixed(1)}px;top:${cy.toFixed(1)}px;` +
                    `background:${color};"></span>`
                );
            }
        }
        this._tsOverlay.innerHTML = buf.join('');
    }

    _handleTimelineEvent(eventName, properties) {
        const handlers = this.eventHandlers.get(eventName);
        if (!handlers) return;
        // Support both single handler (legacy) and array (once + multiple)
        if (Array.isArray(handlers)) {
            // Iterate copy — handlers may remove themselves during iteration
            [...handlers].forEach(h => h(properties));
        } else if (typeof handlers === 'function') {
            handlers(properties);
        }
    }

    /** Register a persistent event handler. */
    on(eventName, handler) {
        this.eventHandlers.set(eventName, handler);
    }

    /** Register a one-time event handler that removes itself after the first call. */
    once(eventName, handler) {
        const wrapped = (props) => {
            handler(props);
            // Remove this specific wrapped handler
            const current = this.eventHandlers.get(eventName);
            if (Array.isArray(current)) {
                const idx = current.indexOf(wrapped);
                if (idx !== -1) current.splice(idx, 1);
                if (!current.length) this.eventHandlers.delete(eventName);
            } else {
                this.eventHandlers.delete(eventName);
            }
        };

        const current = this.eventHandlers.get(eventName);
        if (current === undefined) {
            this.eventHandlers.set(eventName, [wrapped]);
        } else if (Array.isArray(current)) {
            current.push(wrapped);
        } else {
            // Upgrade existing single handler to array
            this.eventHandlers.set(eventName, [current, wrapped]);
        }
    }

    /** Remove a persistent event handler. */
    off(eventName, handler) {
        if (handler === undefined) {
            this.eventHandlers.delete(eventName);
            return;
        }
        const current = this.eventHandlers.get(eventName);
        if (Array.isArray(current)) {
            const idx = current.indexOf(handler);
            if (idx !== -1) current.splice(idx, 1);
            if (!current.length) this.eventHandlers.delete(eventName);
        } else if (current === handler) {
            this.eventHandlers.delete(eventName);
        }
    }

    /** Set items — diff update: add/replace incoming, remove stale. */
    setItems(items) {
        if (!this.items) return;
        const converted = items.map(i => this._convertItemToVisFormat(i));
        const incomingIds = new Set(converted.map(i => i.id));
        const toRemove = this.items.getIds().filter(id => !incomingIds.has(id) && !String(id).startsWith('bg_'));
        if (toRemove.length) this.items.remove(toRemove);
        this.items.update(converted);
    }

    /** Set groups — diff update. */
    setGroups(groups) {
        if (!this.groups) return;
        const converted = groups.map(g => {
            const v = {
                id: g.id,
                content: g.content || g.name || '',
                className: g.className || '',
                order: g.order || 0,
            };
            if (g.nestedGroups !== undefined) v.nestedGroups = g.nestedGroups;
            if (g.treeLevel !== undefined) v.treeLevel = g.treeLevel;
            if (g.showNested !== undefined) v.showNested = g.showNested;
            return v;
        });
        const incomingIds = new Set(converted.map(g => g.id));
        const toRemove = this.groups.getIds().filter(id => !incomingIds.has(id));
        if (toRemove.length) this.groups.remove(toRemove);
        this.groups.update(converted);
    }

    /** Replace all background items managed by BackgroundLayer (bg_* prefix only). */
    setBackgrounds(bgItems) {
        if (!this.items) return;
        const oldBgIds = this.items.getIds().filter(id => String(id).startsWith('bg_'));
        if (oldBgIds.length) this.items.remove(oldBgIds);
        if (bgItems.length) {
            this.items.add(bgItems.map(item => ({
                id: `bg_${item.id}`,
                start: item.start,
                end: item.end,
                type: 'background',
                className: item.className || '',
                content: '',
            })));
        }
    }

    /**
     * Set time markers via vis-timeline addCustomTime API.
     * All markers are fixed (not draggable).
     */
    setMarkers(markers) {
        if (!this.timeline) return;

        this.markers.forEach(marker => {
            try { this.timeline.removeCustomTime(marker.id); } catch (e) {}
        });
        this.markers = [];

        markers.forEach(marker => {
            const ts = marker.timestamp instanceof Date
                ? marker.timestamp
                : new Date(marker.timestamp);
            try {
                this.timeline.addCustomTime(ts, marker.id);
                if (marker.label) {
                    this.timeline.setCustomTimeTitle(marker.label, marker.id);
                }
                if (marker.color || marker.className) {
                    const el = this.container.querySelector(
                        `.vis-custom-time.${String(marker.id).replace(/[^a-zA-Z0-9_-]/g, '_')}`
                    );
                    if (el) {
                        if (marker.color) el.style.borderLeftColor = marker.color;
                        if (marker.className) el.classList.add(...marker.className.split(' ').filter(Boolean));
                    }
                }
                this.markers.push({ id: marker.id, timestamp: ts });
            } catch (e) {
                console.warn('setMarkers: failed to add custom time', marker.id, e);
            }
        });

        this._rebindTimechangeGuard();
    }

    _rebindTimechangeGuard() {
        if (this._timechangeGuardBound) return;
        this._timechangeGuardBound = true;
        this.timeline.on('timechange', (props) => {
            const fixed = this.markers.find(m => m.id === props.id);
            if (fixed) this.timeline.setCustomTime(fixed.timestamp, fixed.id);
        });
        this.timeline.on('timechanged', (props) => {
            const fixed = this.markers.find(m => m.id === props.id);
            if (fixed) this.timeline.setCustomTime(fixed.timestamp, fixed.id);
        });
    }

    _updateMarkerPositions() {
        if (!this.timeline) return;
        this.markers.forEach(marker => {
            try {
                this.timeline.setCustomTime(
                    marker.timestamp instanceof Date ? marker.timestamp : new Date(marker.timestamp),
                    marker.id
                );
            } catch (e) {}
        });
    }

    _convertItemToVisFormat(item) {
        const visItem = {
            id: item.id,
            content: item.content || item.name,
            start: item.start || item.date_start,
            className: item.className || '',
            style: item.style || '',
        };

        if (item.end || item.date_stop) {
            visItem.end = item.end || item.date_stop;
        } else {
            visItem.type = 'point';
        }

        if (item.group) visItem.group = item.group;
        if (item.type)  visItem.type  = item.type;
        if (item.title) visItem.title = item.title;

        const isPoint = visItem.type === 'point';
        if (item.color) {
            if (isPoint) {
                visItem.style += ` --yodoo-point-color: ${item.color};`;
                visItem.className += ' yodoo-point-item';
            } else {
                visItem.style += ` background-color: ${item.color};`;
            }
        }

        if (item.progress !== undefined) visItem.progress = item.progress;

        return visItem;
    }

    setRange(start, end) {
        if (!this.timeline) return;
        if (!(start instanceof Date) || !(end instanceof Date) ||
            !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
            console.warn('yodoo_time_view: setRange called with invalid dates', start, end);
            return;
        }
        this.timeline.setWindow(start, end, { animation: false });
    }

    getRange() {
        if (!this.timeline) return null;
        return this.timeline.getWindow();
    }

    _getRangeMs() {
        const range = this.getRange();
        const startMs = range?.start instanceof Date ? range.start.getTime() : Number(range?.start);
        const endMs   = range?.end   instanceof Date ? range.end.getTime()   : Number(range?.end);
        if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
        return { startMs, endMs, center: (startMs + endMs) / 2, span: endMs - startMs };
    }

    zoomIn() {
        if (!this.timeline) return;
        const r = this._getRangeMs();
        if (!r) return;
        const half = r.span * 0.4;
        this.setRange(new Date(r.center - half), new Date(r.center + half));
    }

    zoomOut() {
        if (!this.timeline) return;
        const r = this._getRangeMs();
        if (!r) return;
        const half = r.span * 0.625;
        this.setRange(new Date(r.center - half), new Date(r.center + half));
    }

    /** Pan to today without changing zoom level. */
    moveToCurrentTime() {
        if (!this.timeline) return;
        this.timeline.moveTo(new Date(), { animation: false });
    }

    redraw() {
        if (!this.timeline) return;
        this.timeline.redraw();
        this._updateMarkerPositions();
    }

    destroy() {
        if (this._tsOverlay) {
            this._tsOverlay.remove();
            this._tsOverlay = null;
        }
        this._tsMarkerMap = {};
        if (this.timeline) {
            this.timeline.destroy();
            this.timeline = null;
        }
        this.markers = [];
        this.eventHandlers.clear();
        this.isInitialized = false;
    }
}
