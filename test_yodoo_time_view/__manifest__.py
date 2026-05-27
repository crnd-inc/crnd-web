# -*- coding: utf-8 -*-
{
    'name': 'Yodoo Time View Test',
    'version': '18.0.0.1.1',
    'summary': 'Test data for Yodoo Time View',
    'category': 'Tools',
    'license': 'LGPL-3',
    'author': 'Center of Research and Development',
    'depends': [
        'base',
        'yodoo_time_view',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/yodoo_time_record_views.xml',
        'views/yodoo_time_record_timeline_views.xml',
        'views/yodoo_time_record_gantt_views.xml',
    ],
    'demo': [
        'data/yodoo_time_record_demo.xml',
        'data/yodoo_time_record_background_demo.xml',
        'data/yodoo_time_record_markers_demo.xml',
    ],
}
