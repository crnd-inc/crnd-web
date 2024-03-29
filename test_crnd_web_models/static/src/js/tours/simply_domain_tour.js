odoo.define('test_crnd_web_field_domain.simply_domain_tour', function (require) {
    'use strict';

    var tour = require('web_tour.tour');

    tour.register('test_crnd_web_field_domain_simply_domain_tour', {
        test: true,
        rainbowMan: false,
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
            content: "Click menu 'Cars'",
            trigger: "a[data-menu-xmlid='test_crnd_web_models.test_car_rental_car_menu']",
        },
        {
            content: "Check in menu 'Cars'",
            trigger: "div.o_cp_controller div.o_control_panel ol.breadcrumb li.breadcrumb-item:containsExact('Car')",
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
            content: "Wait for download form",
            trigger: "span.o_field_char:containsExact('EcoCruiser')",
        },
        {
            content: "Click edit button",
            trigger: "button:contains('Edit')",
            run: "click",
        },
        {
            content: "Input domain into domain field",
            trigger: "input[name='brand_id_field_domain']",
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
//        The brand record with id 2 is 'SpeedTech',
//        so lets check this
        {
            content: "Input domain into domain field",
            trigger: "input[name='brand_id_field_domain']",
            run: "text [('id', '=', 2)]",
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

//        Input empty domain to make sure all records in dropdown list
        {
            content: "Input empty domain into domain field",
            trigger: "input[name='brand_id_field_domain']",
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

//        Save record
        {
            content: "Click save button",
            trigger: "button:contains('Save')",
            run: "click",
        },
        {
            content: "Check record saved",
            trigger: "div.o_form_view.o_form_readonly",
        },
    ]);
    return {};
});
