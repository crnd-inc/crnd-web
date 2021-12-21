import odoo.tests


class TestJS(odoo.tests.HttpCase):

    post_install = True
    at_install = False

    def test_01_js(self):
        self.browser_js(
            '/web/tests?module=crnd_web_float_full_time_widget',
            "", "", login='admin', timeout=1800)
