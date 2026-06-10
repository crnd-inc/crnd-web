/** @odoo-module **/

import { PlanRenderer } from '@yodoo_plan_view/js/plan_renderer';
import { CinemaMultiselectMixin } from './cinema_multiselect_mixin';
import { patch } from '@web/core/utils/patch';

patch(PlanRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        
        const resModel = this.props.resModel || (this.props.model && this.props.model.resModel);
        
        if (resModel === 'cinema.session') {
            CinemaMultiselectMixin.setup.call(this);
            this.isCinemaSession = true;
            
            this.onMounted(async () => {
                if (this.isCinemaSession && this.props.resId) {
                    this.enableMultiselect();
                    await this.loadBookedSeats(this.props.resId);
                    this.render();
                }
            });
        }
    },

    async loadData() {
        if (this.isCinemaSession) {
            this.state.loading = true;
            try {
                await super.loadData();
            } finally {
                this.state.loading = false;
            }
        } else {
            return super.loadData();
        }
    },

    enableMultiselect() {
        if (this.isCinemaSession) {
            CinemaMultiselectMixin.enableMultiselect.call(this);
        }
    },

    async loadBookedSeats(sessionId) {
        if (this.isCinemaSession) {
            await CinemaMultiselectMixin.loadBookedSeats.call(this, sessionId);
        }
    },

    onPolygonClick(polygon, ev) {
        if (this.isCinemaSession && this.multiselectState?.enabled) {
            CinemaMultiselectMixin.onPolygonClickMultiselect.call(this, polygon, ev);
            return;
        }
        return super.onPolygonClick(polygon, ev);
    },

    getPolygonStyle(polygon) {
        if (this.isCinemaSession && this.multiselectState?.enabled) {
            const multiselectStyle = CinemaMultiselectMixin.getPolygonStyleMultiselect.call(this, polygon);
            if (multiselectStyle) {
                return multiselectStyle;
            }
        }
        return super.getPolygonStyle(polygon);
    },

    getSelectedSeatsInfo() {
        if (this.isCinemaSession) {
            return CinemaMultiselectMixin.getSelectedSeatsInfo.call(this);
        }
        return [];
    },

    clearSelection() {
        if (this.isCinemaSession) {
            CinemaMultiselectMixin.clearSelection.call(this);
        }
    },

    async createBookings() {
        if (!this.isCinemaSession || !this.props.resId) {
            return;
        }

        const selectedSeats = this.getSelectedSeatsInfo();
        if (selectedSeats.length === 0) {
            this.env.services.notification.add('Оберіть місця для бронювання', { type: 'warning' });
            return;
        }

        try {
            const bookings = selectedSeats.map(seat => ({
                session_id: this.props.resId,
                seat_id: seat.id,
                state: 'confirmed',
            }));

            await this.orm.create('cinema.booking', bookings);
            
            this.env.services.notification.add(
                `Заброньовано ${bookings.length} місць`,
                { type: 'success' }
            );

            this.clearSelection();
            await this.loadBookedSeats(this.props.resId);
            await this.loadData();
        } catch (error) {
            console.error('[CinemaPlanRenderer] Error creating bookings:', error);
            this.env.services.notification.add('Помилка при бронюванні', { type: 'danger' });
        }
    },
});

Object.assign(PlanRenderer.prototype, {
    ...CinemaMultiselectMixin,
});
