import { AbiItem } from "web3-utils";
import CollateralPoolConfigAbi from "./ABI/CollateralPoolConfig.json";
import ProxyWalletRegistryAbi from "./ABI/ProxyWalletRegistry.json";
import ProxyWalletAbi from "./ABI/ProxyWallet.json";
import FathomStablecoinProxyActionAbi from "./ABI/FathomStablecoinProxyActions.json";
import StableSwapModule from "./ABI/StableSwapModule.json";
import Addresses from "./addresses.json";

import DexPriceOracle from './ABI/DexPriceOracle.json'

import PositionManager from './ABI/PositionManager.json'
import PriceOracle from './ABI/PriceOracle.json'
import BookKeeper from './ABI/BookKeeper.json'
import LiquidationEngine from './ABI/LiquidationEngine.json'
import FixedSpreadLiquidationStrategy from './ABI/FixedSpreadLiquidationStrategy.json'
import DelayFathomOraclePriceFeed from './ABI/DelayFathomOraclePriceFeed.json'



export class SmartContractFactory {
  public static Addresses(chainId: number) {
    try {
      let address: any;
      switch (chainId) {
        case 1337:
          address = Addresses["1337"];
          break;
        case 5:
          address = Addresses["5"];
          break;
        case 51:
          address = Addresses["51"];
          break;
        case 50:
          address = Addresses["50"];
          break;
        default:
          address = Addresses["51"];
          break;
      }
      return address;
    } catch (e) {
      console.error(`Error in fetching address`);
      return {};
    }
  }

  public static PoolConfig(chainId: number) {
    return {
      abi: CollateralPoolConfigAbi.abi as AbiItem[],
      address: SmartContractFactory.Addresses(chainId).collateralPoolConfig,
    }
  };

  public static ProxyWalletRegistry(chainId: number) {
    return {
      abi: ProxyWalletRegistryAbi.abi as AbiItem[],
      address: SmartContractFactory.Addresses(chainId).proxyWalletRegistry,
    }
  };

  public static proxyWallet = {
    abi: ProxyWalletAbi.abi as AbiItem[],
    address: "",
  };

  public static FathomStablecoinProxyAction(chainId: number) {
    return {
      abi: FathomStablecoinProxyActionAbi.abi as AbiItem[],
      address: SmartContractFactory.Addresses(chainId).fathomStablecoinProxyActions,
    }
  };

  public static PositionManager(chainId: number) {
    return {
      abi: PositionManager.abi,
      address: SmartContractFactory.Addresses(chainId).positionManager,
    }
  };

  public static StabilityFeeCollector(chainId: number) {
    return {
      abi: [],
      address: SmartContractFactory.Addresses(chainId).stabilityFeeCollector,
    }
  };

  public static WXDCCollateralTokenAdapter(chainId: number) {
    return {
      abi: [],
      address: SmartContractFactory.Addresses(chainId).collateralTokenAdapter,
    }
  };

  public static USDTCollateralTokenAdapter(chainId: number) {
    return {
      abi: [],
      address: SmartContractFactory.Addresses(chainId).collateralTokenAdapterUSDT,
    }
  };

  public static StablecoinAdapter(chainId: number) {
    return {
      abi: [],
      address: SmartContractFactory.Addresses(chainId).stablecoinAdapter,
    }
  };

  public static AuthtokenAdapter(chainId: number) {
    return {
      abi: [],
      address: SmartContractFactory.Addresses(chainId).authTokenAdapter,
    }
  };

  public static FathomStablecoinProxyActions(chainId: number) {
    return {
      abi: [],
      address: SmartContractFactory.Addresses(chainId).fathomStablecoinProxyActions,
    }
  };

  public static StableSwapModule(chainId: number) {
    return {
      abi: StableSwapModule.abi as AbiItem[],
      address: SmartContractFactory.Addresses(chainId).stableSwapModule,
    }
  };

  public static DexPriceOracle(chainId: number)  {
    return {
      abi:DexPriceOracle.abi as AbiItem [],
      address: SmartContractFactory.Addresses(chainId).dexPriceOracle 
    }
  }

  public static PriceOracle(chainId: number)  {
    return {
      abi:PriceOracle.abi as AbiItem [],
      address: SmartContractFactory.Addresses(chainId).priceOracle 
    }
  }

  public static BookKeeper(chainId: number)  {
    return {
      abi:BookKeeper.abi as AbiItem [],
      address: SmartContractFactory.Addresses(chainId).bookKeeper 
    }
  }

  public static LiquidationEngine(chainId: number)  {
    return {
      abi:LiquidationEngine.abi as AbiItem [],
      address: SmartContractFactory.Addresses(chainId).liquidationEngine 
    }
  }

  public static SystemDebtEngine(chainId: number) {
    return {
      abi: [],
      address: SmartContractFactory.Addresses(chainId).systemDebtEngine,
    }
  };

  public static FixedSpreadLiquidationStrategy(chainId: number) {
    return {
      abi:FixedSpreadLiquidationStrategy.abi as AbiItem [],
      address: SmartContractFactory.Addresses(chainId).fixedSpreadLiquidationStrategy,
    }
  };

  public static DelayFathomOraclePriceFeed(chainId: number) {
    return {
      abi:DelayFathomOraclePriceFeed.abi as AbiItem [],
      address: SmartContractFactory.Addresses(chainId).wxdcDelayPriceFeed,
    }
  };

}