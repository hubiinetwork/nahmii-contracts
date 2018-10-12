# RevenueFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/RevenueFund.sol)
> RevenueFund


**Execution cost**: less than 42913 gas

**Deployment cost**: less than 1715400 gas

**Combined cost**: less than 1758313 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### RegisterAccrualBeneficiaryEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **fraction** *of type `uint256`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeTransferControllerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldTransferControllerManager** *of type `address`*
2. **newTransferControllerManager** *of type `address`*

--- 
### CloseAccrualPeriodEvent()


**Execution cost**: No bound available



--- 
### DepositEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

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
### DeregisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### RegisterBeneficiaryEvent(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

--- 
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

## Fallback


**Execution cost**: No bound available

**Attributes**: payable



## Methods
### depositTokensTo(address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### PARTS_PER()


**Execution cost**: less than 348 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### deregisterService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### aggregateAccrualBalance(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### getBeneficiaryFraction(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### depositTokens(int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **standard** *of type `string`*


--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 897 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### closeAccrualPeriod()


**Execution cost**: No bound available




--- 
### deployer()


**Execution cost**: less than 1094 gas

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
### changeTransferControllerManager(address)
>
>Change the currency manager contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



--- 
### depositEthersTo(address)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **wallet** *of type `address`*


--- 
### getTotalBeneficiaryFraction()


**Execution cost**: less than 768 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### isRegisteredBeneficiary(address)
>
>Gauge whether the given address is the one of a registered beneficiary


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **beneficiary** *of type `address`*

    > Address of beneficiary


Returns:

> true if beneficiary is registered, else false

1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 984 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### periodAccrualBalance(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

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
### registerService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### transferControllerManager()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

[Back to the top ↑](#revenuefund)
