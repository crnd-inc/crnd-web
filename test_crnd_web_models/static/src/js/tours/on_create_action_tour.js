/** @odoo-module **/

import { registry } from "@web/core/registry";

registry.category("web_tour.tours").add('test_crnd_web_models_on_create_action_tour', {
    test: true,
    url: "/web",
    steps: () => [
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
        content: "Click menu 'Test crnd_web_on_create_action'",
        trigger: "a:containsExact('Test crnd_web_on_create_action')",
    },
    {
        content: "Wait for download",
        trigger: "span:containsExact('Books')",
    },
    {
        content: "Click create button",
        trigger: "button:contains('New')",
        run: "click",
    },
    {
        content: "Input text into widget form",
        trigger: ".o_field_char.o_field_widget > .o_input",
        run: "text Lord of Rings",
    },
    {
        content: "Click 'Create book'",
        trigger: "button[name='create_book']",
        run: "click",
    },
    {
        content: "Ensure record created successfully",
        trigger: ".o_data_cell:containsExact('Lord of Rings')",
    },
]});
