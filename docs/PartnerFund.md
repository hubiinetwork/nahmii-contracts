# PartnerFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/PartnerFund.sol)
> PartnerFund


**Execution cost**: less than 43005 gas

**Deployment cost**: less than 1800600 gas

**Combined cost**: less than 1843605 gas

## Constructor



Params:

1. **owner** *of type `address`*

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
### ChangedFeeEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **fee** *of type `uint256`*

--- 
### ChangedWalletEvent(address,address,address)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **oldWallet** *of type `address`*
3. **newWallet** *of type `address`*

--- 
### DepositEvent(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **from** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

--- 
### RegisterParnerEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **fee** *of type `uint256`*

--- 
### StageEvent(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **from** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

--- 
### WithdrawEvent(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **to** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

## Fallback


**Execution cost**: less than 701 gas

**Attributes**: payable



## Methods
### changePartnerFee(address,uint256)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **fee** *of type `uint256`*


--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### activeBalance(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **tag** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

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
### activeBalanceFromAddress(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### getPartnerAddress(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **tag** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### depositCount(address)


**Execution cost**: less than 1960 gas

**Attributes**: constant


Params:

1. **tag** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### deployer()


**Execution cost**: less than 1182 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### changeTransferControllerManager(address)
>
>Change the currency manager contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



--- 
### deposit(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **tag** *of type `address`*
2. **index** *of type `uint256`*

Returns:


1. **balance** *of type `int256`*
2. **blockNumber** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### depositEthersTo(address)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **tag** *of type `address`*


--- 
### depositCountFromAddress(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### getPartnerFee(address)


**Execution cost**: less than 1586 gas

**Attributes**: constant


Params:

1. **tag** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### depositTokensTo(address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### depositFromAddress(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **index** *of type `uint256`*

Returns:


1. **balance** *of type `int256`*
2. **blockNumber** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

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


**Execution cost**: less than 852 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 962 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### registerPartner(address,uint256,bool,bool)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **fee** *of type `uint256`*
3. **canChangeAddress** *of type `bool`*
4. **ownerCanChangeAddress** *of type `bool`*


--- 
### setPartnerWallet(address,address)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **newWallet** *of type `address`*


--- 
### stage(int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*


--- 
### stagedBalance(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **tag** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### stagedBalanceFromAddress(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### transferControllerManager()


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
### withdraw(int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **standard** *of type `string`*


[Back to the top ↑](#partnerfund)
