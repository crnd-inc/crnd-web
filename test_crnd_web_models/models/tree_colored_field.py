from odoo import models, fields, api

L_BROWN_BG_COLOR = 'rgba(224,223,130,1)'
L_GREEN_BG_COLOR = 'rgba(146,210,161,1)'
L_BLUE_BG_COLOR = 'rgba(139,208,219,1)'

DARK_LABEL_COLOR = 'rgba(70,70,70,1)'
WHITE_LABEL_COLOR = 'rgba(255,255,255,1)'


class TreeColoredField(models.Model):
    _name = 'tree.colored.field'
    _description = 'Tree Colored Field'

    name = fields.Char(
        required=True, help='Color demonstration field')

    bg_color = fields.Selection(
        [('l_brown_bg', 'Light Brown'),
         ('l_green_bg', 'Light Green'),
         ('l_blue_bg', 'Light Blue')], default='l_brown_bg',
        required=True,
        help='The field on the basis of which'
             'the background color of other fields')

    label_color = fields.Selection(
        [('dark', 'Dark'),
         ('white', 'White')], default='dark',
        required=True,
        help='The field on the basis of which the label color of other fields')

    line_bg_color = fields.Char(
        compute='_compute_state_color', string='Backgroung Color')
    line_label_color = fields.Char(
        compute='_compute_state_color')

    # expression test fields
    field_colorized_by_state_expression = fields.Char(
        required=True,
        help='Field, colorized by expression')
    label_state = fields.Selection(
        [('ok', 'Ok'),
         ('warning', 'Warning'),
         ('fail', 'Fail')], default='ok',
        required=True,
        help='This field defines color of label '
             '"field_colorized_by_state_expression" field')
    bg_state = fields.Selection(
        [('ok', 'Ok'),
         ('warning', 'Warning'),
         ('fail', 'Fail')], default='fail',
        required=True,
        help='This field defines background color of cell '
             '"field_colorized_by_state_expression" field')
    @api.depends('bg_color', 'label_color')
    def _compute_state_color(self):
        """
            This method shows an example of how to specify the colors
            of each field.
        """
        for rec in self:
            if rec.bg_color == 'l_brown_bg':
                rec.line_bg_color = L_BROWN_BG_COLOR
            elif rec.bg_color == 'l_green_bg':
                rec.line_bg_color = L_GREEN_BG_COLOR
            elif rec.bg_color == 'l_blue_bg':
                rec.line_bg_color = L_BLUE_BG_COLOR

            if rec.label_color == 'dark':
                rec.line_label_color = DARK_LABEL_COLOR
            if rec.label_color == 'white':
                rec.line_label_color = WHITE_LABEL_COLOR
