{
    'name': 'CRnD Web Diagram Plus',
    'category': 'Hidden',
    'summary': """
        Odoo Web Diagram view by CRnD.
    """,
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'version': '11.0.0.0.3',
    'depends': ['web'],
    'data': [
        'views/web_diagram_plus_templates.xml',
    ],
    'qweb': [
        'static/src/xml/*.xml',
    ],
    'auto_install': True,
    "license": "LGPL-3",
}
