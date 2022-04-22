{
    'name': 'Many2One Info Widget',
    'category': '',
    'summary': 'Many2One Info Widget',
    'author': "Center of Research and Development",
    'website': "https://crnd.pro",
    'license': 'LGPL-3',
    'version': '15.0.0.6.0',

    'depends': [
        'web',
    ],
    'assets': {
        'web.assets_qweb': [
            'crnd_web_m2o_info_widget/static/src/xml/popover_template.xml',
        ],
        'web.assets_backend': [
            'crnd_web_m2o_info_widget/static/src/scss/m2o_info_widget.scss',

            'crnd_web_m2o_info_widget/static/src/js/form_renderer.js',
            'crnd_web_m2o_info_widget/static/src/js/m2o_info_widget.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
