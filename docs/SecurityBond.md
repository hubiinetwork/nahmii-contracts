# SecurityBond
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/SecurityBond.sol)
> SecurityBond


**Execution cost**: less than 63168 gas

**Deployment cost**: less than 1944000 gas

**Combined cost**: less than 2007168 gas

## Constructor



Params:

1. **_owner** *of type `address`*

## Events
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeTransferControllerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldTransferControllerManager** *of type `address`*
2. **newTransferControllerManager** *of type `address`*

--- 
### CloseAccrualPeriodEvent()


**Execution cost**: No bound available



--- 
### DepositEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

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
### StageEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

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
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### STAGE_ACTION()


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
### activeBalance(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### depositsCount(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

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
### closeAccrualPeriod()


**Execution cost**: less than 1599 gas




--- 
### depositTokens(int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **standard** *of type `string`*


--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 918 gas

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
2. **timestamp** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### depositTokensTo(address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



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
### deployer()


**Execution cost**: less than 1270 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setTransferControllerManager(address)
>
>Change the currency manager contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



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
### depositEthersTo(address)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **wallet** *of type `address`*


--- 
### stage(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### operator()


**Execution cost**: less than 1006 gas

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
### serviceActivationTimeout()


**Execution cost**: less than 724 gas

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
### setWithdrawalTimeout(uint256)


**Execution cost**: less than 21059 gas


Params:

1. **timeoutInSeconds** *of type `uint256`*


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
2. **timestamp** *of type `uint256`*
3. **token** *of type `address`*
4. **id** *of type `uint256`*

--- 
### withdrawalsCount(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

[Back to the top ↑](#securitybond)
