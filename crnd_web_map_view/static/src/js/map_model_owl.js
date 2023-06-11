/** @odoo-module */

import { Model } from "@web/views/model"

export class MapModel extends Model {
    async setup(params, services) {
        this.params = params;
        this.latitudeField = this.params.archInfo.latitude_field;
        this.longitudeField = this.params.archInfo.longitude_field;
    }

   async load(searchParams) {
        this.searchParams = searchParams;
        this.domain = searchParams.domain;
        this.context = searchParams.context
        await this.loadData();
   }

   async loadData() {
        var domain = [
            [this.latitudeField, '!=', false],
            [this.longitudeField, '!=', false],
        ]
        var full_domain = this.domain.concat(domain);

        this.data = await this.orm.call(this.params.resModel, 'search_read', [], {domain: full_domain});
   }

}