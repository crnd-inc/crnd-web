odoo.define('test_crnd_web_field_domain.field_domain_tour', function (require) {
    'use strict';

    var tour = require('web_tour.tour');

    tour.register('test_crnd_web_field_domain_field_domain_tour', {
        test: true,
        rainbowMan: false,
        url: '/web',
    }, [
        {
            content: "Click menu 'Cars'",
            trigger: "a[data-menu-xmlid='test_crnd_web_field_domain.car_rental_car_menu']",
        },
        {
            content: "Click record with car 'EcoCruiser'",
            trigger: "td.o_data_cell:containsExact('EcoCruiser')",
            run: 'click',
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
    ]);
    return {};
});
