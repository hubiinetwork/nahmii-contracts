# TestAuthorizableServable
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/TestAuthorizableServable.sol)
> TestAuthorizableServable


**Execution cost**: less than 42254 gas

**Deployment cost**: less than 1102600 gas

**Combined cost**: less than 1144854 gas

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
### AuthorizeRegisteredServiceEvent(address,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*

--- 
### AuthorizeRegisteredServiceActionEvent(address,address,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*
3. **action** *of type `string`*

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
### isAuthorizedServiceActionForWallet(address,string,address)
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
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 789 gas

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
### isAuthorizedServiceForWallet(address,address)
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
### deployer()


**Execution cost**: less than 1031 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



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


**Execution cost**: less than 960 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 855 gas

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
### serviceActivationTimeout()


**Execution cost**: less than 617 gas

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
