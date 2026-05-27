/** @odoo-module **/

import {
    Component, onMounted, onWillUnmount, useRef, useState,
} from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";

// Reuse lower-level vis-timeline pieces from yodoo_time_view
import { YodooVisTimelineAdapter } from
    "@yodoo_time_view/core/services/vis_timeline_adapter";
import { BackgroundLayer } from
    "@yodoo_time_view/core/components/background_layer";
import { TimeMarkersLayer } from
    "@yodoo_time_view/core/components/time_markers_layer";

/**
 * TimelineBuilderAction
 *
 * Standalone OWL client action that renders a vis-timeline or gantt chart
 * for any Odoo model based on a yodoo.timeline.template record.
 *
 * Data flow:
 *   mount → get_builder_config (RPC) → init adapter + layers
 *        → get_builder_data  (RPC)  → build groups + items → render
 *   filter change → get_builder_data (RPC) → re-render
 */
export class TimelineBuilderAction extends Component {
    static template = "yodoo_timeline_builder.TimelineBuilderAction";

    setup() {
        this.actionService = useService("action");
        this.orm          = useService("orm");
        this.timelineRef  = useRef("timeline");

        this.adapter  = null;
        this.bgLayer  = null;
        this.mkLayer  = null;

        // Related item metadata for open_form on double-click
        this._relatedItemMeta = {};

        this.state = useState({
            isLoading: true,
            config:    null,   // result of get_builder_config
            // Toolbar / layer toggles (populated after config load)
            currentScale:    'week',
            toolbarScales:   ['day', 'week', 'month', 'year'],
            showToday:       true,
            showZoom:        true,
            showWeekends:    false,
            showWorkHours:   false,
            showNight:       false,
            btnWeekends:     true,
            btnWorkHours:    true,
            btnNight:        false,
            showCurrentTime: true,
            btnCurrentTime:  true,
            customBgLayers:  [],
            customMkLayers:  [],
            eventLayers:     [],
            relatedToggles:  [],
            // Filter bar
            searchText:      '',
            activeFilters:   [],
            addFilterMode:   false,
            draftFilter:     { key: '', operator: 'contains', value: '' },
        });

        onMounted(async () => {
            const templateId = this.props.action?.context?.yodoo_timeline_template_id;
            if (!templateId) {
                console.error('TimelineBuilderAction: no yodoo_timeline_template_id in context');
                return;
            }
            await this._loadConfigAndInit(templateId);
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
            if (this.mkLayer)  { this.mkLayer.destroy();  this.mkLayer  = null; }
            if (this.adapter)  { this.adapter.destroy();  this.adapter  = null; }
        });
    }

    // ── Init ────────────────────────────────────────────────────────────────

    async _loadConfigAndInit(templateId) {
        // 1. Load configuration from the template record
        const config = await this.orm.call(
            'yodoo.timeline.template',
            'get_builder_config',
            [templateId],
        );
        this.state.config = config;
        this._applyLayerState(config.layer_options);

        // 2. Init vis-timeline adapter
        const container = this.timelineRef.el;
        if (!container) return;

        const isGantt = config.view_type === 'gantt';
        this.adapter = new YodooVisTimelineAdapter(container, {
            height: '100%',
            showCurrentTime: false,
            verticalScroll: true,
            horizontalScroll: true,
            zoomKey: 'ctrlKey',
            horizontalScrollKey: 'shiftKey',
            margin: { axis: 5 },
            stack: !isGantt,
        });
        await this.adapter.initialize();
        this.state.isLoading = false;
        this.adapter.redraw();

        // 3. Layers
        const lo = config.layer_options || {};
        this.bgLayer = new BackgroundLayer(this.adapter, lo.background || {});
        this.adapter.on('rangechanged', this.bgLayer._rangeChangedHandler);
        this.bgLayer.refresh();

        this.mkLayer = new TimeMarkersLayer(this.adapter, lo.markers || {});
        this.adapter.once('rangechanged', () => { if (this.mkLayer) this.mkLayer.refresh(); });

        // 4. Double-click → open form
        this.adapter.on('doubleClick', (props) => this._onItemClick(props));

        // 5. Resize observer
        this._resizeObserver = new ResizeObserver(() => this.adapter?.redraw());
        this._resizeObserver.observe(container);

        // 6. Load and render data
        await this._loadAndRender();

        // 7. Jump to default scale
        this.setScale(config.default_scale || 'week');
    }

