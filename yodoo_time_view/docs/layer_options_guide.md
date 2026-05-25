# Layer Options Guide — yodoo_time_view

How to configure Gantt and Timeline toolbar, backgrounds, markers,
and timestamp field visualization via `_time_view_config['layers']`.

---

## Quick Start

```python
class MyModel(models.Model):
    _name = 'my.model'
    _inherit = ['gantt.mixin', 'timeline.mixin']

    _time_view_config = {
        'events': [...],
        'form': {...},
        'layers': {
            'toolbar': {
                'scales':     ['day', 'week', 'month', 'year'],
                'show_today': True,
                'show_zoom':  True,
            },
            'background': {
                'weekends':        False,   # active on load
                'work_hours':      False,
                'night':           False,
                'show_weekends':   True,    # show toggle button
                'show_work_hours': True,
                'show_night':      True,
                'custom': [],
            },
            'markers': {
                'current_time':      True,
                'show_current_time': True,
                'custom': [],
            },

            # Controls timestamp field visualization (see below)
            # 'timestamp_style': 'both',   # default

            'per_view': {
                'gantt':    { 'timestamp_style': 'markers' },
                'timeline': { 'timestamp_style': 'segments' },
            },
        },
    }
```

---

## All Available Parameters

### `layers.toolbar`

| Key | Type | Default | Description |
|---|---|---|---|
| `scales` | `list[str]` | `['day','week','month','year']` | Scale buttons. Allowed: `'day'`, `'week'`, `'month'`, `'year'` |
| `show_today` | `bool` | `True` | Show the **Today** button |
| `show_zoom` | `bool` | `True` | Show the **Zoom +/-** buttons |

---

### `layers.background`

| Key | Type | Default | Description |
|---|---|---|---|
| `weekends` | `bool` | `False` | Weekends highlight **active on load** |
| `work_hours` | `bool` | `False` | Work hours highlight **active on load** |
| `night` | `bool` | `False` | Night highlight **active on load** |
| `show_weekends` | `bool` | `True` | Show the Weekends toggle button |
| `show_work_hours` | `bool` | `True` | Show the Work hrs toggle button |
| `show_night` | `bool` | `True` | Show the Night toggle button |
| `work_hours_start` | `int` | `9` | Work hours start (hour, 0–23) |
| `work_hours_end` | `int` | `18` | Work hours end (hour, 0–23) |
| `work_hours_days` | `list[int]` | `[0,1,2,3,4]` | Workdays (0=Mon … 6=Sun) |
| `custom` | `list[dict]` | `[]` | Custom background layers |

#### Custom background layer dict

```python
{
    'key':    'my_layer',    # unique identifier
    'label':  'My Layer',   # toolbar button label
    'active': False,         # active on load
}
```

Implement `_get_custom_bg_items(key, view_type)` on the model to supply items.

---

### `layers.markers`

| Key | Type | Default | Description |
|---|---|---|---|
| `current_time` | `bool` | `True` | "Now" marker **active on load** |
| `show_current_time` | `bool` | `True` | Show the Now toggle button |
| `custom` | `list[dict]` | `[]` | Custom marker layers |

#### Custom marker layer dict

```python
{
    'key':    'my_marker',
    'label':  'My Marker',
    'active': False,
}
```

Implement `_get_custom_mk_items(key, view_type)` on the model to supply items.

---

### `layers.timestamp_style`

Controls how `timestamp_fields` declared in `events` are visualized on bars.

| Value | Description |
|---|---|
| `'markers'` | Diamond-shaped overlay dots at the exact datetime position on the timeline X-axis. Position is recalculated on every zoom and scroll using `timeline.getWindow()`. |
| `'segments'` | The event bar is split into colored segments at timestamp positions via CSS `linear-gradient`. Color of each segment = color of the preceding timestamp field. |
| `'both'` | Both markers and segment coloring active simultaneously. |

**Default:** `'both'`

#### Set globally (all views):

```python
'layers': {
    'timestamp_style': 'markers',
}
```

#### Set per view type via `per_view`:

```python
'layers': {
    'per_view': {
        'gantt':    { 'timestamp_style': 'markers' },   # Gantt: diamond markers only
        'timeline': { 'timestamp_style': 'segments' },  # Timeline: colored bars only
    },
}
```

#### Override in view arch XML (wins over Python config):

```xml
<gantt date_start="date_start" date_stop="date_end"
       timestamp_style="both" />

<timeline date_start="date_start" date_stop="date_end"
          timestamp_style="markers" />
```

---

### `layers.per_view`

Override any layer key for a specific view type. Supported: `'gantt'`, `'timeline'`.

