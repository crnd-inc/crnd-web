odoo.define('crnd_web_float_full_time_widget.tests', function (require) {
    "use strict";

    var FieldUtils = require('web.field_utils');
    var QUnit = window.QUnit;

    QUnit.module('crnd_web_float_full_time_widget', {}, function () {

        QUnit.test('parse float full time', function (assert) {
            assert.expect(7);

            assert.strictEqual(FieldUtils.parse.float_full_time(
                "", false, false), 0);
            assert.strictEqual(FieldUtils.parse.float_full_time(
                "20.12", false, false), 20.12);
            assert.strictEqual(FieldUtils.parse.float_full_time(
                "84:20:39,9999", true, false), 303648.999);

            assert.strictEqual(FieldUtils.parse.float_full_time(
                "3d 12:20:39,999", false, false), 303639.999);
            assert.strictEqual(FieldUtils.parse.float_full_time(
                "3d 12:20:39", false, true), 303639);
            assert.strictEqual(FieldUtils.parse.float_full_time(
                "84:20:39,999", true, false), 303639.999);
            assert.strictEqual(FieldUtils.parse.float_full_time(
                "84:20:39", true, true), 303639);

        });

        QUnit.test('format float full time', function (assert) {
            assert.expect(10);

            assert.strictEqual(FieldUtils.format.float_full_time(
                0, false, false, null), "00:00:00,000");
            assert.strictEqual(FieldUtils.format.float_full_time(
                0, false, false, 'edit'), "0d 00:00:00,000");

            assert.strictEqual(FieldUtils.format.float_full_time(
                303639.999, false, false, null), "3d 12:20:39,999");
            assert.strictEqual(FieldUtils.format.float_full_time(
                303639, false, true, null), "3d 12:20:39");
            assert.strictEqual(FieldUtils.format.float_full_time(
                303639.999, true, false, null), "84:20:39,999");
            assert.strictEqual(FieldUtils.format.float_full_time(
                303639, true, true, null), "84:20:39");

            assert.strictEqual(FieldUtils.format.float_full_time(
                44439.999, false, false, null), "12:20:39,999");
            assert.strictEqual(FieldUtils.format.float_full_time(
                44439.999, false, false, 'edit'), "0d 12:20:39,999");
            assert.strictEqual(FieldUtils.format.float_full_time(
                44439, false, true, null), "12:20:39");
            assert.strictEqual(FieldUtils.format.float_full_time(
                44439, false, true, 'edit'), "0d 12:20:39");

        });
    });

});
