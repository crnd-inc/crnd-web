/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useRef, useState } from "@odoo/owl";
import { useService, useBus } from "@web/core/utils/hooks";
import { useModelWithSampleData } from "@web/model/model";
import { extractFieldsFromArchInfo, makeActiveField } from "@web/model/relational_model/utils";
import { Layout } from "@web/search/layout";
import { useSetupAction } from "@web/search/action_hook";
import { SearchBar } from "@web/search/search_bar/search_bar";
import { useSearchBarToggler } from "@web/search/search_bar/search_bar_toggler";
import { CogMenu } from "@web/search/cog_menu/cog_menu";
import { standardViewProps } from "@web/views/standard_view_props";
import { YodooVisTimelineAdapter } from "./services/vis_timeline_adapter";
import { BackgroundLayer } from "./components/background_layer";
import { TimeMarkersLayer } from "./components/time_markers_layer";

export class TimeBaseController extends Component {
    static components = { Layout, SearchBar, CogMenu };
    static props = {
        ...standardViewProps,
        Model: Function,
        Renderer: Function,
        archInfo: Object,
        buttonTemplate: { type: String, optional: true },
    };

    get modelParams() {
        const { activeFields, fields } = extractFieldsFromArchInfo(
            this.archInfo || this.props.archInfo,
            this.props.fields
        );
        if (!activeFields.display_name) {
            activeFields.display_name = makeActiveField();
            fields.display_name = { name: "display_name", type: "char", string: "Display Name" };
        }
        const modelConfig = this.props.state?.modelState?.config || {
            resModel: this.props.resModel,
            fields,
            activeFields,
            openGroupsByDefault: true,
        };
        return {
            config: modelConfig,
            state: this.props.state?.modelState,
            limit: this.props.limit || 80,
            defaultGroupBy: this.props.archInfo.defaultGroupBy || false,
            maxGroupByDepth: 2,
        };
    }

    /**
     * Returns adapter-specific options.
     * Override in subclasses.
     */
    _getTimelineOptions() {
        return {};
    }

    /**
     * Build initial state from layerOptions (injected by Python mixin).
     * Falls back to safe defaults if layerOptions is absent.
     */
    _buildLayerState(layerOptions) {
        const lo = layerOptions || {};
        const toolbar = lo.toolbar || {};
        const bg = lo.background || {};
        const mk = lo.markers || {};

        // Build work hours label for button tooltip (e.g. "09:00 – 18:00")
        const pad = (n) => String(n).padStart(2, '0');
        const whStart = bg.work_hours_start ?? 9;
        const whEnd   = bg.work_hours_end   ?? 18;
        const workHoursLabel = `${pad(whStart)}:00 – ${pad(whEnd)}:00`;

        // Build event layers from timestamp_fields of self_fields events
        const eventsConfig = lo.events_config || [];
        const eventLayers = [];
        for (const ev of eventsConfig) {
            if (ev.source !== 'self_fields') continue;
            for (const tf of (ev.timestamp_fields || [])) {
                const tfColor = tf.color || 'inherit';
                eventLayers.push({
                    key:       `${ev.key}__${tf.field}`,
                    eventKey:  ev.key,
                    field:     tf.field,
                    label:     tf.name || tf.field,
                    color:     tfColor,
                    isInherit: tfColor === 'inherit',
                    lighten:   tf.lighten || 0,
                    darken:    tf.darken  || 0,
                    active:    tf.active !== false,
                });
            }
        }

        return {
            isLoading: true,
            currentScale: "week",
            // 'markers' | 'segments' | 'both' (default)
            timestampStyle: lo.timestamp_style || 'both',
            // Toolbar
            toolbarScales: toolbar.scales || ['day', 'week', 'month', 'year'],
            showToday: toolbar.show_today !== false,
            showZoom: toolbar.show_zoom !== false,
            // Built-in background: initial active state
            showWeekends:   Boolean(bg.weekends),
            showWorkHours:  Boolean(bg.work_hours),
            showNight:      Boolean(bg.night),
            // Built-in background: button visibility (show_* from mixin)
            btnWeekends:    bg.show_weekends !== false,
            btnWorkHours:   bg.show_work_hours !== false,
            btnNight:       bg.show_night !== false,
            // Work hours label shown in button tooltip
            workHoursLabel,
            // Custom background layers — [{key, label, active}]
            customBgLayers: (bg.custom || []).map(c => ({
                key: c.key || c.name,
                label: c.label || c.name,
                active: Boolean(c.active),
            })),
            // Built-in marker: initial state + button visibility
            showCurrentTime: mk.current_time !== false,
            btnCurrentTime:  mk.show_current_time !== false,
            // Custom marker layers — [{key, label, active}]
            customMkLayers: (mk.custom || []).map(c => ({
                key: c.key || c.name,
                label: c.label || c.name,
                active: Boolean(c.active),
            })),
            // Event layers from timestamp_fields — [{key, field, label, color, active}]
            eventLayers,
        };
    }

