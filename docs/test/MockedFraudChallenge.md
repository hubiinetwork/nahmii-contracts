# MockedFraudChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedFraudChallenge.sol)
> MockedFraudChallenge


**Execution cost**: less than 42363 gas

**Deployment cost**: less than 1198200 gas

**Combined cost**: less than 1240563 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### AddDoubleSpenderWalletEvent(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

--- 
### AddFraudulentOrderHashEvent(bytes32)


**Execution cost**: No bound available


Params:

1. **hash** *of type `bytes32`*

--- 
### AddFraudulentPaymentHashEvent(bytes32)


**Execution cost**: No bound available


Params:

1. **hash** *of type `bytes32`*

--- 
### AddFraudulentTradeHashEvent(bytes32)


**Execution cost**: No bound available


Params:

1. **hash** *of type `bytes32`*

--- 
### DeregisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### DisableServiceActionEvent(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*

--- 
### EnableServiceActionEvent(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*

--- 
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

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


## Methods
### addFraudulentPaymentHash(bytes32)


**Execution cost**: No bound available


Params:

1. **hash** *of type `bytes32`*


--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### _reset()


**Execution cost**: No bound available




--- 
### isRegisteredActiveService(address)
>
>Gauge whether a service contract is registered and active


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered and activate, else false

1. **output_0** *of type `bool`*

--- 
### enableServiceAction(address,string)
>
>Enable a named action in an already registered service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the registered service contract

2. **action** *of type `string`*

    > The name of the action to be enabled



--- 
### isRegisteredService(address)
>
>Gauge whether a service contract is registered


**Execution cost**: less than 982 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### disableServiceAction(address,string)
>
>Enable a named action in a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract

2. **action** *of type `string`*

    > The name of the action to be disabled



--- 
### fraudulentByOrderHash(bytes32)


**Execution cost**: less than 1734 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 811 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### addDoubleSpenderWallet(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*


--- 
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



--- 
### ADD_FRAUDULENT_PAYMENT_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### addFraudulentOrderHash(bytes32)


**Execution cost**: No bound available


Params:

1. **hash** *of type `bytes32`*


--- 
### operator()


**Execution cost**: less than 921 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### fraudulentPaymentHash()


**Execution cost**: less than 816 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### isEnabledServiceAction(address,string)
>
>Gauge whether a service contract action is enabled which implies also registered and active


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract

2. **action** *of type `string`*

    > The name of action


Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentPaymentHashesCount()
>
>Get the number of fraudulent payment hashes


**Execution cost**: less than 837 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### fraudulentOrderHash()


**Execution cost**: less than 871 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### addFraudulentTradeHash(bytes32)


**Execution cost**: No bound available


Params:

1. **hash** *of type `bytes32`*


--- 
### ADD_FRAUDULENT_TRADE_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### doubleSpenderWalletsCount()
>
>Get the number of wallets tagged as double spenders


**Execution cost**: less than 925 gas

**Attributes**: constant



Returns:

> Number of double spender wallets

1. **output_0** *of type `uint256`*

--- 
### doubleSpenderByWallet(address)


**Execution cost**: less than 1765 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentByTradeHash(bytes32)


**Execution cost**: less than 1206 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isFraudulentPaymentHash(bytes32)


**Execution cost**: less than 1175 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentOrderHashesCount()
>
>Get the number of fraudulent order hashes


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### ADD_FRAUDULENT_ORDER_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### isDoubleSpenderWallet(address)
>
>Get the double spender status of given wallet


**Execution cost**: less than 1444 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet address for which to check double spender status


Returns:

> true if wallet is double spender, false otherwise

1. **output_0** *of type `bool`*

--- 
### ADD_DOUBLE_SPENDER_WALLET_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### ADD_SEIZED_WALLET_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### fraudulentPaymentHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### fraudulentByPaymentHash(bytes32)


**Execution cost**: less than 1382 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentOrderHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### isFraudulentTradeHash(bytes32)


**Execution cost**: less than 1373 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isFraudulentOrderHash(bytes32)


**Execution cost**: less than 1538 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentTradeHashesCount()
>
>Get the number of fraudulent trade hashes


**Execution cost**: less than 1233 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### fraudulentTradeHash()


**Execution cost**: less than 1278 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### doubleSpenderWallets(uint256)


**Execution cost**: less than 1946 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1449 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### fraudulentTradeHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### serviceActivationTimeout()


**Execution cost**: less than 639 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setFraudulentOrderOperatorHash(bool)


**Execution cost**: less than 20534 gas


Params:

1. **_fraudulentOrderHash** *of type `bool`*


--- 
### setFraudulentPaymentOperatorHash(bool)


**Execution cost**: less than 20790 gas


Params:

1. **_fraudulentPaymentHash** *of type `bool`*


--- 
### setFraudulentTradeHash(bool)


**Execution cost**: less than 21340 gas


Params:

1. **_fraudulentTradeHash** *of type `bool`*


--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setServiceActivationTimeout(uint256)
>
>Set the service activation timeout


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

    > The set timeout in unit of seconds



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




[Back to the top ↑](#mockedfraudchallenge)
