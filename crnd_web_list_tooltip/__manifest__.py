# flake8: noqa: E501
{
    "name": "CRND Web List Tooltip",
    "version": "16.0.0.1.0",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'List view tooltips improvements.',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'web',
    ],
    'assets': {
        'web.assets_backend': [
            'crnd_web_list_tooltip/static/src/*.js',
            'crnd_web_list_tooltip/static/src/*.xml',
        ],
    },
    'images': [],
    'installable': True,
    'auto_install': False,
}
