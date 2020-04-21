
odoo.define('crnd_web_widget_section_and_note_text.crnd_section_and_note_text',
function (require) {
    "use strict";
    var FieldChar = require('web.basic_fields').FieldChar;
    var CRNDListFieldText = require(
        'crnd_web_list_popover_widget.DynamicTextPopover');
    var fieldRegistry = require('web.field_registry');

    // This is a merge between a CRNDListFieldText and a CRNDFieldChar.
    // We want a FieldChar for section,
    // and a CRNDListFieldText for the rest (product and note).
    var CRNDSectionAndNoteFieldText = function (parent, name, record, options) {
        var isSection = record.data.display_type === 'line_section';
        var Constructor = isSection ? FieldChar : CRNDListFieldText;
        return new Constructor(parent, name, record, options);
    };

    fieldRegistry.add(
        'crnd_section_and_note_text', CRNDSectionAndNoteFieldText);

});
