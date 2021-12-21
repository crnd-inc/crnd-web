from odoo import models, fields, api


class FloatFullTimeWidget(models.Model):
    _name = 'float.full.time.widget'

    time_1 = fields.Float()
    time_2 = fields.Float()
