import { registry } from "@web/core/registry";

registry.category("web_tour.tours").add('test_crnd_web_models_on_create_action_tour', {
    url: "/odoo/action-test_crnd_web_models.book_action_window",
    steps: () => [
    {
        content: "Wait for list view 'Books' is loaded",
        trigger: ".o_breadcrumb :text(Books)",
    },
    {
        content: "Click create button",
        trigger: ".o_list_view .o_list_button_add",
        run: "click",
    },
    {
        content: "Input text into wizard form",
        trigger: ".modal div[name='title'] input",
        run: "edit Lord of Rings",
    },
    {
        content: "Click 'Create book'",
        trigger: ".modal button[name='create_book']",
        run: "click",
        expectUnloadPage: true,
    },
    {
        content: "Ensure record created successfully",
        trigger: ".o_data_cell:text(Lord of Rings)",
    },
]});
