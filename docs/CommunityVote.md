# CommunityVote
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/CommunityVote.sol)
> Community vote


**Execution cost**: less than 61341 gas

**Deployment cost**: less than 221600 gas

**Combined cost**: less than 282941 gas

## Constructor



Params:

1. **_owner** *of type `address`*

## Events
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*


## Methods
### deployer()


**Execution cost**: less than 735 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 559 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getMaxDriipNonce()
>
>Get the max driip nonce to be accepted in settlements


**Execution cost**: less than 384 gas

**Attributes**: constant



Returns:

> the max driip nonce

1. **output_0** *of type `uint256`*

--- 
### getMaxNullNonce()
>
>Get the max null settlement nonce to be accepted in settlements


**Execution cost**: less than 560 gas

**Attributes**: constant



Returns:

> the max driip nonce

1. **output_0** *of type `uint256`*

--- 
### isDataAvailable()
>
>Get the data availability status


**Execution cost**: less than 528 gas

**Attributes**: constant



Returns:

> true if data is available

1. **output_0** *of type `bool`*

--- 
### isDoubleSpenderWallet(address)
>
>Get the double spender status of given wallet


**Execution cost**: less than 684 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet address for which to check double spender status


Returns:

> true if wallet is double spender, false otherwise

1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 581 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: less than 22845 gas


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: less than 22888 gas


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




[Back to the top ↑](#communityvote)
