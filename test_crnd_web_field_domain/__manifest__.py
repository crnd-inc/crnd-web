{
    'name': "Test CR&D Field Domain",
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '17.0.0.0.1',

    'depends': [
        'crnd_web_field_domain',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/test_field_domain.xml',

    ],
    'demo': [
        'demo/demo_test_map_view.xml',
    ],

    'installable': True,
    'images': ['static/description/banner.png'],
    'auto_install': False,
    'application': False,
}
