"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSubscriptionId = exports.clone = void 0;
const crypto_1 = require("crypto");
// don't pass stateful objects to JSON RPC
const clone = (obj) => JSON.parse(JSON.stringify(obj));
exports.clone = clone;
const maxRandomInt = 281474976710655;
const generateSubscriptionId = () => (0, crypto_1.randomInt)(0, maxRandomInt);
exports.generateSubscriptionId = generateSubscriptionId;
