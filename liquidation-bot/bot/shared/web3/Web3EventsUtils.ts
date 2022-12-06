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

var options = {
  reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: false
  }
};

export class Web3EventsUtils {
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
    if (Web3EventsUtils.contracts.has(contractKey)) {
      return Web3EventsUtils.contracts.get(contractKey);
    }
    /**
     * If we have no this contract, need to create instance and cache it
     * We already has Web3 instance so need to create contract instance and cache it
     */
    if (XDC_CHAIN_IDS.includes(chainId) && Web3EventsUtils.xdc3 instanceof Xdc3) {
      const contract = new Web3EventsUtils.xdc3.eth.Contract(
        contractMetaData.abi as XdcContractMetaData['abi'],
        contractMetaData.address
      );

      Web3EventsUtils.contracts.set(contractKey, contract);
      return contract;
    } else if (Web3EventsUtils.web3 instanceof Web3) {
      const contract = new Web3EventsUtils.web3.eth.Contract(
        contractMetaData.abi,
        contractMetaData.address
      );
      Web3EventsUtils.contracts.set(contractKey, contract);
      return contract;
    }
    /**
     * We have no Web3 instance need to create new instance of Web3
     */
    let contract;
    if (XDC_CHAIN_IDS.includes(chainId)) {
      Web3EventsUtils.xdc3 = new Xdc3(
        new Xdc3.providers.WebsocketProvider(Web3EventsUtils.getWeb3ProviderUrl(chainId),options)
      );

      contract = new Web3EventsUtils.xdc3.eth.Contract(
        contractMetaData.abi as XdcContractMetaData['abi'],
        contractMetaData.address
      );

      Web3EventsUtils.contracts.set(contractKey, contract);
    } else {
      Web3EventsUtils.web3 = new Web3(
        new Web3.providers.WebsocketProvider(Web3EventsUtils.getWeb3ProviderUrl(chainId),options)
      );

      contract = new Web3EventsUtils.web3.eth.Contract(
        contractMetaData.abi,
        contractMetaData.address
      );

      Web3EventsUtils.contracts.set(contractKey, contract);
    }

    return contract;
  };

  public static batchRequest: any = (chainId: number) =>{
    let web3:any

    // if (XDC_CHAIN_IDS.includes(chainId)) {
        web3 = new Xdc3(
          new Xdc3.providers.WebsocketProvider(Web3EventsUtils.getWeb3ProviderUrl(51),options)
        );
    // } else {
    //     web3 = new Web3(
    //       new HDWalletProvider(process.env.LIQUIDATOR_PRIVATE_KEY,Web3Utils.getWeb3ProviderUrl(chainId))
    //     );
    // }

    return new web3.BatchRequest()
  }


  public static getWeb3ProviderUrl: any = (
    chainId: number
  ) => {
    let web3ProviderUrl = '' 
    switch (chainId){
      case 1337: 
        web3ProviderUrl = 'ws://localhost:8545'
      break;
      case 5:
        web3ProviderUrl = 'wss://goerli.infura.io/ws/v3/d85fb151be214d8eaee85c855d9d3dab' 
      break;
      case 50: 
        web3ProviderUrl = ''
      break;
      case 51: 
        web3ProviderUrl = 'wss://ws.apothem.network/ws'
      break;
    }

    return web3ProviderUrl

  }
}
