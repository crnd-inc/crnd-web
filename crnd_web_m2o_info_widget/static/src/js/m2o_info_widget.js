import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import {
    buildM2OFieldDescription,
    extractM2OFieldProps,
    many2OneFieldProps,
    Many2OneField,
} from "@web/views/fields/many2one/many2one_field";
import { usePopover } from "@web/core/popover/popover_hook";

import { Component, proxy, signal, t, useProps } from "@odoo/owl";

class M2OInfoPopover extends Component {
    static template = "crnd_web_m2o_info_widget.popover_template";
    props = useProps({
        close: t.function().optional(),
        info: t.array().optional(),
    });

    setup() {
        this.notification = useService("notification");
    }

    async copy(value) {
        if (!browser.navigator.clipboard) {
            this.notification.add(_t("This browser doesn't allow to copy to clipboard"), {
                type: "warning",
            });
            return;
        }
        try {
            await browser.navigator.clipboard.writeText(String(value ?? ""));
            this.notification.add(_t("Copied"), { type: "success" });
        } catch (error) {
            browser.console.warn(error);
            this.notification.add(_t("Cannot copy to clipboard"), { type: "warning" });
        }
    }
}

export class M2OInfoField extends Many2OneField {
    static template = "crnd_web_m2o_info_widget.M2OInfoField";
    static components = Many2OneField.components;
    props = useProps({
        ...many2OneFieldProps,
        info_fields: t.array().optional(),
        info_method: t.string().optional(),
    });
    infoIcon = signal.ref();

    setup() {
        super.setup();
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.popoverState = proxy({
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

    get value() {
        return this.m2oProps.value;
    }

    get resId() {
        return this.value?.id;
    }

    get relation() {
        return this.m2oProps.relation;
    }

    get context() {
        return this.m2oProps.context;
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

        const fieldsGet = await this.orm.call(this.relation, "fields_get", [fields, ["string"]], {
            context: this.context,
        });

        const validFields = fields.filter((name) => Boolean(fieldsGet?.[name]));
        const invalidFields = fields.filter((name) => !fieldsGet?.[name]);

        if (invalidFields.length) {
            this.notification.add(_t("Some fields are not available and were skipped"), {
                type: "warning",
            });
            browser.console.warn("M2O info widget: invalid fields skipped:", invalidFields);
        }

        if (!validFields.length) {
            return [];
        }

        const [recordData] = await this.orm.read(this.relation, [this.resId], validFields, {
            context: this.context,
        });

        return validFields.map((name) => ({
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
            this.notification.add(_t("Cannot load info: invalid info_method"), {
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

        this.popover.open(this.infoIcon(), {
            info: this.popoverState.info,
        });
        this.popoverState.isOpen = true;
    }
}

export const m2oInfoField = {
    ...buildM2OFieldDescription(M2OInfoField),
    extractProps(staticInfo, dynamicInfo) {
        const props = extractM2OFieldProps(staticInfo, dynamicInfo);
        const { options } = staticInfo;
        return {
            ...props,
            info_fields: options?.info_fields,
            info_method: options?.info_method,
        };
    },
};

registry.category("fields").add("m2o_info", m2oInfoField);
registry.category("fields").add("list.m2o_info", m2oInfoField);
registry.category("fields").add("kanban.m2o_info", m2oInfoField);
