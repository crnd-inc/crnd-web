{
    'name': 'CRnD Web Diagram Plus',
    'category': 'Hidden',
    'summary': """
        Odoo Web Diagram view by CRnD.
    """,
    'author': "Center of Research and Development",
    'support': 
    'website': "https://crnd.pro",
    'version': '11.0.0.0.4',
    'depends': ['web'],
    'data': [
        'views/web_diagram_plus_templates.xml',
    ],
    'qweb': [
        'static/src/xml/*.xml',
    ],
    'auto_install': False,
    'license': 'LGPL-3',
    'support': 'info@crnd.pro',
}
