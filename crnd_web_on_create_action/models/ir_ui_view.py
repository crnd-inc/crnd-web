from odoo import models

ACTION_TYPE_ACTION = 'action'
ACTION_TYPE_OBJECT = 'object'
ON_CREATE_ACTION_NAME_CLASS = 'on-create-action-name-'
ON_CREATE_ACTION_TYPE_CLASS = 'on-create-action-type-'


class IrUiView(models.Model):
    _inherit = 'ir.ui.view'

    def _postprocess_view(self, node, model_name, editable=True,
                          parent_name_manager=None, **options):
        action_name = None
        action_type = None
        view_class = node.attrib.get('class')
        if view_class:
            class_list = view_class.split(' ')
            for class_name in class_list:
                if class_name.startswith(ON_CREATE_ACTION_NAME_CLASS):
                    action_name = class_name.split(
                        ON_CREATE_ACTION_NAME_CLASS)[1]
                elif class_name.startswith(ON_CREATE_ACTION_TYPE_CLASS):
                    action_type = class_name.split(
                        ON_CREATE_ACTION_TYPE_CLASS)[1]
                if action_name and action_type:
                    break
        if action_name:
            if action_type not in [ACTION_TYPE_ACTION, ACTION_TYPE_OBJECT]:
                action_type = ACTION_TYPE_OBJECT
            if action_type == ACTION_TYPE_ACTION:
                action_id = self.env.ref(action_name, raise_if_not_found=False)
                action_name = str(action_id.id) if action_id else False
        if action_name:
            node.set('on_create_action_name', action_name)
            node.set('on_create_action_type', action_type)
        return super()._postprocess_view(
            node, model_name, editable=editable,
            parent_name_manager=parent_name_manager, **options)
