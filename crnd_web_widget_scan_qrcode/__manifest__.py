{
    "name": 'CRND Web Widget Scan QR-Code',
    'version': "16.0.0.2.0",
    'author': 'Center of Research and Development',
    'website': 'https://crnd.pro',
    'summary': 'Scan QR-Code Widget',
    'license': 'LGPL-3',
    'depends': [
        'web',
    ],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'crnd_web_widget_scan_qrcode/static/src/js/*.js',
            'crnd_web_widget_scan_qrcode/static/src/scss/*.scss',
        ],
        'web.assets_qweb': [
            'crnd_web_widget_scan_qrcode/static/src/xml/*.xml',
        ],
    },
    'installable': False,
    'auto_install': False,
}
