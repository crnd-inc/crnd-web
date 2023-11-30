{
    'name': "CRND Web Widget Select Geolocation",
    'summary': (
        "CRND Web Widget Select Geolocation"),
    'author': "Center of Research and Development",
    'support': 'info@crnd.pro',
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '16.0.0.1.3',

    'depends': [
        'base_geolocalize',
        'web',
        'base',
    ],
    'assets': {
        'web.assets_backend': [
            'crnd_web_widget_select_geolocation/static/src/js/widget_select_geolocation_owl.js',
            'crnd_web_widget_select_geolocation/static/src/scss/*.scss',
            'crnd_web_widget_select_geolocation/static/src/xml/*.xml',
        ],
    },

    'installable': True,
    'auto_install': False,
    'application': False,
}
