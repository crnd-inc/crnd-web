{
    "name": 'CRND Web Widget Scan QR-Code',
    'version': "14.0.0.3.0",
    'author': 'Center of Research and Development',
    'website': 'https://crnd.pro',
    'summary': 'Scan QR-Code Widget',
    'license': 'LGPL-3',
    'depends': [
        'web',
    ],
    'data': [
        'views/assets_backend.xml',
    ],
    'qweb': [
        'static/src/xml/qr_code_scanner_widget.xml'
    ],
    'installable': True,
    'images': ['static/description/banner.png'],
    'auto_install': False,
}
