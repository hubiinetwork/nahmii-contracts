# AccessorManager
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/AccessorManager.sol)
> AccessorManager


**Execution cost**: No bound available

**Deployment cost**: less than 254400 gas

**Combined cost**: No bound available

## Constructor



Params:

1. **deployer** *of type `address`*

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
### RegisterSignerEvent(address)


**Execution cost**: No bound available


Params:

1. **signer** *of type `address`*


## Methods
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: less than 22910 gas


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: less than 22735 gas


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### deployer()


**Execution cost**: less than 691 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 559 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isSigner(address)
>
>Gauge whether an address is registered signer


**Execution cost**: less than 728 gas

**Attributes**: constant


Params:

1. **_address** *of type `address`*

    > The concerned address


Returns:

> true if address is registered signer, else false

1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 581 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### registerSigner(address)
>
>Registers a signer


**Execution cost**: less than 22647 gas


Params:

1. **newSigner** *of type `address`*

    > The address of the signer to register



--- 
### signersMap(address)


**Execution cost**: less than 609 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




[Back to the top ↑](#accessormanager)
