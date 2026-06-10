/** @odoo-module **/

import { Model } from "@web/model/model";
import { KeepLast } from "@web/core/utils/concurrency";

/**
 * Plan Model
 * Handles data loading and saving for plan view
 */
export class PlanModel extends Model {
    setup(params, services) {
        this.keepLast = new KeepLast();
        this.root = null;
        this.resModel = params.resModel;
        this.resId = params.resId;
        this.context = params.context || {};
    }

    /**
     * Load plan data from server
     */
    async load(params = {}) {
        const resId = params.resId || this.resId;
        const context = params.context || this.context || {};
        
        // Check if we're in booking mode (only set once, don't reset)
        if (context.booking_mode && !this.bookingMode) {
            this.bookingMode = true;
            this.bookingConfig = {
                model: context.booking_model,
                relatedField: context.booking_related_field,
                relatedId: context.booking_related_id,
                objectField: context.booking_object_field,
                stateField: context.booking_state_field || 'state',
                stateValue: context.booking_state_value || 'confirmed',
                customerField: context.booking_customer_field,
                sessionName: context.session_name || '',
            };
        }
        
        try {
            const result = await this.keepLast.add(
                this.orm.call(
                    this.resModel,
                    'read',
                    [[resId], [
                        'plan_image',
                        'plan_image_type',
                        'plan_scale_coefficient',
                        'plan_show_grid',
                        'plan_grid_size',
                        'plan_snap_to_grid',
                        'plan_origin_x',
                        'plan_origin_y',
                        'plan_show_origin',
                        'plan_polygon_ids',
                    ]]
                )
            );

            if (result && result.length > 0) {
                const data = result[0];
                this.root = {
                    id: data.id,
                    image: data.plan_image,
                    imageType: data.plan_image_type,
                    scaleCoefficient: data.plan_scale_coefficient || 1.0,
                    showGrid: data.plan_show_grid,
                    gridSize: data.plan_grid_size || 20,
                    snapToGrid: data.plan_snap_to_grid,
                    originX: data.plan_origin_x || 0,
                    originY: data.plan_origin_y || 0,
                    showOrigin: data.plan_show_origin,
                    polygonIds: data.plan_polygon_ids || [],
                    polygons: [],
                    relatedObjects: [],
                    bookedObjects: [],
                };

                // Load polygons if any
                if (this.root.polygonIds.length > 0) {
                    await this.loadPolygons();
                }
                
                // Load related objects (e.g., rooms for floor)
                this.root.relatedObjects = await this.loadRelatedObjects(this.resModel, resId);
                
                // Load booked objects if in booking mode
                if (this.bookingMode && this.bookingConfig) {
                    this.root.bookedObjects = await this.loadBookedObjects();
                }
            }
        } catch (error) {
            console.error('[PlanModel] Error loading data:', error);
            this.root = {
                id: resId,
                image: null,
                polygons: [],
            };
        }

        return this.root;
    }

    /**
     * Load polygons for this plan
     */
    async loadPolygons() {
        try {
            const polygons = await this.orm.call(
                'plan.polygon',
                'read',
                [this.root.polygonIds, [
                    'name',
                    'points',
                    'centroid_x',
                    'centroid_y',
                    'area_pixels',
                    'area_meters',
                    'related_model',
                    'related_id',
                    'related_name',
                    'fill_color',
                    'stroke_color',
                    'stroke_width',
                    'opacity',
                    'label_x',
                    'label_y',
                    'label_text',
                ]]
            );

            this.root.polygons = polygons.map(p => ({
                id: p.id,
                name: p.name,
                points: JSON.parse(p.points || '[]'),
                centroidX: p.centroid_x,
                centroidY: p.centroid_y,
                areaPixels: p.area_pixels,
                areaMeters: p.area_meters,
                relatedModel: p.related_model,
                relatedId: p.related_id,
                relatedName: p.related_name,
                fillColor: p.fill_color,
                strokeColor: p.stroke_color,
                strokeWidth: p.stroke_width,
                opacity: p.opacity,
                labelX: p.label_x,
                labelY: p.label_y,
                labelText: p.label_text,
            }));
        } catch (error) {
            console.error('[PlanModel] Error loading polygons:', error);
            this.root.polygons = [];
        }
    }

    /**
     * Save polygon changes
     */
    async savePolygons(polygons) {
        const promises = [];

        for (const polygon of polygons) {
            if (polygon.id) {
                // Update existing
                promises.push(
                    this.orm.write('plan.polygon', [polygon.id], {
                        points: JSON.stringify(polygon.points),
                        fill_color: polygon.fill_color,
                        stroke_color: polygon.stroke_color,
                        stroke_width: polygon.stroke_width,
                        opacity: polygon.opacity,
                    })
                );
            } else {
                // Create new
                promises.push(
                    this.orm.create('plan.polygon', [{
                        plan_id: this.resId,
                        points: JSON.stringify(polygon.points),
                        fill_color: polygon.fill_color,
                        stroke_color: polygon.stroke_color,
                        stroke_width: polygon.stroke_width,
                        opacity: polygon.opacity,
                        related_model: polygon.related_model,
                        related_id: polygon.related_id,
                    }])
                );
            }
        }

        await Promise.all(promises);
        return this.load();
        return this._load();
    }

    /**
     * Delete polygon
     */
    async deletePolygon(polygonId) {
        await this.orm.unlink('plan.polygon', [polygonId]);
        return this._load();
    }

    /**
     * Update plan settings
     */
    async updatePlanSettings(values) {
        await this.orm.write(this.resModel, [this.resId], values);
        return this._load();
    }

    /**
     * Save scale coefficient
     */
    async saveScaleCoefficient(coefficient) {
        await this.orm.write(this.resModel, [this.resId], {
            plan_scale_coefficient: coefficient,
        });
        this.data.scaleCoefficient = coefficient;
        return this.data;
    }

    /**
     * Load related objects via server-side method get_plan_related_objects().
     * Each model implementing plan.view.mixin overrides this method.
     */
    async loadRelatedObjects(resModel, resId) {
        try {
            return await this.orm.call(resModel, 'get_plan_related_objects', [[resId]]);
        } catch (error) {
            console.error('[PlanModel] Error loading related objects:', error);
            return [];
        }
    }

    /**
     * Load booked objects in booking mode (universal)
     */
    async loadBookedObjects() {
        if (!this.bookingConfig) {
            return [];
        }

        try {
            const config = this.bookingConfig;
            const domain = [
                [config.relatedField, '=', config.relatedId],
                [config.stateField, '=', config.stateValue],
            ];

            const bookings = await this.orm.searchRead(
                config.model,
                domain,
                [config.objectField]
            );

            // Return array of booked object IDs
            return bookings.map(b => {
                const fieldValue = b[config.objectField];
                return Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
            }).filter(id => id);
        } catch (error) {
            console.error('[PlanModel] Error loading booked objects:', error);
            return [];
        }
    }
}
