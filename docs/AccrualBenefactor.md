# AccrualBenefactor
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/AccrualBenefactor.sol)


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
### RegisterAccrualBeneficiaryEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **fraction** *of type `uint256`*

--- 
### RegisterBeneficiaryEvent(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*


## Methods
### destructor()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### PARTS_PER()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getTotalBeneficiaryFraction()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
### getBeneficiaryFraction(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### isRegisteredBeneficiary(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### registerBeneficiary(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### registerFractionalBeneficiary(address,uint256)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **fraction** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### triggerDestroy()


**Execution cost**: No bound available




[Back to the top ↑](#accrualbenefactor)
