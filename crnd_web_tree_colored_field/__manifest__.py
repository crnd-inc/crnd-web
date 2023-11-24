# flake8: noqa: E501
{
    'name': 'CRND web tree colored field',
    'version': '15.0.0.8.0',
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'summary': """""",
    'license': 'LGPL-3',
    'category': 'Technical Settings',

    'depends': [
        'web',
    ],
    'assets': {
        'web.assets_backend': [
            'crnd_web_tree_colored_field'
            '/static/src/js/crnd_web_tree_colored_field.js',
        ],
    },
    'demo': [],
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
