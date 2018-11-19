# CancelOrdersChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/CancelOrdersChallenge.sol)
> CancelOrdersChallenge


**Execution cost**: less than 42843 gas

**Deployment cost**: less than 1656800 gas

**Combined cost**: less than 1699643 gas

## Constructor



Params:

1. **_owner** *of type `address`*

## Events
### CancelOrdersEvent(bytes32[],address)


**Execution cost**: No bound available


Params:

1. **orderOperatorHashes** *of type `bytes32[]`*
2. **wallet** *of type `address`*

--- 
### ChallengeEvent(bytes32,bytes32,address)


**Execution cost**: No bound available


Params:

1. **orderOperatorHash** *of type `bytes32`*
2. **tradeHash** *of type `bytes32`*
3. **wallet** *of type `address`*

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
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SetValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*


## Methods
### cancelOrders(tuple[])


**Execution cost**: No bound available


Params:

1. **orders** *of type `tuple[]`*


--- 
### cancelledOrderHashesByIndices(address,uint256,uint256)
>
>Get cancelled order hashes for given wallet in the given index range


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return the nonces of cancelled orders

2. **low** *of type `uint256`*

    > The lower inclusive index from which to extract orders

3. **up** *of type `uint256`*

    > The upper inclusive index from which to extract orders


Returns:

> The array of cancelled operator hashes

1. **output_0** *of type `bytes32[]`*

--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### cancellingWalletsCount()
>
>Get count of wallets that have cancelled orders


**Execution cost**: less than 529 gas

**Attributes**: constant



Returns:

> The count of cancelling wallets

1. **output_0** *of type `uint256`*

--- 
### cancellingWallets(uint256)


**Execution cost**: less than 1154 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### cancelledOrdersCount(address)
>
>Get count of cancelled orders for given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return the count of cancelled orders


Returns:

> The count of cancelled orders

1. **output_0** *of type `uint256`*

--- 
### challenge(tuple,address)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*


--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 767 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

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

> The challenge phase

1. **output_0** *of type `uint8`*

--- 
### deployer()


**Execution cost**: less than 1053 gas

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

> true if order is cancelled, else false

1. **output_0** *of type `bool`*

--- 
### setValidator(address)
>
>Set the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### operator()


**Execution cost**: less than 811 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setConfiguration(address)
>
>Set the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### walletCancelledOrderOperatorHashIndexMap(address,bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### walletCancelledOrderOperatorHashes(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### walletOrderCancelledTimeoutMap(address)


**Execution cost**: less than 895 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

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
