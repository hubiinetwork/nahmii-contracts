# TestAuthorizableServable
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/TestAuthorizableServable.sol)
> TestAuthorizableServable


**Execution cost**: less than 42524 gas

**Deployment cost**: less than 1361400 gas

**Combined cost**: less than 1403924 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### AuthorizeInitiallyRegisteredServiceEvent(address,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*

--- 
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### AuthorizeRegisteredServiceActionEvent(address,address,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*
3. **action** *of type `string`*

--- 
### AuthorizeRegisteredServiceEvent(address,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*

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
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

--- 
### UnauthorizeRegisteredServiceActionEvent(address,address,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*
3. **action** *of type `string`*

--- 
### UnauthorizeRegisteredServiceEvent(address,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*


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
### authorizeRegisteredService(address)
>
>Authorize the given registered service by enabling all of actions
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service



--- 
### authorizeInitiallyRegisteredService(address)
>
>Add service to initial whitelist of services
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service



--- 
### initialServiceWalletUnauthorizedMap(address,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*

Returns:


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
### initialServiceAuthorizedMap(address)


**Execution cost**: less than 907 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

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


**Execution cost**: less than 1026 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### isAuthorizedRegisteredServiceAction(address,string,address)
>
>Gauge whether the given service action is authorized for the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service

2. **action** *of type `string`*

    > The concerned service action

3. **wallet** *of type `address`*

    > The address of the concerned wallet


Returns:

> true if service action is authorized for the given wallet, else false

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
### disableInitialServiceAuthorization()
>
>Disable further initial authorization of services
>
> This operation can not be undone


**Execution cost**: less than 21300 gas




--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 877 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

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


**Execution cost**: less than 921 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isAuthorizedRegisteredService(address,address)
>
>Gauge whether the given service is authorized for the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service

2. **wallet** *of type `address`*

    > The address of the concerned wallet


Returns:

> true if service is authorized for the given wallet, else false

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
### authorizeRegisteredServiceAction(address,string)
>
>Authorize the given registered service action
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service

2. **action** *of type `string`*

    > The concerned service action



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
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### deployer()


**Execution cost**: less than 1207 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### initialServiceAuthorizationDisabled()


**Execution cost**: less than 937 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### serviceActionWalletTouchedMap(address,bytes32,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*
3. **param_2** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### serviceActionWalletUnauthorizedMap(address,bytes32,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `bytes32`*
3. **param_2** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### serviceActivationTimeout()


**Execution cost**: less than 705 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### serviceWalletActionList(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### serviceWalletUnauthorizedMap(address,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

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
### unauthorizeRegisteredService(address)
>
>Unauthorize the given registered service by enabling all of actions
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service



--- 
### unauthorizeRegisteredServiceAction(address,string)
>
>Unauthorize the given registered service action
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service

2. **action** *of type `string`*

    > The concerned service action



[Back to the top ↑](#testauthorizableservable)
