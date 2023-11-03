{
    "name": "CRND Web List Popover Widget",
    "version": "13.0.0.9.0",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Tooltips message for text fields on tree view.',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'web',
    ],
    'data': [
        'views/assets_backend.xml',
    ],
    'qweb': [
        "static/src/xml/popover_templates.xml",
    ],
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
