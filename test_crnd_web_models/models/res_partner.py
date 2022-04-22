from odoo import models
from odoo.addons.crnd_web_m2o_info_widget import helper_get_many2one_info_data


class ResPartner(models.Model):
    _inherit = 'res.partner'

    def test_helper_many2one_info(self):
        return helper_get_many2one_info_data(self, [
            'name', 'commercial_company_name', 'website',
            'email', 'phone', 'mobile'
        ])
