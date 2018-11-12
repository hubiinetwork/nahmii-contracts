# UnitTestHelpers
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/UnitTestHelpers.sol)
> UnitTestHelpers


**Execution cost**: less than 41598 gas

**Deployment cost**: less than 711600 gas

**Combined cost**: less than 753198 gas

## Constructor



Params:

1. **_owner** *of type `address`*

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
### ChangeTransferControllerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldTransferControllerManager** *of type `address`*
2. **newTransferControllerManager** *of type `address`*

--- 
### CloseAccrualPeriodEvent()


**Execution cost**: No bound available



--- 
### CloseAccrualPeriodWasCalled()


**Execution cost**: No bound available



--- 
### DepositEthersToWasCalled(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

--- 
### DepositTokensToWasCalled(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

## Fallback


**Execution cost**: less than 541 gas

**Attributes**: payable



## Methods
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### callToStage_SECURITYBOND(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **securityBond** *of type `address`*
2. **wallet** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyid** *of type `uint256`*


--- 
### callToDepositTokens_TOKENHOLDERREVENUEFUND(address,address,int256)


**Execution cost**: No bound available


Params:

1. **tokenHolderRevenueFund** *of type `address`*
2. **token** *of type `address`*
3. **amount** *of type `int256`*


--- 
### callToCloseAccrualPeriod_TOKENHOLDERREVENUEFUND(address)


**Execution cost**: No bound available


Params:

1. **tokenHolderRevenueFund** *of type `address`*


--- 
### balanceBlocksIn(address,uint256,uint256)


**Execution cost**: less than 569 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### callToSeizeAllBalances_CLIENTFUND(address,address,address)


**Execution cost**: No bound available


Params:

1. **clientFund** *of type `address`*
2. **sourceWallet** *of type `address`*
3. **destWallet** *of type `address`*


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
### setTransferControllerManager(address)
>
>Change the currency manager contract


**Execution cost**: less than 23000 gas


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



--- 
### callToUpdateSettledBalance_CLIENTFUND(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **clientFund** *of type `address`*
2. **wallet** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*


--- 
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: less than 23127 gas


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: less than 22820 gas


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### closeAccrualPeriod()


**Execution cost**: less than 1335 gas




--- 
### deployer()


**Execution cost**: less than 908 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### depositEthersTo(address)


**Execution cost**: less than 1453 gas

**Attributes**: payable


Params:

1. **wallet** *of type `address`*


--- 
### depositTokensTo(address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 688 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 754 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### send_money(address,uint256)


**Execution cost**: No bound available


Params:

1. **target** *of type `address`*
2. **amount** *of type `uint256`*


--- 
### transferControllerManager()


**Execution cost**: less than 864 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

[Back to the top ↑](#unittesthelpers)
