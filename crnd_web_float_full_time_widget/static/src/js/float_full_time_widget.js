odoo.define('crnd_web_float_full_time_widget.FullFloatTime', function (require) {
"use strict";

    var registry = require('web.field_registry');
    var basic_fields = require('web.basic_fields');
    var field_utils = require('web.field_utils');
    var core = require('web.core');

    var _t = core._t;

    var FloatTimeDuration = basic_fields.FieldFloat.extend({

        /**
        * Widget implies:
        * the integer part of float represents seconds, the fractional part represents milliseconds
        * For example: 94225.22 => 94225 seconds and 22 milliseconds.
        * Full template has view: 0d 00:00:00.000 where Dd hh:mm:ss,msc
        * D - days, d - literal (days, can be translated), h - hours, m - minutes, s - seconds, msc - milliseconds.
        * For example: 1d 02:10:25,220 to float 94225.22
        * Widget has options:
        * round_off - true, display template without milliseconds (false by default),
        * time_only - true, display template without days (false by default).
        * For example:
        * round_off: false, time_only: false: 0d 00:00:00.000 (94225.22 to template 1d 02:10:25,220)
        * round_off: true, time_only: false: 0d 00:00:00 (94225.22 to template 1d 02:10:25)
        * round_off: true, time_only: true: 00:00:00 (94225.22 to template 26:10:25)
        * round_off: false, time_only: true: 00:00:00,000 (94225.22 to template 26:10:25,220)
        * It simplifying operations with time.
        */

        init: function () {
            this._super.apply(this, arguments);
            this.round_off = this.nodeOptions.round_off;
            this.time_only = this.nodeOptions.time_only;
        },

        formatFloatTimeDuration: function(value){
            var pattern = '%02d:%02d:%02d';
            if (this.time_only !== true) {
                pattern = '%01d' + _t('d') + ' ' + pattern;
            }
            if (this.round_off !== true) {
                pattern += ',%03d';
            }
            var in_value = value;
            if (value < 0) {
                in_value = Math.abs(value);
                pattern = '-' + pattern;
            }
            var time_values = this._get_time_value_for_pattern(in_value);
            if (this.round_off === true && this.time_only === true) {
                return _.str.sprintf(
                    pattern, time_values.hours, time_values.minutes, time_values.seconds);
            } else if (this.round_off === true && this.time_only !== true) {
                return _.str.sprintf(
                    pattern, time_values.days, time_values.hours, time_values.minutes, time_values.seconds);
            } else if (this.round_off !== true && this.time_only === true) {
                return _.str.sprintf(
                    pattern, time_values.hours, time_values.minutes, time_values.seconds, time_values.milliseconds);
            }
            return _.str.sprintf(
                pattern, time_values.days, time_values.hours, time_values.minutes, time_values.seconds, time_values.milliseconds);
        },

        parseFloatTimeDuration: function(value){
            var parse_integer = field_utils.parse.integer;
            var factor = 1;
            var in_value = value;
            if (value[0] === '-') {
                in_value = value.slice(1);
                factor = -1;
            }
            var float_time_pair = in_value.split(/,| |:/);
            if (float_time_pair.length < 3){
                return factor * parseFloat(value);
            }
            var days = 0;
            var hours = 0;
            var minutes = 0;
            var seconds = 0;
            var milliseconds = 0;
            if (this.round_off === true && this.time_only === true) {
                hours = parse_integer(float_time_pair[0]) * 3600;
                minutes = parse_integer(float_time_pair[1]) * 60;
                seconds = parse_integer(float_time_pair[2]);
            } else if (this.round_off === true && this.time_only !== true) {
                days = parse_integer(float_time_pair[0].slice(0, -1)) * 86400;
                hours = parse_integer(float_time_pair[1]) * 3600;
                minutes = parse_integer(float_time_pair[2]) * 60;
                seconds = parse_integer(float_time_pair[3]);
            } else if (this.round_off !== true && this.time_only === true) {
                hours = parse_integer(float_time_pair[0]) * 3600;
                minutes = parse_integer(float_time_pair[1]) * 60;
                seconds = parse_integer(float_time_pair[2]);
                milliseconds = parse_integer(float_time_pair[3]) / 1000;
            } else {
                days = parse_integer(float_time_pair[0].slice(0, -1)) * 86400;
                hours = parse_integer(float_time_pair[1]) * 3600;
                minutes = parse_integer(float_time_pair[2]) * 60;
                seconds = parse_integer(float_time_pair[3]);
                milliseconds = parse_integer(float_time_pair[4]) / 1000;
            }
            return factor * (days + hours + minutes + seconds + milliseconds);
        },

        _get_time_value_for_pattern: function (value) {
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
            if (this.time_only !== true) {
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
            return this.formatFloatTimeDuration(value);
        },

        _parseValue: function (value) {
            return this.parseFloatTimeDuration(value);
        },

    });

    var FloatFullTime = FloatTimeDuration.extend({

        /**
        * Widget based on FloatTimeDuration widget.
        * It implies: represents float as time of twenty-four hours.
        * Widget restrict inputting data.
        * Data can be from 00:00:00,000 to 23:59:59,999 and only positive value.
        * It has the same options, but time_only all times is true (except days).
        * It can be used for marking the time of start or stop any process.
        * It means that it will contains the quantity of seconds from the start of the day.
        * For example:
        * 00:00:00,000 in float 0 (midnight)
        * start_at = 01:22:30,220 (in float 4950.22 seconds from midnight)
        * stop_at = 04:45:15,560 (in float 17115.56 seconds from midnight)
        * It simplifying operations with time.
        */

        init: function () {
            this._super.apply(this, arguments);
            this.round_off = this.nodeOptions.round_off;
            this.time_only = true;
        },

        isValid: function () {
            this._super.apply(this, arguments);
            if (this.value > 86399.999 || this.value < 0) {
                this.do_warn(
                    _t('The value of the field: ') +
                    this.field.string +
                    _t(', can not be more than 23:59:59,999 sec and less than 0 sec! Please check it!')
                );

                this._isValid = false;
            }
            return this._isValid;
        },
    });

    registry.add('float_time_duration', FloatTimeDuration);
    registry.add('float_full_time', FloatFullTime);

    return {
        FloatTimeDuration: FloatTimeDuration,
        FloatFullTime: FloatFullTime
    };
});
