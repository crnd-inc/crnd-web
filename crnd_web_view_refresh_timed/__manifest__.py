{
    'name': 'CRND web view refresh timed',
    'version': '15.0.0.2.0',
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
    'assets': {
        'web.assets_backend': [
            'crnd_web_view_refresh_timed/static/src/js/abstract_view.js',
            'crnd_web_view_refresh_timed/static/src/js/abstract_controller.js',
        ],
    },
    'demo': [],
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
