"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
class Position {
    constructor(_address, _debtShare, _safetyBuffer) {
        this.address = _address;
        this.debtShare = ethers_1.ethers.BigNumber.from(_debtShare);
        this.safetyBuffer = ethers_1.ethers.BigNumber.from(_safetyBuffer);
    }
    get isUnSafe() {
        return this.safetyBuffer.lte(0) && this.debtShare.gt(0);
    }
}
exports.default = Position;
