odoo.define('crnd_m2o_info_widget.widget', function (require) {
    "use strict";

    var fieldRegistry = require('web.field_registry');
    var relationFields = require('web.relational_fields');
    var fieldMany2One = relationFields.FieldMany2One;

    var M2OInfo = fieldMany2One.extend({
        _renderReadonly: function () {
            this._super.apply(this, arguments);
            
            if (this.m2o_value) {
                var self = this;
                var $link = this.$el;
                this.$el = $('<div>').addClass('m2o_info');
                this.$el.append($link);

                this.$info_icon = $('<span>').addClass('info_icon')
                    .attr('id', 'info_icon')
                    .appendTo(this.$el)
                    .append($('<i>').addClass('fa fa-info'));


                var info_fields = this._stringToArray(this.attrs.info_fields);
                this._rpc({
                    model: this.value.model,
                    method: 'read',
                    args: [[this.value.res_id], info_fields],
                }).then(function (result) {
                    self._createInfoPopup(result, info_fields);
                });
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

            var $info_popup = $('<div>').addClass('info_popup')
                .appendTo(self.$info_icon);

            if (result) {
                for (var i = 0; i < info_fields.length; i++) {
                    if (result[0][info_fields[i]]) {
                        var $row = $('<div>').appendTo($info_popup);
                        $('<label>')
                            .text(result[0][info_fields[i]]).appendTo($row );
                        var $copy = $('<span>').addClass('fa fa-copy')
                            .appendTo($row );
                        $copy.click(this._onClicCopy.bind(this));
                    }
                }
            }
        },

        _onClicCopy: function (event) {
            this._copyTextToBuffer(event.currentTarget.previousElementSibling);
        },

        _copyTextToBuffer: function (element) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
        },
    });

    fieldRegistry.add('m2o_info', M2OInfo);
});
