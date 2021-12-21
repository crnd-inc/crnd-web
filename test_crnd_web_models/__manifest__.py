{
    "name": "Test CRND Web Models",
    "version": "12.0.0.3.0",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Module for testing web addons.',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'crnd_web_list_popover_widget',
        'crnd_web_float_full_time_widget',
    ],
    'demo': [
        'demo/popover_widget.xml',
        'demo/float_full_time_widget.xml',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/popover_widget_text_model.xml',
        'views/popover_widget_html_model.xml',
        'views/popover_widget_char_model.xml',
        'views/popover_widget.xml',
        'views/float_full_time_widget.xml',
    ],
    'images': [],
    'installable': True,
    'auto_install': False,
}
