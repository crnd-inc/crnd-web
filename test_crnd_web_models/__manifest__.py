{
    "name": "Test CRND Web Models",
    "version": "17.0.0.15.1",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Module for testing web addons.',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        # 'crnd_web_diagram_plus',
        # 'crnd_web_float_full_time_widget',
        # 'crnd_web_m2o_info_widget',
        # 'crnd_web_tree_colored_field',
        'crnd_web_on_create_action',
        # 'crnd_web_actions',
        # 'generic_mixin',
        'crnd_web_field_domain',
    ],
    'demo': [
        # 'demo/float_full_time_widget.xml',
        # 'demo/m2o_info_widget.xml',
        # 'demo/tree_colored_field.xml',
        # 'demo/web_diagram_plus.xml',
        'demo/crnd_web_field_domain.xml',
    ],
    'assets': {
        'web.assets_tests': [
            'test_crnd_web_models/static/src/js/tours/*.js'
        ]
    },
    'data': [
        'security/ir.model.access.csv',
        'views/menu.xml',
        # 'views/m2o_info_widget.xml',
        # 'views/float_full_time_widget.xml',
        # 'views/tree_colored_field.xml',
        # 'views/web_diagram_plus.xml',
        # 'views/web_diagram_plus_arrow.xml',
        # 'views/web_diagram_plus_node.xml',
        'views/test_crnd_web_model_book.xml',
        # 'views/test_crnd_web_actions.xml',
        'views/test_crnd_web_field_domain.xml',
        'wizard/book_wizard_create.xml',
    ],
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
