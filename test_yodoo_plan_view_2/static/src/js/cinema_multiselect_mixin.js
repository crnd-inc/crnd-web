/** @odoo-module **/

export const CinemaMultiselectMixin = {
    setup() {
        this.multiselectState = {
            enabled: false,
            selectedSeats: new Set(),
            bookedSeats: new Set(),
        };
    },

    enableMultiselect() {
        this.multiselectState.enabled = true;
        this.state.editModeEnabled = false;
    },

    onPolygonClickMultiselect(polygon, ev) {
        if (!this.multiselectState.enabled) {
            return;
        }

        ev.stopPropagation();

        const seatId = polygon.relatedId;
        if (!seatId) {
            return;
        }

        if (this.multiselectState.bookedSeats.has(seatId)) {
            return;
        }

        if (this.multiselectState.selectedSeats.has(seatId)) {
            this.multiselectState.selectedSeats.delete(seatId);
        } else {
            this.multiselectState.selectedSeats.add(seatId);
        }
    },

    getPolygonStyleMultiselect(polygon) {
        const seatId = polygon.relatedId;
        
        if (this.multiselectState.bookedSeats.has(seatId)) {
            return {
                fillColor: '#dc3545',
                strokeColor: '#a71d2a',
                opacity: 0.7,
                strokeWidth: 2,
            };
        }

        if (this.multiselectState.selectedSeats.has(seatId)) {
            return {
                fillColor: '#28a745',
                strokeColor: '#1e7e34',
                opacity: 0.8,
                strokeWidth: 3,
            };
        }

        return {
            fillColor: '#6c757d',
            strokeColor: '#495057',
            opacity: 0.5,
            strokeWidth: 2,
        };
    },

    async loadBookedSeats(sessionId) {
        if (!sessionId) {
            return;
        }

        try {
            const bookings = await this.orm.searchRead(
                'cinema.booking',
                [
                    ['session_id', '=', sessionId],
                    ['state', '=', 'confirmed']
                ],
                ['seat_id']
            );

            this.multiselectState.bookedSeats.clear();
            bookings.forEach(booking => {
                if (booking.seat_id && booking.seat_id[0]) {
                    this.multiselectState.bookedSeats.add(booking.seat_id[0]);
                }
            });
        } catch (error) {
            console.error('[CinemaMultiselect] Error loading booked seats:', error);
        }
    },

    getSelectedSeatsInfo() {
        const selectedIds = Array.from(this.multiselectState.selectedSeats);
        const seats = [];

        this.state.data.polygons.forEach(polygon => {
            if (selectedIds.includes(polygon.relatedId)) {
                seats.push({
                    id: polygon.relatedId,
                    name: polygon.relatedName || polygon.labelText || `Seat ${polygon.relatedId}`,
                });
            }
        });

        return seats;
    },

    clearSelection() {
        this.multiselectState.selectedSeats.clear();
    },
};
