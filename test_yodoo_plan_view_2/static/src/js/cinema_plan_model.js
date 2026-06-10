/** @odoo-module **/

import { PlanModel } from '@yodoo_plan_view/js/plan_model';
import { patch } from '@web/core/utils/patch';

patch(PlanModel.prototype, {
    async load(params) {
        if (this.resModel === 'cinema.session') {
            return this._loadCinemaSession(params);
        }
        return super.load(params);
    },

    async _loadCinemaSession(params) {
        if (!this.resId) {
            this.root = {
                image: null,
                imageWidth: 0,
                imageHeight: 0,
                polygons: [],
            };
            return;
        }

        const sessionData = await this.orm.read(
            'cinema.session',
            [this.resId],
            ['hall_id']
        );

        if (!sessionData || !sessionData[0] || !sessionData[0].hall_id) {
            this.root = {
                image: null,
                imageWidth: 0,
                imageHeight: 0,
                polygons: [],
            };
            return;
        }

        const hallId = sessionData[0].hall_id[0];

        const hallData = await this.orm.read(
            'cinema.hall',
            [hallId],
            [
                'plan_image',
                'plan_scale_coefficient',
            ]
        );

        const hall = hallData[0];

        const polygons = await this.orm.searchRead(
            'plan.polygon',
            [
                ['plan_id', '=', `cinema.hall,${hallId}`],
            ],
            [
                'id',
                'name',
                'points',
                'fill_color',
                'stroke_color',
                'opacity',
                'stroke_width',
                'related_model',
                'related_id',
                'related_name',
                'label_x',
                'label_y',
                'label_text',
                'centroid_x',
                'centroid_y',
            ]
        );

        this.root = {
            image: hall.plan_image || null,
            imageWidth: 0,
            imageHeight: 0,
            scaleCoefficient: hall.plan_scale_coefficient || 1.0,
            polygons: polygons.map(p => this._mapPolygon(p)),
        };
    },

    _mapPolygon(polygon) {
        let points = [];
        if (polygon.points) {
            try {
                points = JSON.parse(polygon.points);
            } catch (e) {
                console.error('[CinemaPlanModel] Error parsing points:', e);
                points = [];
            }
        }

        return {
            id: polygon.id,
            name: polygon.name || '',
            points: points,
            fillColor: polygon.fill_color || '#3498db',
            strokeColor: polygon.stroke_color || '#2980b9',
            opacity: polygon.opacity || 0.5,
            strokeWidth: polygon.stroke_width || 2,
            relatedModel: polygon.related_model || null,
            relatedId: polygon.related_id || null,
            relatedName: polygon.related_name || '',
            labelX: polygon.label_x || null,
            labelY: polygon.label_y || null,
            labelText: polygon.label_text || '',
            centroidX: polygon.centroid_x || null,
            centroidY: polygon.centroid_y || null,
        };
    },
});
