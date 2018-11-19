# MockedSecurityBondService
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedSecurityBondService.sol)
> MockedSecurityBondService


**Execution cost**: less than 41512 gas

**Deployment cost**: less than 371200 gas

**Combined cost**: less than 412712 gas

## Constructor



Params:

1. **deployer** *of type `address`*

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
### SetSecurityBondEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*


## Methods
### deployer()


**Execution cost**: less than 833 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deprive(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*


--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 635 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 679 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### reward(address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **rewardFraction** *of type `uint256`*
3. **unlockTimeoutInSeconds** *of type `uint256`*


--- 
### securityBond()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setSecurityBond(address)
>
>Set the security bond contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) SecurityBond contract instance



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




[Back to the top ↑](#mockedsecuritybondservice)
