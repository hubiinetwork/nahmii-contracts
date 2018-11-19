# Servable
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/Servable.sol)


**Execution cost**: No bound available

**Deployment cost**: No bound available

**Combined cost**: No bound available


## Events
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
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*


## Methods
### operator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setOperator(address)


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*


--- 
### setDeployer(address)


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*


--- 
### isEnabledServiceAction(address,string)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isRegisteredService(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### enableServiceAction(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*


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
### isRegisteredActiveService(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### disableServiceAction(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*


--- 
### deployer()


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




[Back to the top ↑](#servable)
