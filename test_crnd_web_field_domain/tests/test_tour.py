from odoo.tests.common import tagged
from odoo.addons.generic_mixin.tests.common import WebTourCase


@tagged('post_install', '-at_install')
class TestCrndWebFieldDomain(WebTourCase):

    def test_simply_field_domain(self):
        self.run_js_tour(
            start_url='/web',
            tour_name='test_crnd_web_field_domain_simply_domain_tour',
            login='admin')

    def test_context_eval_field_domain(self):
        self.run_js_tour(
            start_url='/web',
            tour_name='test_crnd_web_field_domain_context_eval_domain_tour',
            login='admin')
