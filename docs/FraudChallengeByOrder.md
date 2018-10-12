# FraudChallengeByOrder
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/FraudChallengeByOrder.sol)
> FraudChallengeByOrder


**Execution cost**: less than 42148 gas

**Deployment cost**: less than 1002600 gas

**Combined cost**: less than 1044748 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### ChallengeByOrderEvent(tuple,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **challenger** *of type `address`*

--- 
### ChangeConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeSecurityBondEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### ChangeValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*


## Methods
### configuration()


**Execution cost**: No bound available

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
### changeFraudChallenge(address)
>
>Change the fraudChallenge contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) FraudChallenge contract instance



--- 
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### changeConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### challenge(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### changeSecurityBond(address)
>
>Change the security bond contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) SecurityBond contract instance



--- 
### changeValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### deployer()


**Execution cost**: less than 940 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 786 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### fraudChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 808 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### securityBond()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challenge((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256))
>
>Submit an order candidate in continuous Fraud Challenge (FC)


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > Fraudulent order candidate



[Back to the top ↑](#fraudchallengebyorder)
