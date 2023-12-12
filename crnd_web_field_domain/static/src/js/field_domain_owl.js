/** @odoo-module **/

import { Domain } from "@web/core/domain";
import { Field } from "@web/views/fields/field";
import { patch } from "@web/core/utils/patch";
import { evaluateExpr, evaluateBooleanExpr } from "@web/core/py_js/py";
import { getFieldContext } from "@web/model/relational_model/utils";

patch(Field.prototype, {

   get fieldComponentProps() {
       const record = this.props.record;
       let readonly = this.props.readonly || false;

       let propsFromNode = {};
       if (this.props.fieldInfo) {
           let fieldInfo = this.props.fieldInfo;
           readonly =
               readonly ||
               evaluateBooleanExpr(fieldInfo.readonly, record.evalContextWithVirtualIds);

           if (this.field.extractProps) {
               if (this.props.attrs) {
                   fieldInfo = {
                       ...fieldInfo,
                       attrs: {...fieldInfo.attrs, ...this.props.attrs},
                   };
               }

               const dynamicInfo = {
                   get context() {
                       return getFieldContext(record, fieldInfo.name, fieldInfo.context);
                   },
                   domain() {
                       const evalContext = record.evalContext;
                       if (fieldInfo.domain || fieldInfo.options.domain_field) {
                           var main_domain = fieldInfo.domain ? fieldInfo.domain : [];
                           var additional_domain = fieldInfo.options.domain_field && record.data[fieldInfo.options.domain_field] ? record.data[fieldInfo.options.domain_field] : [];
                           var full_domain = Domain.and([main_domain, additional_domain]).toString()
                           return new Domain(evaluateExpr(full_domain, evalContext)).toList();
                       }
                       const {domain} = record.fields[fieldInfo.name];
                       return typeof domain === "string"
                           ? new Domain(evaluateExpr(domain, evalContext)).toList()
                           : domain || [];
                   },
                   required: evaluateBooleanExpr(
                       fieldInfo.required,
                       record.evalContextWithVirtualIds
                   ),
                   readonly: readonly,
               };
               propsFromNode = this.field.extractProps(fieldInfo, dynamicInfo);
           }
       }
       const props = { ...this.props };
        delete props.style;
        delete props.class;
        delete props.showTooltip;
        delete props.fieldInfo;
        delete props.attrs;
        delete props.type;
        delete props.readonly;

        return {
            readonly: readonly || !record.isInEdition || false,
            ...propsFromNode,
            ...props,
        };
   }

});
