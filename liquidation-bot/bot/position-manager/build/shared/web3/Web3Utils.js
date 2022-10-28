"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Utils = void 0;
const web3_1 = __importDefault(require("web3"));
const xdc3_1 = __importDefault(require("xdc3"));
const supportedChainIds = [5, 1337, 50, 51];
const XDC_CHAIN_IDS = [50, 51];
class Web3Utils {
}
exports.Web3Utils = Web3Utils;
/**
 * We need to avoid create new instance of contract each time
 */
Web3Utils.contracts = new Map();
Web3Utils.getContractInstance = (contractMetaData, chainId) => {
    /**
     * Get cache key by address and chainId
     */
    const contractKey = `${chainId}:${contractMetaData.address}`;
    /**
     * Check this key in Map, if it has return cached instance
     */
    if (Web3Utils.contracts.has(contractKey)) {
        return Web3Utils.contracts.get(contractKey);
    }
    /**
     * If we have no this contract, need to create instance and cache it
     * We already has Web3 instance so need to create contract instance and cache it
     */
    if (XDC_CHAIN_IDS.includes(chainId) && Web3Utils.xdc3 instanceof xdc3_1.default) {
        const contract = new Web3Utils.xdc3.eth.Contract(contractMetaData.abi, contractMetaData.address);
        Web3Utils.contracts.set(contractKey, contract);
        return contract;
    }
    else if (Web3Utils.web3 instanceof web3_1.default) {
        const contract = new Web3Utils.web3.eth.Contract(contractMetaData.abi, contractMetaData.address);
        Web3Utils.contracts.set(contractKey, contract);
        return contract;
    }
    /**
     * We have no Web3 instance need to create new instance of Web3
     */
    let contract;
    if (XDC_CHAIN_IDS.includes(chainId)) {
        Web3Utils.xdc3 = new xdc3_1.default(xdc3_1.default.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId));
        contract = new Web3Utils.xdc3.eth.Contract(contractMetaData.abi, contractMetaData.address);
        Web3Utils.contracts.set(contractKey, contract);
    }
    else {
        Web3Utils.web3 = new web3_1.default(web3_1.default.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId));
        contract = new Web3Utils.web3.eth.Contract(contractMetaData.abi, contractMetaData.address);
        Web3Utils.contracts.set(contractKey, contract);
    }
    return contract;
};
Web3Utils.getContractInstanceFrom = (abi, address, chainId) => {
    const contractKey = `${chainId}:${address}`;
    if (Web3Utils.contracts.has(contractKey)) {
        return Web3Utils.contracts.get(contractKey);
    }
    if (XDC_CHAIN_IDS.includes(chainId) && Web3Utils.xdc3 instanceof xdc3_1.default) {
        const contract = new Web3Utils.xdc3.eth.Contract(abi, address);
        Web3Utils.contracts.set(contractKey, contract);
        return contract;
    }
    else if (Web3Utils.web3 instanceof web3_1.default) {
        const contract = new Web3Utils.web3.eth.Contract(abi, address);
        Web3Utils.contracts.set(contractKey, contract);
        return contract;
    }
    let contract;
    if (XDC_CHAIN_IDS.includes(chainId)) {
        Web3Utils.xdc3 = new xdc3_1.default(xdc3_1.default.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId));
        contract = new Web3Utils.xdc3.eth.Contract(abi, address);
        Web3Utils.contracts.set(contractKey, contract);
    }
    else {
        Web3Utils.web3 = new web3_1.default(web3_1.default.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId));
        contract = new Web3Utils.web3.eth.Contract(abi, address);
        Web3Utils.contracts.set(contractKey, contract);
    }
    return contract;
};
Web3Utils.getWeb3Instance = (chainId) => {
    if (XDC_CHAIN_IDS.includes(chainId) && Web3Utils.xdc3 instanceof xdc3_1.default) {
        return Web3Utils.xdc3;
    }
    else if (Web3Utils.web3 instanceof web3_1.default) {
        return Web3Utils.web3;
    }
    if (XDC_CHAIN_IDS.includes(chainId)) {
        Web3Utils.xdc3 = new xdc3_1.default(xdc3_1.default.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId));
        return Web3Utils.xdc3;
    }
    else {
        Web3Utils.web3 = new web3_1.default(web3_1.default.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId));
        return Web3Utils.web3;
    }
};
Web3Utils.getWeb3ProviderUrl = (chainId) => {
    let web3ProviderUrl = '';
    switch (chainId) {
        case 1337:
            web3ProviderUrl = 'ws://localhost:8545';
            break;
        case 5:
            web3ProviderUrl = 'https://goerli.infura.io/v3/d85fb151be214d8eaee85c855d9d3dab';
            break;
        case 50:
            web3ProviderUrl = '';
            break;
        case 51:
            web3ProviderUrl = 'https://rpc.apothem.network';
            break;
    }
    return web3ProviderUrl;
};