    _applyLayerState(lo) {
        if (!lo) return;
        const tb  = lo.toolbar   || {};
        const bg  = lo.background || {};
        const mk  = lo.markers   || {};
        const evCfg = lo.events_config || [];

        const pad = (n) => String(n).padStart(2, '0');
        const whStart = bg.work_hours_start ?? 9;
        const whEnd   = bg.work_hours_end   ?? 18;

        // Toolbar toggles for related events
        const relatedToggles = [];
        for (const ev of evCfg) {
            if (!ev.toolbar_button) continue;
            const btn = ev.toolbar_button;
            relatedToggles.push({
                key:    ev.key,
                label:  btn.label || ev.key,
                icon:   btn.icon  || 'fa-circle',
                active: btn.active !== false,
            });
        }

        Object.assign(this.state, {
            currentScale:    this.state.config?.default_scale || 'week',
            toolbarScales:   tb.scales    || ['day', 'week', 'month', 'year'],
            showToday:       tb.show_today !== false,
            showZoom:        tb.show_zoom  !== false,
            showWeekends:    Boolean(bg.weekends),
            showWorkHours:   Boolean(bg.work_hours),
            showNight:       Boolean(bg.night),
            btnWeekends:     bg.show_weekends  !== false,
            btnWorkHours:    bg.show_work_hours !== false,
            btnNight:        bg.show_night      !== false,
            workHoursLabel: `${pad(whStart)}:00 – ${pad(whEnd)}:00`,
            showCurrentTime: mk.current_time !== false,
            btnCurrentTime:  mk.show_current_time !== false,
            customBgLayers:  (bg.custom || []).map(c => ({
                key: c.key || c.name, label: c.label || c.name, active: Boolean(c.active),
            })),
            customMkLayers:  (mk.custom || []).map(c => ({
                key: c.key || c.name, label: c.label || c.name, active: Boolean(c.active),
            })),
            eventLayers:     [],
            relatedToggles,
        });
    }

    // ── Data loading ────────────────────────────────────────────────────────

    async _loadAndRender() {
        if (!this.adapter?.isInitialized) return;
        const cfg = this.state.config;
        if (!cfg) return;

        const filters = this.state.activeFilters.map(f => ({
            key: f.key, operator: f.operator, value: f.value,
        }));

        const result = await this.orm.call(
            'yodoo.timeline.template',
            'get_builder_data',
            [cfg.id, [], filters, cfg.view_type],
        );

        this._renderData(cfg, result.records, result.events || []);
    }

    // ── Rendering ───────────────────────────────────────────────────────────

    _renderData(cfg, records, relatedEvents) {
        const isGantt     = cfg.view_type === 'gantt';
        const groupbyFlds = cfg.groupby_fields || [];
        const hasOverlay  = this._overlaySourceKeys(cfg).size > 0;

        if (groupbyFlds.length > 0) {
            if (isGantt) {
                this._renderGanttGrouped(cfg, records, relatedEvents,
                                         groupbyFlds, hasOverlay);
            } else {
                this._renderTimelineGrouped(cfg, records, relatedEvents,
                                            groupbyFlds, hasOverlay);
            }
        } else {
            this._renderFlat(cfg, records, relatedEvents, isGantt, hasOverlay);
        }
    }

    /** Returns Set of event keys whose source_key is marked overlay:true. */
    _overlaySourceKeys(cfg) {
        const evCfg = cfg.layer_options?.events_config || [];
        return new Set(evCfg.filter(ev => ev.overlay).map(ev => ev.key));
    }

    /** Build groups from records grouped by up to two groupby fields. */
    _groupRecords(records, groupbyFlds) {
        // Returns [{label, value, records, subgroups: [{label, value, records}]}]
        const gb1 = groupbyFlds[0];
        const gb2 = groupbyFlds[1] || null;
        const ordered = [];
        const byKey1  = {};

        for (const rec of records) {
            const rawVal1  = rec[gb1];
            const key1     = rawVal1 ? (Array.isArray(rawVal1) ? String(rawVal1[0]) : String(rawVal1)) : '__none__';
            const label1   = rawVal1 ? (Array.isArray(rawVal1) ? rawVal1[1] : String(rawVal1)) : '—';

            if (!byKey1[key1]) {
                byKey1[key1] = { label: label1, value: rawVal1, records: [], subgroups: {}, _subOrder: [] };
                ordered.push(key1);
            }

            if (gb2) {
                const rawVal2 = rec[gb2];
                const key2    = rawVal2 ? (Array.isArray(rawVal2) ? String(rawVal2[0]) : String(rawVal2)) : '__none__';
                const label2  = rawVal2 ? (Array.isArray(rawVal2) ? rawVal2[1] : String(rawVal2)) : '—';

                if (!byKey1[key1].subgroups[key2]) {
                    byKey1[key1].subgroups[key2] = { label: label2, value: rawVal2, records: [] };
                    byKey1[key1]._subOrder.push(key2);
                }
                byKey1[key1].subgroups[key2].records.push(rec);
            } else {
                byKey1[key1].records.push(rec);
            }
        }

        return ordered.map(k => ({
            ...byKey1[k],
            subgroups: byKey1[k]._subOrder.map(sk => byKey1[k].subgroups[sk]),
        }));
    }

