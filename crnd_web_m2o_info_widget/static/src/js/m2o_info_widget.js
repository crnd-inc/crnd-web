/** @odoo-module **/

import { browser } from "@web/core/browser/browser";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Many2OneField, many2OneField } from "@web/views/fields/many2one/many2one_field";
import { usePopover } from "@web/core/popover/popover_hook";

import { Component, useRef, useState } from "@odoo/owl";

class M2OInfoPopover extends Component {
    setup() {
        this.notification = useService("notification");
    }

    async copy(value) {
        if (!browser.navigator.clipboard) {
            this.notification.add(this.env._t("This browser doesn't allow to copy to clipboard"), {
                type: "warning",
            });
            return;
        }
        try {
            await browser.navigator.clipboard.writeText(String(value ?? ""));
            this.notification.add(this.env._t("Copied"), { type: "success" });
        } catch (error) {
            browser.console.warn(error);
        }
    }
}

M2OInfoPopover.template = "crnd_web_m2o_info_widget.popover_template";
M2OInfoPopover.props = {
    close: { type: Function, optional: true },
    info: { type: Array, optional: true },
};

export class M2OInfoField extends Many2OneField {
    setup() {
        super.setup();
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.infoIconRef = useRef("infoIcon");
        this.popoverState = useState({
            isOpen: false,
            loading: false,
            info: [],
        });
        this.popover = usePopover(M2OInfoPopover, {
            popoverClass: "m2o-info-popover",
            position: "bottom",
            onClose: () => {
                this.popoverState.isOpen = false;
            },
        });
    }

    _normalizeInfoData(info) {
        const list = Array.isArray(info) ? info : [];
        return list
            .filter((item) => item && typeof item === "object")
            .map((item, index) => ({
                name: item.name ?? String(index),
                string: item.string ?? "",
                value: item.value ?? "",
            }));
    }

    get hasInfoButton() {
        return Boolean(this.value && (this.infoFields || this.infoMethod));
    }

    get infoFields() {
        const fields = this.props.info_fields;
        return Array.isArray(fields) ? fields : null;
    }

    get infoMethod() {
        const method = this.props.info_method;
        return typeof method === "string" ? method : null;
    }

    async _getInfoDataFields() {
        const fields = this.infoFields || [];
        const [recordData] = await this.orm.read(this.relation, [this.resId], fields, {
            context: this.context,
        });
        const fieldsGet = await this.orm.call(this.relation, "fields_get", [fields, ["string"]], {
            context: this.context,
        });
        return fields.map((name) => ({
            name,
            string: fieldsGet?.[name]?.string || "",
            value: recordData?.[name] ?? "",
        }));
    }

    async _getInfoDataMethod() {
        try {
            return await this.orm.call(this.relation, this.infoMethod, [[this.resId]], {
                context: this.context,
            });
        } catch (error) {
            browser.console.warn(error);
            this.notification.add(this.env._t("Cannot load info: invalid info_method"), {
                type: "warning",
            });
            return [];
        }
    }

    async _getInfoData() {
        if (this.infoFields) {
            return this._normalizeInfoData(await this._getInfoDataFields());
        } else if (this.infoMethod) {
            return this._normalizeInfoData(await this._getInfoDataMethod());
        }
        browser.console.warn("Cannot many2one field info. Field is not configured.");
        return [];
    }

    async onClickInfo(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        if (this.popover.isOpen) {
            this.popover.close();
            this.popoverState.isOpen = false;
            return;
        }

        if (!this.resId) {
            return;
        }

        this.popoverState.loading = true;
        try {
            this.popoverState.info = await this._getInfoData();
        } finally {
            this.popoverState.loading = false;
        }

        this.popover.open(this.infoIconRef.el, {
            info: this.popoverState.info,
        });
        this.popoverState.isOpen = true;
    }
}

M2OInfoField.template = "crnd_web_m2o_info_widget.M2OInfoField";
M2OInfoField.components = Many2OneField.components;
M2OInfoField.supportedTypes = ["many2one"];
M2OInfoField.props = {
    ...Many2OneField.props,
    info_fields: { type: Array, optional: true },
    info_method: { type: String, optional: true },
};

M2OInfoField.extractProps = ({ attrs, field }) => {
    const res = Many2OneField.extractProps({ attrs, field });
    return {
        ...res,
        info_fields: attrs.options?.info_fields,
        info_method: attrs.options?.info_method,
    };
};

export const m2oInfoField = {
    ...many2OneField,
    component: M2OInfoField,
    supportedTypes: ["many2one"],
    extractProps({ attrs, context, decorations, options, string }, dynamicInfo) {
        return {
            ...many2OneField.extractProps({ attrs, context, decorations, options, string }, dynamicInfo),
            info_fields: options?.info_fields,
            info_method: options?.info_method,
        };
    },
};

registry.category("fields").add("m2o_info", m2oInfoField);
registry.category("fields").add("list.m2o_info", m2oInfoField);
registry.category("fields").add("kanban.m2o_info", m2oInfoField);
