def get_attrs_field_names(env, arch, model, editable):
    """ Retrieve the field names appearing in context, domain and attrs, and
        return a list of triples ``(field_name, attr_name, attr_value)``.
    """
    VIEW_TYPES = {item[0] for item in type(env['ir.ui.view']).type.selection}
    symbols = _get_attrs_symbols() | {None}
    result = []

    def get_name(node):
        """ return the name from an AST node, or None """
        if isinstance(node, ast.Name):
            return node.id

    def get_subname(get, node):
        """ return the subfield name from an AST node, or None """
        if isinstance(node, ast.Attribute) and get(node.value) == 'parent':
            return node.attr

    def process_expr(expr, get, key, val):
        """ parse `expr` and collect triples """
        for node in ast.walk(ast.parse(expr.strip(), mode='eval')):
            name = get(node)
            if name not in symbols:
                result.append((name, key, val))

    def process_attrs(expr, get, key, val):
        """ parse `expr` and collect field names in lhs of conditions. """
        for domain in safe_eval(expr).values():
            if not isinstance(domain, list):
                continue
            for arg in domain:
                if isinstance(arg, (tuple, list)):
                    process_expr(str(arg[0]), get, key, expr)

    def process(node, model, editable, get=get_name):
        """ traverse `node` and collect triples """
        if node.tag in VIEW_TYPES:
            # determine whether this view is editable
            editable = editable and _view_is_editable(node)
        elif node.tag in ('field', 'groupby'):
            # determine whether the field is editable
            field = model._fields.get(node.get('name'))
            if field:
                editable = editable and field_is_editable(field, node)

        for key, val in node.items():
            if not val:
                continue
            if key in ATTRS_WITH_FIELD_NAMES:
                process_expr(val, get, key, val)
            elif key == 'attrs':
                process_attrs(val, get, key, val)

        if node.tag in ('field', 'groupby') and field and field.relational:
            if editable and not node.get('domain'):
                domain = field._description_domain(env)
                # process the field's domain as if it was in the view
                if isinstance(domain, str):
                    process_expr(domain, get, 'domain', domain)
            # retrieve subfields of 'parent'
            model = env[field.comodel_name]
            get = partial(get_subname, get)

        for child in node:
            if node.tag == 'search' and child.tag == 'searchpanel':
                # searchpanel part has to be validated independently
                continue
            process(child, model, editable, get)

    process(arch, model, editable)
    return result
