{
    'name': 'CRnD Web Diagram Plus',
    'category': 'Hidden',
    'summary': """
        Odoo Web Diagram view by CRnD.
    """,
    'author': 'Center of Research and Development',
    'support': 'info@crnd.pro',
    'website': 'https://crnd.pro',
    'license': 'LGPL-3',
    'version': '11.0.0.0.5',
    'depends': ['web'],
    'data': [
        'views/web_diagram_plus_templates.xml',
    ],
    'qweb': [
        'static/src/xml/*.xml',
    ],
    'auto_install': False,
}
