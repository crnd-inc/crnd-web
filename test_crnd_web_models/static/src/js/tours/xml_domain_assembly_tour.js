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
            trigger: "a[data-menu-xmlid='test_crnd_web_models.test_car_rental_menu']",
        },
        {
            content: "Check in menu 'Car Rental'",
            trigger: "main.o_main_content div.o_control_panel ol.breadcrumb" +
            " li.breadcrumb-item:containsExact('Car Rental')",
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
            trigger: ":has(a[name='customer_id']:contains('Azure Interior'):contains())",
        },
        {
            content: "Click edit button",
            trigger: "button:contains('Edit')",
            run: "click",
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
            content: "Input domain into domain field",
            trigger: "input[name='car_id_field_domain']",
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
            content: "Input domain into domain field",
            trigger: "input[name='car_id_field_domain']",
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
            content: "Input domain into domain field",
            trigger: "input[name='car_id_field_domain']",
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
