{
    'name': 'CRND web on create action',
    'version': '15.0.0.5.0',
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'summary': "Make it possible to use wizards to create records",
    'license': 'LGPL-3',
    'category': 'Technical Settings',

    'depends': [
        'web',
    ],
    'data': [],
    'demo': [],
    'assets': {
        'web.assets_backend': [
            'crnd_web_on_create_action/static/src/js/*.js',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