    _buildItem(rec, cfg, groupId, hasOverlay) {
        const start = rec[cfg.date_start];
        const end   = cfg.date_stop ? rec[cfg.date_stop] : null;
        if (!start) return null;
        const color   = cfg.color ? rec[cfg.color] : null;
        const colorStr = (typeof color === 'string') ? color : null;
        return {
            id:       rec.id,
            content:  rec.display_name || String(rec.id),
            title:    this._buildTooltipHtml(rec, cfg),
            start:    new Date(start),
            end:      end ? new Date(end) : undefined,
            group:    groupId,
            subgroup: hasOverlay ? 'main' : undefined,
            color:    colorStr || undefined,
        };
    }

    _buildGanttItem(rec, cfg, groupId, hasOverlay) {
        const start = rec[cfg.date_start];
        const end   = cfg.date_stop ? rec[cfg.date_stop] : null;
        if (!start) return null;
        const color    = cfg.color ? rec[cfg.color] : null;
        const colorStr = (typeof color === 'string') ? color : null;
        return {
            id:       rec.id,
            content:  '&nbsp;',
            title:    this._buildTooltipHtml(rec, cfg),
            start:    new Date(start),
            end:      end ? new Date(end) : undefined,
            group:    groupId,
            subgroup: hasOverlay ? 'main' : undefined,
            color:    colorStr || undefined,
        };
    }

    _renderFlat(cfg, records, relatedEvents, isGantt, hasOverlay) {
        const groups = [];
        const items  = [];
        const recIdToGroupId = {};
        let seq = 1;

        for (const rec of records) {
            const gid = seq++;
            groups.push({
                id: gid,
                content: rec.display_name || String(rec.id),
                subgroupStack: hasOverlay ? { main: false } : undefined,
            });
            recIdToGroupId[rec.id] = gid;
            const item = isGantt
                ? this._buildGanttItem(rec, cfg, gid, hasOverlay)
                : this._buildItem(rec, cfg, gid, hasOverlay);
            if (item) items.push(item);
        }

        this._appendRelated(items, relatedEvents, recIdToGroupId, cfg);
        this.adapter.setGroups(groups);
        this.adapter.setItems(items);
    }

    _renderTimelineGrouped(cfg, records, relatedEvents, groupbyFlds, hasOverlay) {
        const tree  = this._groupRecords(records, groupbyFlds);
        const groups = [];
        const items  = [];
        const recIdToGroupId = {};
        let seq = 1;

        for (const g1 of tree) {
            if (g1.subgroups && g1.subgroups.length) {
                for (const g2 of g1.subgroups) {
                    const gid = seq++;
                    groups.push({
                        id: gid,
                        content: `${g1.label} / ${g2.label}`,
                        subgroupStack: hasOverlay ? { main: false } : undefined,
                    });
                    for (const rec of g2.records) {
                        recIdToGroupId[rec.id] = gid;
                        const item = this._buildItem(rec, cfg, gid, hasOverlay);
                        if (item) items.push(item);
                    }
                }
            } else {
                const gid = seq++;
                groups.push({
                    id: gid,
                    content: g1.label,
                    subgroupStack: hasOverlay ? { main: false } : undefined,
                });
                for (const rec of g1.records) {
                    recIdToGroupId[rec.id] = gid;
                    const item = this._buildItem(rec, cfg, gid, hasOverlay);
                    if (item) items.push(item);
                }
            }
        }

        this._appendRelated(items, relatedEvents, recIdToGroupId, cfg);
        this.adapter.setGroups(groups);
        this.adapter.setItems(items);
    }

