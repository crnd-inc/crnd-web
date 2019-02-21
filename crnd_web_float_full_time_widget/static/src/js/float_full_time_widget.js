odoo.define('crnd_web_float_full_time_widget.FloatFullTime', function (require) {
"use strict";

    var registry = require('web.field_registry');
    var basic_fields = require('web.basic_fields');
    var field_utils = require('web.field_utils');

    var FloatFullTime = basic_fields.FieldFloat.extend({

        init: function () {
            this._super.apply(this, arguments);
        },

        formatFullFloatTime: function(value){
            var round_off = this.nodeOptions.round_off;
            var time_only = this.nodeOptions.time_only;
            var pattern = '%02d:%02d:%02d';
            if (time_only !== true) {
                pattern = '%01dd:' + pattern;
            }
            if (round_off !== true) {
                pattern += ',%03d';
            }
            var in_value = value;
            if (value < 0) {
                in_value = Math.abs(value);
                pattern = '-' + pattern;
            }
            var time_values = this._get_time_value_for_pattern(round_off, time_only, in_value);
            if (round_off === true && time_only === true) {
                return _.str.sprintf(
                    pattern, time_values.hours, time_values.minutes, time_values.seconds);
            } else if (round_off === true && time_only !== true) {
                return _.str.sprintf(
                    pattern, time_values.days, time_values.hours, time_values.minutes, time_values.seconds);
            } else if (round_off !== true && time_only === true) {
                return _.str.sprintf(
                    pattern, time_values.hours, time_values.minutes, time_values.seconds, time_values.milliseconds);
            }
            return _.str.sprintf(
                pattern, time_values.days, time_values.hours, time_values.minutes, time_values.seconds, time_values.milliseconds);
        },

        parseFullFloatTime: function(value){
            var round_off = this.nodeOptions.round_off;
            var time_only = this.nodeOptions.time_only;
            var parse_integer = field_utils.parse.integer;
            var factor = 1;
            var in_value = value;
            if (value[0] === '-') {
                in_value = value.slice(1);
                factor = -1;
            }
            var float_time_pair = in_value.split(":");
            if (float_time_pair.length < 3){
                return factor * parseFloat(value);
            }
            var days = 0;
            var hours = 0;
            var minutes = 0;
            var seconds = 0;
            var milliseconds = 0;
            var sec_millisec = '';
            if (round_off === true && time_only === true) {
                hours = parse_integer(float_time_pair[0]) * 3600;
                minutes = parse_integer(float_time_pair[1]) * 60;
                seconds = parse_integer(float_time_pair[2]);
            } else if (round_off === true && time_only !== true) {
                days = parse_integer(float_time_pair[0].slice(0, -1)) * 86400;
                hours = parse_integer(float_time_pair[1]) * 3600;
                minutes = parse_integer(float_time_pair[2]) * 60;
                seconds = parse_integer(float_time_pair[3]);
            } else if (round_off !== true && time_only === true) {
                sec_millisec = float_time_pair[2].split(",");
                hours = parse_integer(float_time_pair[0]) * 3600;
                minutes = parse_integer(float_time_pair[1]) * 60;
                seconds = parse_integer(sec_millisec[0]);
                milliseconds = parse_integer(sec_millisec[1]) / 1000;
            } else {
                sec_millisec = float_time_pair[3].split(",");
                days = parse_integer(float_time_pair[0].slice(0, -1)) * 86400;
                hours = parse_integer(float_time_pair[1]) * 3600;
                minutes = parse_integer(float_time_pair[2]) * 60;
                seconds = parse_integer(sec_millisec[0]);
                milliseconds = parse_integer(sec_millisec[1]) / 1000;
            }
            return factor * (days + hours + minutes + seconds + milliseconds);
        },

        _get_time_value_for_pattern: function (round_off, time_only, value) {
            var total_sec = Math.floor(value);
            var milisec = Math.round(value % 1 * 1000);
            if (milisec === 1000){
                milisec = 0;
                total_sec += 1;
            }
            var days = 0;
            var hours = Math.floor(value / 3600);
            var hours_in_sec = hours * 3600;
            var minutes = Math.floor((total_sec - hours_in_sec) / 60);
            var seconds = Math.floor(total_sec%60);
            if (time_only !== true) {
                days = Math.floor(hours / 24);
                hours -= days * 24;
            }
            return {
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'milliseconds': milisec,
            };
        },

        _formatValue: function (value) {
            return this.formatFullFloatTime(value);
        },

        _parseValue: function (value) {
            return this.parseFullFloatTime(value);
        },

    });

    registry.add('float_full_time', FloatFullTime);

    return FloatFullTime;
});
