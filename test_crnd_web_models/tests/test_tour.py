from odoo.tests.common import tagged
from odoo.addons.generic_mixin.tests.common import WebTourCase


@tagged('post_install', '-at_install')
class TestCrndWebModels(WebTourCase):

    def test_on_create_action(self):
        records_before = self.env['test.crnd.web.model.book'].search([])
        wizard_count_before = self.env['book.wizard.create'].search_count([])
        self.assertFalse(wizard_count_before)
        self.run_js_tour(
            start_url='/web',
            tour_name='test_crnd_web_models_on_create_action_tour',
            login='admin')
        new_record = self.env['test.crnd.web.model.book'].search(
            [('id', 'not in', records_before.ids)])
        wizard_count_after = self.env['book.wizard.create'].search_count([])
        self.assertEqual(wizard_count_after, 1)
        self.assertEqual(new_record.title, 'Lord of Rings')

    def test_crnd_web_actions(self):
        records_before = self.env['test.crnd.web.actions'].search([])
        self.run_js_tour(
            start_url='/web',
            tour_name='test_crnd_web_models_test_crnd_web_actions',
            login='admin')
        new_record = self.env['test.crnd.web.actions'].search(
            [('id', 'not in', records_before.ids)])
        self.assertEqual(new_record.title, 'Test Crnd Web Actions')

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
