/** @odoo-module **/

/**
 * Plan Arch Parser
 * Parses the <plan> XML definition
 */
export class PlanArchParser {
    parse(arch, resModel, resId, fields) {
        const archInfo = {
            resModel: resModel,
            resId: resId,
            fields: fields || {},
        };

        // Parse arch if needed (for now just return basic info)
        // In future can parse custom attributes from <plan> tag
        
        return archInfo;
    }
}
