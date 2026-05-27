/** @odoo-module **/

import { TimeBaseController } from "../core/time_base_controller";

export class GanttController extends TimeBaseController {
    static template = "yodoo_time_view.GanttController";

    _getTimelineOptions() {
        return { stack: false };
    }

    _renderGrouped(modelGroups, archInfo, relatedEvents = []) {
        const { dateStart, dateStop } = archInfo;
        const groups = [];
        const items = [];
        const tsMarkerMap = {};
        const recIdToGroupId = {};
        let groupIdSeq = 1;

        const addRecord = (record, groupId) => {
            const data = record.data || record;
            const start = data[dateStart];
            const end = dateStop ? data[dateStop] : null;
            if (!start) return;
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
                title:   this._buildTooltipHtml(data, archInfo),
                start:   new Date(start),
                end:     end ? new Date(end) : undefined,
                group:   groupId,
                style:   segStyle || undefined,
                color:   segStyle ? undefined : (color || undefined),
            });
        };

        for (const group1 of modelGroups) {
            const label1 = group1.displayName ?? String(group1.value ?? "—");
            const subGroups = group1.list?.groups;

            if (subGroups && subGroups.length > 0) {
                const level1Id = groupIdSeq++;
                const level2Ids = [];

                for (const group2 of subGroups) {
                    const label2 = group2.displayName ?? String(group2.value ?? "—");
                    const level2Id = groupIdSeq++;
                    level2Ids.push(level2Id);

                    let g2records = [];
                    const g2subGroups = group2.list?.groups;
                    if (g2subGroups && g2subGroups.length > 0) {
                        for (const g3 of g2subGroups) {
                            g2records = g2records.concat(g3.list?.records || g3.records || []);
                        }
                    } else {
                        g2records = group2.list?.records || group2.records || [];
                    }

                    const recordIds = [];
                    for (const record of g2records) {
                        const data = record.data || record;
                        const displayName = data.display_name || data.name || String(record.resId || record.id);
                        const rowId = groupIdSeq++;
                        recordIds.push(rowId);
                        groups.push({ id: rowId, content: displayName, treeLevel: 3 });
                        addRecord(record, rowId);
                    }

                    groups.push({
                        id: level2Id,
                        content: label2,
                        treeLevel: 2,
                        nestedGroups: recordIds.length ? recordIds : undefined,
                    });
                }

                groups.push({
                    id: level1Id,
                    content: label1,
                    treeLevel: 1,
                    nestedGroups: level2Ids.length ? level2Ids : undefined,
                });
            } else {
                const level1Id = groupIdSeq++;
                const recordIds = [];

                const g1records = group1.list?.records || group1.records || [];
                for (const record of g1records) {
                    const data = record.data || record;
                    const displayName = data.display_name || data.name || String(record.resId || record.id);
                    const rowId = groupIdSeq++;
                    recordIds.push(rowId);
                    groups.push({ id: rowId, content: displayName, treeLevel: 2 });
                    addRecord(record, rowId);
                }

                groups.push({
                    id: level1Id,
                    content: label1,
                    treeLevel: 1,
                    nestedGroups: recordIds.length ? recordIds : undefined,
                });
            }
        }

        groups.sort((a, b) => (a.treeLevel || 1) - (b.treeLevel || 1));

        this._appendRelatedItems(items, relatedEvents, recIdToGroupId);
        this.adapter.setGroups(groups);
        this.adapter.setItems(items);
        this.adapter.setTsMarkers(tsMarkerMap);
    }

}
