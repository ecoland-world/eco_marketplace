# EcoMarket

This folder contains Eco-Marketplace's environment for the development of it's Solidity smart contracts.

At this environment, one can write / test new features through test-drive-development in a modular manner. One can also perform static analysis and fuzz tests.

To get started, clone this repository:

``` jsx
git clone https://github.com/ecoland-world/game-contracts.git
```

Then install the packages:

``` jsx
cd ecoland
yarn install
```

## Code Conventions

Solidity version: 0.8.17

[Solidity style guide]([https://docs.soliditylang.org/en/v0.8.17/style-guide.html](https://docs.soliditylang.org/en/v0.8.17/style-guide.html))

Unchecked blocks should be used for small loops provided the [dimensional analysis]([https://en.wikipedia.org/wiki/Dimensional_analysis](https://en.wikipedia.org/wiki/Dimensional_analysis)) of the operations involved suggests overflows/underFlows to be highly unlikely.

```jsx
uint256[] memory numbersArray = [4, 5, 6, 7];
unchecked{
	uint256 arraySize = numbersArray.length;
	for (uint i =0; i < arraySize; i++){
		// CUSTOM LOGIC
	}
}

```

[Ethers.js]([https://docs.ethers.org/v5/](https://docs.ethers.org/v5/))

[Hardhat]([https://hardhat.org/hardhat-runner/docs/getting-started#overview](https://hardhat.org/hardhat-runner/docs/getting-started#overview))

## Unit tests

Must cover all checks, effects and interactions [checks-effects-interactions pattern](https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html)

Bear in mind: no feature is considered done until it has been tested. 

### Edge cases

Reserved for the QA team. 

## Integrative Tests

Reserved space.

## Fork Tests

Reserved for tests after mainnet’s deployment

## Code-safety

For long-term modularity, magic numbers should not be picked as the first solution to a problem. 

### Valid before any contract’s initial deployment

If a PR contains additional arguments to constructor or initilialize functions - it must be stated at the commit. When adding a new global variable, consider the possibility of setting it to constant first, immutable second and without extra tags third. 

As a rule-of-thumb, low-level calls are not strictly necessary outside of the storage proxy pattern and should be reserved to smart contracts that have an upgradeable component.

### Static Analysis

```
yarn slither 
```

By default we don’t want any warning, but there’s some permissiveness, specially to low severity issues.

Moderate severity issues can be deployed provided the pull requester recognizes it’s ocurrance and addresses it’s existence at the PR.

High severity issues should not be deployed, but could be with proper reasoning by the requester:

Justification as to why this is the best approach.

External references proving this specific case can be considered safe.

Critical severity issues cannot be deployed.

### Fuzing

Reserved.

## Documentation

All functions deployment should follow Ethereum’s documentation standard:

``` jsx
/**
* @notice
* @param 
* @dev 

*/
```

GitBook’s documentation will be handled by JoVi.

## Auditing

This repository has not yet gone through auditors review and should be used with caution. 

