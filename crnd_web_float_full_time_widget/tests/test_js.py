import odoo.tests


class TestJS(odoo.tests.HttpCase):

    post_install = True
    at_install = False

    # Temporarily disable QUnit tests
    # def test_01_js(self):
    #     self.phantom_js(
    #         '/web/tests?module=crnd_web_float_full_time_widget',
    #         "", "", login='admin', timeout=1800)
