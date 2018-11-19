# AccrualBenefactor
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/AccrualBenefactor.sol)


**Execution cost**: No bound available

**Deployment cost**: No bound available

**Combined cost**: No bound available


## Events
### DeregisterAccrualBeneficiaryEvent(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

--- 
### DeregisterBeneficiaryEvent(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

--- 
### RegisterAccrualBeneficiaryEvent(address,int256)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **fraction** *of type `int256`*

--- 
### RegisterBeneficiaryEvent(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

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
### operator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deregisterBeneficiary(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### destructor()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getBeneficiaryFraction(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `int256`*

--- 
### getTotalBeneficiaryFraction()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

--- 
### isRegisteredBeneficiary(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### registerBeneficiary(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### registerFractionalBeneficiary(address,int256)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **fraction** *of type `int256`*

Returns:


1. **output_0** *of type `bool`*

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
### triggerDestroy()


**Execution cost**: No bound available




[Back to the top ↑](#accrualbenefactor)
