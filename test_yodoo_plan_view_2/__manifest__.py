{
    'name': 'Test Plan View 2 - Cinema',
    'version': '18.0.1.0.0',
    'category': 'Technical',
    'summary': 'Test module for Plan View with Cinema models',
    'author': 'Center of Research and Development',
    'website': 'https://crnd.pro',
    'license': 'LGPL-3',
    'depends': [
        'yodoo_plan_view',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/cinema_hall_views.xml',
        'views/cinema_seat_views.xml',
        'views/cinema_session_views.xml',
        'views/cinema_booking_views.xml',
        'views/menu.xml',
    ],
    'demo': [
        'demo/cinema_demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
        ],
    },
    'installable': True,
    'auto_install': False,
}
