# Nahmii Contracts

This is the home of code for smart contracts for hubii's 2nd layer solution called nahmii.

## Whitepaper

Please see the release page (https://github.com/hubiinetwork/nahmii-contracts/releases) to download the whitepaper.

## Tests

In order to run the included tests there are a couple of alternatives readily available.

[Truffle Develop](https://truffleframework.com/docs/truffle/getting-started/using-truffle-develop-and-the-console) may be spawned by `truffle develop`. Running command `test` in its REPL will initiate a run of all tests.

Alternatively the standard `npm test` may be run. This command spawns an instance of [ganache-cli](https://github.com/trufflesuite/ganache-cli) on which smart contracts are deployed and tests executed against.

## Bytecode Verification

Etherscan code verification is currently not possible as their code verification tool does not support ABI coder v2. In a support ticket correspondence we were told that support for ABI coder v2 is on their agenda. 

## Contributing

### Bug reports

Please open issues in the issue tracker and label them as bugs.

### Development

All development is happening on the develop branch by using pull requests. Master branch is reserved for later usage.

### Practices
#### Gitflow

Please obey by established Gitflow principles. Details can be obtained in [post by Vincent Driessen](http://nvie.com/posts/a-successful-git-branching-model/) or in [Atlassian's Gitflow Workflow tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). Driessen's [git-flow](https://github.com/nvie/gitflow) git extension is indispensable.
