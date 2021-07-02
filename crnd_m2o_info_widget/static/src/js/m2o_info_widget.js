odoo.define('crnd_m2o_info_widget.widget', function (require) {
    "use strict";

    var fieldRegistry = require('web.field_registry');
    var relationFields = require('web.relational_fields');
    var fieldMany2One = relationFields.FieldMany2One;

    var M2OInfo = fieldMany2One.extend({
        _renderReadonly: function () {
            this._super.apply(this, arguments);

            if (this.m2o_value) {
                this.info_data = false;

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

        _onClickInfo: function (event) {
            if (this.info_data) {
                this._showInfoPopup(true, event.clientX);
            } else {
                var self = this;

                this._rpc({
                    model: this.value.model,
                    method: 'read',
                    args: [[this.value.res_id], this.nodeOptions.info_fields],
                }).then(function (result) {
                    self._createInfoPopup(result, self.nodeOptions.info_fields);
                    self.info_data = true;
                    self._showInfoPopup(true, event.clientX);
                });
            }
        },

        _onMouseLeaveInfo: function () {
            if (this.info_data) {
                this._showInfoPopup(false);
            }
        },

        _createInfoPopup: function (data, info_fields) {
            this.$info_popup = $('<div>').addClass('info_popup')
                .appendTo(this.$info_icon);

            if (data) {
                for (var i = 0; i < info_fields.length; i++) {
                    if (data[0][info_fields[i]]) {
                        var $row = $('<div>').appendTo(this.$info_popup);
                        $('<label>')
                            .text(data[0][info_fields[i]]).appendTo($row );
                        var $copy = $('<span>').addClass('fa fa-copy')
                            .appendTo($row);
                        new ClipboardJS($copy[0], {  // eslint-disable-line
                            text: function (target) {
                                return target.previousElementSibling
                                    .textContent;
                            },
                        });
                    }
                }
            }
        },

        _showInfoPopup: function (state, left_offset) {
            var is_show = this.$info_popup.hasClass('info_popup_visible');
            if (!state && is_show) {
                this.$info_popup.removeClass('info_popup_visible');
            } else if (state && !is_show) {
                var popup_width = this.$info_popup.outerWidth();
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
                this.$info_popup.css(css_value);
                this.$info_popup.addClass('info_popup_visible');
            }
        },
    });

    fieldRegistry.add('m2o_info', M2OInfo);
});
