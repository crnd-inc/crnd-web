#  Copyright (c) 2019. Center of Research and Development
#  (https://crnd.pro) <info@crnd.pro>
#  See LICENSE file for licensing details.
{
    'name': 'CRnD Web Client',
    'version': '14.0.1.6.0',
    'summary': 'Web Client Extention',
    'category': 'Tools',
    'author': 'Center of Research and Development ',
    'website': 'https://crnd.pro',
    'license': 'OPL-1',

    'depends': [
        'bus',
        'web',
    ],
    'data': [
        'views/assets.xml',
    ],
    'installable': True,
    'images': ['static/description/banner.png'],
    'auto_install': False,
}
