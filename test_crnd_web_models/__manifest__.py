{
    "name": "Test CRND Web Models",
    "version": "19.0.0.15.4",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Module for testing web addons.',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'crnd_web_m2o_info_widget',
        'crnd_web_tree_colored_field',
        'crnd_web_on_create_action',
        'generic_mixin',
    ],
    'demo': [
        'demo/m2o_info_widget.xml',
        'demo/tree_colored_field.xml',
    ],
    'assets': {
        'web.assets_tests': [
            'test_crnd_web_models/static/src/js/tours/*.js'
        ]
    },
    'data': [
        'security/ir.model.access.csv',
        'views/menu.xml',
        'views/m2o_info_widget.xml',
        'views/tree_colored_field.xml',
        'views/test_crnd_web_model_book.xml',
        'wizard/book_wizard_create.xml',
    ],
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
