# -*- coding: utf-8 -*-
from odoo import fields, models


class IrUiMenu(models.Model):
    """Extend ir.ui.menu to tag auto-generated builder menu items."""

    _inherit = 'ir.ui.menu'

    yodoo_template_id = fields.Char(
        string='Yodoo Template ID',
        index=True,
        help='Set by yodoo_timeline_builder to identify auto-generated menus.',
    )
