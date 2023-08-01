odoo.define('test_crnd_web_field_domain.xml_assembly_domain_tour', function (require) {
    'use strict';

    var tour = require('web_tour.tour');

    tour.register('test_crnd_web_field_domain_xml_assembly_domain_tour', {
        test: true,
        rainbowMan: false,
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
            content: "Click menu 'Cars'",
            trigger: "a:containsExact('Car Rental')",
        },
        {
            content: "Check in menu 'Car Rental'",
            trigger: "div.o_view_controller div.o_control_panel ol.breadcrumb" +
            " li.breadcrumb-item span:containsExact('Car Rental')",
        },
        {
            content: "Check record list has 'Azure Interior' partner(waiting to form load)",
            trigger: "table:has(td.o_data_cell:contains('Azure Interior'))",
        },
        {
            content: "Check record list has 'Ready Mat' partner(waiting to form load)",
            trigger: "table:has(td.o_data_cell:contains('Ready Mat'))",
        },
        {
            content: "Click record with partner 'Azure Interior'",
            trigger: "td.o_data_cell:first",
            run: "click",
        },
        {
            content: "Wait for download form",
            trigger: ":has(div[name='customer_id']) :has(input[id='customer_id'])",
        },
        {
            content: "Click Car field",
            trigger: "div[name='car_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Ensure dropdown list has 'CityUrbanGlide Hybrid' car",
            trigger: "ul.ui-autocomplete:has(a:contains('CityUrbanGlide Hybrid')) ",
        },
        {
            content: "Ensure dropdown list has 'CityFamilyJourney' car",
            trigger: "ul.ui-autocomplete:has(a:contains('CityFamilyJourney')) ",
        },
        {
            content: "Ensure dropdown list has 'CityAdventureXplorer' car",
            trigger: "ul.ui-autocomplete:has(a:contains('CityAdventureXplorer')) ",
        },
        {
            content: "Ensure dropdown list not has 'EcoCruiser' car",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('EcoCruiser')):contains()) ",
        },
        {
            content: "Ensure dropdown list not has 'SportRider GT' car",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('SportRider GT')):contains()) ",
        },
        {
            content: "Click Car field",
            trigger: "div[name='car_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Discard changes",
            trigger: "button.o_form_button_cancel",
            run: "click",
        },
        {
            content: "Input domain into domain field",
            trigger: "input[id='car_id_field_domain']",
            run: "text [('id', '=', 3)]",
        },
        {
            content: "Click Car field",
            trigger: "div[name='car_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Ensure dropdown list has 'CityUrbanGlide Hybrid' car",
            trigger: "ul.ui-autocomplete:has(a:contains('CityUrbanGlide Hybrid')) ",
        },
        {
            content: "Ensure dropdown list not has 'CityFamilyJourney' car",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('CityFamilyJourney')):contains()) ",
        },
        {
            content: "Ensure dropdown list not has 'CityAdventureXplorer' car",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('CityAdventureXplorer')):contains()) ",
        },
        {
            content: "Click Car field",
            trigger: "div[name='car_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Discard changes",
            trigger: "button.o_form_button_cancel",
            run: "click",
        },
        {
            content: "Input domain into domain field",
            trigger: "input[id='car_id_field_domain']",
            run: "text [('id', '=', 4)]",
        },
        {
            content: "Click Car field",
            trigger: "div[name='car_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Ensure dropdown list has 'CityFamilyJourney' car",
            trigger: "ul.ui-autocomplete:has(a:contains('CityFamilyJourney')) ",
        },
        {
            content: "Ensure dropdown list not has 'CityUrbanGlide Hybrid' car",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('CityUrbanGlide Hybrid')):contains()) ",
        },
        {
            content: "Ensure dropdown list not has 'CityAdventureXplorer' car",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('CityAdventureXplorer')):contains()) ",
        },
        {
            content: "Click Car field",
            trigger: "div[name='car_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Discard changes",
            trigger: "button.o_form_button_cancel",
            run: "click",
        },
        {
            content: "Input domain into domain field",
            trigger: "input[id='car_id_field_domain']",
            run: "text [('id', '=', 5)]",
        },
        {
            content: "Click Car field",
            trigger: "div[name='car_id'] div.o_input_dropdown input",
            run: "click",
        },
        {
            content: "Ensure dropdown list has 'CityAdventureXplorer' car",
            trigger: "ul.ui-autocomplete:has(a:contains('CityAdventureXplorer')) ",
        },
        {
            content: "Ensure dropdown list not has 'CityUrbanGlide Hybrid' car",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('CityUrbanGlide Hybrid')):contains()) ",
        },
        {
            content: "Ensure dropdown list not has 'CityFamilyJourney' car",
            trigger: "ul.ui-autocomplete:not(:has(a:contains('CityFamilyJourney')):contains()) ",
        },
        {
            content: "Click Car field",
            trigger: "div[name='car_id'] div.o_input_dropdown input",
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
    ]);
    return {};
});
