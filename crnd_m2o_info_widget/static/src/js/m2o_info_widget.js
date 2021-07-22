odoo.define('crnd_m2o_info_widget.widget', function (require) {
    "use strict";

    var fieldRegistry = require('web.field_registry');
    var relationFields = require('web.relational_fields');
    var fieldMany2One = relationFields.FieldMany2One;

    var M2OInfo = fieldMany2One.extend({
        _renderReadonly: function () {
            this._super.apply(this, arguments);

            if (this.m2o_value) {
                this.info_data = null;
                this.$info_popup = null;

                var $link = this.$el;
                this.$el = $('<div>').addClass('m2o_info');
                this.$el.append($link);

                this.$info_icon = $('<span>').addClass('info_icon')
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
                self._rpc({
                    model: self.value.model,
                    method: 'read',
                    args: [[self.value.res_id], self.nodeOptions.info_fields],
                }).then(function (result) {
                    if (result) {
                        self.info_data = result[0];
                        def.resolve(self.info_data);
                    } else {
                        self.info_data = null;
                        def.resolve(null);
                    }
                });
            }
            return def;
        },

        /**
         * Create popup window for this widget.
         * @param {Object} data: dictionary with fields read from database
         * @returns JQuery element of created popup
         */
        _createInfoPopup: function (data) {
            var self = this;

            self.$info_popup = $('<div>').addClass('info_popup')
                .appendTo(self.$info_icon);

            if (data) {
                _.each(
                    self.nodeOptions.info_fields,
                    function (field_name) {
                        if (data[field_name]) {
                            // TODO: possibly use template to build this widget
                            //       Also, it would be good to display field
                            //       names left side field value.
                            //       For example:
                            //           Name: John Doe
                            //           Phone: 12335
                            //           Email: john.doe@jd.com
                            var $row = $('<div>').appendTo(self.$info_popup);
                            $('<label>').text(data[field_name]).appendTo($row);
                            var $copy = $('<span>').addClass('fa fa-copy')
                                .appendTo($row);

                            // TODO: implement in better way
                            new ClipboardJS($copy[0], {  // eslint-disable-line
                                text: function (target) {
                                    return target.previousElementSibling
                                        .textContent;
                                },
                            });
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
