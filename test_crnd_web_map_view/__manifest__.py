{
    'name': "Test CR&D Map View",
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '14.0.0.3.0',

    'depends': [
        'crnd_web_map_view',
    ],
    'data': [
        'security/ir.model.access.csv',
        'wizard/test_map_wizard.xml',
        'views/test_map_views.xml',

    ],
    'demo': [
        'demo/demo_test_map_view.xml',
    ],

    'installable': True,
    'images': ['static/description/banner.png'],
    'auto_install': False,
    'application': False,
}
