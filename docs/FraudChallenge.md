# FraudChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/FraudChallenge.sol)
> FraudChallenge


**Execution cost**: less than 44566 gas

**Deployment cost**: less than 3131400 gas

**Combined cost**: less than 3175966 gas

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
### addSeizedWallet(address)
>
>Add given wallet to store of seized wallets if not already present


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The seized wallet



--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



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
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### addFraudulentPayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


--- 
### ADD_SEIZED_WALLET_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### ADD_FRAUDULENT_TRADE_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### addFraudulentOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### addDoubleSpenderWallet(address)
>
>Add given wallets to store of double spender wallets if not already present


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The first wallet to add



--- 
### isFraudulentTradeHash(bytes32)
>
>Get the state about whether the given hash equals the hash of a fraudulent trade


**Execution cost**: less than 1360 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash to be tested


Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentOrderOperatorHashMap(bytes32)


**Execution cost**: less than 986 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



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


**Execution cost**: less than 1902 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1427 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### doubleSpenderWalletsMap(address)


**Execution cost**: less than 1457 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


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
### doubleSpenderWalletsCount()
>
>Get the number of wallets tagged as double spenders


**Execution cost**: less than 925 gas

**Attributes**: constant



Returns:

> Number of double spender wallets

1. **output_0** *of type `uint256`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 877 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isSeizedWallet(address)
>
>Get the seized status of given wallet


**Execution cost**: less than 1620 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet address for which to check seized status


Returns:

> true if wallet is seized, false otherwise

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
### fraudulentOrdersCount()
>
>Get the number of fraudulent orders


**Execution cost**: less than 1255 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### fraudulentPaymentsCount()
>
>Get the number of fraudulent payments


**Execution cost**: less than 969 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
### fraudulentPaymentOperatorHashMap(bytes32)


**Execution cost**: less than 1448 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

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
### isFraudulentPaymentOperatorHash(bytes32)
>
>Get the state about whether the given hash equals the operator hash of a fraudulent payment


**Execution cost**: less than 1338 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash to be tested


Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentTradeHashMap(bytes32)


**Execution cost**: less than 766 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isFraudulentOrderOperatorHash(bytes32)
>
>Get the state about whether the given hash equals the operator hash of a fraudulent order


**Execution cost**: less than 1624 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash to be tested


Returns:


1. **output_0** *of type `bool`*

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
### fraudulentTradesCount()
>
>Get the number of fraudulent trades


**Execution cost**: less than 661 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### isDoubleSpenderWallet(address)
>
>Get the double spender status of given wallet


**Execution cost**: less than 1422 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet address for which to check double spender status


Returns:

> true if wallet is double spender, false otherwise

1. **output_0** *of type `bool`*

--- 
### seizedWallets(uint256)


**Execution cost**: less than 1792 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

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
### isRegisteredService(address)
>
>Gauge whether a service contract is registered


**Execution cost**: less than 1026 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 965 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



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
### seizedWalletsMap(address)


**Execution cost**: less than 1193 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### serviceActivationTimeout()


**Execution cost**: less than 705 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
>
>Add given trade to store of fraudulent trades if not already present


**Execution cost**: No bound available




--- 
### addFraudulentPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Add given payment to store of fraudulent payments if not already present


**Execution cost**: No bound available




--- 
### addFraudulentTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))
>
>Add given order to store of fraudulent orders if not already present


**Execution cost**: No bound available




[Back to the top ↑](#fraudchallenge)
