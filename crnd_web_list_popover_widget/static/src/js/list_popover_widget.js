odoo.define('crnd_web_list_popover_widget.ListPopoverWidget',
    function (require) {
        "use strict";

        var ListRenderer = require('web.ListRenderer');
        ListRenderer.include({
            events: _.extend({}, ListRenderer.prototype.events, {
                'mouseover tbody tr td.o_data_popover': function (event) {
                    var content =
                        $(event.currentTarget).context.innerText.trim();
                    $(event.currentTarget).popover({
                        content: content,
                        trigger: 'hover',
                        placement: 'auto',
                        container: 'body',
                        html: false,
                        animation: false,
                    }).popover('show');
                },
            }),
        });
    });
