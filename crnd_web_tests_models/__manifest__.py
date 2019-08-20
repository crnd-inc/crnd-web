{
    "name": "CRND Web Test Model",
    "version": "11.0.0.0.1",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Module for testing web addons.',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'crnd_web_list_popover_widget',
    ],
    'demo': [
        'demo/popover_widget.xml',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/popover_widget_text_model.xml',
        'views/popover_widget_html_model.xml',
        'views/popover_widget_char_model.xml',
        'views/popover_widget.xml',
    ],
    'images': [],
    'installable': True,
    'auto_install': False,
}
