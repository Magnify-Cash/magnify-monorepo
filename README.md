# Magnify Cash V1 Monorepo

Welcome to Magnify Cash V1! This repository is the central hub for the Magnify Cash protocol, an innovative system for NFT-collateralized lending and borrowing of ERC20 tokens. It utilizes a novel AMM-style architecture called "LAMM" (Lending Automated Market Maker) for its lending markets.

The protocol aims to provide a simple yet powerful DeFi primitive where any NFT can be lent against any fungible token, with customizable lending parameters like duration, interest, and loan value. All core components like liquidity, credit, and debit positions are tokenized to foster composability and future development.

A 2% loan origination fee is levied on all loans, distributed among a protocol insurance fund, NFT royalty payouts, and protocol revenue.

For a deep dive into the smart contracts, protocol design, and specific mechanisms, please refer to the [contracts README](contracts/README.md).

## Repository Structure

This monorepo uses [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to manage dependencies across its subprojects. Run `yarn install` from the root directory to install all necessary dependencies.

The monorepo includes the following key subprojects:

1.  **`contracts`**: Contains all the Solidity smart contracts that form the core of the Magnify Cash protocol. This includes:
    *   `MagnifyCashV1.sol`: The main protocol module.
    *   `MagnifyCashERC721.sol`: An abstract ERC721 contract with built-in roles.
    *   `MagnifyLendingKeysV1.sol`: The NFT representing ownership of lending desks.
    *   `MagnifyObligationNotesV1.sol`: The NFT tokenizing a borrower's loan obligation.
    Detailed documentation can be found in the [`contracts/README.md`](contracts/README.md).

2.  **`subgraph`**: Implements [The Graph](https://thegraph.com/) protocol to index and query data from the Magnify Cash smart contracts. This provides an efficient way for the dApp and other services to access on-chain data.

3.  **`faucet`**: A Vite and React-based web application that serves as a token faucet. It allows users to obtain test versions of ERC20 tokens and potentially NFTs for use on testnet environments while interacting with the Magnify Cash protocol. It utilizes `wagmi` and `ConnectKit` for blockchain interactions.

4.  **`dapp-v1`**: The primary decentralized application (dApp) providing the user interface for interacting with the Magnify Cash protocol. Users can create lending desks, borrow, lend, and manage their positions through this interface. It is built using Vite, React, `wagmi`, and `ConnectKit`.

## Local Development Setup

To begin local development, carefully follow the steps outlined below:

### Setting up graph-node docker

1. Install Docker v4.10.1 from [here](https://docs.docker.com/desktop/release-notes/#4100).

2. Clone the [graph-node](https://github.com/graphprotocol/graph-node) repository into a shared parent directory with the current repository. Both repositories should be located in the same parent folder.

3. Build graph-node images locally by following [these steps](https://github.com/graphprotocol/graph-node/tree/master/docker#running-graph-node-on-an-macbook-m1). **Note**: Before proceeding, you must increase Docker's memory allowance to 8GB from Preferences → Resources. After completion, you can revert it to the default 4GB.

### Starting a Local Development Stack

1. Begin by running `yarn install` to install all the necessary dependencies.

2. Execute `yarn contracts start` to bring up the local hardhat chain.

3. Start the local graph stack with `yarn graph-node`. Please wait until the logs indicate `Downloading latest blocks from Ethereum, this may take a few minutes...`.

4. Deploy a fresh version of all contracts and the subgraph by running `yarn deploy:local`.

The environment is now ready for development. You can launch the faucet service using `yarn faucet start` and/or start the dApp with `yarn dapp-v1 start`.

## Deploying to Staging

### Requirements:

1. Make sure you have a valid `PRIVATE_KEY` with testnet ETH in your `.env`.
2. Run `graph auth --product hosted-service <SUBGRAPH_ACCESS_TOKEN>`.

### Steps:

1. Run `yarn contracts deploy:<network>`.
2. Change the addresses and block numbers in `subgraph/subgraph.yaml` and `dapp-v1/wagmi.config.ts` as needed by copying them from the new `deployments.json`. Also, for `subgraph/networks.json`, copy the values from "mainnet" into the desired network.
3. Run `yarn subgraph deploy:<network>`.
4. Make sure `yarn dapp build` is working locally with the production `.env`s, and without the local graph node running.
5. Push changes to `staging` branch for them to be deployed.

**Note**: After deploying a new version of the subgraph, you must wait for the graph-node to sync the latest blocks before you can run the dapp. This usually takes 10-15 minutes.

If you just want to deploy the subgraph and dapp and not the contracts, you can do the following:

- Make sure the addresses and block numbers are correct in `subgraph/subgraph.yaml` and `dapp-v1/wagmi.config.ts`.
- Do step 3 to 5 from above.

**Notes:**

- When you make changes to the contracts, always run `yarn deploy:local` to deploy the updated contracts and subgraph.

- If you close the hardhat chain process, ensure to restart the `graph-node` script as well.

- For the scripts to work correctly, ensure that both this repo and the graph-node repo are present in the same parent directory.

## Deploying to Production

### Requirements:
1. Ensure you have `.env` and `contracts/.env` filled out. This includes the following variables:
`.env`
```
INFURA_API_KEY
PRIVATE_KEY
```

`contracts/.env`
```
SOLC_VERSION
DAPP_SRC
REPORT_GAS
CMC_KEY
PLATFORM_WALLET
OBLIGATION_URI
KEYS_URI
LOF
CONTRACT_OWNER
MAINNET_URL
ETHERSCAN_API_KEY
```

### Steps
1. Run `yarn contracts deploy:<network>`.
2. Change the addresses and block numbers in `dapp-v1/wagmi.config.ts` as needed by copying them from the new `deployments.json`.
3. Make sure `yarn dapp build` is working locally.
4. Push changes to `staging` branch for them to be deployed.

## Supporting new chain (WIP)

### contracts
- add new network in contracts/hardhat.config.ts
- add new `deploy:<network>` command in `contracts/package.json`

### frontend
- add deployed contract address in `dapp-v1/wagmi.config.ts`
- add new chain in `dapp-v1/src/wagmi.ts`
- update protocol defaults in `dapp-v1/src/helpers/protocolDefaults`
- update alchemy networks in `dapp-v1/src/helpers/utils.ts`

### subgraph
- add new `deploy:<network>` command in `subgraph/package.json`


## Running Tests

To run all smart contract tests, execute `yarn contracts test`.

## Contributing

Contributions to Magnify Cash are welcome! If you're interested in contributing, please check out the open issues on GitHub. For major changes, please open an issue first to discuss what you would like to change.

Ensure your contributions adhere to the project's coding standards and include tests where applicable.

## Support

If you have any questions, encounter issues, or need support regarding this repository or the Magnify Cash protocol, please feel free to reach out via email to: [ty@siestamarkets.com](mailto:ty@siestamarkets.com).
