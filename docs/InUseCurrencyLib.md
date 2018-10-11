# InUseCurrencyLib
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/InUseCurrencyLib.sol)


**Execution cost**: less than 458 gas

**Deployment cost**: less than 374200 gas

**Combined cost**: less than 374658 gas




## Methods
### INVALID_INDEX()


**Execution cost**: less than 426 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### addItem(InUseCurrencyLib.InUseCurrency storage,address,uint256)
>
>NOTE: Does not like "add" because we use assembly


**Execution cost**: No bound available


Params:

1. **i** *of type `InUseCurrencyLib.InUseCurrency storage`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*


--- 
### clear(InUseCurrencyLib.InUseCurrency storage)


**Execution cost**: No bound available


Params:

1. **i** *of type `InUseCurrencyLib.InUseCurrency storage`*


--- 
### getAt(InUseCurrencyLib.InUseCurrency storage,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **i** *of type `InUseCurrencyLib.InUseCurrency storage`*
2. **idx** *of type `uint256`*

Returns:


1. **output_0** *of type `tuple`*

--- 
### getLength(InUseCurrencyLib.InUseCurrency storage)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **i** *of type `InUseCurrencyLib.InUseCurrency storage`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### getPos(InUseCurrencyLib.InUseCurrency storage,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **i** *of type `InUseCurrencyLib.InUseCurrency storage`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### removeItem(InUseCurrencyLib.InUseCurrency storage,address,uint256)


**Execution cost**: No bound available


Params:

1. **i** *of type `InUseCurrencyLib.InUseCurrency storage`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*


--- 
### removeItemAt(InUseCurrencyLib.InUseCurrency storage,uint256)


**Execution cost**: No bound available


Params:

1. **i** *of type `InUseCurrencyLib.InUseCurrency storage`*
2. **idx** *of type `uint256`*


[Back to the top ↑](#inusecurrencylib)
