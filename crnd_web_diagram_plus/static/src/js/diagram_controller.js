/** @odoo-module **/

import {sprintf} from "@web/core/utils/strings";
import {_t} from "@web/core/l10n/translation";
import {Layout} from "@web/search/layout";
import {useModelWithSampleData} from "@web/model/model";
import {standardViewProps} from "@web/views/standard_view_props";
import {useSetupView} from "@web/views/view_hook";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import {useOwnedDialogs, useService} from "@web/core/utils/hooks";
import {Component, useSubEnv, useRef, useState} from "@odoo/owl";
import {uuid} from "@web/views/utils";
import {
    ConfirmationDialog
} from "@web/core/confirmation_dialog/confirmation_dialog";

function useUniqueDialog() {
    const displayDialog = useOwnedDialogs();
    let close = null;
    return (...args) => {
        if (close) {
            close();
        }
        close = displayDialog(...args);
    };
}

/**
 * Diagram Controller
 */
export class DiagramPlusController extends Component {
    setup() {
        useSubEnv({
            custom_events: {
                add_edge: this._onAddEdge.bind(this),
                edit_edge: this._onEditEdge.bind(this),
                edit_node: this._onEditNode.bind(this),
                remove_edge: this._onRemoveEdge.bind(this),
                remove_node: this._onRemoveNode.bind(this),
                change_node_position: this._onChangeNodePosition.bind(this),
            }
        });
        this.dialog = useService("dialog");
        this.displayDialog = useUniqueDialog();
        this.state = useState({
            uuid: uuid()
        })
        this.model = useState(useModelWithSampleData(this.props.Model, this.props.modelParams));
        useSetupView({
            rootRef: useRef("root"),
            getContext: () => this.props.context,
        });
    }

    async handleDataChange() {
        await this.model.reload()
        this.state.uuid = uuid();
    }

    async _addNode(event) {
        let {node_model} = this.model.get();
        return new Promise((resolve) => {
            this.displayDialog(
                FormViewDialog, {
                    resModel: node_model,
                    resId: false,
                    context: this.props.context || {},
                    title: sprintf("%s %s", _t("Create:"), _t('Activity')),
                    onRecordSaved: async () => {
                        await this.handleDataChange()
                    },
                }, {onClose: () => resolve()}
            );
        });
    }

    _autoLayout() {
        let self = this;
        return this.dialog.add(ConfirmationDialog, {
            body: _t("Do you really want to change the positions of the nodes?"),
            confirmLabel: _t("Confirm"),
            confirm: async () => {
                self.model.calc_auto_layout = true;
                await this.handleDataChange()
            },
            cancel: () => {
            },
        });
    }

    _onRemoveNode(record_id) {
        let {node_model} = this.model.get();
        let self = this;
        return this.dialog.add(ConfirmationDialog, {
            body: _t("Are you sure you want to remove this node? This will remove its connected transitions as well."),
            confirmLabel: _t("Delete"),
            confirm: async () => {
                await self.model.orm.call(node_model, "unlink", [record_id])
                await this.handleDataChange()
            },
            cancel: () => {
            },
        });
    }

    _onEditNode(record_id) {
        let {diagram_readonly, node_model} = this.model.get();
        if (diagram_readonly) {
            return
        }
        return new Promise((resolve) => {
            this.displayDialog(
                FormViewDialog, {
                    resModel: node_model,
                    resId: record_id,
                    context: this.context,
                    title: sprintf("%s %s", _t("Open:"), _t('Activity')),
                    onRecordSaved: async () => {
                        await this.handleDataChange()
                    },
                }, {onClose: () => resolve()}
            );
        });
    }

    async _onChangeNodePosition(node) {
        let {node_model} = this.model.get();
        let d_position_field = $(this.model.nodes).attr('d_position_field');
        let node_position = JSON.stringify(node.get_pos());
        let values = {};
        values[d_position_field] = node_position;
        await this.model.orm.call(node_model, "write", [[node.id], values])
        return this.handleDataChange()
    }

    _onAddEdge(data) {
        let {diagram_readonly, connectors, connector_model} = this.model.get();
        if (diagram_readonly) {
            return false
        }
        let ctx = this.props.context || {}
        ctx[`default_${$(connectors).attr('source')}`] = data.source_id;
        ctx[`default_${$(connectors).attr('destination')}`] = data.dest_id;
        return new Promise((resolve) => {
            this.displayDialog(
                FormViewDialog, {
                    resModel: connector_model,
                    resId: false,
                    context: ctx,
                    title: sprintf("%s %s", _t("Create:"), _t('Transition')),
                    onRecordSaved: async () => {
                        await this.handleDataChange()
                    },
                }, {onClose: () => resolve()}
            );
        });
    }

    _onRemoveEdge(record_id) {
        let {diagram_readonly, connector_model} = this.model.get();
        if (diagram_readonly) {
            return
        }
        let self = this;
        return this.dialog.add(ConfirmationDialog, {
            body: _t("Are you sure you want to remove this transition?"),
            confirmLabel: _t("Delete"),
            confirm: async () => {
                await self.model.orm.call(connector_model, "unlink", [record_id])
                await this.handleDataChange()
            },
            cancel: () => {
            },
        });
    }

    _onEditEdge(record_id) {
        let {diagram_readonly, connector_model} = this.model.get();

        if (diagram_readonly) {
            return
        }
        return new Promise((resolve) => {
            this.displayDialog(
                FormViewDialog, {
                    resModel: connector_model,
                    resId: record_id,
                    context: this.context,
                    title: sprintf("%s %s", _t("Open:"), _t('Transition')),
                    onRecordSaved: async () => {
                        await this.handleDataChange()
                    },
                }, {onClose: () => resolve()}
            );
        });
    }
}

DiagramPlusController.template = "DiagramPlusView.Controller";
DiagramPlusController.components = {Layout};
DiagramPlusController.props = {
    ...standardViewProps,
    Model: Function,
    modelParams: Object,
    Renderer: Function,
    buttonTemplate: String,
};
