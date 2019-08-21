from odoo import models, fields


class PopoverWidgetHtmlModel(models.Model):
    _name = 'popover.widget.html.model'
    _description = 'Popover Widget HTML Model'

    name = fields.Char(required=True)
    html_field_simple = fields.Html(
        help="HTML field no widgets.")
    html_popover_widget_html = fields.Html(
        help="HTML field with html popover widget sets allow HTML.")
    html_popover_widget_no_html = fields.Html(
        help="HTML field with html popover widget sets no allow HTML.")
