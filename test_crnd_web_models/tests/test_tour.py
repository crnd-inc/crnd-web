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
