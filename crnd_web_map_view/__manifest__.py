{
    'name': "CR&D Map View",
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'license': 'Other proprietary',
    'version': '13.0.0.1.1',

    'depends': [
        'base_geolocalize',
    ],
    'data': [
        'templates/assets.xml',
    ],
    'qweb': [
        'static/src/xml/map_view.xml',
    ],

    'installable': True,
    'auto_install': False,
    'application': False,
}
