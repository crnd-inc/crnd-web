{
    'name': 'Test CR&D Web Diagram View',

    'summary': 'Demo for crnd_web_diagram_plus',

    'category': 'Tools',
    'author': "Center of Research and Development",
    'license': 'LGPL-3',

    'version': '17.0.0.1.0',

    'depends': [
        'base',
        'generic_mixin',
        'crnd_web_diagram_plus',
    ],

    'data': [
        'security/ir.model.access.csv',
        'views/development_development_views.xml',
        'views/development_stage_views.xml',
        'views/development_type_views.xml',
    ],

    'demo': [
        'demo/demo_development.xml',
    ],

    'assets': {},

    'installable': True,
    'auto_install': False,
    'application': False,
}
