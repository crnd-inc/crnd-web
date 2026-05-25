# -*- coding: utf-8 -*-
{
    'name': 'Yodoo Time View',
    'version': '18.0.0.1.0',
    'category': 'Web',
    'summary': 'Universal Timeline/Gantt views with background layers',
    'author': 'Center of Research and Development',
    'website': 'https://crnd.pro',
    'license': 'LGPL-3',
    'depends': ['web'],
    'data': [
        'views/templates.xml',
    ],
    'assets': {
        'web.assets_backend': [
            # External vis-timeline library (MIT license)
            'yodoo_time_view/static/lib/vis-timeline/vis-timeline-graph2d.js',
            'yodoo_time_view/static/lib/vis-timeline/vis-timeline-graph2d.css',

            # Core - Services
            'yodoo_time_view/static/src/core/services/vis_timeline_adapter.js',

            # Core - Components
            'yodoo_time_view/static/src/core/components/background_layer.js',
            'yodoo_time_view/static/src/core/components/time_markers_layer.js',

            # Core - Shared (Timeline + Gantt)
            'yodoo_time_view/static/src/core/time_arch_parser.js',
            'yodoo_time_view/static/src/core/time_renderer.js',
            'yodoo_time_view/static/src/core/time_base_controller.js',

            # Timeline View
            'yodoo_time_view/static/src/timeline/timeline_view.xml',
            'yodoo_time_view/static/src/timeline/timeline_controller.js',
            'yodoo_time_view/static/src/timeline/timeline_view.js',

            # Gantt View
            'yodoo_time_view/static/src/gantt/gantt_controller.js',
            'yodoo_time_view/static/src/gantt/gantt_view.xml',
            'yodoo_time_view/static/src/gantt/gantt_view.js',

            # Styles
            'yodoo_time_view/static/src/scss/yodoo_time_view.scss',
        ],
    },
}
