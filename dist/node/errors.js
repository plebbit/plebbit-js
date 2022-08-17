"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codes = exports.messages = void 0;
var messages;
(function (messages) {
    messages["ERR_ENS_RESOLVER_NOT_FOUND"] = "ENS resolver is not found";
    messages["ERR_ENS_TXT_RECORD_NOT_FOUND"] = "ENS resolver did not find the text record";
    messages["ERR_SUB_SIGNER_NOT_DEFINED"] = "Subplebbit signer is not defined";
    messages["ERR_SUB_ALREADY_STARTED"] = "Subplebbit already started";
    messages["ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS"] = "subplebbit-address is pointing to a different address than subplebbit.signer.address";
    messages["ERR_SUB_CAN_EITHER_RUN_OR_UPDATE"] = "Subplebbit can either sync through .start() or update, but not both";
})(messages = exports.messages || (exports.messages = {}));
var codes;
(function (codes) {
    codes["ERR_ENS_RESOLVER_NOT_FOUND"] = "ERR_ENS_RESOLVER_NOT_FOUND";
    codes["ERR_ENS_TXT_RECORD_NOT_FOUND"] = "ERR_ENS_TXT_RECORD_NOT_FOUND";
    codes["ERR_SUB_SIGNER_NOT_DEFINED"] = "ERR_SUB_SIGNER_NOT_DEFINED";
    codes["ERR_SUB_ALREADY_STARTED"] = "ERR_SUB_ALREADY_STARTED";
    codes["ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS"] = "ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS";
    codes["ERR_SUB_CAN_EITHER_RUN_OR_UPDATE"] = "ERR_SUB_CAN_EITHER_RUN_OR_UPDATE";
})(codes = exports.codes || (exports.codes = {}));
