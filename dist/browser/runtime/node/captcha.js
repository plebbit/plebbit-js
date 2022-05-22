"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.createCaptcha = void 0;
// can't create captchas in the browser
var extra_1 = require("captcha-canvas/js-script/extra");
Object.defineProperty(exports, "createCaptcha", {
    enumerable: true, get: function () {
        return extra_1.createCaptcha;
    }
});
