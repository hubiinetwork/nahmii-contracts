# SignerManageable
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/SignerManageable.sol)


**Execution cost**: No bound available

**Deployment cost**: No bound available

**Combined cost**: No bound available

## Constructor



Params:

1. **manager** *of type `address`*

## Events
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

--- 
### SetSignerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldSignerManager** *of type `address`*
2. **newSignerManager** *of type `address`*


## Methods
### triggerDestroy()


**Execution cost**: No bound available




--- 
### deployer()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### ethrecover(bytes32,uint8,bytes32,bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*
2. **v** *of type `uint8`*
3. **r** *of type `bytes32`*
4. **s** *of type `bytes32`*

Returns:


1. **output_0** *of type `address`*

--- 
### isSignedBy(bytes32,uint8,bytes32,bytes32,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*
2. **v** *of type `uint8`*
3. **r** *of type `bytes32`*
4. **s** *of type `bytes32`*
5. **signer** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isSignedByRegisteredSigner(bytes32,uint8,bytes32,bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*
2. **v** *of type `uint8`*
3. **r** *of type `bytes32`*
4. **s** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setDeployer(address)


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*


--- 
### setOperator(address)


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*


--- 
### setSignerManager(address)


**Execution cost**: No bound available


Params:

1. **newSignerManager** *of type `address`*


--- 
### signerManager()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

[Back to the top ↑](#signermanageable)
