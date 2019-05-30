odoo.define('web_diagram_plus.view_registry', function (require) {
    "use strict";

    var view_registry = require('web.view_registry');

    var DiagramPlusView = require('web_diagram_plus.DiagramPlusView');

    view_registry.add('diagram_plus', DiagramPlusView);

});
