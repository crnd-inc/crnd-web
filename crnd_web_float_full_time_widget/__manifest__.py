# flake8: noqa: E501
{
    "name": "CRND Web Float Full Time Widget",
    "version": "15.0.0.5.0",
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
        'web.assets_backend': [
            'crnd_web_float_full_time_widget/static/src/js/float_full_time_widget.js',
        ],
        'web.qunit_suite_tests': [
            'crnd_web_float_full_time_widget/static/tests/float_full_time_widget_tests.js',
        ],
    },
    'images': ['static/description/banner.gif'],
    'installable': True,
    'auto_install': False,
}
