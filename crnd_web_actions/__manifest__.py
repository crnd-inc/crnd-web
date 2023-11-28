{
    'name': 'CRND web actions',
    'version': '17.0.0.4.0',
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
            'crnd_web_actions/static/src/js/*.js',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
