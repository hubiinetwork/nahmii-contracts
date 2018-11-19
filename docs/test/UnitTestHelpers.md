# UnitTestHelpers
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/UnitTestHelpers.sol)
> UnitTestHelpers


**Execution cost**: less than 41559 gas

**Deployment cost**: less than 677600 gas

**Combined cost**: less than 719159 gas

## Constructor



Params:

1. **_owner** *of type `address`*

## Events
### CloseAccrualPeriodEvent()


**Execution cost**: No bound available



--- 
### CloseAccrualPeriodWasCalled()


**Execution cost**: No bound available



--- 
### DepositEthersToWasCalled(address,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **balance** *of type `string`*

--- 
### DepositTokensToWasCalled(address,string,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **balance** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

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


**Execution cost**: less than 475 gas

**Attributes**: payable



## Methods
### receiveEthersTo(address,string)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **wallet** *of type `address`*
2. **balance** *of type `string`*


--- 
### callToDepositTokens_TOKENHOLDERREVENUEFUND(address,address,int256)


**Execution cost**: No bound available


Params:

1. **tokenHolderRevenueFund** *of type `address`*
2. **token** *of type `address`*
3. **amount** *of type `int256`*


--- 
### callToDepositTokens_REVENUEFUND(address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **revenueFund** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### callToCloseAccrualPeriod_TOKENHOLDERREVENUEFUND(address)


**Execution cost**: No bound available


Params:

1. **tokenHolderRevenueFund** *of type `address`*


--- 
### balanceBlocksIn(address,uint256,uint256)


**Execution cost**: less than 503 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### transferControllerManager()


**Execution cost**: less than 820 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### closeAccrualPeriod()


**Execution cost**: less than 1291 gas




--- 
### deployer()


**Execution cost**: less than 886 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 622 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 666 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### receiveTokensTo(address,string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **balance** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*
6. **standard** *of type `string`*


--- 
### send_money(address,uint256)


**Execution cost**: No bound available


Params:

1. **target** *of type `address`*
2. **amount** *of type `uint256`*


--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: less than 22930 gas


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: less than 23039 gas


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setTransferControllerManager(address)
>
>Set the currency manager contract


**Execution cost**: less than 22978 gas


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




[Back to the top ↑](#unittesthelpers)
