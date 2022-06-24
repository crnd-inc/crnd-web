odoo.define('test_crnd_web_models.on_create_action_tour', function (require) {
    'use strict';

    var tour = require('web_tour.tour');

    tour.register('test_crnd_web_models_on_create_action_tour', {
        test: true,
        url: '/web',
    }, [
        {
            content: "Click on main menu",
            trigger: ".full",
            run: 'click',
        },
        {
            content: "Click menu 'Tests'",
            trigger: "a[data-menu-xmlid='base.menu_tests']",
            run: 'click',
        },
        {
            content: "Click menu 'CRND Web Tests'",
            trigger: "a[data-menu-xmlid='test_crnd_web_models.crnd_web_tests']",
        },
        {
            content: "Click menu 'Test crnd_web_on_create_action'",
            trigger: "a:has" +
            "(span:containsExact('Test crnd_web_on_create_action'))",
        },
        {
            content: "Wait for download",
            trigger: "div[class='on-create-action-name-test_crnd_web_models" +
            ".action_wizard_book_create table-responsive']",
        },
        {
            content: "Click create button",
            trigger: "button:contains('Create')",
            run: "click",
        },
        {
            content: "Input text into widget form",
            trigger: ".o_field_char.o_field_widget.o_input",
            run: "text Lord of Rings",
        },
        {
            content: "Click 'Save'",
            trigger: "button[name='create_book']",
            run: "click",
        },
        {
            content: "Ensure record created successfully",
            trigger: ".o_data_cell:containsExact('Lord of Rings')",
        },
    ]);
    return {};
});
