/* global ClipboardJS */
odoo.define('crnd_web_m2o_info_widget.m2o_info_widget', function (require) {
    "use strict";

    var fieldRegistry = require('web.field_registry');
    var relationFields = require('web.relational_fields');
    var fieldMany2One = relationFields.FieldMany2One;

    var M2OInfo = fieldMany2One.extend({

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
                this.info_data = null;
                this.popover_initialized = false;

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

        /**
         * Get Data for this widget.
         * @returns {Deferred}
         */
        _getInfoData: function () {
            var self = this;
            var def = $.Deferred();
            if (self.info_data) {
                def.resolve(self.info_data);
            } else {
                // Initialize info data
                self.info_data = {};
                _.each(
                    self.nodeOptions.info_fields,
                    function (field_name) {
                        self.info_data[field_name] = {};
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
                                self.info_data[field_name].value = val;
                            } else {
                                self.info_data[field_name].value = '';
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
                                self.info_data[field_name].name = val;
                            } else {
                                self.info_data[field_name].name = '';
                            }
                        });
                });
                $.when(def_field_values, def_field_names).then(function () {
                    def.resolve(self.info_data);
                });
            }
            return def;
        },

        /**
         * Render single row of popover content.
         * @param {Object} data: info_data object
         * @param {String} field_name: name of field to render
         * @returns JQuery element of created row
         */
        _renderInfoPopUpRow: function (data, field_name) {
            var $row = $('<tr>');
            $('<th>').text(
                data[field_name].name + ":").appendTo($row);
            $('<td>').text(
                data[field_name].value).appendTo($row);
            var $copy_cell = $('<td>').appendTo($row);
            var $copy = $('<span>')
                .addClass('m2o-info-copy btn btn-sm btn-outline-primary')
                .data('field-name', field_name)
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
                _.each(
                    self.nodeOptions.info_fields,
                    function (field_name) {
                        if (data[field_name].value) {
                            var $row = self._renderInfoPopUpRow(
                                data, field_name);
                            $row.appendTo($info_table);

                            // Update data with generated elements
                            data[field_name].clipboard = new ClipboardJS(
                                $row.find('.m2o-info-copy')[0],
                                {
                                    text: function (target) {
                                        var fname = $(target).data(
                                            'field-name');
                                        return self.info_data[fname].value;
                                    },
                                }
                            );
                            data[field_name].$el = $row;
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
                    });
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
    });

    fieldRegistry.add('m2o_info', M2OInfo);
});
