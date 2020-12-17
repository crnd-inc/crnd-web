from odoo.tests import HttpCase, tagged

try:
    import websocket
except ImportError:
    # chrome headless tests will be skipped
    websocket = None


@tagged('post_install')
@tagged('-at_install')
class TestJS(HttpCase):

    def test_01_js(self):
        self.browser_js(
            '/web/tests?module=DiagramPlus', "", "", login='admin')
