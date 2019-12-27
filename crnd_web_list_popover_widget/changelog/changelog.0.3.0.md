Fixed bug, that happens when popover-content evaluated to False.
Some times, when text field has no provided value on creation of record,
it is set to NULL in postgres, which is converted to False by Odoo.
