# TokenHolderRevenueFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/TokenHolderRevenueFund.sol)
> TokenHolderRevenueFund


**Execution cost**: less than 43705 gas

**Deployment cost**: less than 2413600 gas

**Combined cost**: less than 2457305 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### CloseAccrualPeriodEvent()


**Execution cost**: No bound available



--- 
### ClaimAccrualEvent(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

--- 
### DisableServiceActionEvent(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*

--- 
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

--- 
### ReceiveEvent(address,string,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **balanceType** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

--- 
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### DeregisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### EnableServiceActionEvent(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*

--- 
### SetRevenueTokenEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldRevenueToken** *of type `address`*
2. **newRevenueToken** *of type `address`*

--- 
### SetTransferControllerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldTransferControllerManager** *of type `address`*
2. **newTransferControllerManager** *of type `address`*

--- 
### WithdrawEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **to** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

## Fallback


**Execution cost**: No bound available

**Attributes**: payable



## Methods
### depositsCount(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

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
### aggregateAccrualMap(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


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


**Execution cost**: less than 1045 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### periodAccrualBalance(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

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
### aggregateAccrualBalance(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 896 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deposit(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **index** *of type `uint256`*

Returns:


1. **amount** *of type `int256`*
2. **blockNumber** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



--- 
### operator()


**Execution cost**: less than 962 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### closeAccrualPeriod()


**Execution cost**: No bound available




--- 
### CLOSE_ACCRUAL_PERIOD_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### periodAccrualMap(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

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
### receiveTokensTo(address,string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **balanceType** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*
6. **standard** *of type `string`*


--- 
### deployer()


**Execution cost**: less than 1358 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### DEPOSIT_BALANCE_TYPE()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### receiveTokens(string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **balanceType** *of type `string`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### claimAccrual(address,uint256)


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*


--- 
### receiveEthersTo(address,string)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **wallet** *of type `address`*
2. **balanceType** *of type `string`*


--- 
### setTransferControllerManager(address)
>
>Set the currency manager contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



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


**Execution cost**: less than 724 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setRevenueToken(address)
>
>Set the revenue token contract


**Execution cost**: No bound available


Params:

1. **newRevenueToken** *of type `address`*

    > The (address of) RevenueToken contract instance



--- 
### setServiceActivationTimeout(uint256)
>
>Set the service activation timeout


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

    > The set timeout in unit of seconds



--- 
### stagedBalance(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### transferControllerManager()


**Execution cost**: No bound available

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
### withdraw(int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **standard** *of type `string`*


--- 
### withdrawal(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **index** *of type `uint256`*

Returns:


1. **amount** *of type `int256`*
2. **blockNumber** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### withdrawalsCount(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

[Back to the top ↑](#tokenholderrevenuefund)
