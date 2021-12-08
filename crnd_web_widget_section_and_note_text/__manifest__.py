# flake8: noqa: E501
{
    "name": "CRND Web Widget Section And Note Text",
    "version": "15.0.0.0.1",
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
    'assets': {
        'web.assets_backend': [
            'crnd_web_widget_section_and_note_text/static/src/js/crnd_web_section_and_note_text.js',
        ],
    },
    'installable': True,
    'auto_install': False,
}
