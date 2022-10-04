"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers/lib/ethers");
class PriceChecker {
    // public readonly priceOracleContract;
    constructor(_priceFeed) {
        this.fetchHandle = null;
        this.priceFeed = _priceFeed;
        this.price = { price: ethers_1.BigNumber.from(0), lastUpdated: Date.now() };
        let priceOracleAbi = [
            'function setPrice(bytes32 _collateralPoolId) external'
        ];
        // this.priceOracleContract = new ethers.Contract(priceOracleAddress, priceOracleAbi, provider.getSigner());
        // const eventFilter = {
        //     address: this.priceOracleContract.address,
        //     topics: [
        //         utils.id("LogSetPrice(bytes32,bytes32,uint256)"),
        //     ]
        // }
        // provider.on(eventFilter, (log, event) => {
        //     // Emitted whenever onchain price update happens
        //     console.log(LogLevel.keyEvent('================================'));
        //     console.log(LogLevel.keyEvent('OnChain Price Update Event Fired'));
        //     console.log(LogLevel.keyEvent('================================'));
        //     if(this.consumer != undefined)
        //         this.consumer();
        // })
        // const eventFilter1 = {
        //     address: simplePriceFeedAddress,
        //     topics: [
        //         utils.id("LogSetPrice(address,uint256,uint256)")
        //     ]
        // }
        // provider.on(eventFilter1, (log, event) => {
        //     // Emitted whenever onchain price update happens
        //     console.log(LogLevel.keyEvent('================================'));
        //     console.log(LogLevel.keyEvent('New price update on-chain'));
        //     console.log(LogLevel.keyEvent('================================'));
        //     if(this.consumer != undefined)
        //         this.consumer();
        // })
    }
    async init(fetchInterval = 120000, _consumer) {
        this.consumer = _consumer;
        await this.updateOnChainPrice();
        if (this.fetchHandle !== null)
            clearInterval(this.fetchHandle);
        this.fetchHandle = setInterval(this.checkPrice.bind(this), fetchInterval);
    }
    //Check the latest price of underlying collatral
    async checkPrice() {
        console.log('info', `checking the price of ${this.priceFeed.symbol}`);
        const _price = await this.priceFeed.fetchPrice();
        console.log('info', `latest price on dex is ${_price}`);
        await this.updatePrice(_price);
    }
    //update the price
    async updatePrice(_price) {
        if (_price.lt(this.price.price)) {
            console.log('info', `Drop in price ${this.priceFeed.symbol}, Trigger on-chain price update...`);
            //TODO: Trigger on-chain oracle price update
            await this.updateOnChainPrice();
        }
        this.price = { price: _price, lastUpdated: Date.now() };
    }
    async updateOnChainPrice() {
        // console.log(LogLevel.keyEvent('Updating on-chain price...'));
        // await this.priceOracleContract.setPrice(COLLATERAL_POOL_ID);
    }
    stop() {
        if (this.fetchHandle !== null)
            clearInterval(this.fetchHandle);
    }
}
exports.default = PriceChecker;
