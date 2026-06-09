{
    'name': 'Yodoo Plan View',
    'category': 'Technical Settings',
    'summary': """
        Yodoo Plan View - Interactive Floor Plans
        ==========================================

        Advanced plan visualization for Odoo with:

        * Interactive floor plans with raster/vector backgrounds
        * Draw and edit polygons (rooms, zones)
        * Link polygons to Odoo records
        * Measure areas and distances
        * Zoom, pan, and grid controls
        * Scale calibration with ruler
        * Point "0" origin marker
        * Snap-to-grid functionality
            """,
    'author': 'Center of Research and Development',
    'website': 'https://crnd.pro',
    'license': 'OPL-1',
    'version': '18.0.0.1.0',
    'depends': [
        'web',
    ],
    'data': [
        'security/ir.model.access.csv',
        'data/plan_settings_data.xml',
        'views/plan_settings_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'yodoo_plan_view/static/src/xml/plan_templates.xml',
            'yodoo_plan_view/static/src/scss/plan_view.scss',
            'yodoo_plan_view/static/src/js/components/plan_toolbar.js',
            'yodoo_plan_view/static/src/js/components/plan_zoom.js',
            'yodoo_plan_view/static/src/js/components/plan_grid.js',
            'yodoo_plan_view/static/src/js/components/plan_polygon.js',
            'yodoo_plan_view/static/src/js/components/plan_ruler.js',
            'yodoo_plan_view/static/src/js/components/plan_canvas.js',
            'yodoo_plan_view/static/src/js/plan_arch_parser.js',
            'yodoo_plan_view/static/src/js/plan_model.js',
            'yodoo_plan_view/static/src/js/plan_label_mixin.js',
            'yodoo_plan_view/static/src/js/plan_renderer.js',
            'yodoo_plan_view/static/src/js/plan_controller.js',
            'yodoo_plan_view/static/src/js/plan_view.js',
        ],
    },
}
