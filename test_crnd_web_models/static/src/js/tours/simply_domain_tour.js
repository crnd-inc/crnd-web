/** @odoo-module **/

import { registry } from "@web/core/registry";

registry.category("web_tour.tours").add('test_crnd_web_field_domain_simply_domain_tour', {
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
            content: "Click menu 'Cars'",
            trigger: "a:containsExact('Cars')",
        },
        {
            content: "Check in menu 'Cars'",
            trigger: "span:containsExact('Car')",
        },
        {
            content: "Check record list has 'EcoCruiser'(waiting to form load)",
            trigger: "table:has(td.o_data_cell:contains('EcoCruiser'))",
        },
        {
            content: "Check record list has 'FamilyJourney'(waiting to form load)",
            trigger: "table:has(td.o_data_cell:contains('FamilyJourney'))",
        },
        {
            content: "Click record with car 'EcoCruiser'",
            trigger: "td.o_data_cell:first",
            run: "click",
        },
        {
            content: "Input domain into domain field",
            trigger: "div[name='brand_id_field_domain'] input",
            run: "text [('id', '=', 1)]",
        },
//        The brand record with id 1 is 'GreenDrive',
//        so lets check this
        {
            content: "Click Brand field",
            trigger: "div[name='brand_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Ensure dropdown list has 'GreenDrive' brand",
            trigger: "ul.ui-autocomplete:has(a:contains('GreenDrive')) ",
        },
        {
            content: "Click Brand field",
            trigger: "div[name='brand_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Discard changes",
            trigger: "button.o_form_button_cancel",
            run: "click",
        },

//        The brand record with id 2 is 'SpeedTech',
//        so lets check this
        {
            content: "Input domain into domain field",
            trigger: "div[name='brand_id_field_domain'] input",
            run: "text [('id', '=', 2)]",
        },
        {
            content: "Click Brand field",
            trigger: "div[name='brand_id'] input",
            run: "click",
        },
        {
            content: "Ensure dropdown list has 'SpeedTech' brand",
            trigger: "ul.ui-autocomplete:has(a:contains('SpeedTech')) ",
        },
//        Check no more other 4 records in dropdown list
        {
            content: "Ensure dropdown list not has 'GreenDrive' brand",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('GreenDrive')):contains()) ",
        },
        {
            content: "Ensure dropdown list not has 'CityWheels' brand",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('CityWheels')):contains()) ",
        },
        {
            content: "Ensure dropdown list not has 'ComfortCars' brand",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('ComfortCars')):contains()) ",
        },
        {
            content: "Ensure dropdown list not has 'TrekDrive' brand",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('TrekDrive')):contains()) ",
        },
        {
            content: "Click Brand field",
            trigger: "div[name='brand_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Discard changes",
            trigger: "button.o_form_button_cancel",
            run: "click",
        },

//        Input empty domain to make sure all records in dropdown list
        {
            content: "Input empty domain into domain field",
            trigger: "div[name='brand_id_field_domain'] input",
            run: "text []",
        },
        {
            content: "Click Brand field",
            trigger: "div[name='brand_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Ensure dropdown list has 'SpeedTech' brand",
            trigger: "ul.ui-autocomplete:has(a:contains('SpeedTech')) ",
        },
        {
            content: "Ensure dropdown list has 'GreenDrive' brand",
            trigger: "ul.ui-autocomplete:has(a:contains('GreenDrive')) ",
        },
        {
            content: "Ensure dropdown list has 'CityWheels' brand",
            trigger: "ul.ui-autocomplete:has(a:contains('CityWheels')) ",
        },
        {
            content: "Ensure dropdown list has 'ComfortCars' brand",
            trigger: "ul.ui-autocomplete:has(a:contains('ComfortCars')) ",
        },
        {
            content: "Ensure dropdown list has 'TrekDrive' brand",
            trigger: "ul.ui-autocomplete:has(a:contains('TrekDrive')) ",
        },
        {
            content: "Click Brand field",
            trigger: "div[name='brand_id'] div.o_input_dropdown input",
            run: "click",
        },

//        Save record
        {
            content: "Click save button",
            trigger: "button.o_form_button_save",
            run: "click",
        },
        {
            content: "Check record saved",
            trigger: ".o_form_status_indicator_buttons.invisible",
        },
]});
