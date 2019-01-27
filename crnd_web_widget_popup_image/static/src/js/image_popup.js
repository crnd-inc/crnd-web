odoo.define('crnd_web_widget_popup_image.ImagePopup', function (require) {
"use strict";

    var registry = require('web.field_registry');
    var basic_fields = require('web.basic_fields');
    var session = require('web.session');
    var field_utils = require('web.field_utils');

    var ImagePopup = basic_fields.FieldBinaryImage.extend({

        popup: function(){
            var url = session.url('/web/image', {
                    model: this.model,
                    id: JSON.stringify(this.res_id),
                    field: this.nodeOptions.preview_image || this.name,
                    // unique forces a reload of the image when the record has been updated
                    unique: field_utils.format.datetime(this.recordData.__last_update).replace(/[^0-9]/g, ''),
            });

            $('.img').magnificPopup({
                items: {src: url},
                type:'image',
                closeOnContentClick: true,
             }).magnificPopup('open');
        },

        events: _.extend({}, basic_fields.FieldBinaryImage.prototype.events, {
            'click img': function(event){
                if (this.mode !== 'edit'){
                    event.stopPropagation();
                    return this.popup();
                }
            }
        }),

    });

    registry.add('image_popup', ImagePopup);
    return ImagePopup;
});
