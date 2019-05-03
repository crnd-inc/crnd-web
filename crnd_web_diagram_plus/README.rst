Web Diagram Plus
================

Simple example for internal usage:

    .. code:: xml

        <record model="ir.ui.view" id="some_id">
            <field name="name">some_name</field>
            <field name="model">model.name</field>
            <field name="arch" type="xml">
                <diagram_plus>
                    <node object="name.of.model"
                          bgcolor="from_old_diagram_non_priority"
                          bg_color_field="name_of_field_bg_color"
                          fg_color_field="name_of_field_fg_color">
                        <field name="name_of_label_field"/>
                        <field name="field_for_bgcolor_expr"/>
                        <field name="name_of_field_bg_color"/>
                        <field name="name_of_field_fg_color"/>
                    </node>
                    <arrow object="name.of.model"
                           source="source_field(from)"
                           destination="destination_field(to)"
                           label="['name_of_label_field']">
                        <field name="source_field"/>
                        <field name="destination_field"/>
                        <field name="name_of_label_field"/>
                    </arrow>
                </diagram_plus>
            </field>
        </record>