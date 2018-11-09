# NullSettlement
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/NullSettlement.sol)
> NullSettlement


**Execution cost**: less than 42415 gas

**Deployment cost**: less than 1256800 gas

**Combined cost**: less than 1299215 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### ChangeClientFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### ChangeCommunityVoteEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldCommunityVote** *of type `address`*
2. **newCommunityVote** *of type `address`*

--- 
### ChangeConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeNullSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldNullSettlementChallenge** *of type `address`*
2. **newNullSettlementChallenge** *of type `address`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SettleNullByProxyEvent(address,address,uint8)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **proposalStatus** *of type `uint8`*

--- 
### SettleNullEvent(address,uint8)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **proposalStatus** *of type `uint8`*


## Methods
### setConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### setNullSettlementChallenge(address)
>
>Change the null settlement challenge contract


**Execution cost**: No bound available


Params:

1. **newNullSettlementChallenge** *of type `address`*

    > The (address of) NullSettlementChallenge contract instance



--- 
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setCommunityVote(address)
>
>Change the community vote contract


**Execution cost**: No bound available


Params:

1. **newCommunityVote** *of type `address`*

    > The (address of) CommunityVote contract instance



--- 
### setClientFund(address)
>
>Change the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### nullSettlementChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### seizedWalletsCount()
>
>Get the number of wallets whose funds have be seized


**Execution cost**: less than 614 gas

**Attributes**: constant



Returns:

> Number of wallets

1. **output_0** *of type `uint256`*

--- 
### operator()


**Execution cost**: less than 874 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1182 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 852 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isSeizedWallet(address)
>
>Get the seized status of given wallet


**Execution cost**: less than 1397 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:

> true if wallet is seized, false otherwise

1. **output_0** *of type `bool`*

--- 
### communityVoteUpdateDisabled()


**Execution cost**: less than 1011 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### disableUpdateOfCommunityVote()
>
>Disable future updates of community vote contract


**Execution cost**: less than 20835 gas




--- 
### maxNullNonce()


**Execution cost**: less than 746 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### communityVote()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### seizedWallets(uint256)


**Execution cost**: less than 1525 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### seizedWalletsMap(address)


**Execution cost**: less than 1102 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### settleNull()
>
>Settle null


**Execution cost**: No bound available




--- 
### settleNullByProxy(address)
>
>Settle null by proxy


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### updateMaxNullNonce()
>
>Update the max null settlement nonce property from CommunityVote contract


**Execution cost**: No bound available




--- 
### walletCurrencyMaxNullNonce(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

[Back to the top ↑](#nullsettlement)
