import Web3 from "web3";
import Xdc3 from "xdc3";
import { AbiItem } from "web3-utils";
import { AbiItem as XdcAbiItem } from 'xdc3-utils';

const supportedChainIds = [5, 1337,50, 51];
const XDC_CHAIN_IDS = [50, 51];

interface ContractMetaData {
  address: string;
  abi: AbiItem[];
}

interface XdcContractMetaData {
  address: string;
  abi: XdcAbiItem[];
}

export class Web3Utils {
  public static web3: Web3;
  public static xdc3: Xdc3;
  /**
   * We need to avoid create new instance of contract each time
   */
  public static contracts = new Map();

  public static getContractInstance: any = (
    contractMetaData: ContractMetaData | XdcContractMetaData,
    chainId: number
  ) => {
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
    if (XDC_CHAIN_IDS.includes(chainId) && Web3Utils.xdc3 instanceof Xdc3) {
      const contract = new Web3Utils.xdc3.eth.Contract(
        contractMetaData.abi as XdcContractMetaData['abi'],
        contractMetaData.address
      );

      Web3Utils.contracts.set(contractKey, contract);
      return contract;
    } else if (Web3Utils.web3 instanceof Web3) {
      const contract = new Web3Utils.web3.eth.Contract(
        contractMetaData.abi,
        contractMetaData.address
      );
      Web3Utils.contracts.set(contractKey, contract);
      return contract;
    }
    /**
     * We have no Web3 instance need to create new instance of Web3
     */
    let contract;
    if (XDC_CHAIN_IDS.includes(chainId)) {
      Web3Utils.xdc3 = new Xdc3(
        Xdc3.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId)
      );

      contract = new Web3Utils.xdc3.eth.Contract(
        contractMetaData.abi as XdcContractMetaData['abi'],
        contractMetaData.address
      );

      Web3Utils.contracts.set(contractKey, contract);
    } else {
      Web3Utils.web3 = new Web3(
        Web3.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId)
      );

      contract = new Web3Utils.web3.eth.Contract(
        contractMetaData.abi,
        contractMetaData.address
      );

      Web3Utils.contracts.set(contractKey, contract);
    }

    return contract;
  };

  public static getContractInstanceFrom: any = (
    abi: AbiItem[] | XdcAbiItem[],
    address: string,
    chainId: number
  ) => {
    const contractKey = `${chainId}:${address}`;

    if (Web3Utils.contracts.has(contractKey)) {
      return Web3Utils.contracts.get(contractKey);
    }

    if (XDC_CHAIN_IDS.includes(chainId) && Web3Utils.xdc3 instanceof Xdc3) {
      const contract = new Web3Utils.xdc3.eth.Contract(abi as XdcAbiItem[], address);
      Web3Utils.contracts.set(contractKey, contract);
      return contract;
    } else if (Web3Utils.web3 instanceof Web3) {
      const contract = new Web3Utils.web3.eth.Contract(abi, address);
      Web3Utils.contracts.set(contractKey, contract);
      return contract;
    }

    let contract;
    if (XDC_CHAIN_IDS.includes(chainId)) {
      Web3Utils.xdc3 = new Xdc3(
        Xdc3.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId)
      );

      contract = new Web3Utils.xdc3.eth.Contract(abi as XdcAbiItem[], address);

      Web3Utils.contracts.set(contractKey, contract);
    } else {
      Web3Utils.web3 = new Web3(
        Web3.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId)
      );

      contract = new Web3Utils.web3.eth.Contract(abi, address);

      Web3Utils.contracts.set(contractKey, contract);
    }

    return contract;
  };

  public static getWeb3Instance: any = (chainId: number) => {
    if (XDC_CHAIN_IDS.includes(chainId) && Web3Utils.xdc3 instanceof Xdc3) {
      return Web3Utils.xdc3;
    } else if (Web3Utils.web3 instanceof Web3) {
      return Web3Utils.web3;
    }

    if (XDC_CHAIN_IDS.includes(chainId)) {
      Web3Utils.xdc3 = new Xdc3(
        Xdc3.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId)
      );
      return Web3Utils.xdc3;
    } else {
      Web3Utils.web3 = new Web3(
        Web3.givenProvider || Web3Utils.getWeb3ProviderUrl(chainId)
      );
      return Web3Utils.web3;
    }

  };

  public static getWeb3ProviderUrl: any = (
    chainId: number
  ) => {
    let web3ProviderUrl = '' 
    switch (chainId){
      case 1337: 
        web3ProviderUrl = 'ws://localhost:8545'
      break;
      case 5:
        web3ProviderUrl = 'https://goerli.infura.io/v3/d85fb151be214d8eaee85c855d9d3dab' 
      break;
      case 50: 
        web3ProviderUrl = ''
      break;
      case 51: 
        web3ProviderUrl = 'https://rpc.apothem.network'
      break;
    }

    return web3ProviderUrl

  }
}
