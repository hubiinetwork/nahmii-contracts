# MockedClientFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedClientFund.sol)
> MockedClientFund


**Execution cost**: less than 1167 gas

**Deployment cost**: less than 1121600 gas

**Combined cost**: less than 1122767 gas


## Events
### LockBalancesEvent(address,address)


**Execution cost**: No bound available


Params:

1. **lockedWallet** *of type `address`*
2. **lockerWallet** *of type `address`*

--- 
### StageEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### UnlockBalancesEvent(address,address)


**Execution cost**: No bound available


Params:

1. **lockedWallet** *of type `address`*
2. **lockerWallet** *of type `address`*

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


**Execution cost**: less than 626 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _reset()


**Execution cost**: No bound available




--- 
### _addActiveBalanceLogEntry(int256,uint256)


**Execution cost**: less than 60529 gas


Params:

1. **amount** *of type `int256`*
2. **blockNumber** *of type `uint256`*


--- 
### _beneficiaryTransfers(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*
2. **output_1** *of type `address`*
3. **output_2** *of type `int256`*
4. **output_3** *of type `address`*
5. **output_4** *of type `uint256`*
6. **output_5** *of type `string`*

--- 
### _beneficiaryTransfersCount()


**Execution cost**: less than 472 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### activeBalanceLogEntry(address,address,uint256,uint256)


**Execution cost**: less than 1684 gas

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
### activeBalanceLogEntriesCount(address,address,uint256)


**Execution cost**: less than 605 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### activeBalanceLogEntries(uint256)


**Execution cost**: less than 1094 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **amount** *of type `int256`*
2. **blockNumber** *of type `uint256`*

--- 
### _settledBalanceUpdatesCount()


**Execution cost**: less than 451 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _settledBalanceUpdates(uint256)


**Execution cost**: less than 2797 gas

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*
2. **output_1** *of type `int256`*
3. **output_2** *of type `address`*
4. **output_3** *of type `uint256`*

--- 
### _unlocksCount()


**Execution cost**: less than 758 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _stages(uint256)


**Execution cost**: less than 3513 gas

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
### stages(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*
3. **figure** *of type `tuple`*
4. **standard** *of type `string`*

--- 
### lockBalancesByProxy(address,address)


**Execution cost**: less than 62793 gas


Params:

1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*


--- 
### beneficiaryTransfers(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*
3. **figure** *of type `tuple`*
4. **standard** *of type `string`*

--- 
### lockedWalletsCount()


**Execution cost**: less than 824 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### locks(uint256)


**Execution cost**: less than 1570 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **lockedWallet** *of type `address`*
2. **lockerWallet** *of type `address`*

--- 
### settledBalanceUpdates(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*
3. **figure** *of type `tuple`*
4. **standard** *of type `string`*

--- 
### stage(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


--- 
### transferToBeneficiary(address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### unlockBalancesByProxy(address)


**Execution cost**: less than 62990 gas


Params:

1. **wallet** *of type `address`*


--- 
### unlocks(uint256)


**Execution cost**: less than 1240 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **lockedWallet** *of type `address`*
2. **lockerWallet** *of type `address`*

--- 
### updateSettledBalance(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


[Back to the top ↑](#mockedclientfund)
