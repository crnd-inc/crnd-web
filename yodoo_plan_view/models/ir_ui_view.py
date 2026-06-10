from odoo import fields, models


class View(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(
        selection_add=[('plan', 'Plan')],
        ondelete={'plan': 'cascade'}
    )

    def _get_view_info(self):
        """Register plan view type with icon"""
        res = super()._get_view_info()  # pylint: disable=no-member
        res.update({'plan': {'icon': 'fa fa-map'}})
        return res
