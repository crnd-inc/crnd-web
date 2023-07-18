{
    "name": "Test CRND Web Image Popup Widget",
    "version": "16.0.0.1.1",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Allows you to test `crnd_web_widget_popup_image` module. '
               'Go to Contacts -> Tree/Form view',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'contacts',
        'crnd_web_widget_popup_image',
    ],
    'data': [
        'views/res_partner.xml',
    ],
    'assets': {},
    'images': [],
    'installable': True,
    'auto_install': False,
}
