from odoo import models, fields


class M2oInfoWidget(models.Model):
    _name = 'm2o.info.widget'
    _description = 'M2o Info Widget'

    name = fields.Char(required=True)

    partner_id = fields.Many2one(
        'res.partner', index=True, required=False,
        ondelete='restrict', tracking=True)
    widget_partner_id = fields.Many2one(
        'res.partner', index=True, required=False,
        ondelete='restrict', tracking=True)
