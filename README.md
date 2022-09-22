# Fathom Stablecoin Liquidation Bot

## Table of Contents

- [Fathom Stablecoin Liquidation Bot](#fathom-stablecoin-liquidation-bot)
	- [Table of Contents](#table-of-contents)
	- [Target Stablecoin](#target-stablecoin)
	- [What is Liquidation](#what-is-liquidation)
	- [Liquidation Bot](#liquidation-bot)
	- [Liquidation Strategy](#liquidation-strategy)
	- [Bot Architecture](#bot-architecture)
	- [Refrences](#refrences)
	- [License](#license)

## Target Stablecoin

Target stablecoin is [FXD](https://github.com/Into-the-Fathom/fathom-stablecoin-smart-contracts) by [Fathom](fathom.fi).
FXD is modified fork of [Alpaca Stablecoin](https://github.com/alpaca-finance/alpaca-stablecoin).

## What is Liquidation
CDP-based stablecoin protocols keep the level of issued debt in a stable state with liquidation. Liquidation is similar to foreclosure which is forced when the borrower cannot pay the interest rate and principal on time, therefore, the lender will force the collateral sale. The difference is that foreclosure happens when the borrower cannot keep up with the agreed cash flow, whereas, liquidation of a position in stablecoin protocols happens when the value of collateralized assets plummets and moves the Loan to Value ratio(LTV) of a position to a certain ‘risky’ level.

## Liquidation Bot
Liquidation Bot is an automated software that will look for liquidation opportunity and trigger the liquidation process without any manual intervention. Below should be the key features of Liquidation Bot
- It should work automatically with no of very less humen interaction.
- It should be running all the time.
- It should liquidate bad position as early as possible once the position is detected as bad.
- It should consume less gas, also a failed liquidation opporunity is loss in term of gas fees.

## Liquidation Strategy
Fixed spread liquidation strategy is used. In case of under collateralisation of asset, only some part of collateral is liquidated. This is called close factor. This reduces the liquidation risk for borrower while still maintain the system stability. Close factor is set to 25% in FXD which means only 25% of collateral could be liquidated.

- Some of the key pointers/functions from FXD:
    - ##PositionManager.sol##
        - **lastPositionId** : Gives the total number of positions opened
        - **LogNewPosition** : Event is emitted when new position is opened.
    - ##GetPositions.sol##
        - **getPositionWithSafetyBuffer**: Returns all the positions with debtShare and safetyBuffer.
    - ##CollateralPoolConfig.sol##
        -  CollateralPoolConfig is the top most level object which has multiple pools in it **collateralPools** in it. Each collateralPool object has priceFeed (PriceFeed.sol) and strategy(ILiquidationStratgy -> FixedSpreadLiquidationStratgy.sol)
    - ##LiquidationEngine.sol##
	    -  LiquidationEngine has **execute()** method which takes in poolId as input. Pool id which is inside ##CollateralPoolConfig.sol## has all the required information like priceFeed and liquidation stratagy. This price feed is derived from pool id which was passed from Engine to LiquidationStratgy and then getPrice method.
	    -  ##PriceOracle.sol## has **setPrice(poolId)** which internally has it’s respective feed from pool-Id (check .testnet.js file for dependency graph). 

## Bot Architecture
![Bot Architecture](./liquidation-bot/design-docs/liquidation_bot_v1.0.jpg?raw=true "Liquidator Bot")

There are 4 main components of bot:
- Event Listner
    - Event Listner will subscribe to listen two events **LogSetPrice** and **LowNewPisition**. If listner component recieve any of those two events, it calles Position Manager to re-organize the positions based on updated position data.
- Position Manager
    - Position manager will fetch the positions from on-chain and position them efficiently so that retrival of risky position can be quick e.g. we may store the positions in binary tree based on risk factors. 
- Price Check
    - This module will fetch the price of underlying asset from external service and compare it with last price stored on bot. Only If there is drop in price, bot calls PriceOracle.sol setPrice() method on-chain to updated the price of collatral.
- Worker/Executor
    - Worker component will fetch the position based combination of risk-factor and debt share. Bot will pick the risky position first and try to execute liquidation() on chain.If somehow transaction is reverted, position will be put back to Position Manager. 

## Refrences
 - https://hackmd.io/@1P8kjN1-TWykQ36ndKV07Q/rkP3NAv35
 - https://cryptomarketpool.com/compound-finance-liquidation-bot/
 - https://cryptomarketpool.com/build-a-crypto-back-running-bot/
 - https://andytudhope.github.io/community/scd-faqs/keepers/
 - https://www.youtube.com/watch?v=w-oVV0Ie3Fw&list=PLO5VPQH6OWdX-Rh7RonjZhOd9pb9zOnHW&index=18

## License

See [LICENSE.md](./LICENSE.md).
