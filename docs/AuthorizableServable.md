# AuthorizableServable
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/AuthorizableServable.sol)


**Execution cost**: No bound available

**Deployment cost**: No bound available

**Combined cost**: No bound available


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
### authorizeInitiallyRegisteredService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


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


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### initialServiceAuthorizedMap(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

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
### isAuthorizedRegisteredServiceAction(address,string,address)


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
### disableInitialServiceAuthorization()


**Execution cost**: No bound available




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
### operator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isAuthorizedRegisteredService(address,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### changeOperator(address)


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*


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
### changeDeployer(address)


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*


--- 
### deployer()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### initialServiceAuthorizationDisabled()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### registerServiceDeferred(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


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


**Execution cost**: No bound available

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
