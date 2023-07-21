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

    def test_xml_domain_assembly(self):
        # In the view 'car_rental.xml' for field 'car_id' there is a
        # following domain "[('name', 'ilike', 'City')]".
        # With the mentioned domain there are 3 records:
        # - CityUrbanGlide Hybrid (id=3);
        # - CityFamilyJourney (id=4);
        # - CityAdventureXplorer (id=5);
        # To test domain assembly, we add new domain
        # with car domain field, using id

        self.run_js_tour(
            start_url='/web',
            tour_name='test_crnd_web_field_domain_xml_assembly_domain_tour',
            login='admin')
