odoo.define('test_crnd_web_field_domain.context_eval_domain_tour', function (require) {
    'use strict';

    var tour = require('web_tour.tour');

    tour.register('test_crnd_web_field_domain_context_eval_domain_tour', {
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

//        Use context 'model_id' in domain
        {
            content: "Input context domain into domain field",
            trigger: "input[name='brand_id_field_domain']",
            run: "text [('id', '=', model_id)]",
        },
//        The following mapping uses in test domain:

//        | id |     brand_id       |     model_id      |
//        -----------------------------------------------
//        | 1  |    GreenDrive      |     Eco200x       |
//        | 2  |    SpeedTech       |     SR-GT2023     |
//        | 3  |    CityWheels      |     UG-H500       |
//        | 4  |    ComfortCars     |     FC2023        |
//        | 5  |    TrekDrive       |     AX-4x4        |
        {
            content: "Click Brand field",
            trigger: "div[name='brand_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Ensure dropdown list has 'GreenDrive' brand",
            trigger: "ul.ui-autocomplete:has(a:contains('GreenDrive')) ",
        },
//        Check no more other records in dropdown list
        {
            content: "Ensure dropdown list not has 'SpeedTech' brand",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('SpeedTech')):contains()) ",
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

//        Change model_id in record
        {
            content: "Click Model field",
            trigger: "div[name='model_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Change model with id 2",
            trigger: "ul.ui-autocomplete li.ui-menu-item:has(a:contains('SR-GT2023'))",
            run: "click",
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
