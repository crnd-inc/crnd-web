from odoo import models


class IrActionsReadonly(models.Model):
    _name = 'ir.actions.view.editable'
    _inherit = 'ir.actions.actions'
