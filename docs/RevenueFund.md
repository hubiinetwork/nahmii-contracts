# RevenueFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/RevenueFund.sol)
> RevenueFund


**Execution cost**: less than 43336 gas

**Deployment cost**: less than 2096800 gas

**Combined cost**: less than 2140136 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### RegisterAccrualBeneficiaryEvent(address,int256)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **fraction** *of type `int256`*

--- 
### ReceiveEvent(address,string,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **balanceType** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

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
### DeregisterAccrualBeneficiaryEvent(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

--- 
### CloseAccrualPeriodEvent()


**Execution cost**: No bound available



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

--- 
### SetTransferControllerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldTransferControllerManager** *of type `address`*
2. **newTransferControllerManager** *of type `address`*

## Fallback


**Execution cost**: No bound available

**Attributes**: payable



## Methods
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




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
### aggregateAccrualBalance(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### getBeneficiaryFraction(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `int256`*

--- 
### closeAccrualPeriod()


**Execution cost**: No bound available




--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 809 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getTotalBeneficiaryFraction()


**Execution cost**: less than 680 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

--- 
### deregisterService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


--- 
### deployer()


**Execution cost**: less than 1138 gas

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
### DEPOSIT_BALANCE_TYPE()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### receiveTokens(string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **balanceType** *of type `string`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### registerService(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*


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
### receiveEthersTo(address,string)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **wallet** *of type `address`*
2. **balanceType** *of type `string`*


--- 
### registerFractionalBeneficiary(address,int256)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **fraction** *of type `int256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 874 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### receiveTokensTo(address,string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **balanceType** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*
6. **standard** *of type `string`*


--- 
### registerBeneficiary(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### registeredServicesMap(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

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
### setTransferControllerManager(address)
>
>Set the currency manager contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



--- 
### transferControllerManager()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

[Back to the top ↑](#revenuefund)
