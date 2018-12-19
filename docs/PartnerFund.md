# PartnerFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/PartnerFund.sol)
> PartnerFund


**Execution cost**: less than 43307 gas

**Deployment cost**: less than 2067800 gas

**Combined cost**: less than 2111107 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### ReceiveEvent(address,address,int256,address,uint256)


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

--- 
### SetdFeeEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **fee** *of type `uint256`*

--- 
### SetdWalletEvent(address,address,address)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **oldWallet** *of type `address`*
3. **newWallet** *of type `address`*

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


**Execution cost**: less than 723 gas

**Attributes**: payable



## Methods
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



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
### ACTIVE_BALANCE()


**Execution cost**: less than 1087 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

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
### setPartnerFee(address,uint256)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **fee** *of type `uint256`*


--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 808 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getPartnerFee(address)


**Execution cost**: less than 1542 gas

**Attributes**: constant


Params:

1. **tag** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

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
### deployer()


**Execution cost**: less than 1248 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 896 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### receiveTokensTo(address,string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **balance** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*
6. **standard** *of type `string`*


--- 
### depositsCount(address)


**Execution cost**: less than 1652 gas

**Attributes**: constant


Params:

1. **tag** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

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
### depositCountFromAddress(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### receiveEthersTo(address,string)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **tag** *of type `address`*
2. **balance** *of type `string`*


--- 
### receiveTokens(string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **balance** *of type `string`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### registerPartner(address,uint256,bool,bool)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **fee** *of type `uint256`*
3. **canChangeAddress** *of type `bool`*
4. **ownerCanChangeAddress** *of type `bool`*


--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setPartnerWallet(address,address)


**Execution cost**: No bound available


Params:

1. **tag** *of type `address`*
2. **newWallet** *of type `address`*


--- 
### setTransferControllerManager(address)
>
>Set the currency manager contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



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
