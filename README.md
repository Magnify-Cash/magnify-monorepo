# NFTY Finance V1 Monorepo

![NFTY Finance Logo](https://nfty.finance/icon.svg)

Welcome to NFTY Finance V1! This repository serves as the central hub for various subprojects that collectively constitute the NFTY Finance protocol. If you wish to learn more about the contracts, protocol design, and other related aspects, please navigate to the [`/contracts`](contracts/docs/README.md) directory.

## Repo Structure

This monorepo utilizes [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to manage dependencies across subprojects seamlessly. To get started, simply run `yarn install` from the root directory, and it will automatically handle all the dependencies for the subprojects.

Currently, the monorepo comprises the following four subprojects:

1. **contracts**: This section contains the smart contracts that form the backbone of the NFTY Finance protocol. For in-depth details, please refer to the [`/contracts`](contracts/docs/README.md) directory.

2. **subgraph**: Here, you can find the code responsible for managing the subgraph of the NFTY Finance protocol. (You may include additional context or purpose of the subgraph here.)

3. **faucet**: The faucet subproject deals with setting up and managing the faucet service. (Feel free to elaborate further on the functionality of the faucet if needed.)

4. **dapp**: The dapp subproject encompasses the decentralized application (dApp) for NFTY Finance. (Provide more information on the features and functionalities of the dApp as necessary.)

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

### Deploying to Staging

#### Requirements:

1. Make sure you have a valid `PRIVATE_KEY` with Sepolia ETH in your `.env`.
2. Run `graph auth --product hosted-service <SUBGRAPH_ACCESS_TOKEN>`.

#### Steps:

1. Run `yarn contracts deploy:testnet`.
2. Change the addresses and block numbers in `subgraph/subgraph.yaml` and `dapp-v1/wagmi.config.ts` as needed by copying them from the new `deployments.json`.
3. Run `yarn subgraph deploy:testnet`.
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

### Running Tests

To run all smart contract tests, execute `yarn contracts test`. If you want to target specific tests, e.g., tests with the name `NFTYNotes`, you can use `yarn contracts test --grep "NFTYNotes"`.

## Contributing

We highly value and welcome contributions to enhance the NFTY Finance protocol. Whether you find issues or have ideas for improvements, feel free to open a pull request or create an issue on the repository. We kindly request that all contributions adhere to the project's guidelines and coding standards.

Thank you for showing interest in NFTY Finance! We believe a comprehensive README is crucial for any project as it offers valuable insights into the project and reflects the developer's commitment to quality and transparency. If you have any further questions or require assistance, don't hesitate to reach out. Happy coding!
