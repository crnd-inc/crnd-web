# flake8: noqa: E501
{
<<<<<<< HEAD:crnd_web_list_tooltip/__manifest__.py
    "name": "CRND Web List Tooltip",
    "version": "16.0.0.1.1",
=======
    "name": "CRND Web Button Box Fullwidth",
    "version": "15.0.0.6.0",
>>>>>>> origin/15.0:crnd_web_button_box_full_width/__manifest__.py
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
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