Supports all keys from `toolbar`, `background`, `markers`, plus `timestamp_style`.
Merged **on top of** the model-level config after global defaults.

```python
'per_view': {
    'gantt': {
        'timestamp_style': 'markers',
        'toolbar': {
            'scales':    ['week', 'month'],
            'show_zoom': False,
        },
        'background': {
            'show_night': False,
        },
    },
    'timeline': {
        'timestamp_style': 'segments',
        'toolbar': {
            'scales': ['day', 'week', 'month'],
        },
        'markers': {
            'current_time': False,
        },
    },
},
```

---

## Timestamp Fields Reference

Declared in `_time_view_config['events'][n]['timestamp_fields']`:

```python
'timestamp_fields': [
    {
        'field':   'checkpoint_1',   # Datetime field on the model (required)
        'name':    'Checkpoint 1',   # tooltip / legend label
        'color':   'inherit',        # 'inherit' = derive from record color
        'lighten': 0.0,              # 0.0–1.0: mix with white
        'darken':  0.0,              # 0.0–1.0: mix with black
        'active':  True,             # shown by default
    },
    {
        'field':   'checkpoint_2',
        'name':    'Checkpoint 2',
        'color':   'inherit',
        'lighten': 0.35,             # lighter shade of the record color
        'active':  True,
    },
    {
        'field':   'deadline',
        'name':    'Deadline',
        'color':   '#e74c3c',        # explicit color — ignores lighten/darken
        'active':  True,
    },
]
```

| Key | Type | Default | Description |
|---|---|---|---|
| `field` | `str` | required | Datetime field name on the model |
| `name` | `str` | field name | Tooltip label |
| `color` | `str` | `'inherit'` | `'inherit'` uses record color; or explicit HEX/CSS color |
| `lighten` | `float` | `0.0` | Mix color toward white (0.0 = unchanged, 1.0 = white) |
| `darken` | `float` | `0.0` | Mix color toward black (0.0 = unchanged, 1.0 = black) |
| `active` | `bool` | `True` | Visible on load |

### Color derivation with `'inherit'`

Record base color `#85c1e9` with different `lighten` values:

```
lighten: 0.0  → #85c1e9  (base color, no change)
lighten: 0.35 → #b0d7f1  (35% mixed with white)
lighten: 0.60 → #cee6f6  (60% mixed with white)
```

### Segment coloring logic

```
Event bar: ──────────────────────────────────────────────
           |  base color  | cp1 color | cp2 color        |
                         ◆           ◆
                     checkpoint_1  checkpoint_2
```

- Before first timestamp → **base record color**
- After timestamp N → **timestamp N's color** (until next timestamp or bar end)
- Timestamps outside the bar's `[start, end]` range are ignored

---

## Full Example

```python
_time_view_config = {
    'events': [
        {
            'key':         'main',
            'type':        'base',
            'source':      'self_fields',
            'start_field': 'date_start',
            'stop_field':  'date_end',
            'color_field': 'color',
            'timestamp_fields': [
                {'field': 'planned_start', 'name': 'Planned Start',
                 'color': 'inherit', 'lighten': 0.0, 'active': True},
                {'field': 'actual_start',  'name': 'Actual Start',
                 'color': 'inherit', 'lighten': 0.4, 'active': True},
                {'field': 'deadline',      'name': 'Deadline',
                 'color': '#e74c3c',                 'active': True},
            ],
        },
    ],
    'form': {
        'string':        'Project Timeline',
        'default_scale': 'week',
    },
    'layers': {
        'toolbar': {
            'scales':     ['day', 'week', 'month', 'year'],
            'show_today': True,
            'show_zoom':  True,
        },
        'background': {
            'weekends':   True,
            'work_hours': False,
            'night':      False,
        },
        'markers': {
            'current_time': True,
        },
        'per_view': {
            'gantt': {
                'timestamp_style': 'markers',    # Gantt: diamond dots on bars
                'background': {'show_night': False},
            },
            'timeline': {
                'timestamp_style': 'segments',   # Timeline: colored bar segments
                'toolbar': {'scales': ['week', 'month']},
            },
        },
    },
}
```

---

## Merge Order

```
Global defaults
    ↓  _merge()
Model-level  _time_view_config['layers']
    ↓  _merge() + timestamp_style
Per-view     _time_view_config['layers']['per_view'][view_type]
    ↓  arch attribute wins (if set)
<gantt timestamp_style="..." />
    ↓  serialized as layer_options attr on arch root
TimeBaseController._buildLayerState(layerOptions)
    → state.timestampStyle, state.eventLayers, ...
```
