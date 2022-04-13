{
    "name": "CRND Web Float Full Time Widget",
    "version": "14.0.0.2.0",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Float Time Duration Widget',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'web',
    ],
    'data': [
    ],
    'assets': {
        'web.assets_qweb': [
            'crnd_web_float_full_time_widget'
            '/static/tests/float_full_time_widget_tests.js',
        ],
        'web.assets_backend': [
            'crnd_web_float_full_time_widget'
            '/static/src/js/float_full_time_widget.js',
        ],
    },
    'images': ['static/description/banner.gif'],
    'installable': True,
    'auto_install': False,
}
