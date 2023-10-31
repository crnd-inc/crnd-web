{
    'name': "CR&D Map View",
    'summary': (
        "This technical module provides view that allows to display "
        "objects on the map"),
    'author': "Center of Research and Development",
    'support': 'info@crnd.pro',
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '13.0.0.3.0',

    'depends': [
        'base_geolocalize',
        'web',
        'base',
    ],
    'data': [
        'templates/assets.xml',
    ],
    'qweb': [
        'static/src/xml/map_view.xml',
    ],

    'installable': True,
    'images': ['static/description/banner.png'],
    'auto_install': False,
    'application': False,
}
