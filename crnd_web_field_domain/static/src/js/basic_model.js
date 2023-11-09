odoo.define('crnd_web_field_domain.field_domain', function (require) {
    "use strict";

    var BasicModel = require('web.BasicModel');
    var pyUtils = require("web.py_utils");
    var Domain = require('web.Domain');


    BasicModel.include({

        _getDomain: function (element, options) {
            if (!options || !options.fieldName) {
                return this._super.apply(this, arguments);
            }
            var field_name = options ? options.fieldName: undefined;
            var viewType = options.viewType || element.viewType;
            var element_options = field_name && viewType ? element.fieldsInfo[viewType][field_name].options : undefined;
            var domain_field = element_options ? element_options.domain_field : undefined;
            var domain_field_value = domain_field && element._changes && element._changes[domain_field] ? element._changes[domain_field] : element.data[domain_field] || "[]";

            if (options.fieldName && domain_field) {
                if (element._domains[options.fieldName]) {
                    var field_domain = element._domains[options.fieldName];
                    var is_field_domain_string = typeof field_domain === "string";
                    var origin_domain = field_domain.length !== 0 && is_field_domain_string ? field_domain : "[]";
                    var assembled_domain = pyUtils.assembleDomains([origin_domain, domain_field_value], "AND");
                    return Domain.prototype.stringToArray(assembled_domain, this._getEvalContext(element, true));
                }
                var viewType = options.viewType || element.viewType;
                var fieldInfo = element.fieldsInfo[viewType][options.fieldName];
                if (fieldInfo && fieldInfo.domain) {
                    var field_domain = fieldInfo.domain;
                    var is_field_domain_string = typeof field_domain === "string";
                    var origin_domain = field_domain.length !== 0 && is_field_domain_string ? field_domain : "[]";
                    var assembled_domain = pyUtils.assembleDomains([origin_domain, domain_field_value], "AND");
                    return Domain.prototype.stringToArray(assembled_domain, this._getEvalContext(element, true));
                }
                var fieldParams = element.fields[options.fieldName];
                if (fieldParams.domain) {
                    var field_domain = fieldParams.domain;
                    var is_field_domain_string = typeof field_domain === "string";
                    var origin_domain = field_domain.length !== 0 && is_field_domain_string ? field_domain : "[]";
                    var assembled_domain = pyUtils.assembleDomains([origin_domain, domain_field_value], "AND");
                    return Domain.prototype.stringToArray(assembled_domain, this._getEvalContext(element, true));
                }
                return this._super.apply(this, arguments);
            }
            return this._super.apply(this, arguments);
        },
    });
});
