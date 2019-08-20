odoo.define('crnd_web_list_popover_widget.DynamicPopover', function (require) {
    "use strict";
    var Registry = require('web.field_registry');
    var FieldText = require('web.basic_fields').FieldText;
    var Core = require('web.core');
    var QWeb = Core.qweb;

    var DynamicPopover = FieldText.extend({

        events: _.extend({}, FieldText.prototype.events, {
            'mousedown': 'popover_hide',
        }),

        init: function () {
            this._super.apply(this, arguments);
            this.maxWidth = this.nodeOptions.max_width;
            this.popoverMaxWidth = this.nodeOptions.popover_max_width;
            this.lineClamp = this.nodeOptions.line_clamp;
            this.placement = this.nodeOptions.placement || "auto";
            this.animation = this.nodeOptions.animation || false;
            this.allow_html = this.nodeOptions.allow_html || false;
            // IE do not supports webkit, and we detected IE <=10, 11, 12
            this.isIE = navigator.userAgent.search(/(MSIE|Trident|Edge)/) > -1;
        },

        start: function () {
            if (this.mode === 'readonly') {
                this.popover_init();
            }
            return this._super();
        },

        destroy: function () {
            this.popover_destroy();
            this._super.apply(this, arguments);
        },

        _renderReadonly: function () {
            if (this.allow_html === true) {
                this.$toEl = $('<div class="o_readonly"/>');
                this.$toEl.html(this._textToHtml(this.value));
                this.$toEl.appendTo(this.$el);
            } else {
                this._super();
            }
        },

        _textToHtml: function (text) {
            var value = text || "";
            try {
                // Crashes if text isn't html
                // eslint-disable-next-line no-unused-expressions
                $(text)[0].innerHTML;
            } catch (e) {
                if (value.match(/^\s*$/)) {
                    value = '<p><br></p>';
                } else {
                    value = "<p>" +
                        value.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
                        "<p>";
                }
            }
            return value;
        },

        popover_init: function () {
            var style = {
                "max-width": this.maxWidth,
                "-webkit-line-clamp": this.lineClamp,
            };
            this.$el = this.$el.css(style).addClass(
                this.isIE ? 'o_popover_widget_ie' : 'o_popover_widget');
            var template = QWeb.render("PopoverTemplate",
                {popover_style: "max-width: " + this.popoverMaxWidth + ";"}
            );
            var content = this.value;
            if (this.allow_html === true) {
                content = this._textToHtml(this.value);
                // Except trumbowyg empty html field value
                if (this.field.type === 'html' && content === '<p><br></p>') {
                    content = '';
                }
            }
            this.$el.popover({
                template: template,
                content: content,
                trigger: 'hover',
                placement: this.placement,
                container: 'body',
                html: this.allow_html,
                animation: this.animation,
            });
        },

        popover_destroy: function () {
            $('div.popover').popover('destroy');
        },

        popover_hide: function () {
            $('div.popover').popover('hide');
        },

    });

    Registry.add('list.dynamic_popover', DynamicPopover);
    return DynamicPopover;
});
