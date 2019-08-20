from odoo import models, fields


class PopoverWidgetTextModel(models.Model):
    _name = 'popover.widget.text.model'
    _description = 'Popover Widget Text Model'

    name = fields.Char(required=True)
    text_field_simple = fields.Text(
        help="Text field no widgets.")
    text_popover_widget_html = fields.Text(
        help="Text field with popover widget sets allow HTML.")
    text_popover_widget_no_html = fields.Text(
        help="Text field with popover widget sets no allow HTML.")
    text_standard_html_widget = fields.Text(
        help="Text field with standard html widget.")
