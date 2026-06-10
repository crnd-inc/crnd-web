/** @odoo-module **/

import { PlanController } from '@yodoo_plan_view/js/plan_controller';
import { patch } from '@web/core/utils/patch';

patch(PlanController.prototype, {
    setup() {
        super.setup(...arguments);
        
        // For cinema.session, wrap model to ensure it has loading property
        if (this.props.resModel === 'cinema.session') {
            const originalModel = this.model;
            const self = this;
            
            // Override model property with getter/setter
            Object.defineProperty(this, 'model', {
                get() {
                    // Return a Proxy that ensures loading property exists
                    return new Proxy(originalModel || {}, {
                        get(target, prop) {
                            if (prop === 'loading') {
                                return target.loading !== undefined ? target.loading : false;
                            }
                            return target[prop];
                        },
                        set(target, prop, value) {
                            target[prop] = value;
                            return true;
                        }
                    });
                },
                set(value) {
                    // Allow setting model
                    Object.defineProperty(self, '_model', {
                        value: value,
                        writable: true,
                        configurable: true
                    });
                },
                configurable: true
            });
        }
    },
});
