from odoo import models


class IrActionsReadonly(models.Model):
    _name = 'ir.actions.readonly'
    _inherit = 'ir.actions.actions'
