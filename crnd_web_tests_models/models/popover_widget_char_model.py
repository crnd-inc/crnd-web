from odoo import models, fields


class PopoverWidgetCharModel(models.Model):
    _name = 'popover.widget.char.model'
    _description = 'Popover Widget Char Model'

    name = fields.Char(required=True)
    char_field_simple = fields.Char(
        help="Char field no widgets.")
    char_popover_widget_html = fields.Text(
        help="Char field with popover widget sets allow HTML.")
    char_popover_widget_no_html = fields.Text(
        help="Char field with popover widget sets no allow HTML.")
    char_standard_html_widget = fields.Text(
        help="Char field with standard html widget.")
