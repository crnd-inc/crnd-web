odoo.define('crnd_web_list_tooltip_widget.ListTooltipWidget',
    function (require) {
        "use strict";

        var ListRenderer = require('web.ListRenderer');
        ListRenderer.include({
            events: _.extend({}, ListRenderer.prototype.events, {
                'mouseover tbody tr td.td_in_tooltip': function (event) {
                    var tooltipTitle =
                        $(event.currentTarget).context.innerText.trim();
                    $(event.currentTarget).tooltip({
                        title: tooltipTitle,
                        delay: 0,
                    }).tooltip('show');
                },
            }),
        });
    });
