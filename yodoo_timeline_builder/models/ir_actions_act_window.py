# -*- coding: utf-8 -*-
from odoo import fields, models


class IrActionsActWindow(models.Model):
    """Extend ir.actions.act_window to tag auto-generated builder actions."""

    _inherit = 'ir.actions.act_window'

    yodoo_template_id = fields.Char(
        string='Yodoo Template ID',
        index=True,
        help='Set by yodoo_timeline_builder to identify auto-generated actions.',
    )
