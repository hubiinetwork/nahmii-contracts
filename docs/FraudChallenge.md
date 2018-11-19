# FraudChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/FraudChallenge.sol)
> FraudChallenge


**Execution cost**: less than 42348 gas

**Deployment cost**: less than 1194600 gas

**Combined cost**: less than 1236948 gas

## Constructor



Params:

1. **deployer** *of type `address`*

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
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### fraudulentOrderHashesCount()
>
>Get the number of fraudulent order hashes


**Execution cost**: less than 485 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
### fraudulentByOrderHash(bytes32)


**Execution cost**: less than 1580 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

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
### ADD_FRAUDULENT_PAYMENT_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 767 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### addDoubleSpenderWallet(address)
>
>Add given wallets to store of double spender wallets if not already present


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The first wallet to add



--- 
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



--- 
### addFraudulentOrderHash(bytes32)
>
>Add given order hash to store of fraudulent order hashes if not already present


**Execution cost**: No bound available


Params:

1. **hash** *of type `bytes32`*


--- 
### doubleSpenderByWallet(address)


**Execution cost**: less than 1611 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

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
### addFraudulentTradeHash(bytes32)
>
>Add given trade hash to store of fraudulent trade hashes if not already present


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


**Execution cost**: less than 815 gas

**Attributes**: constant



Returns:

> Number of double spender wallets

1. **output_0** *of type `uint256`*

--- 
### doubleSpenderWallets(uint256)


**Execution cost**: less than 1792 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### fraudulentByTradeHash(bytes32)


**Execution cost**: less than 1096 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### deployer()


**Execution cost**: less than 1295 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### addFraudulentPaymentHash(bytes32)
>
>Add given payment hash to store of fraudulent payment hashes if not already present


**Execution cost**: No bound available


Params:

1. **hash** *of type `bytes32`*


--- 
### fraudulentOrderHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### fraudulentByPaymentHash(bytes32)


**Execution cost**: less than 1272 gas

**Attributes**: constant


Params:

1. **param_0** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### ADD_SEIZED_WALLET_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### setServiceActivationTimeout(uint256)
>
>Set the service activation timeout


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

    > The set timeout in unit of seconds



--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### isDoubleSpenderWallet(address)
>
>Get the double spender status of given wallet


**Execution cost**: less than 1334 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet address for which to check double spender status


Returns:

> true if wallet is double spender, false otherwise

1. **output_0** *of type `bool`*

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
### isFraudulentTradeHash(bytes32)
>
>Get the state about whether the given hash equals the hash of a fraudulent trade


**Execution cost**: less than 1316 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash to be tested


Returns:

> true if hash is the one of a fraudulent trade, else false

1. **output_0** *of type `bool`*

--- 
### isRegisteredService(address)
>
>Gauge whether a service contract is registered


**Execution cost**: less than 938 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### fraudulentTradeHashesCount()
>
>Get the number of fraudulent trade hashes


**Execution cost**: less than 1123 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### isFraudulentPaymentHash(bytes32)
>
>Get the state about whether the given hash equals the hash of a fraudulent payment


**Execution cost**: less than 1118 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash to be tested


Returns:

> true if hash is the one of a fraudulent payment, else null

1. **output_0** *of type `bool`*

--- 
### fraudulentTradeHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### operator()


**Execution cost**: less than 855 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isFraudulentOrderHash(bytes32)
>
>Get the state about whether the given hash equals the hash of a fraudulent order


**Execution cost**: less than 1448 gas

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash to be tested


Returns:


1. **output_0** *of type `bool`*

--- 
### fraudulentPaymentHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### fraudulentPaymentHashesCount()
>
>Get the number of fraudulent payment hashes


**Execution cost**: less than 749 gas

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
### serviceActivationTimeout()


**Execution cost**: less than 595 gas

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
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


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




[Back to the top ↑](#fraudchallenge)
