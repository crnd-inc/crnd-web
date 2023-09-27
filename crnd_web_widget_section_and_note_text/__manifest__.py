{
    "name": "CRND Web Widget Section And Note Text",
    "version": "13.0.0.0.2",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Makes the standard section_and_note_text widget compatible '
               'with CRND Web List Popover Widget.',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'web',
        'crnd_web_list_popover_widget',
        'account',
    ],
    'data': [
        'views/assets_backend.xml',
    ],
    'installable': True,
    'auto_install': False,
}
