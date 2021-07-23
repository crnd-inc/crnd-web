/* global ClipboardJS */
odoo.define('crnd_m2o_info_widget.widget', function (require) {
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
                this.$info_popup = null;

                var $link = this.$el;
                this.$el = $('<div>').addClass('m2o_info');
                this.$el.append($link);

                this.$info_icon = $('<span>')
                    .addClass('info_icon btn btn-sm btn-outline-primary ml4')
                    .appendTo(this.$el)
                    .append($('<i>').addClass('fa fa-info'));

                this.$info_icon.on('click', this._onClickInfo.bind(this));
                this.$info_icon.on('mouseleave',
                    this._onMouseLeaveInfo.bind(this));
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

        _renderPopUpRow: function (data, field_name) {
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
         * Create popup window for this widget.
         * @param {Object} data: info_data object
         * @returns JQuery element of created popup
         */
        _createInfoPopup: function (data) {
            var self = this;

            self.$info_popup = $('<div>').addClass('info_popup')
                .appendTo(self.$info_icon);
            var $info_table = $('<table>')
                .addClass('table table-sm table-borderless')
                .appendTo(self.$info_popup);

            if (data) {
                _.each(
                    self.nodeOptions.info_fields,
                    function (field_name) {
                        if (data[field_name].value) {
                            var $row = self._renderPopUpRow(data, field_name);
                            $row.appendTo($info_table);

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
            return self.$info_popup;
        },

        /**
         * Get or create (if needed) popup window for this widget.
         * @returns {Deferred}
         */
        _getOrCreateInfoPopup: function () {
            var self = this;

            var def = $.Deferred();

            if (self.$info_popup) {
                def.resolve(self.$info_popup);
            } else {
                self._getInfoData().then(function (data) {
                    def.resolve(self._createInfoPopup(data));
                });
            }
            return def;
        },

        /**
         * Show info popup.
         * @param {Number} left_offset: Have to be event.clientX of click event
         */
        _showInfoPopup: function (left_offset) {
            var self = this;
            self._getOrCreateInfoPopup().then(function ($info_popup) {
                if (!$info_popup.hasClass('info_popup_visible')) {
                    var popup_width = $info_popup.outerWidth();
                    var window_width = $(window).width();
                    var right_offset = window_width - left_offset;
                    var css_value = {};
                    if (left_offset >= popup_width) {
                        css_value = {
                            right: '-1px',
                            left: 'none',
                        };
                    } else if (left_offset <= popup_width &&
                            right_offset >= popup_width) {
                        css_value = {
                            right: 'none',
                            left: '-1px',
                        };
                    } else {
                        css_value = {
                            right: 'none',
                            left: right_offset - popup_width - 10 + 'px',
                        };
                    }
                    self.$info_popup.css(css_value);
                    self.$info_popup.addClass('info_popup_visible');
                }
            });
        },

        _hideInfoPopup: function () {
            var self = this;
            self._getOrCreateInfoPopup().then(function ($info_popup) {
                $info_popup.removeClass('info_popup_visible');
            });
        },

        _onClickInfo: function (event) {
            var self = this;
            self._showInfoPopup(event.clientX);
        },

        _onMouseLeaveInfo: function () {
            var self = this;
            self._hideInfoPopup();
        },
    });

    fieldRegistry.add('m2o_info', M2OInfo);
});
