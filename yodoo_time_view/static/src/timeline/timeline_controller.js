/** @odoo-module **/

import { TimeBaseController } from "../core/time_base_controller";

export class TimelineController extends TimeBaseController {
    static template = "yodoo_time_view.TimelineController";

    _getTimelineOptions() {
        return { stack: true };
    }

    _renderGrouped(modelGroups, archInfo, relatedEvents = []) {
        const { dateStart, dateStop } = archInfo;
        const groups = [];
        const items = [];
        const tsMarkerMap = {};
        const recIdToGroupId = {};
        let groupIdSeq = 1;
        const hasOverlay = this._overlaySourceKeys.size > 0;

        const addRecords = (recordList, groupId) => {
            for (const record of (recordList || [])) {
                const data = record.data || record;
                const start = data[dateStart];
                const end = dateStop ? data[dateStop] : null;
                const displayName = data.display_name || data.name || String(record.resId || record.id);
                if (!start) continue;
                const color = this._getItemColor(data, archInfo.color);
                const recId = record.resId || record.id;
                const startMs = new Date(start).getTime();
                const stopMs  = end ? new Date(end).getTime() : null;

                recIdToGroupId[recId] = groupId;
                const markerData = this._getMarkerData(data, startMs, stopMs, color);
                if (markerData.length && this.state.timestampStyle !== 'segments') tsMarkerMap[recId] = markerData;
                const segStyle = this._buildSegmentStyle(markerData, startMs, stopMs, color);

                items.push({
                    id:       recId,
                    content:  displayName,
                    title:    this._buildTooltipHtml(data, archInfo),
                    start:    new Date(start),
                    end:      end ? new Date(end) : undefined,
                    group:    groupId,
                    subgroup: hasOverlay ? 'main' : undefined,
                    style:    segStyle || undefined,
                    color:    segStyle ? undefined : (color || undefined),
                });
            }
        };

        const makeGroup = (id, content, extra = {}) => ({
            id, content,
            subgroupStack: hasOverlay ? { main: false } : undefined,
            ...extra,
        });

        for (const group1 of modelGroups) {
            const label1 = group1.displayName ?? String(group1.value ?? "—");
            const subGroups = group1.list?.groups;

            if (subGroups && subGroups.length > 0) {
                for (const group2 of subGroups) {
                    const label2 = group2.displayName ?? String(group2.value ?? "—");
                    const groupId = groupIdSeq++;
                    groups.push(makeGroup(groupId, `${label1} / ${label2}`));
                    const g2subGroups = group2.list?.groups;
                    let g2records;
                    if (g2subGroups && g2subGroups.length > 0) {
                        g2records = [];
                        for (const g3 of g2subGroups) {
                            g2records = g2records.concat(g3.list?.records || g3.records || []);
                        }
                    } else {
                        g2records = group2.list?.records || group2.records || [];
                    }
                    addRecords(g2records, groupId);
                }
            } else {
                const groupId = groupIdSeq++;
                groups.push(makeGroup(groupId, label1));
                addRecords(group1.list?.records || group1.records || [], groupId);
            }
        }

        this._appendRelatedItems(items, relatedEvents, recIdToGroupId);
        this.adapter.setGroups(groups);
        this.adapter.setItems(items);
        this.adapter.setTsMarkers(tsMarkerMap);
    }

}
