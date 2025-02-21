{
    'name': 'CRnD Web Diagram Plus',
    'category': 'Technical Settings',
    'summary': """
        Odoo Web Diagram view by CRnD.
    """,
    'author': 'Center of Research and Development',
    'support': 'info@crnd.pro',
    'website': 'https://crnd.pro',
    'license': 'OPL-1',
    'version': '17.0.0.14.2',
    'depends': [
        'web',
    ],
    'assets': {
        'web.assets_backend': [
            'crnd_web_diagram_plus/static/src/scss/diagram_view.scss',
            'crnd_web_diagram_plus/static/lib/js/underscore-umd.js',
            'crnd_web_diagram_plus/static/lib/js/raphael-2.0.2/raphael.js',
            'crnd_web_diagram_plus/static/lib/js/vec2.js',
            'crnd_web_diagram_plus/static/lib/js/graph.js',
            'crnd_web_diagram_plus/static/src/js/diagram_arch_parser.js',
            'crnd_web_diagram_plus/static/src/js/diagram_model.js',
            'crnd_web_diagram_plus/static/src/js/diagram_controller.js',
            'crnd_web_diagram_plus/static/src/js/diagram_renderer.js',
            'crnd_web_diagram_plus/static/src/js/diagram_view.js',
            'crnd_web_diagram_plus/static/src/xml/base_diagram.xml',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
    'price': 50.0,
    'currency': 'EUR',
}
