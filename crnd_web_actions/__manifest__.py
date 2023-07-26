{
    'name': 'CRND web actions',
    'version': '15.0.0.3.0',
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
            'crnd_web_actions/static/src/js/basic_controller.js',
            'crnd_web_actions/static/src/js/client_action.js',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
