# MockedClientFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedClientFund.sol)
> MockedClientFund


**Execution cost**: less than 766 gas

**Deployment cost**: less than 731400 gas

**Combined cost**: less than 732166 gas

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
### stages(uint256)


**Execution cost**: less than 2012 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*
3. **figure** *of type `tuple`*

--- 
### reset()


**Execution cost**: No bound available




--- 
### activeBalanceLogEntriesCount(address,address,uint256)


**Execution cost**: less than 539 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### activeBalanceLogEntry(address,address,uint256,uint256)


**Execution cost**: less than 1596 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **index** *of type `uint256`*

Returns:


1. **amount** *of type `int256`*
2. **blockNumber** *of type `uint256`*

--- 
### activeBalanceLogEntries(uint256)


**Execution cost**: less than 1028 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **amount** *of type `int256`*
2. **blockNumber** *of type `uint256`*

--- 
### _settledBalanceUpdates(uint256)


**Execution cost**: less than 2709 gas

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


**Execution cost**: less than 3422 gas

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
### _addActiveBalanceLogEntry(int256,uint256)


**Execution cost**: less than 60507 gas


Params:

1. **amount** *of type `int256`*
2. **blockNumber** *of type `uint256`*


--- 
### _stagesCount()


**Execution cost**: less than 561 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### seizeAllBalances(address,address)


**Execution cost**: less than 62592 gas


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


**Execution cost**: less than 2100 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*
3. **figure** *of type `tuple`*

--- 
### stage(address,int256,address,uint256)


**Execution cost**: less than 123759 gas


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


--- 
### stageToBeneficiaryUntargeted(address,address,int256,address,uint256)


**Execution cost**: less than 121658 gas


Params:

1. **sourceWallet** *of type `address`*
2. **beneficiary** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*


--- 
### updateSettledBalance(address,int256,address,uint256)


**Execution cost**: less than 123737 gas


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


[Back to the top ↑](#mockedclientfund)
