### Fixed

- Fixed the error that occurred when viewing the flow diagram on `request.type` with a large number of requests.

#### Technical details

The controller now builds a comprehensive list of fields to read, including:
- Base fields (`id`, `name`)
- Color fields (`bg_color_field`, `fg_color_field`)
- All visible and invisible node fields specified in the diagram parameters
