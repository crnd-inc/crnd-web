Introduced a new feature empowering to determine the node that needs highlighting and assign a custom fill color to it.
Additionally, the diagram now supports a readonly mode.

To highlight a node, the following values should be passed through the context:
- `highlight_node_id`: The ID of the node object to be highlighted;
- `highlight_node_color`: The color (in HEX or RGB format) to fill the highlighted node

To enable the readonly mode for the diagram, the following value should be passed through the context:
- `diagram_readonly`: A boolean value indicating whether the diagram should be readonly.
