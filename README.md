# Fathom Stablecoin Liquidation Bot

[![Docker Image CI](https://github.com/Into-the-Fathom/fathom-stablecoin-liquidation-bot/actions/workflows/build-and-deploy.yml/badge.svg?branch=github-action-integration)](https://github.com/Into-the-Fathom/fathom-stablecoin-liquidation-bot/actions/workflows/build-and-deploy.yml)

## Table of Contents

- [Fathom Stablecoin Liquidation Bot](#fathom-stablecoin-liquidation-bot)
  - [Table of Contents](#table-of-contents)
  - [Target Stablecoin](#target-stablecoin)
  - [What is Liquidation](#what-is-liquidation)
  - [Liquidation Bot](#liquidation-bot)
  - [Liquidation Strategy](#liquidation-strategy)
  - [Bot Architecture \[To be changed....\]](#bot-architecture-to-be-changed)
  - [Prepare the environment](#prepare-the-environment)
  - [How to run from bot](#how-to-run-from-bot)
  - [Monitor The Application](#monitor-the-application)
  - [How To Run without building](#how-to-run-without-building)
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

## Bot Architecture [To be changed....]
![Bot Architecture](./liquidation-bot/design-docs/liquidation_bot_v1.0.jpg?raw=true "Liquidator Bot")

There are 4 main components of bot:
- Event Listner
    - Event Listner will subscribe to listen event **LogSetPrice**. 
- Position Manager
    - Position manager will fetch the positions from on-chain and position them efficiently so that retrival of risky position can be quick. 
- Worker
  - Worker module perform the liquidation in batches.  
- Analytics
  - This component will keep track of bot analytics like how many transactions attempted, how much succeed/failed. It will store all liquidated positions as well.

## Prepare the environment
- Please make sure docker and docker-compose is installed. You can refer the the link `https://docs.docker.com/get-docker/` to install it.
- Initliaze docker swarm with `docker swarm init`
- Create secret for bot address: `printf "<BOT_ADDRESS>" | docker secret create liquidator_bot_address -`
- Create secret for bot private key: `printf "<BOT_PRIVATE_KEY>" | docker secret create liquidator_bot_pk -`
- You can varify the secrets using `docker secret ls` 

## How to run from bot
Once above steps are completed, you are ready to deploy the application in local environment.
- Clone the repository go to src directory `CD src/`
- Build all docker images using `./build.sh 0` command. This step will create the latest docker images.
- Setup Environment Variables: Open `docker-compose.yaml` and edit the e.g.  `LIQUIDATION_BATCH_SIZE`,  `LIQUIDATION_INTERVAL` 
- Start the Bot: `docker stack deploy -c docker-compose.yml liquidation-bot`
- Stop Bot: `docker stack rm liquidation-bot`

## Monitor The Application
Liquidation bot has integrated with Jaeger tracing where all the key events/logs & errors are sent to jaeger client. One can monitor the jaeger interface at `http://localhost:16686` for key events and error troubleshooting. 

## How To Run without building
We can use pre-build images and run the bot directly, you still need to have environment setup as mentioned in previous steps.

**Note:Docker images are build targated on ubuntu machine and might not work on M1 mac machine** 
- `curl https://raw.githubusercontent.com/Into-the-Fathom/fathom-stablecoin-liquidation-bot/dev/src/docker-compose.yml >> docker-compose.yml && docker stack deploy -c docker-compose.yml liquidation-bot --resolve-image always`


## Refrences
 - https://hackmd.io/@1P8kjN1-TWykQ36ndKV07Q/rkP3NAv35
 - https://cryptomarketpool.com/compound-finance-liquidation-bot/
 - https://cryptomarketpool.com/build-a-crypto-back-running-bot/
 - https://andytudhope.github.io/community/scd-faqs/keepers/
 - https://www.youtube.com/watch?v=w-oVV0Ie3Fw&list=PLO5VPQH6OWdX-Rh7RonjZhOd9pb9zOnHW&index=18
 - https://github.com/trufflesuite/truffle/issues/4757

## License

See [LICENSE.md](./LICENSE.md).
