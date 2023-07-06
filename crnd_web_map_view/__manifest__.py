{
    'name': "CR&D Map View",
    'summary': (
        "This technical module provides view that allows to display "
        "objects on the map"),
    'author': "Center of Research and Development",
    'support': 'info@crnd.pro',
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '15.0.0.2.0',

    'depends': [
        'base_geolocalize',
        'web',
        'base',
    ],
    'data': [
    ],
    'assets': {
        'web.assets_qweb': [
            'crnd_web_map_view/static/src/xml/map_view.xml',
        ],
        'web.assets_backend': [
            'crnd_web_map_view/static/src/scss/map_view.scss',

            'crnd_web_map_view/static/src/js/map_view.js',
            'crnd_web_map_view/static/src/js/map_model.js',
            'crnd_web_map_view/static/src/js/map_controller.js',
            'crnd_web_map_view/static/src/js/map_renderer.js',
        ],
    },

    'installable': True,
    'auto_install': False,
    'application': False,
}
