# AuthorizableServable
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/AuthorizableServable.sol)


**Execution cost**: No bound available

**Deployment cost**: No bound available

**Combined cost**: No bound available


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


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*

Returns:


1. **output_0** *of type `bool`*

--- 
### authorizeRegisteredService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### authorizeRegisteredServiceAction(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*


--- 
### isRegisteredActiveService(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isAuthorizedServiceActionForWallet(address,string,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*
3. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### disableServiceAction(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*


--- 
### changeDeployer(address)


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*


--- 
### destructor()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deregisterService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### isAuthorizedServiceForWallet(address,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### deployer()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### changeOperator(address)


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*


--- 
### enableServiceAction(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*


--- 
### isRegisteredService(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### registerService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### registerServiceDeferred(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### serviceActivationTimeout()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### setServiceActivationTimeout(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*


--- 
### triggerDestroy()


**Execution cost**: No bound available




--- 
### unauthorizeRegisteredService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### unauthorizeRegisteredServiceAction(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*


[Back to the top ↑](#authorizableservable)
