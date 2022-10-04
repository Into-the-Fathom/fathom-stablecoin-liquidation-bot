"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceFeed = void 0;
class PriceFeed {
    //public readonly dexPriceContract;
    constructor(_symbol) {
        this.symbol = _symbol;
        let dexPriceContractAbi = [
            'function getPrice(address token0, address token1) external view override returns (uint256, uint256)',
        ];
        // this.dexPriceContract = new ethers.Contract(dexPriceOracle, dexPriceContractAbi, provider);
    }
    fetchPrice() {
        throw new Error("Method not implemented.");
    }
}
exports.PriceFeed = PriceFeed;
