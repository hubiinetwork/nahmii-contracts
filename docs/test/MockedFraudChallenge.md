# MockedFraudChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedFraudChallenge.sol)
> MockedFraudChallenge


**Execution cost**: less than 44574 gas

**Deployment cost**: less than 3135200 gas

**Combined cost**: less than 3179774 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### AddSeizedWalletEvent(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

--- 
### AddFraudulentOrderEvent(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*

--- 
### AddFraudulentTradeEvent(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*

--- 
### AddFraudulentPaymentEvent(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*

--- 
### AddDoubleSpenderWalletEvent(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

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
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*


## Methods
### fraudulentOrderOperatorHash()


**Execution cost**: less than 1069 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentOrders(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **wallet** *of type `address`*
3. **placement** *of type `tuple`*
4. **seals** *of type `tuple`*
5. **blockNumber** *of type `uint256`*
6. **operatorId** *of type `uint256`*

--- 
### ADD_FRAUDULENT_PAYMENT_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### addFraudulentTrade(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*


--- 
### ADD_FRAUDULENT_ORDER_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### ADD_DOUBLE_SPENDER_WALLET_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



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
### doubleSpenderWallets(uint256)


**Execution cost**: less than 2056 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1559 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### addFraudulentPayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


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
### doubleSpenderWalletsMap(address)


**Execution cost**: less than 1545 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 921 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### fraudulentOrderOperatorHashMap(bytes32)


**Execution cost**: less than 1030 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

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
### ADD_SEIZED_WALLET_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### addSeizedWallet(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*


--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### addFraudulentOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### doubleSpenderWalletsCount()
>
>Get the number of wallets tagged as double spenders


**Execution cost**: less than 991 gas

**Attributes**: constant



Returns:

> Number of double spender wallets

1. **output_0** *of type `uint256`*

--- 
### ADD_FRAUDULENT_TRADE_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### seizedWallets(uint256)


**Execution cost**: less than 1924 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### seizedWalletsMap(address)


**Execution cost**: less than 1259 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentPaymentsCount()
>
>Get the number of fraudulent payments


**Execution cost**: less than 1035 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
### operator()


**Execution cost**: less than 1031 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### isDoubleSpenderWallet(address)
>
>Get the double spender status of given wallet


**Execution cost**: less than 1510 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet address for which to check double spender status


Returns:

> true if wallet is double spender, false otherwise

1. **output_0** *of type `bool`*

--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



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
### isFraudulentPaymentOperatorHash(bytes32)


**Execution cost**: less than 1373 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isFraudulentTradeHash(bytes32)


**Execution cost**: less than 1395 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentTradeHashMap(bytes32)


**Execution cost**: less than 788 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentTradesCount()
>
>Get the number of fraudulent trades


**Execution cost**: less than 705 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### fraudulentTradeHash()


**Execution cost**: less than 1300 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### isFraudulentOrderOperatorHash(bytes32)


**Execution cost**: less than 1714 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### seizedWalletsCount()
>
>Get the number of wallets whose funds have be seized


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> Number of seized wallets

1. **output_0** *of type `uint256`*

--- 
### fraudulentPaymentOperatorHashMap(bytes32)


**Execution cost**: less than 1580 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isSeizedWallet(address)
>
>Get the seized status of given wallet


**Execution cost**: less than 1752 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet address for which to check seized status


Returns:

> true if wallet is seized, false otherwise

1. **output_0** *of type `bool`*

--- 
### fraudulentOrdersCount()
>
>Get the number of fraudulent orders


**Execution cost**: less than 1387 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### fraudulentPaymentOperatorHash()


**Execution cost**: less than 706 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### reset()


**Execution cost**: No bound available




--- 
### isRegisteredService(address)
>
>Gauge whether a service contract is registered


**Execution cost**: less than 1048 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### fraudulentPayments(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **amount** *of type `int256`*
3. **currency** *of type `tuple`*
4. **sender** *of type `tuple`*
5. **recipient** *of type `tuple`*
6. **transfers** *of type `tuple`*
7. **seals** *of type `tuple`*
8. **blockNumber** *of type `uint256`*
9. **operatorId** *of type `uint256`*

--- 
### fraudulentTrades(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **amount** *of type `int256`*
3. **currencies** *of type `tuple`*
4. **rate** *of type `int256`*
5. **buyer** *of type `tuple`*
6. **seller** *of type `tuple`*
7. **transfers** *of type `tuple`*
8. **seal** *of type `tuple`*
9. **blockNumber** *of type `uint256`*
10. **operatorId** *of type `uint256`*

--- 
### serviceActivationTimeout()


**Execution cost**: less than 749 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### setFraudulentOrderOperatorHash(bool)


**Execution cost**: less than 20534 gas


Params:

1. **_fraudulentOrderOperatorHash** *of type `bool`*


--- 
### setFraudulentPaymentOperatorHash(bool)


**Execution cost**: less than 20922 gas


Params:

1. **_fraudulentPaymentOperatorHash** *of type `bool`*


--- 
### setFraudulentTradeHash(bool)


**Execution cost**: less than 21362 gas


Params:

1. **_fraudulentTradeHash** *of type `bool`*


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




--- 
### addFraudulentOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### addFraudulentPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### addFraudulentTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




[Back to the top ↑](#mockedfraudchallenge)
