odoo.define('crnd_web_widget_scan_qrcode.qr_code_scanner_widget', function (require) {
    "use strict";
    const registry = require('web.field_registry');
    const AbstractField = require('web.AbstractField');
    const Dialog = require('web.Dialog');
    const { qweb } = require('web.core');

    const QrCodeWidget = AbstractField.extend({
        template: 'qr_code_widget',
        supportedFieldTypes: ['char'],
        jsLibs: [
            '/crnd_web_widget_scan_qrcode/static/lib/html5_qrcode/html5_qrcode.js',
        ],
        events: _.extend({}, AbstractField.prototype.events, {
            'click .open_qr_code_scanner_btn': '_onClickOpenScannerBtn',
        }),

        init: function (parent, name, record, options) {
            this._super.apply(this, arguments);

            this.showText = true;
            if (this.attrs.options.show_text !== undefined) {
                this.showText = this.attrs.options.show_text;
            }
        },

        isEmpty: function () {
            return false;
        },

        _onClickOpenScannerBtn: function (event) {
            $('body').append(qweb.render('qr_code_scanner_popup', {}));
            this.$succesMessageEl =  $('.qr_code_scanner_success_message');
            $('.qr_code_scanner_close_popup_btn').click(this._onClickClosePopupBtn.bind(this));
            $('#qr_code_scanner_save_btn').click(this._onClickSaveQRCode.bind(this));
            $('#qr_code_scanner_resume_btn').click(this._onClickResumeScanning.bind(this));

            this.html5QrcodeScanner = new Html5QrcodeScanner(
                'qr_code_scanner',
                {
                    fps: 10,
                },
                false,
            );

            this.html5QrcodeScanner.render(this._onScanSuccess.bind(this));
        },

         _onScanSuccess: function (decodedText, decodedResult) {
            this.html5QrcodeScanner.pause(true);

            this.decodedText = decodedText;
            $('#qr_code_test').text(decodedText);
            this.$succesMessageEl.removeClass('d-none');
         },

        _onClickSaveQRCode: function () {
            this._setValue(this.decodedText);
            this._closeScannerPopup();
            if (this.showText) {
              $('.qr_code_text').text(this.decodedText);
            } else {
              $('#qr_code_check_icon').removeClass('d-none');
            }
        },

        _onClickClosePopupBtn: function (event) {
            this._closeScannerPopup();
        },

        _onClickResumeScanning: function (event) {
            this.$succesMessageEl.addClass('d-none');
            this.html5QrcodeScanner.resume();
        },

        _closeScannerPopup: function () {
            $('.qr_code_scanner_popup').remove();
            this.html5QrcodeScanner.clear();
            this.html5QrcodeScanner = null;
        },
    });


    registry.add('qr_code_widget', QrCodeWidget)

});
