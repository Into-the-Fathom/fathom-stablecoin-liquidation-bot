"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
class Position {
    constructor(_address, _poolId, _debtShare, _safetyBuffer) {
        this.positionAddress = _address;
        this.collatralPool = _poolId;
        this.debtShare = new bn_js_1.default(_debtShare);
        this.safetyBuffer = new bn_js_1.default(_safetyBuffer);
    }
    get isUnSafe() {
        return this.safetyBuffer.lte(new bn_js_1.default(0)) && this.debtShare.gt(new bn_js_1.default(0));
    }
}
exports.default = Position;
