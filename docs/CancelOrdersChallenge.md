# CancelOrdersChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/CancelOrdersChallenge.sol)
> CancelOrdersChallenge


**Execution cost**: less than 43169 gas

**Deployment cost**: less than 1949800 gas

**Combined cost**: less than 1992969 gas

## Constructor



Params:

1. **_owner** *of type `address`*

## Events
### CancelOrdersEvent(tuple[],address)


**Execution cost**: No bound available


Params:

1. **orders** *of type `tuple[]`*
2. **wallet** *of type `address`*

--- 
### ChallengeEvent(tuple,tuple,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **trade** *of type `tuple`*
3. **wallet** *of type `address`*

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
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*


## Methods
### walletOrderOperatorHashIndexMap(address,bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### challengePhase(address)
>
>Get current phase of a wallets cancelled order challenge


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address of wallet for which the cancelled order challenge phase is returned


Returns:


1. **output_0** *of type `uint8`*

--- 
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### challenge(tuple,address)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*


--- 
### cancelOrders(tuple[])


**Execution cost**: No bound available


Params:

1. **orders** *of type `tuple[]`*


--- 
### setConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 786 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### walletOrderOperatorHashCancelledMap(address,bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### getCancelledOrders(address,uint256)
>
>Get 10 cancelled orders for given wallet starting at given start index


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return the nonces of cancelled orders

2. **startIndex** *of type `uint256`*

    > The start index from which to extract order nonces, used for pagination


Returns:


1. **output_0** *of type `tuple[10]`*

--- 
### deployer()


**Execution cost**: less than 1050 gas

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
### getCancelledOrdersCount(address)
>
>Get count of cancelled orders for given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return the count of cancelled orders


Returns:


1. **output_0** *of type `uint256`*

--- 
### isOrderCancelled(address,bytes32)
>
>Get wallets cancelled status of order


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The ordering wallet

2. **orderHash** *of type `bytes32`*

    > The (operator) hash of the order


Returns:


1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 808 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### walletOrderCancelledListMap(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **wallet** *of type `address`*
3. **placement** *of type `tuple`*
4. **seals** *of type `tuple`*
5. **blockNumber** *of type `uint256`*
6. **operatorId** *of type `uint256`*

--- 
### walletOrderCancelledTimeoutMap(address)


**Execution cost**: less than 914 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### cancelOrders((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256)[])
>
>Cancel orders of msg.sender


**Execution cost**: No bound available


Params:

1. **orders** *of type `undefined`*

    > The orders to cancel



--- 
### challenge((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),address)
>
>Challenge cancelled order


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The trade that challenges a cancelled order

2. **wallet** *of type `undefined`*

    > The concerned wallet



[Back to the top ↑](#cancelorderschallenge)
