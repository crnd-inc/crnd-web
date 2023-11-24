# flake8: noqa: E501
{
    'name': 'CRND web tree field action',
    'version': '15.0.0.8.0',
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'summary': """""",
    'license': 'LGPL-3',
    'category': 'Technical Settings',

    'depends': [
        'web',
    ],
    'data': [
    ],
    'demo': [],
    'assets': {
        'web.assets_backend': [
            'crnd_web_tree_field_action/static/src/js/list_renderer.js',
        ],
        'web.qunit_suite_tests': [
            'crnd_web_tree_field_action/static/tests/list_tests.js',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': False,
    'auto_install': False,
}