    setup() {
        this.actionService = useService("action");
        this.orm = useService("orm");
        this.timelineRef = useRef("timeline");
        this.adapter = null;
        this.bgLayer = null;
        this.mkLayer = null;
        this.archInfo = this.props.archInfo;

        // Build reactive state from layerOptions (Python mixin config)
        this.state = useState(this._buildLayerState(this.archInfo.layerOptions));

        this.searchBarToggler = useSearchBarToggler();

        const BaseModel = this.props.Model;
        class YodooTimeModel extends BaseModel {
            async _loadGroupedList(config) {
                config.openGroupsByDefault = true;
                return super._loadGroupedList(config);
            }
        }
        this.model = useState(useModelWithSampleData(YodooTimeModel, this.modelParams));

        useBus(this.model.bus, "update", () => this._renderData());

        useSetupAction({
            getLocalState: () => ({}),
        });

        onMounted(async () => {
            await this._initTimeline();
            this._initLayers();
            this._renderData();
            this.adapter.on('click', (props) => this._onItemClick(props));
        });

        onWillUnmount(() => {
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }
            if (this.bgLayer) {
                this.adapter?.off('rangechanged', this.bgLayer._rangeChangedHandler);
                this.bgLayer.destroy();
                this.bgLayer = null;
            }
            if (this.mkLayer) { this.mkLayer.destroy(); this.mkLayer = null; }
            if (this.adapter) {
                this.adapter.destroy();
                this.adapter = null;
            }
        });
    }

    async _initTimeline() {
        const container = this.timelineRef.el;
        if (!container) return;
        this.adapter = new YodooVisTimelineAdapter(container, {
            height: "100%",
            showCurrentTime: false,   // managed by TimeMarkersLayer
            verticalScroll: true,
            horizontalScroll: true,
            zoomKey: "ctrlKey",
            horizontalScrollKey: "shiftKey",
            margin: { axis: 5 },
            ...this._getTimelineOptions(),
        });
        await this.adapter.initialize();
        this.state.isLoading = false;
        this.adapter.redraw();
        this._resizeObserver = new ResizeObserver(() => this.adapter?.redraw());
        this._resizeObserver.observe(container);
    }

    /**
     * Create BackgroundLayer and TimeMarkersLayer with options from mixin config.
     * Background subscribes to rangechanged for dynamic range expansion.
     * Markers are initialized on the first rangechanged event (vis DOM is ready).
     */
    _initLayers() {
        const lo = this.archInfo.layerOptions || {};

        this.bgLayer = new BackgroundLayer(this.adapter, lo.background || {});
        this.adapter.on('rangechanged', this.bgLayer._rangeChangedHandler);
        this.bgLayer.refresh();

        this.mkLayer = new TimeMarkersLayer(this.adapter, lo.markers || {});
        this.adapter.once('rangechanged', () => {
            if (this.mkLayer) this.mkLayer.refresh();
        });
    }

    async _renderData() {
        if (!this.adapter?.isInitialized) return;
        const root = this.model.root;
        if (!root) return;

        const relatedEvents = await this._loadRelatedEvents(root);
        const hasGroups = root.groups && root.groups.length > 0;
        if (hasGroups) {
            this._renderGrouped(root.groups, this.props.archInfo, relatedEvents);
        } else {
            this._renderRecords(root.records || [], this.props.archInfo, relatedEvents);
        }
    }

    async _loadRelatedEvents(root) {
        const hasRelated = this._eventsConfig.some(e => e.source === 'related');
        if (!hasRelated) return [];

        // Collect all loaded record ids
        const records = root.records || [];
        const ids = records.map(r => r.resId || r.id).filter(Boolean);
        if (!ids.length) return [];

        try {
            const result = await this.orm.call(
                this.props.resModel,
                'get_time_view_data',
                [ids, this.viewType || 'timeline']
            );
            return (result && result.events) ? result.events : [];
        } catch (e) {
            console.warn('yodoo_time_view: _loadRelatedEvents failed', e);
            return [];
        }
    }

    get _eventsConfig() {
        return this.archInfo?.layerOptions?.events_config || [];
    }

    // ---- Toolbar toggle handlers ----

    toggleBackground(key) {
        if (!this.bgLayer) return;
        this.bgLayer.toggle(key);
        if (key === 'weekends')   this.state.showWeekends   = this.bgLayer.state.weekends;
        if (key === 'work_hours') this.state.showWorkHours  = this.bgLayer.state.work_hours;
        if (key === 'night')      this.state.showNight      = this.bgLayer.state.night;
    }

    toggleCurrentTime() {
        if (!this.mkLayer) return;
        this.mkLayer.toggle('current_time');
        this.state.showCurrentTime = this.mkLayer.state.current_time;
    }

    toggleCustomBg(key) {
        const entry = this.state.customBgLayers.find(c => c.key === key);
        if (!entry) return;
        entry.active = !entry.active;
        this._refreshCustomBgLayers();
    }

    toggleCustomMk(key) {
        const entry = this.state.customMkLayers.find(c => c.key === key);
        if (!entry) return;
        entry.active = !entry.active;
        this._refreshCustomMkLayers();
    }

    toggleEventLayer(key) {
        const entry = this.state.eventLayers.find(l => l.key === key);
        if (!entry) return;
        entry.active = !entry.active;
        this._renderData();
    }

    /**
     * Build vis-timeline point items for timestamp_fields of a single record.
     * Returns an array of items to push alongside the main range item.
     *
     * @param {object} data   - record.data
     * @param {number} groupId - vis group id the record belongs to
     * @param {string|number} idPrefix - unique prefix (record id)
     */
    _mixWithWhite(hex, pct) {
        if (!hex || !hex.startsWith('#') || hex.length < 7) return hex || '#888888';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const nr = Math.round(r + (255 - r) * pct);
        const ng = Math.round(g + (255 - g) * pct);
        const nb = Math.round(b + (255 - b) * pct);
        return `#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`;
    }

    _mixWithBlack(hex, pct) {
        if (!hex || !hex.startsWith('#') || hex.length < 7) return hex || '#888888';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const nr = Math.round(r * (1 - pct));
        const ng = Math.round(g * (1 - pct));
        const nb = Math.round(b * (1 - pct));
        return `#${nr.toString(16).padStart(2,'0')}${ng.toString(16).padStart(2,'0')}${nb.toString(16).padStart(2,'0')}`;
    }

    _resolveTimestampColor(layer, baseColor) {
        let color = layer.color === 'inherit' ? (baseColor || '#888888') : (layer.color || '#888888');
        if (layer.lighten > 0) color = this._mixWithWhite(color, layer.lighten);
        if (layer.darken  > 0) color = this._mixWithBlack(color, layer.darken);
        return color;
    }

    /**
     * Builds a CSS linear-gradient string that segments the bar by marker positions.
     * Segment before first marker: baseColor. Each subsequent segment: marker's color.
     * Returns null if no markers fall within [startMs, stopMs].
     */
    _buildSegmentStyle(markerData, startMs, stopMs, baseColor) {
        if (this.state.timestampStyle === 'markers') return null;
        if (!markerData.length || !stopMs || stopMs <= startMs) return null;
        const rangeMs = stopMs - startMs;
        const sorted = [...markerData]
            .sort((a, b) => a.tsMs - b.tsMs)
            .filter(m => m.tsMs > startMs && m.tsMs < stopMs);
        if (!sorted.length) return null;

        const stops = [];
        let prevColor = baseColor || '#888888';
        stops.push(`${prevColor} 0%`);
        for (const m of sorted) {
            const pct = ((m.tsMs - startMs) / rangeMs * 100).toFixed(2);
            stops.push(`${prevColor} ${pct}%`);
            stops.push(`${m.color} ${pct}%`);
            prevColor = m.color;
        }
        stops.push(`${prevColor} 100%`);
        return `background: linear-gradient(to right, ${stops.join(', ')});`;
    }

    /**
     * Returns [{tsMs, color, label}] for all active timestamp layers of a record.
     * Called by controllers to build the marker map passed to adapter.setTsMarkers().
     */
    _getMarkerData(data, startMs, stopMs, baseColor) {
        const layers = this.state.eventLayers || [];
        if (!layers.length) return [];
        const result = [];
        for (const layer of layers) {
            if (!layer.active) continue;
            const val = data[layer.field];
            if (!val) continue;
            // Luxon DateTime (.ts = ms) or plain date string/object
            const tsMs = (val && typeof val === 'object' && typeof val.ts === 'number')
                ? val.ts
                : new Date(val).getTime();
            if (isNaN(tsMs)) continue;
            result.push({
                tsMs,
                color: this._resolveTimestampColor(layer, baseColor),
                label: layer.label,
            });
        }
        return result;
    }

    /**
     * Rebuild custom background periods for all active custom layers.
     * Items come pre-generated from Python (_get_custom_bg_items),
     * the framework only decides which layers are active and passes items to the adapter.
     */
    _refreshCustomBgLayers() {
        if (!this.bgLayer) return;
        const lo = this.archInfo.layerOptions || {};
        const configEntries = (lo.background && lo.background.custom) || [];
        const items = [];
        let id = 90000;
        for (const entry of this.state.customBgLayers) {
            if (!entry.active) continue;
            const cfg = configEntries.find(c => c.key === entry.key);
            for (const raw of (cfg && cfg.items) || []) {
                items.push({
                    id: id++,
                    start: new Date(raw.start),
                    end: new Date(raw.end),
                    type: 'background',
                    className: raw.className || '',
                });
            }
        }
        this.bgLayer.setCustomPeriods(items);
    }

    /**
     * Rebuild custom markers for all active custom marker layers.
     * Items come pre-generated from Python (_get_custom_mk_items),
     * the framework only decides which markers are active and passes them to the adapter.
     */
    _refreshCustomMkLayers() {
        if (!this.mkLayer) return;
        const lo = this.archInfo.layerOptions || {};
        const configEntries = (lo.markers && lo.markers.custom) || [];
        const items = [];
        for (const entry of this.state.customMkLayers) {
            if (!entry.active) continue;
            const cfg = configEntries.find(c => c.key === entry.key);
            for (const raw of (cfg && cfg.items) || []) {
                items.push({
                    id: raw.id || `__custom_${entry.key}__`,
                    timestamp: new Date(raw.timestamp),
                    label: raw.label || entry.label,
                    color: raw.color || '#888',
                    className: raw.className || '',
                });
            }
        }
        this.mkLayer.setCustomMarkers(items);
    }

    // ---- Other handlers ----

    _onItemClick(props) {
        const resId = props.item;
        if (!resId) return;
        // Skip synthetic ids: timestamps (ts_*) and related events (rel_*)
        if (typeof resId === 'string') return;
        this.actionService.doAction({
            type: 'ir.actions.act_window',
            res_model: this.props.resModel,
            res_id: resId,
            views: [[false, 'form']],
            target: 'new',
        });
    }

    _getItemColor(data, colorField) {
        if (!colorField) return null;
        const val = data[colorField];
        if (!val) return null;
        if (typeof val === 'string' && (val.startsWith('#') || /^[a-zA-Z]+$/.test(val))) return val;
        return null;
    }

    _renderRecords(records, archInfo, relatedEvents = []) {
        const { dateStart, dateStop } = archInfo;
        const groups = [];
        const items = [];
        const tsMarkerMap = {};
        const recIdToGroupId = {};
        let groupIdSeq = 1;

        for (const record of records) {
            const data = record.data || record;
            const start = data[dateStart];
            const end = dateStop ? data[dateStop] : null;
            const displayName = data.display_name || data.name || String(record.resId || record.id);
            if (!start) continue;

            const groupId = groupIdSeq++;
            groups.push({ id: groupId, content: displayName });
            const color = this._getItemColor(data, archInfo.color);
            const recId = record.resId || record.id;
            const startMs = new Date(start).getTime();
            const stopMs  = end ? new Date(end).getTime() : null;

            recIdToGroupId[recId] = groupId;
            const markerData = this._getMarkerData(data, startMs, stopMs, color);
            if (markerData.length && this.state.timestampStyle !== 'segments') tsMarkerMap[recId] = markerData;
            const segStyle = this._buildSegmentStyle(markerData, startMs, stopMs, color);

            items.push({
                id:      recId,
                content: '&nbsp;',
                start:   new Date(start),
                end:     end ? new Date(end) : undefined,
                group:   groupId,
                style:   segStyle || undefined,
                color:   segStyle ? undefined : (color || undefined),
            });
        }

        this._appendRelatedItems(items, relatedEvents, recIdToGroupId);
        this.adapter.setGroups(groups);
        this.adapter.setItems(items);
        this.adapter.setTsMarkers(tsMarkerMap);
    }

    /**
     * Normalize Odoo UTC datetime string "YYYY-MM-DD HH:MM:SS" → Date (UTC).
     * Handles both plain strings from RPC and any other parseable values.
     */
    _parseEvDate(s) {
        if (!s) return null;
        const str = String(s);
        // "2024-01-15 10:30:00" → "2024-01-15T10:30:00Z"
        const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)
            ? str.replace(' ', 'T') + 'Z'
            : str;
        return new Date(normalized);
    }

    /**
     * Append related events (from Python get_time_view_data) to the items array.
     *
     * @param {Array}  items          - vis-timeline items array (mutated in place)
     * @param {Array}  relatedEvents  - events returned by get_time_view_data
     * @param {Object} recIdToGroupId - map of record id → vis group id for
     *                                  assigning background items to the right row
     */
    _appendRelatedItems(items, relatedEvents, recIdToGroupId = {}) {
        for (const ev of relatedEvents) {
            if (!ev.start) continue;
            // Resolve vis group: prefer parent record's row, fall back to ev.group
            const groupId = recIdToGroupId[ev.parent_record_id] ?? ev.group ?? undefined;
            const startDate = this._parseEvDate(ev.start);
            const endDate   = ev.end ? this._parseEvDate(ev.end) : undefined;

            if (ev.type === 'background') {
                items.push({
                    id:        ev.id,
                    start:     startDate,
                    end:       endDate,
                    type:      'background',
                    group:     groupId,
                    className: `o_vis_related_bg o_vis_related_bg_${
                        ev.source_key || 'default'}`,
                    style: ev.color
                        ? `background-color: ${ev.color}; opacity: 0.35;`
                        : undefined,
                });
            } else {
                items.push({
                    id:        ev.id,
                    content:   ev.name || '',
                    start:     startDate,
                    end:       endDate,
                    type:      ev.type || 'range',
                    group:     groupId,
                    className: 'o_vis_related_item',
                });
            }
        }
    }

    setScale(scale) {
        this.state.currentScale = scale;
        if (!this.adapter?.isInitialized) return;
        const r = this.adapter._getRangeMs?.();
        const center = r ? new Date(r.center) : new Date();
        const halfMs = {
            day:   43200000,     // 12 h
            week:  302400000,    // 3.5 days
            month: 1296000000,   // 15 days
            year:  15768000000,  // 182.5 days
        }[scale] || 302400000;
        this.adapter.setRange(new Date(center - halfMs), new Date(center + halfMs));
    }

    moveToToday() {
        if (!this.adapter?.isInitialized) return;
        this.adapter.moveToCurrentTime();
    }

    zoomIn() {
        if (!this.adapter?.isInitialized) return;
        this.adapter.zoomIn();
    }

    zoomOut() {
        if (!this.adapter?.isInitialized) return;
        this.adapter.zoomOut();
    }
}
