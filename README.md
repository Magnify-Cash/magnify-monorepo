# nftyfinance-monorepo

Monorepo for all NFTY Finance related development

## Repo structure

This is a monorepo which uses [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/). To install dependencies, run `yarn install` from the root and that will take care of all the dependencies of the subprojects.

You can run yarn commands within a subproject directly from the root. As an example, to run the `start` command inside the `contracts` subproject, you can run `yarn contracts start`.

Currently there are 4 subprojects

- contracts
- subgraph
- faucet
- dapp

## Local development

### Setting up graph-node docker

1. Install Docker v4.10.1 from [here](https://docs.docker.com/desktop/release-notes/#4100).
2. Clone the [graph-node](https://github.com/graphprotocol/graph-node) repo alongside this repo, i.e. in the same directory this repo is in.
3. Build graph-node images locally following [these](https://github.com/graphprotocol/graph-node/tree/master/docker#running-graph-node-on-an-macbook-m1) steps. **Note**: you have to increase memory allowance of Docker to 8GB from Preferences→Resources for this step. After this step is done you can decrease it back to the default 4GB.

### Starting a local development stack

1. Run `yarn install` to install all dependencies.
2. Run `yarn contracts start` to bring up local hardhat chain.
3. Run `yarn graph-node` to bring up local graph stack. Wait until the logs say `Downloading latest blocks from Ethereum, this may take a few minutes...`.
4. Run `yarn deploy:local`. This will deploy a fresh version of the all contracts and subgraph.

The environment is now ready. Now you can run `yarn faucet start` to start the faucet, and// or run `yarn dapp start` to start the dapp.

**Notes:**

- Anytime you have made changes in the contracts, run `yarn deploy:local` again.
- If you close the hardhat chain process, you have to restart the `graph-node` script too.
- The scripts will work only if you have this repo and the graph-node repo in the same directory.

### Running tests

Run `yarn contracts test` to run all smart contract tests. To target specific tests, e.g. to run tests with the name `NFTYNotes` you can run `yarn contracts test --grep "NFTYNotes"`.
