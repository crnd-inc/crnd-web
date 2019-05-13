{
    'name': 'CRND Web Diagram Plus',
    'category': 'Hidden',
    'summary': """
        Odoo Web Diagram view from CRND.
    """,
    'author': "Center of Research & Development",
    'website': "https://crnd.pro",
    'version': '11.0.0.0.1',
    'depends': ['web'],
    'data': [
        'views/web_diagram_plus_templates.xml',
    ],
    'qweb': [
        'static/src/xml/*.xml',
    ],
    'auto_install': True,
    'license': 'Other proprietary',
}
