# -*- coding: utf-8 -*-
{
    'name': 'Yodoo Timeline Builder',
    'version': '18.0.1.1.0',
    'category': 'Reporting',
    'summary': 'Build dynamic Timeline / Gantt views for any Odoo model',
    'author': 'CRND',
    'depends': ['web', 'yodoo_time_view'],
    'data': [
        'security/yodoo_timeline_builder_groups.xml',
        'security/ir.model.access.csv',
        'views/timeline_template_views.xml',
        'views/menus.xml',
    ],
    'application': True,
    'license': 'OPL-1',
}
