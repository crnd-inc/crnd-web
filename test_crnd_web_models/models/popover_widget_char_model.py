from odoo import models, fields


class PopoverWidgetCharModel(models.Model):
    _name = 'popover.widget.char.model'
    _description = 'Popover Widget Char Model'

    name = fields.Char(required=True)
    char_field_simple = fields.Char(
        help="Char field no widgets.")
    char_popover_widget = fields.Char(
        help="Char field with char popover widget.")