    _renderGanttGrouped(cfg, records, relatedEvents, groupbyFlds, hasOverlay) {
        const tree   = this._groupRecords(records, groupbyFlds);
        const groups = [];
        const items  = [];
        const recIdToGroupId = {};
        let seq = 1;

        for (const g1 of tree) {
            const level1Id  = seq++;
            const level2Ids = [];

            if (g1.subgroups && g1.subgroups.length) {
                for (const g2 of g1.subgroups) {
                    const level2Id  = seq++;
                    const recordIds = [];
                    level2Ids.push(level2Id);

                    for (const rec of g2.records) {
                        const rowId = seq++;
                        recordIds.push(rowId);
                        recIdToGroupId[rec.id] = rowId;
                        groups.push({
                            id: rowId,
                            content: rec.display_name || String(rec.id),
                            treeLevel: 3,
                            subgroupStack: hasOverlay ? { main: false } : undefined,
                        });
                        const item = this._buildGanttItem(rec, cfg, rowId, hasOverlay);
                        if (item) items.push(item);
                    }

                    groups.push({
                        id: level2Id,
                        content: g2.label,
                        treeLevel: 2,
                        nestedGroups: recordIds.length ? recordIds : undefined,
                    });
                }
            } else {
                const recordIds = [];
                for (const rec of g1.records) {
                    const rowId = seq++;
                    recordIds.push(rowId);
                    recIdToGroupId[rec.id] = rowId;
                    groups.push({
                        id: rowId,
                        content: rec.display_name || String(rec.id),
                        treeLevel: 2,
                        subgroupStack: hasOverlay ? { main: false } : undefined,
                    });
                    const item = this._buildGanttItem(rec, cfg, rowId, hasOverlay);
                    if (item) items.push(item);
                }
                groups.push({
                    id: level1Id,
                    content: g1.label,
                    treeLevel: 1,
                    nestedGroups: recordIds.length ? recordIds : undefined,
                });
                // Skip the level1Id push below for this branch
                continue;
            }

            groups.push({
                id: level1Id,
                content: g1.label,
                treeLevel: 1,
                nestedGroups: level2Ids.length ? level2Ids : undefined,
            });
        }

        groups.sort((a, b) => (a.treeLevel || 1) - (b.treeLevel || 1));

        this._appendRelated(items, relatedEvents, recIdToGroupId, cfg);
        this.adapter.setGroups(groups);
        this.adapter.setItems(items);
    }

    // ── Related events ──────────────────────────────────────────────────────

    _appendRelated(items, relatedEvents, recIdToGroupId, cfg) {
        this._relatedItemMeta = {};

        const toggledOffKeys = new Set(
            (this.state.relatedToggles || [])
                .filter(t => !t.active)
                .map(t => t.key),
        );

        const overlayKeys = this._overlaySourceKeys(cfg);

        for (const ev of relatedEvents) {
            if (!ev.start) continue;
            if (ev.source_key && toggledOffKeys.has(ev.source_key)) continue;

            const groupId  = recIdToGroupId[ev.parent_record_id] ?? ev.group ?? undefined;
            const startDate = this._parseDate(ev.start);
            const endDate   = ev.end ? this._parseDate(ev.end) : undefined;

            if (ev.type === 'background') {
                items.push({
                    id:        ev.id,
                    start:     startDate,
                    end:       endDate,
                    type:      'background',
                    group:     groupId,
                    className: `o_vis_related_bg o_vis_related_bg_${ev.source_key || 'default'}`,
                    style:     ev.color
                        ? `background-color: ${ev.color}; opacity: 0.35;`
                        : undefined,
                });
            } else {
                const isOverlay = ev.source_key && overlayKeys.has(ev.source_key);
                const item = {
                    id:        ev.id,
                    content:   ev.name || '&nbsp;',
                    start:     startDate,
                    end:       endDate,
                    type:      ev.type || 'range',
                    group:     groupId,
                    subgroup:  isOverlay ? 'main' : undefined,
                    className: `o_vis_related_item o_vis_related_item_${ev.source_key || 'default'}`,
                };
                if (ev.color) {
                    item.style = `background-color: ${ev.color}; border-color: ${ev.color};`;
                }
                if (ev.open_form && ev.rel_model && ev.rel_id) {
                    this._relatedItemMeta[ev.id] = { rel_model: ev.rel_model, rel_id: ev.rel_id };
                }
                items.push(item);
            }
        }
    }

    // ── Tooltip ─────────────────────────────────────────────────────────────

