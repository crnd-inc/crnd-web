from odoo import models, fields, api


class FloatTimeDurationWidget(models.Model):
    _name = 'float.time.duration.widget'

    time_1 = fields.Float()
    time_2 = fields.Float()
    time_3 = fields.Float()
    time_4 = fields.Float()
