"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3EventsUtils = void 0;
const web3_1 = __importDefault(require("web3"));
const xdc3_1 = __importDefault(require("xdc3"));
const supportedChainIds = [5, 1337, 50, 51];
const XDC_CHAIN_IDS = [50, 51];
var options = {
    reconnect: {
        auto: true,
        delay: 5000,
        maxAttempts: 5,
        onTimeout: false
    }
};
class Web3EventsUtils {
}
exports.Web3EventsUtils = Web3EventsUtils;
/**
 * We need to avoid create new instance of contract each time
 */
Web3EventsUtils.contracts = new Map();
Web3EventsUtils.getContractInstance = (contractMetaData, chainId) => {
    /**
     * Get cache key by address and chainId
     */
    const contractKey = `${chainId}:${contractMetaData.address}`;
    /**
     * Check this key in Map, if it has return cached instance
     */
    if (Web3EventsUtils.contracts.has(contractKey)) {
        return Web3EventsUtils.contracts.get(contractKey);
    }
    /**
     * If we have no this contract, need to create instance and cache it
     * We already has Web3 instance so need to create contract instance and cache it
     */
    if (XDC_CHAIN_IDS.includes(chainId) && Web3EventsUtils.xdc3 instanceof xdc3_1.default) {
        const contract = new Web3EventsUtils.xdc3.eth.Contract(contractMetaData.abi, contractMetaData.address);
        Web3EventsUtils.contracts.set(contractKey, contract);
        return contract;
    }
    else if (Web3EventsUtils.web3 instanceof web3_1.default) {
        const contract = new Web3EventsUtils.web3.eth.Contract(contractMetaData.abi, contractMetaData.address);
        Web3EventsUtils.contracts.set(contractKey, contract);
        return contract;
    }
    /**
     * We have no Web3 instance need to create new instance of Web3
     */
    let contract;
    if (XDC_CHAIN_IDS.includes(chainId)) {
        Web3EventsUtils.xdc3 = new xdc3_1.default(new xdc3_1.default.providers.WebsocketProvider(Web3EventsUtils.getWeb3ProviderUrl(chainId), options));
        contract = new Web3EventsUtils.xdc3.eth.Contract(contractMetaData.abi, contractMetaData.address);
        Web3EventsUtils.contracts.set(contractKey, contract);
    }
    else {
        Web3EventsUtils.web3 = new web3_1.default(new web3_1.default.providers.WebsocketProvider(Web3EventsUtils.getWeb3ProviderUrl(chainId), options));
        contract = new Web3EventsUtils.web3.eth.Contract(contractMetaData.abi, contractMetaData.address);
        Web3EventsUtils.contracts.set(contractKey, contract);
    }
    return contract;
};
Web3EventsUtils.getWeb3ProviderUrl = (chainId) => {
    let web3ProviderUrl = '';
    switch (chainId) {
        case 1337:
            web3ProviderUrl = 'ws://localhost:8545';
            break;
        case 5:
            web3ProviderUrl = 'wss://goerli.infura.io/ws/v3/d85fb151be214d8eaee85c855d9d3dab';
            break;
        case 50:
            web3ProviderUrl = '';
            break;
        case 51:
            web3ProviderUrl = 'wss://ws.apothem.network/ws';
            break;
    }
    return web3ProviderUrl;
};
