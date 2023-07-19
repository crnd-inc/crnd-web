{
    'name': 'Test Crnd Web Field Domain',
    'version': '12.0.0.1.0',
    'summary': 'The module to test Crnd Web Field Domain',
    'author': 'Center of Research and Development',
    'website': 'https://crnd.pro',
    'license': 'LGPL-3',
    'category': 'Technical Settings',
    'depends': [
        'crnd_web_field_domain'
    ],
    'data': [
        'security/ir.model.access.csv',

        'views/car_rental.xml',
        'views/car_rental_brand.xml',
        'views/car_rental_car.xml',
        'views/car_rental_model.xml',
        'views/car_rental_transmission.xml',
        'views/car_rental_fuel_type.xml',
    ],
    'demo': [
        'demo/demo_car_rental.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
}
