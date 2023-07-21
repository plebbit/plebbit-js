"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSubscriptionId = exports.clone = void 0;
// don't pass stateful objects to JSON RPC
const clone = (obj) => JSON.parse(JSON.stringify(obj));
exports.clone = clone;
const generateSubscriptionId = () => Math.floor(1000000 * Math.random());
exports.generateSubscriptionId = generateSubscriptionId;
