# -*- coding: utf-8 -*-
from odoo import fields, models


class IrUiView(models.Model):
    """Extend ir.ui.view to tag auto-generated builder views."""

    _inherit = 'ir.ui.view'

    yodoo_template_id = fields.Char(
        string='Yodoo Template ID',
        index=True,
        help='Set by yodoo_timeline_builder to identify auto-generated views.',
    )
