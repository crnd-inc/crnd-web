{
    'name': "CRND Web Widget Select Geolocation",
    'summary': (
        "CRND Web Widget Select Geolocation"),
    'author': "Center of Research and Development",
    'support': 'info@crnd.pro',
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '14.0.0.1.3',

    'depends': [
        'base_geolocalize',
        'web',
        'base',
    ],
    'data': [
        'templates/assets.xml',
    ],
    'qweb': [
        'static/src/xml/widget_select_geolocation.xml',
    ],

    'installable': True,
    'auto_install': False,
    'application': False,
}
