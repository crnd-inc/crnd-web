{
    'name': 'CRND web action reload',
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
        'security/ir.model.access.csv',
    ],
    'demo': [],
    'assets': {
        'web.assets_backend': [
            'crnd_web_action_reload/static/src/js/action_manager.js',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
