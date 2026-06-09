{
    'name': 'Yodoo Plan View - Test',
    'category': 'Real Estate',
    'summary': 'Test module for Yodoo Plan View with Floor and Room models',
    'author': 'Center of Research and Development',
    'website': 'https://crnd.pro',
    'license': 'OPL-1',
    'version': '18.0.0.1.0',
    'depends': [
        'yodoo_plan_view',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/floor_views.xml',
        'views/room_views.xml',
        'demo/floor_demo.xml',
    ],
    'demo': [
        'demo/floor_demo.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
}
