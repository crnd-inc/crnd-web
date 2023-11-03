{
    'name': "Test CR&D Map View Contacts",
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '15.0.0.3.1',

    'depends': [
        'contacts',
        'crnd_web_map_view',
    ],
    'data': [
        'views/contact_views.xml',
    ],

    'installable': True,
    'images': ['static/description/banner.png'],
    'auto_install': False,
    'application': False,
}
