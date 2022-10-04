"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateRandom = (maxLimit = 100) => {
    let rand = Math.random() * maxLimit;
    rand = Math.floor(rand); // 99
    return rand;
};
exports.default = generateRandom;
