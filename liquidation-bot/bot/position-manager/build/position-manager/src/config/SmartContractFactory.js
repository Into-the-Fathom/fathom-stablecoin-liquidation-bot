"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartContractFactory = void 0;
const CollateralPoolConfig_json_1 = __importDefault(require("./ABI/CollateralPoolConfig.json"));
const ProxyWalletRegistry_json_1 = __importDefault(require("./ABI/ProxyWalletRegistry.json"));
const ProxyWallet_json_1 = __importDefault(require("./ABI/ProxyWallet.json"));
const FathomStablecoinProxyActions_json_1 = __importDefault(require("./ABI/FathomStablecoinProxyActions.json"));
const BEP20_json_1 = __importDefault(require("./ABI/BEP20.json"));
const GetPositions_json_1 = __importDefault(require("./ABI/GetPositions.json"));
const StableSwapModule_json_1 = __importDefault(require("./ABI/StableSwapModule.json"));
const addresses_json_1 = __importDefault(require("./addresses.json"));
const Staking_json_1 = __importDefault(require("./ABI/Staking.json"));
const StakingGetter_json_1 = __importDefault(require("./ABI/StakingGetter.json"));
const MainToken_json_1 = __importDefault(require("./ABI/MainToken.json"));
const VeMainToken_json_1 = __importDefault(require("./ABI/VeMainToken.json"));
const Token_json_1 = __importDefault(require("./ABI/Token.json"));
const FathomStats_json_1 = __importDefault(require("./ABI/FathomStats.json"));
const Governor_json_1 = __importDefault(require("./ABI/Governor.json"));
const VeFathom_json_1 = __importDefault(require("./ABI/VeFathom.json"));
const DexPriceOracle_json_1 = __importDefault(require("./ABI/DexPriceOracle.json"));
const PositionManager_json_1 = __importDefault(require("./ABI/PositionManager.json"));
class SmartContractFactory {
    static Addresses(chainId) {
        try {
            let address;
            switch (chainId) {
                case 1337:
                    address = addresses_json_1.default["1337"];
                    break;
                case 5:
                    address = addresses_json_1.default["5"];
                    break;
                case 51:
                    address = addresses_json_1.default["51"];
                    break;
                case 50:
                    address = addresses_json_1.default["50"];
                    break;
                default:
                    address = addresses_json_1.default["51"];
                    break;
            }
            return address;
        }
        catch (e) {
            console.error(`Error in fetching address`);
            return {};
        }
    }
    static PoolConfig(chainId) {
        return {
            abi: CollateralPoolConfig_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).collateralPoolConfig,
        };
    }
    ;
    static ProxyWalletRegistry(chainId) {
        return {
            abi: ProxyWalletRegistry_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).proxyWalletRegistry,
        };
    }
    ;
    static FathomStablecoinProxyAction(chainId) {
        return {
            abi: FathomStablecoinProxyActions_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).fathomStablecoinProxyActions,
        };
    }
    ;
    static WXDC(chainId) {
        return {
            abi: BEP20_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).WXDC,
        };
    }
    ;
    static USDT(chainId) {
        return {
            abi: BEP20_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).USDT,
        };
    }
    ;
    static FathomStableCoin(chainId) {
        return {
            abi: BEP20_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).fathomStablecoin,
        };
    }
    ;
    static PositionManager(chainId) {
        return {
            abi: PositionManager_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).positionManager,
        };
    }
    ;
    static StabilityFeeCollector(chainId) {
        return {
            abi: [],
            address: SmartContractFactory.Addresses(chainId).stabilityFeeCollector,
        };
    }
    ;
    static WXDCCollateralTokenAdapter(chainId) {
        return {
            abi: [],
            address: SmartContractFactory.Addresses(chainId).collateralTokenAdapter,
        };
    }
    ;
    static USDTCollateralTokenAdapter(chainId) {
        return {
            abi: [],
            address: SmartContractFactory.Addresses(chainId).collateralTokenAdapterUSDT,
        };
    }
    ;
    static StablecoinAdapter(chainId) {
        return {
            abi: [],
            address: SmartContractFactory.Addresses(chainId).stablecoinAdapter,
        };
    }
    ;
    static AuthtokenAdapter(chainId) {
        return {
            abi: [],
            address: SmartContractFactory.Addresses(chainId).authTokenAdapter,
        };
    }
    ;
    static FathomStablecoinProxyActions(chainId) {
        return {
            abi: [],
            address: SmartContractFactory.Addresses(chainId).fathomStablecoinProxyActions,
        };
    }
    ;
    static GetPositions(chainId) {
        return {
            abi: GetPositions_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).getPositions
        };
    }
    ;
    static StableSwapModule(chainId) {
        return {
            abi: StableSwapModule_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).stableSwapModule,
        };
    }
    ;
    static FathomStats(chainId) {
        return {
            abi: FathomStats_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).fathomStats,
        };
    }
    ;
    static FathomGovernor(chainId) {
        return {
            abi: Governor_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).fathomGovernor
        };
    }
    static Staking(chainId) {
        return {
            abi: Staking_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).staking
        };
    }
    static MainToken(chainId) {
        return {
            abi: MainToken_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).mainToken // '0x62f3d571A7DAcC00C047e58fE500ee99A98E3f63'
        };
    }
    static StakingGetter(chainId) {
        return {
            abi: StakingGetter_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).stakingGetter // '0x62f3d571A7DAcC00C047e58fE500ee99A98E3f63'
        };
    }
    static VeMAINToken(chainId) {
        return {
            abi: VeMainToken_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).veMainToken // '0x62f3d571A7DAcC00C047e58fE500ee99A98E3f63'
        };
    }
    static StreamRewardToken(chainId) {
        return {
            abi: Token_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).streamRewardToken // '0x62f3d571A7DAcC00C047e58fE500ee99A98E3f63'
        };
    }
    static VeFathom(chainId) {
        return {
            abi: VeFathom_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).veFTHM
        };
    }
    static DexPriceOracle(chainId) {
        return {
            abi: DexPriceOracle_json_1.default.abi,
            address: SmartContractFactory.Addresses(chainId).dexPriceOracle
        };
    }
}
exports.SmartContractFactory = SmartContractFactory;
SmartContractFactory.proxyWallet = {
    abi: ProxyWallet_json_1.default.abi,
    address: "",
};
SmartContractFactory.BEP20 = (_address) => {
    return {
        abi: BEP20_json_1.default.abi,
        address: _address,
    };
};
