{
    'name': 'Many2One Info Widget',
    'category': '',
    'summary': 'Many2One Info Widget',
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '18.0.0.11.1',

    'depends': [
        'web',
    ],
    'assets': {
        'web.assets_backend': [
            'crnd_web_m2o_info_widget/static/src/scss/m2o_info_widget.scss',
            'crnd_web_m2o_info_widget/static/src/xml/popover_template.xml',
            'crnd_web_m2o_info_widget/static/src/js/m2o_info_widget.js',
        ],
    },
    'installable': True,
    'images': ['static/description/banner.png'],
    'application': False,
    'auto_install': False,
}
