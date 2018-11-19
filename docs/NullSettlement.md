# NullSettlement
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/NullSettlement.sol)
> NullSettlement


**Execution cost**: less than 42088 gas

**Deployment cost**: less than 946000 gas

**Combined cost**: less than 988088 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### SetClientFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### SetCommunityVoteEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldCommunityVote** *of type `address`*
2. **newCommunityVote** *of type `address`*

--- 
### SetConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### SetNullSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldNullSettlementChallenge** *of type `address`*
2. **newNullSettlementChallenge** *of type `address`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SettleNullByProxyEvent(address,address,address,uint256)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### SettleNullEvent(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*


## Methods
### nullSettlementChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setCommunityVote(address)
>
>Set the community vote contract


**Execution cost**: No bound available


Params:

1. **newCommunityVote** *of type `address`*

    > The (address of) CommunityVote contract instance



--- 
### disableUpdateOfCommunityVote()
>
>Disable future updates of community vote contract


**Execution cost**: less than 20791 gas




--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 764 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 786 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### maxNullNonce()


**Execution cost**: less than 658 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### clientFund()


**Execution cost**: No bound available

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


**Execution cost**: less than 1094 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### communityVoteUpdateDisabled()


**Execution cost**: less than 923 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### communityVote()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setClientFund(address)
>
>Set the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### setConfiguration(address)
>
>Set the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setNullSettlementChallenge(address)
>
>Set the null settlement challenge contract


**Execution cost**: No bound available


Params:

1. **newNullSettlementChallenge** *of type `address`*

    > The (address of) NullSettlementChallenge contract instance



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### settleNull(address,uint256)
>
>Settle null


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

2. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



--- 
### settleNullByProxy(address,address,uint256)
>
>Settle null by proxy


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



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
