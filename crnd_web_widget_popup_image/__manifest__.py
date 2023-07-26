{
    "name": "CRND Web Image Popup Widget",
    "version": "15.0.0.2.0",
    "author": "Center of Research and Development",
    "website": "https://crnd.pro",
    'summary': 'Popup images from the binary fields',
    "license": "LGPL-3",
    'category': 'Technical Settings',
    'depends': [
        'web',
    ],
    'data': [
    ],
    'assets': {
        'web.assets_backend': [
            'crnd_web_widget_popup_image'
            '/static/lib/magnific_popup/magnific-popup.css',
            'crnd_web_widget_popup_image'
            '/static/lib/magnific_popup/jquery.magnific-popup.min.js',
            'crnd_web_widget_popup_image'
            '/static/src/less/image_on_treeview.less',
            'crnd_web_widget_popup_image'
            '/static/src/js/image_popup.js',
        ],
    },
    'images': ['static/description/banner.gif'],
    'installable': True,
    'auto_install': False,
}
