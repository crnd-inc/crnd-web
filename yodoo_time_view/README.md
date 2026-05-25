# Yodoo Time View

Universal **Timeline** and **Gantt** views for Odoo 18, powered by [vis-timeline](https://visjs.github.io/vis-timeline/) (MIT).

Attach either view to any model in two steps: inherit a mixin and add an XML action.

---

## Features

| Feature | Description |
|---|---|
| **Timeline view** | Horizontal swimlane chart — each row is a record or group, bars are time intervals |
| **Gantt view** | Hierarchical tree chart with up to 3 nesting levels, suitable for tasks and projects |
| **Scale toolbar** | Day / Week / Month / Year buttons; Today pan button; Zoom In/Out |
| **Background layers** | Built-in: weekends, work hours, night. Custom periods from Python |
| **Time markers** | Built-in "Now" marker (auto-updates every 60 s). Custom markers from Python |
| **Color coding** | Per-record color via a `Char` field (HEX `#rrggbb` or CSS color name) |
| **Timestamp markers** | Diamond-shaped indicators on bars at exact datetime positions — zoom/scroll safe |
| **Segment coloring** | Bar split into colored segments at timestamp positions via CSS linear-gradient |
| **Grouping** | Standard Odoo `group_by` — up to 3 nested levels in Gantt, flat in Timeline |
| **Related events** | Display records from a different model as overlay items on the same chart |
| **Double-click** | Opens the record form in a dialog |
| **Diff updates** | vis DataSet is updated incrementally — no full re-render on data reload |
| **Range-aware bg** | Background periods generated only within the visible window ± 30 days, expand on scroll |

---

## Installation

Add `yodoo_time_view` to your module's `depends` list:

```python
# your_module/__manifest__.py
'depends': ['yodoo_time_view'],
```

---

## Quick Start

### Gantt view (tasks, projects, reservations)

Your model gets `datetime_start`, `datetime_stop`, `color`, and `progress` fields for free.

```python
# models/my_task.py
from odoo import fields, models

class MyTask(models.Model):
    _name = 'my.task'
    _inherit = ['gantt.mixin']

    name = fields.Char(required=True)
    # datetime_start, datetime_stop, color, progress — inherited from gantt.mixin
```

```xml
<!-- views/my_task_views.xml -->
<record id="view_my_task_gantt" model="ir.ui.view">
    <field name="name">my.task.gantt</field>
    <field name="model">my.task</field>
    <field name="arch" type="xml">
        <gantt date_start="datetime_start" date_stop="datetime_stop" color="color" />
    </field>
</record>

<record id="action_my_task_gantt" model="ir.actions.act_window">
    <field name="name">My Tasks — Gantt</field>
    <field name="res_model">my.task</field>
    <field name="view_mode">gantt,list,form</field>
</record>
```

### Timeline view (events, bookings, shifts)

```python
# models/my_event.py
from odoo import fields, models

class MyEvent(models.Model):
    _name = 'my.event'
    _inherit = ['timeline.mixin']

    name  = fields.Char(required=True)
    start = fields.Datetime(required=True)
    stop  = fields.Datetime()
    color = fields.Char(default='#3498db')
```

```xml
<record id="view_my_event_timeline" model="ir.ui.view">
    <field name="name">my.event.timeline</field>
    <field name="model">my.event</field>
    <field name="arch" type="xml">
        <timeline date_start="start" date_stop="stop" color="color" />
    </field>
</record>
```

### Both views on the same model

Inherit both mixins — fields come from `gantt.mixin` only once (MRO handles deduplication):

```python
class MyRecord(models.Model):
    _name = 'my.record'
    _inherit = ['gantt.mixin', 'timeline.mixin']

    name = fields.Char(required=True)
```

---

## Configuration via `_time_view_config`

Override `_time_view_config` on your model to control every aspect of the views.
The dict is merged in three layers: **global defaults → model config → per-view override**.

```python
_time_view_config = {

    # ── Events ───────────────────────────────────────────────────────────────
    'events': [
        {
            'key':         'main',
            'type':        'base',
            'source':      'self_fields',
            'start_field': 'datetime_start',
            'stop_field':  'datetime_stop',
            'color_field': 'color',

            # Timestamp markers — see "Timestamp Fields" section below
            'timestamp_fields': [],
        },
    ],

    # ── Form / view options ───────────────────────────────────────────────────
    'form': {
        'string':         'My View',
        'default_scale':  'week',
        'allowed_scales': ['day', 'week', 'month', 'year'],
        'default_group_by': None,
    },

    # ── Layers ───────────────────────────────────────────────────────────────
    'layers': {
        'toolbar': {
            'scales':     ['day', 'week', 'month', 'year'],
            'show_today': True,
            'show_zoom':  True,
        },
        'background': {
            'weekends':   False,
            'work_hours': False,
            'night':      False,
            'custom':     [],
        },
        'markers': {
            'current_time': True,
            'custom':       [],
        },

        # Controls how timestamp_fields are visualized — see below
        # 'timestamp_style': 'both',   # default

        # Per-view overrides — applied on top of the model-level layers config
        'per_view': {
            'gantt':    { 'timestamp_style': 'markers' },
            'timeline': { 'timestamp_style': 'segments' },
        },
    },
}
```

---

## Timestamp Fields

Timestamp fields mark specific datetime points within an event bar. They are rendered in
two complementary modes, controlled by `timestamp_style`.

### Declaring timestamp fields

Add `timestamp_fields` inside an event config:

```python
'events': [
    {
        'key':         'main',
        'type':        'base',
        'source':      'self_fields',
        'start_field': 'date_start',
        'stop_field':  'date_end',
        'timestamp_fields': [
            {
                'field':   'checkpoint_1',  # Datetime field on the model
                'name':    'Checkpoint 1',  # tooltip label
                'color':   'inherit',       # 'inherit' = derive from record color
                'lighten': 0.0,             # 0.0–1.0 — mix with white
                'darken':  0.0,             # 0.0–1.0 — mix with black
                'active':  True,            # shown by default
            },
            {
                'field':   'checkpoint_2',
                'name':    'Checkpoint 2',
                'color':   'inherit',
                'lighten': 0.35,
                'active':  True,
            },
            {
                'field':   'deadline',
                'name':    'Deadline',
                'color':   '#e74c3c',       # explicit color, ignores 'lighten'/'darken'
                'active':  True,
            },
        ],
    },
],
```

| Key | Type | Default | Description |
|---|---|---|---|
| `field` | `str` | required | Datetime field name on the model |
| `name` | `str` | field name | Label shown in tooltip |
| `color` | `str` | `'inherit'` | `'inherit'` — use record color; or explicit HEX/CSS |
| `lighten` | `float` | `0.0` | Mix color with white (0.0 = no change, 1.0 = pure white) |
| `darken` | `float` | `0.0` | Mix color with black (0.0 = no change, 1.0 = pure black) |
| `active` | `bool` | `True` | Shown on load; user can toggle in toolbar |

### `timestamp_style` — display mode

Controls how timestamp fields are visualized. Set at `layers` level or per-view in `layers.per_view`.

| Value | Description |
|---|---|
| `'markers'` | Diamond-shaped overlay indicators positioned at the exact datetime on the timeline X-axis. Position is recalculated on every zoom/scroll. |
| `'segments'` | The event bar is split into colored segments by the timestamp positions using CSS `linear-gradient`. Each segment takes the color of the preceding timestamp field. |
| `'both'` | Both markers and segment coloring are active simultaneously. |

**Default:** `'both'`

#### Setting globally for all views:

```python
'layers': {
    'timestamp_style': 'markers',  # all views show only markers
    ...
}
```

#### Setting per view type:

```python
'layers': {
    'per_view': {
        'gantt':    { 'timestamp_style': 'markers' },   # Gantt: diamonds
        'timeline': { 'timestamp_style': 'segments' },  # Timeline: colored bars
    },
}
```

#### Overriding in the view arch XML (wins over Python config):

```xml
<gantt date_start="date_start" date_stop="date_end"
       timestamp_style="both" />
```

### Segment coloring logic

Segments are defined by sorted timestamp positions within the bar:

```
|────────────────────────────────────────────────────|
  base color   | checkpoint_1 color | checkpoint_2 color
              ◆                    ◆
          checkpoint_1         checkpoint_2
```

- Segment before first timestamp → **base record color**
- Each subsequent segment → **color of the preceding timestamp field**

Timestamps outside `[date_start, date_end]` are ignored for segment boundaries.

### Color derivation with `'inherit'`

When `color: 'inherit'`, the timestamp color is derived from the record's base color:

```python
# Same hue as record, progressively lighter:
{'field': 'step_1', 'color': 'inherit', 'lighten': 0.0}   # = base color
{'field': 'step_2', 'color': 'inherit', 'lighten': 0.35}  # 35% mixed with white
{'field': 'step_3', 'color': 'inherit', 'lighten': 0.6}   # 60% mixed with white

# Darker variants:
{'field': 'step_1', 'color': 'inherit', 'darken': 0.2}    # 20% mixed with black
```

---

## Event Sources

### `source: 'self_fields'`

Reads date fields directly from the current model's records.

```python
{
    'key':         'interval',
    'type':        'base',
    'source':      'self_fields',
    'start_field': 'date_start',
    'stop_field':  'date_end',
    'color_field': 'color',
}
```

### `source: 'related'`

Fetches records from another model and overlays them on the chart.

```python
{
    'key':              'meetings',
    'source':           'related',
    'model':            'calendar.event',
    'domain':           [('partner_ids', 'in', '__partner_id__')],
    'domain_ref_field': 'partner_id',
    'start_field':      'start_datetime',
    'stop_field':       'stop_datetime',
    'type':             'base',
    'group_key':        'meetings',
}
```

---

## Custom Background Periods

```python
# In _time_view_config['layers']['background']['custom']:
{'key': 'lunch_break', 'label': 'Lunch Break', 'active': False}
```

```python
@api.model
def _get_custom_bg_items(self, key, view_type=None):
    if key == 'lunch_break':
        items = []
        for day in range(-60, 61):
            d = (datetime.today() + timedelta(days=day)).replace(
                hour=12, minute=0, second=0, microsecond=0)
            if d.weekday() < 5:
                items.append({
                    'start':     d.isoformat(),
                    'end':       d.replace(hour=13).isoformat(),
                    'className': 'o_vis_bg_lunch',
                })
        return items
    return []
```

---

## Custom Markers

```python
# In _time_view_config['layers']['markers']['custom']:
{'key': 'deadline', 'label': 'Deadline', 'active': True}
```

```python
@api.model
def _get_custom_mk_items(self, key, view_type=None):
    if key == 'deadline':
        return [{
            'id':        '__my_deadline__',
            'timestamp': self.env['my.config'].get_deadline().isoformat(),
            'label':     'Deadline',
            'color':     '#e74c3c',
            'className': 'o_vis_marker_deadline',
        }]
    return []
```

---

## Built-in Fields (from `gantt.mixin`)

| Field | Type | Description |
|---|---|---|
| `datetime_start` | `Datetime` | Start of the interval (required) |
| `datetime_stop` | `Datetime` | End of the interval (optional — point item if absent) |
| `color` | `Char` | Item color — HEX (`#3498db`) or CSS name (`red`) |
| `progress` | `Float` | Completion percentage 0–100 (Gantt only) |

If you use only `timeline.mixin` (without `gantt.mixin`), declare the date fields yourself.

---

## Toolbar Buttons

| Button | Behaviour |
|---|---|
| **Day / Week / Month / Year** | Snap the visible window to that scale |
| **Today** | Pan to the current time without changing zoom |
| **Zoom In / Out** | Shrink or expand the visible window by ~20% |
| **Weekends / Work Hours / Night** | Toggle the corresponding built-in background highlight |
| **Now** | Toggle the "current time" vertical marker |
| Custom layer buttons | Toggle any custom background or marker layer |

---

## CSS Classes

Define your own colors in your module's SCSS:

```scss
.vis-item.vis-background.o_vis_bg_lunch {
    background-color: rgba(241, 196, 15, 0.15);
}

.vis-custom-time.o_vis_marker_deadline {
    border-left-color: #e74c3c;
}
```

Built-in classes provided by `yodoo_time_view`:

| Class | Layer |
|---|---|
| `o_vis_bg_weekend` | Weekends background |
| `o_vis_bg_workhours` | Work hours background |
| `o_vis_bg_night` | Night background |
| `o_vis_related_item` | Items from `source: 'related'` |
| `o_ts_marker_item` | Timestamp marker overlay (diamond) |
| `yodoo-ts-marker-overlay` | Overlay container for timestamp markers |

---

## Architecture Overview

```
Model
 ├── gantt.mixin          ← fields: datetime_start/stop, color, progress
 │    └── time.view.base.mixin   ← get_views() injection, _time_view_config merge
 └── timeline.mixin
      └── time.view.base.mixin

JS (OWL + vis-timeline)
 ├── TimeBaseController     ← scale, zoom, data render, _getMarkerData, _buildSegmentStyle
 │    ├── GanttController   ← tree groups (3 levels), blank item content
 │    └── TimelineController ← flat groups, display_name as item content
 ├── YodooVisTimelineAdapter
 │    ├── vis.Timeline wrapper, diff DataSet updates
 │    └── setTsMarkers() + _updateTsMarkerOverlay()  ← overlay diamonds
 ├── BackgroundLayer        ← range-aware cache, auto-expands on scroll
 └── TimeMarkersLayer       ← "Now" marker, auto-refresh every 60 s

Timestamp rendering pipeline:
  _time_view_config.events[].timestamp_fields
    → _buildLayerState()      (JS state: eventLayers, timestampStyle)
    → _getMarkerData()        (collects {tsMs, color, label} per record)
    → _buildSegmentStyle()    (CSS gradient — only when style ≠ 'markers')
    → adapter.setTsMarkers()  (overlay — only when style ≠ 'segments')
    → _updateTsMarkerOverlay() on 'changed' event
       uses timeline.getWindow() + item.parent.top + item.top → px coords
```

---

## License

LGPL-3 (module code) · MIT (vis-timeline library)
