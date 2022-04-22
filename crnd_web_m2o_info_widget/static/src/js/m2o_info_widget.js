/** @odoo-module **/

import fieldRegistry from 'web.field_registry';
import { FieldMany2One } from 'web.relational_fields';
import { qweb } from 'web.core';

var M2OInfo = FieldMany2One.extend({

    init: function () {
        var self = this;
        self._super.apply(self, arguments);

        self.popover_initialized = false;

        // Keep popover info, to be able to destroy when widget
        // desttroyed
        self.popover_data = null;
        self.popover_field_data = null;
    },

    _renderReadonly: function () {
        this._super.apply(this, arguments);

        if (this.m2o_value) {
            // Format is info_data = {
            //     field_name: {
            //         name: name of field
            //         value: value of field
            //         $el: jquery element of the field
            //         clipboard: ClipboardJS instance
            //     },
            // }

            var $link = this.$el;
            this.$el = $('<div>').addClass('m2o_info');
            this.$el.append($link);

            this.$info_icon = $('<span>')
                .addClass(
                    'm2o-info-icon btn btn-sm btn-outline-primary ml4')
                .appendTo(this.$el)
                .append($('<i>').addClass('fa fa-info'));

            this.$info_icon.on('click', this._onClickInfo.bind(this));
        }
    },

    /* Get info data based on fields specified in nodeOptions.info_fields
    *
    * @returns {Deferred} array of objects. Each object represents info
    * about single field.
    *
    * Example of return result:
    * [
    *     {
    *          name: name of the field,
    *          string: label of the field,
    *          value: value of the field,
    *     },
    * ]
    */
    _getInfoDataFields: function () {
        var self = this;
        var def = $.Deferred();

        // Initialize info data
        var info_data = {};
        _.each(
            self.nodeOptions.info_fields,
            function (field_name) {
                info_data[field_name] = {};
            });

        // Fill values for each field
        var def_field_values = self._rpc({
            model: self.value.model,
            method: 'read',
            args: [[self.value.res_id], self.nodeOptions.info_fields],
        }).then(function (result) {
            _.each(
                self.nodeOptions.info_fields,
                function (field_name) {
                    if (result) {
                        var val = result[0][field_name];
                        info_data[field_name].value = val;
                    } else {
                        info_data[field_name].value = '';
                    }
                });
        });

        // Get field names
        var def_field_names = self._rpc({
            model: self.value.model,
            method: 'fields_get',
            args: [self.nodeOptions.info_fields, ['string']],
        }).then(function (result) {
            _.each(
                self.nodeOptions.info_fields,
                function (field_name) {
                    if (result) {
                        var val = result[field_name].string;
                        info_data[field_name].name = val;
                    } else {
                        info_data[field_name].name = '';
                    }
                });
        });
        $.when(def_field_values, def_field_names).then(function () {
            var res = [];
            _.each(
                self.nodeOptions.info_fields,
                function (field_name) {
                    res.push({
                        name: field_name,
                        string: info_data[field_name].name,
                        value: info_data[field_name].value,
                    });
                });
            def.resolve(res);
        });
        return def;
    },

    /* Get info data based on method called on field's relation model.
    *
    * @returns {Deferred} array of objects.
    * Each object represents info about single field.
    *
    * Example of return result:
    * [
    *     {
    *          name: name of the field,
    *          string: label of the field,
    *          value: value of the field,
    *     },
    * ]
    */
    _getInfoDataMethod: function () {
        var self = this;
        return self._rpc({
            model: self.value.model,
            method: self.nodeOptions.info_method,
            args: [[self.value.res_id]],
        });
    },

    /* Get info data based on fields specified in nodeOptions.info_fields
    *
    * @returns {Deferred} array of objects.
    * Each object represents info about single field.
    *
    * Example of return result:
    * [
    *     {
    *          name: name of the field,
    *          string: label of the field,
    *          value: value of the field,
    *     },
    * ]
    */
    _getInfoData: function () {
        var self = this;

        if (self.nodeOptions.info_fields) {
            return self._getInfoDataFields();
        } else if (self.nodeOptions.info_method) {
            return self._getInfoDataMethod();
        }
        console.log(
            "Cannot many2one field info. Field is not configured.");
    },

    /**
     * Render single row of popover content.
     * @param {Object} field_info: info about single field
     * @param {String} field_name: name of field to render
     * @returns JQuery element of created row
     */
    _renderInfoPopUpRow: function (field_info) {
        var $row = $('<tr>');
        $('<th>').text(field_info.string + ":")
            .addClass('info_label')
            .appendTo($row);
        $('<td>').text(
            field_info.value).appendTo($row);
        var $copy_cell = $('<td>').appendTo($row);
        var $copy = $('<span>')
            .addClass('m2o-info-copy btn btn-sm btn-outline-primary')
            .data('field-name', field_info.name)
            .appendTo($copy_cell);
        $('<i/>').addClass('fa fa-copy').appendTo($copy);
        return $row;
    },

    /**
     * Render popover content for this widget.
     * @param {Object} data: info_data object
     * @returns JQuery element of created popover
     */
    _renderInfoPopUp: function (data) {
        var self = this;
        var $info_popup = $('<div>').addClass('m2o-info-popover');
        var $info_table = $('<table>')
            .addClass('table table-sm table-borderless')
            .appendTo($info_popup);

        if (data) {
            _.each(data, function (field_info) {
                if (field_info.value) {
                    var $row = self._renderInfoPopUpRow(field_info);
                    $row.appendTo($info_table);

                    // Update data with generated elements
                    field_info.clipboard = new ClipboardJS(
                        $row.find('.m2o-info-copy')[0],
                        {
                            text: function () {
                                return field_info.value;
                            },
                        }
                    );
                    field_info.$el = $row;
                }
            });
        }
        return $info_popup;
    },

    _onClickInfo: function () {
        var self = this;
        var def = $.Deferred();
        if (self.popover_initialized) {
            def.resolve();
        } else {
            self._getInfoData().then(function (data) {
                var $info_popup = self._renderInfoPopUp(data);
                self.$info_icon.popover({
                    content: $info_popup,
                    html: true,
                    trigger: 'manual',
                    animation: true,
                    template: qweb.render(
                        'crnd_web_m2o_info_widget.popover_template', {}),
                });

                self.popover_initialized = true;

                // Keep popover info, to be able to destroy when widget
                // desttroyed
                self.popover_data = self.$info_icon.data('bs.popover');
                self.popover_field_data = data;

                $info_popup.on('mouseleave', function () {
                    self.$info_icon.popover('hide');
                });

                def.resolve();
            });
        }

        def.then(function () {
            self.$info_icon.popover('toggle');
        });
    },

    _destroyPopover: function () {
        if (this.popover_initialized) {
            if (!this.$info_icon.data('bs.popover')) {
                this.$info_icon.data('bs.popover', this.popover_data);
            }
            if (this.popover_field_data) {
                _.each(this.popover_field_data, function (field_info) {
                    if (field_info.clipboard) {
                        field_info.clipboard.destroy();
                    }
                });
            }
            this.$info_icon.popover('dispose');
            this.popover_initialized = false;
            this.popover_data = null;
            this.popover_field_data = null;
        }
    },

    reset: function () {
        this._destroyPopover();
        this._super.apply(this, arguments);
    },

    destroy: function () {
        this._destroyPopover();
        this._super.apply(this, arguments);
    },
});

fieldRegistry.add('m2o_info', M2OInfo);
