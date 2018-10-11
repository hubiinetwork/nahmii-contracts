# Migrations
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/Migrations.sol)


**Execution cost**: less than 41015 gas

**Deployment cost**: less than 238000 gas

**Combined cost**: less than 279015 gas

## Constructor




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


## Methods
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: less than 22888 gas


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


**Execution cost**: less than 669 gas

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
### last_completed_migration()


**Execution cost**: less than 428 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### operator()


**Execution cost**: less than 625 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setCompleted(uint256)


**Execution cost**: less than 20645 gas


Params:

1. **completed** *of type `uint256`*


--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### upgrade(address)


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*


[Back to the top ↑](#migrations)
