# SignerManager
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/SignerManager.sol)
> SignerManager


**Execution cost**: No bound available

**Deployment cost**: less than 380200 gas

**Combined cost**: No bound available

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### RegisterSignerEvent(address)


**Execution cost**: No bound available


Params:

1. **signer** *of type `address`*

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
### isSigner(address)
>
>Gauge whether an address is registered signer


**Execution cost**: less than 747 gas

**Attributes**: constant


Params:

1. **_address** *of type `address`*

    > The concerned address


Returns:

> true if address is registered signer, else false

1. **output_0** *of type `bool`*

--- 
### signerIndicesMap(address)


**Execution cost**: less than 531 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### deployer()


**Execution cost**: less than 779 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 603 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 625 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### registerSigner(address)
>
>Registers a signer


**Execution cost**: less than 63102 gas


Params:

1. **newSigner** *of type `address`*

    > The address of the signer to register



--- 
### signerIndex(address)
>
>Get the 0 based index of the given address in the list of signers


**Execution cost**: less than 1039 gas

**Attributes**: constant


Params:

1. **_address** *of type `address`*

    > The concerned address


Returns:

> The index of the signer address

1. **output_0** *of type `uint256`*

--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: less than 22954 gas


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: less than 22933 gas


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### signers(uint256)


**Execution cost**: less than 881 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### signersByIndices(uint256,uint256)
>
>Get the subset of registered signers in the given 0 based index range


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **low** *of type `uint256`*

    > The lower inclusive index

2. **up** *of type `uint256`*

    > The upper inclusive index


Returns:

> The subset of registered signers

1. **output_0** *of type `address[]`*

--- 
### signersCount()
>
>Get the count of registered signers


**Execution cost**: less than 648 gas

**Attributes**: constant



Returns:

> The count of registered signers

1. **output_0** *of type `uint256`*

--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




[Back to the top ↑](#signermanager)