    _buildTooltipHtml(rec, cfg) {
        const lo      = cfg.layer_options || {};
        const evCfg   = lo.events_config || [];
        const mainEv  = evCfg.find(e => e.source === 'self_fields') || {};
        const ttFields = mainEv.tooltip_fields || [];

        const fmtDate = (v) => {
            if (!v) return '?';
            return String(v).replace('T', ' ').substring(0, 16);
        };

        let html = '<div class="o_yodoo_tooltip">';
        const displayName = rec.display_name || '';
        if (displayName) html += `<div class="o_yodoo_tt_header">${displayName}</div>`;

        const startStr = fmtDate(rec[cfg.date_start]);
        const endStr   = cfg.date_stop ? fmtDate(rec[cfg.date_stop]) : null;
        html += '<div class="o_yodoo_tt_dates">';
        html += endStr ? `${startStr} → ${endStr}` : startStr;
        html += '</div>';

        for (const tf of ttFields) {
            const fieldName = typeof tf === 'string' ? tf : tf.field;
            const label     = typeof tf === 'string' ? fieldName : (tf.label || fieldName);
            let val = rec[fieldName];
            if (val === null || val === undefined || val === false) continue;
            if (Array.isArray(val)) val = val[1] || val[0];
            html += `<div class="o_yodoo_tt_row">`
                  + `<span class="o_yodoo_tt_label">${label}:</span>`
                  + `<span class="o_yodoo_tt_value">${val}</span>`
                  + `</div>`;
        }

        html += '</div>';
        return html;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    _parseDate(s) {
        if (!s) return null;
        const str = String(s);
        const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(str)
            ? str.replace(' ', 'T') + (str.includes('T') ? '' : 'Z')
            : str;
        return new Date(normalized);
    }

    _onItemClick(props) {
        const resId = props.item;
        if (!resId) return;

        if (typeof resId === 'string') {
            const meta = this._relatedItemMeta[resId];
            if (meta?.rel_model && meta?.rel_id) {
                this.actionService.doAction({
                    type: 'ir.actions.act_window',
                    res_model: meta.rel_model,
                    res_id: meta.rel_id,
                    views: [[false, 'form']],
                    target: 'new',
                });
            }
            return;
        }

        const cfg = this.state.config;
        if (!cfg) return;
        this.actionService.doAction({
            type: 'ir.actions.act_window',
            res_model: cfg.model,
            res_id: resId,
            views: [[false, 'form']],
            target: 'new',
        });
    }

    // ── Toolbar handlers ────────────────────────────────────────────────────

    setScale(scale) {
        this.state.currentScale = scale;
        if (!this.adapter?.isInitialized) return;
        const r     = this.adapter._getRangeMs?.();
        const center = r ? new Date(r.center) : new Date();
        const halfMs = { day: 43200000, week: 302400000, month: 1296000000, year: 15768000000 }[scale] || 302400000;
        this.adapter.setRange(new Date(center - halfMs), new Date(center + halfMs));
    }

    moveToToday() { this.adapter?.moveToCurrentTime(); }
    zoomIn()      { this.adapter?.zoomIn(); }
    zoomOut()     { this.adapter?.zoomOut(); }

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

    toggleRelatedEvent(key) {
        const entry = this.state.relatedToggles.find(t => t.key === key);
        if (!entry) return;
        entry.active = !entry.active;
        this._loadAndRender();
    }

    // ── Filter bar handlers ─────────────────────────────────────────────────

    get searchFields() {
        return this.state.config?.search_fields || [];
    }

    onFilterFieldChange(ev) {
        const key   = ev.target.value;
        const sf    = this.searchFields.find(f => f.key === key);
        const ttype = sf?.ttype || 'char';
        const op    = ['integer', 'float', 'monetary'].includes(ttype) ? '=' : 'contains';
        this.state.draftFilter = { key, ttype, label: sf?.label || key, operator: op, value: '' };
    }

    onFilterOperatorChange(ev) {
        this.state.draftFilter.operator = ev.target.value;
    }

    onFilterValueInput(ev) {
        this.state.draftFilter.value = ev.target.value;
    }

    applyDraft() {
        const d = this.state.draftFilter;
        if (!d.key) return;
        if (!['is_set', 'is_not_set'].includes(d.operator) && d.value === '') return;

        const field = this.searchFields.find(f => f.key === d.key);
        this.state.activeFilters.push({
            id: Date.now(),
            key: d.key,
            label: field?.label || d.key,
            operator: d.operator,
            value: d.value,
        });
        this.state.draftFilter = { key: '', operator: 'contains', value: '' };
        this.state.addFilterMode = false;
        this._loadAndRender();
    }

    removeFilter(id) {
        this.state.activeFilters = this.state.activeFilters.filter(f => f.id !== id);
        this._loadAndRender();
    }

    clearAllFilters() {
        this.state.activeFilters = [];
        this._loadAndRender();
    }
}

registry.category("actions").add("yodoo_timeline_builder", TimelineBuilderAction);
