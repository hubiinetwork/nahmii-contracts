# MockedBeneficiary
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedBeneficiary.sol)
> MockedBeneficiary


**Execution cost**: less than 524 gas

**Deployment cost**: less than 486600 gas

**Combined cost**: less than 487124 gas




## Methods
### depositEthersTo(address)


**Execution cost**: No bound available

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
### deposits(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **wallet** *of type `address`*
2. **figure** *of type `tuple`*
3. **standard** *of type `string`*

--- 
### getDeposit(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

Returns:


1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*

--- 
### reset()


**Execution cost**: No bound available




[Back to the top ↑](#mockedbeneficiary)
