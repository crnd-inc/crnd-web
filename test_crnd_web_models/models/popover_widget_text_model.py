from odoo import models, fields


class PopoverWidgetTextModel(models.Model):
    _name = 'popover.widget.text.model'
    _description = 'Popover Widget Text Model'

    name = fields.Char(required=True)
    text_field_simple = fields.Text(
        help="Text field no widgets.")
    text_popover_widget = fields.Text(
        help="Text field with text popover widget.")
