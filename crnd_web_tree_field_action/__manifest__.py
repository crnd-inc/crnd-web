{
    'name': 'CRND web tree field action',
    'version': '14.0.0.4.0',
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
        'web.assets_qweb': [
            'crnd_web_tree_field_action/static/tests/list_tests.js',
        ],
        'web.assets_backend': [
            'crnd_web_tree_field_action/static/src/js/list_renderer.js',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
