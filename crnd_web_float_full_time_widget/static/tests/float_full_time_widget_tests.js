odoo.define('crnd_web_float_full_time_widget.tests', function (require) {
    "use strict";

    var FullFloatTime = require(
        'crnd_web_float_full_time_widget.FullFloatTime');
    var QUnit = window.QUnit;

    QUnit.module('crnd_web_float_full_time_widget', {}, function () {

        QUnit.test('parse float full time', function (assert) {
            assert.expect(7);

            assert.strictEqual(FullFloatTime.parse.float_full_time("", false, false), 0);
            assert.strictEqual(FullFloatTime.parse.float_full_time("20.12", false, false), 20.12);
            assert.strictEqual(FullFloatTime.parse.float_full_time("84:20:39,9999", true, false), 303648.999);

            assert.strictEqual(FullFloatTime.parse.float_full_time("3d 12:20:39,999", false, false), 303639.999);
            assert.strictEqual(FullFloatTime.parse.float_full_time("3d 12:20:39", false, true), 303639);
            assert.strictEqual(FullFloatTime.parse.float_full_time("84:20:39,999", true, false), 303639.999);
            assert.strictEqual(FullFloatTime.parse.float_full_time("84:20:39", true, true), 303639);

        });

        QUnit.test('format float full time', function (assert) {
            assert.expect(5);

            assert.strictEqual(FullFloatTime.format.float_full_time(0, false, false), "0d 00:00:00,000");

            assert.strictEqual(FullFloatTime.format.float_full_time(303639.999, false, false), "3d 12:20:39,999");
            assert.strictEqual(FullFloatTime.format.float_full_time(303639, false, true), "3d 12:20:39");
            assert.strictEqual(FullFloatTime.format.float_full_time(303639.999, true, false), "84:20:39,999");
            assert.strictEqual(FullFloatTime.format.float_full_time(303639, true, true), "84:20:39");

        });
    });

});
