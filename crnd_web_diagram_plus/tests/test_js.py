from odoo.tests import HttpCase, tagged


@tagged('post_install')
@tagged('-at_install')
class TestJS(HttpCase):

    def test_01_js(self):
        self.phantom_js(
            '/web/tests?module=DiagramPlus', "", "", login='admin')
