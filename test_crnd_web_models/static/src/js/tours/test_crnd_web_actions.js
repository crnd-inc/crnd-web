odoo.define('test_crnd_web_models.test_crnd_web_actions', function (require) {
    'use strict';

    var tour = require('web_tour.tour');

    tour.register('test_crnd_web_models_test_crnd_web_actions', {
        test: true,
        url: '/web',
    }, [
        {
            content: "Click on main menu",
            trigger: "nav.o_main_navbar button.dropdown-toggle",
            run: 'click',
        },
        {
            content: "Click menu 'Tests'",
            trigger: "a[data-menu-xmlid='base.menu_tests']",
            run: 'click',
        },
        {
            content: "Click menu 'CRND Web Tests'",
            trigger: "button[data-menu-xmlid='test_crnd_web_models.crnd_web_tests']",
        },
        {
            content: "Click menu 'Test crnd_web_actions'",
            trigger: "a:containsExact('Test crnd_web_actions')",
        },
        {
            content: "Wait for download",
            trigger: "div[class='o_control_panel'] ol:has" +
                "(li > span:containsExact('Actions'))",
        },
        {
            content: "Click create button",
            trigger: "button:contains('Create')",
            run: "click",
        },
        {
            content: "Input text into form",
            trigger: ".o_field_char.o_field_widget.o_input",
            run: "text Test Crnd Web Actions",
        },
        {
            content: "Click button 'Action readonly'",
            trigger: "button[name='action_readonly']",
            run: "click",
        },
        {
            content: "Ensure form in readonly state",
            trigger: "span[name='title']",
        },
        {
            content: "Click button 'Action editable'",
            trigger: "button[name='action_editable']",
            run: "click",
        },
        {
            content: "Ensure form in editable state",
            trigger: "td:has(.o_field_char.o_field_widget.o_input)",
        },
        {
            content: "Click 'Save'",
            trigger: "button:contains('Save')",
            run: "click",
        },
    ]);
    return {};
});
