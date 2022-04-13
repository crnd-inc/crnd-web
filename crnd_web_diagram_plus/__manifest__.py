{
    'name': 'CRnD Web Diagram Plus',
    'category': 'Technical Settings',
    'summary': """
        Odoo Web Diagram view by CRnD.
    """,
    'author': 'Center of Research and Development',
    'support': 'info@crnd.pro',
    'website': 'https://crnd.pro',
    'license': 'LGPL-3',
    'version': '14.0.0.5.0',
    'depends': [
        'web',
    ],
    'data': [
        'views/web_diagram_plus_templates.xml',
    ],
    'qweb': [
        'static/src/xml/*.xml',
    ],
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
