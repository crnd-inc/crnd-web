odoo.define('crnd_web_tree_field_action.list_tests', function (require) {
    "use strict";

    var ListView = require('web.ListView');
    var testUtils = require('web.test_utils');
    var createView = testUtils.createView;
    var QUnit = window.QUnit;

    QUnit.module('crnd_web_tree_field_action_tests', {
        beforeEach: function () {
            this.data = {
                test_model: {
                    fields: {
                        test_field_1: {string: 'test_field_1', type: 'char'},
                        test_field_2: {string: 'test_field_2', type: 'char'},
                    },
                    records: [
                        {
                            id: 1,
                            test_field_1: 'value_1_1',
                            test_field_2: 'value_1_2',
                        },
                        {
                            id: 2,
                            test_field_1: 'value_2_1',
                            test_field_2: 'value_2_2',
                        },
                    ]
                },
            };
        }
    }, function () {

        QUnit.test('opening action when clicking on cell', function (assert) {
            assert.expect(1);

            var list = createView({
                View: ListView,
                model: 'test_model',
                data: this.data,
                arch: '<tree>' +
                        '<field name="test_field_1"/>' +
                        '<field name="test_field_2" class="field_with_action" options="{\'on_click\': {\'action\': \'%(action_name)d\', \'type\': \'action\'}}"/>' +
                    '</tree>',
            });

            testUtils.intercept(list, 'button_clicked', function () {
                assert.ok('list view should trigger button_clicked event');
            });

            list.$('tr td.field_with_action').first().click();
            list.destroy();
        });
    });
});
