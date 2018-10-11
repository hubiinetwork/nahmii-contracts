# MockedClientFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedClientFund.sol)
> MockedClientFund


**Execution cost**: less than 651 gas

**Deployment cost**: less than 619400 gas

**Combined cost**: less than 620051 gas

## Constructor




## Events
### SeizeAllBalancesEvent(address,address)


**Execution cost**: No bound available


Params:

1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*

--- 
### StageEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### UpdateSettledBalanceEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


## Methods
### _stagesCount()


**Execution cost**: less than 495 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### reset()


**Execution cost**: No bound available




--- 
### _settledBalanceUpdates(uint256)


**Execution cost**: less than 2643 gas

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*
2. **output_1** *of type `int256`*
3. **output_2** *of type `address`*
4. **output_3** *of type `uint256`*

--- 
### _stages(uint256)


**Execution cost**: less than 3356 gas

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*
2. **output_1** *of type `address`*
3. **output_2** *of type `int256`*
4. **output_3** *of type `address`*
5. **output_4** *of type `uint256`*

--- 
### seizeAllBalances(address,address)


**Execution cost**: less than 62526 gas


Params:

1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*


--- 
### seizures(uint256)


**Execution cost**: less than 1108 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **source** *of type `address`*
2. **target** *of type `address`*

--- 
### settledBalanceUpdates(uint256)


**Execution cost**: less than 2012 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*
3. **figure** *of type `tuple`*

--- 
### stage(address,int256,address,uint256)


**Execution cost**: less than 123671 gas


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


--- 
### stageToBeneficiaryUntargeted(address,address,int256,address,uint256)


**Execution cost**: less than 121614 gas


Params:

1. **sourceWallet** *of type `address`*
2. **beneficiary** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*


--- 
### stages(uint256)


**Execution cost**: less than 1946 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*
3. **figure** *of type `tuple`*

--- 
### updateSettledBalance(address,int256,address,uint256)


**Execution cost**: less than 123649 gas


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


[Back to the top ↑](#mockedclientfund)
