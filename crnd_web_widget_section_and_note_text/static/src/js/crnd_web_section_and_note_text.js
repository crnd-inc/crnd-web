/** @odoo-module **/

import fieldRegistry from 'web.field_registry';
import { FieldChar } from 'web.basic_fields';
import CRNDListFieldText from 'crnd_web_list_popover_widget.DynamicTextPopover';

// This is a merge between a CRNDListFieldText and a CRNDFieldChar.
// We want a FieldChar for section,
// and a CRNDListFieldText for the rest (product and note).
var CRNDSectionAndNoteFieldText = function (parent, name, record, options) {
    var isSection = record.data.display_type === 'line_section';
    var Constructor = isSection ? FieldChar : CRNDListFieldText;
    return new Constructor(parent, name, record, options);
};

fieldRegistry.add('crnd_section_and_note_text', CRNDSectionAndNoteFieldText);
