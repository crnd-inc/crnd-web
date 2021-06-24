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
                    .attr('id', 'info_icon')
                    .appendTo(this.$el)
                    .append($('<i>').addClass('fa fa-info'));

                this.$info_icon.click(this._onClickInfo.bind(this));
                this.$info_icon.mouseleave(this._onMouseLeaveInfo.bind(this));
            }
        },

        _onClickInfo: function () {
            if (this.info_data) {
                this.$info_popup.addClass('info_popup_visible');
            } else {
                var self = this;

                this._rpc({
                    model: this.value.model,
                    method: 'read',
                    args: [[this.value.res_id], this.nodeOptions.info_fields],
                }).then(function (result) {
                    self._createInfoPopup(result, self.nodeOptions.info_fields);
                    self.info_data = true;
                    self.$info_popup.addClass('info_popup_visible');
                });
            }
        },

        _onMouseLeaveInfo: function () {
            if (this.info_data) {
                this.$info_popup.removeClass('info_popup_visible');
            }
        },

        _stringToArray: function (value) {
            var array = [];
            var str_array = value.slice(1, -1);
            var str_array_split = str_array.split(',');
            array = str_array_split.map(function (val) {
                return val.trim().slice(1, -1);
            });
            return array;
        },

        _createInfoPopup: function (result, info_fields) {
            var self = this;

            self.$info_popup = $('<div>').addClass('info_popup')
                .appendTo(self.$info_icon);

            if (result) {
                for (var i = 0; i < info_fields.length; i++) {
                    if (result[0][info_fields[i]]) {
                        var $row = $('<div>').appendTo(self.$info_popup);
                        $('<label>')
                            .text(result[0][info_fields[i]]).appendTo($row );
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
    });

    fieldRegistry.add('m2o_info', M2OInfo);
});
