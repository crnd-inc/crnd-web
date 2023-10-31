{
    'name': 'Many2One Info Widget',
    'category': '',
    'summary': 'Many2One Info Widget',
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '12.0.0.0.0',

    'depends': [
        'web',
    ],
    'data': [
        'templates/templates.xml',
    ],
    'qweb': [
        'static/src/xml/popover_template.xml',
    ],

    'installable': True,
    'images': ['static/description/banner.png'],
    'application': False,
    'auto_install': False,
}
