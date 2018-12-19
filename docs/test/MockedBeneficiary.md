# MockedBeneficiary
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedBeneficiary.sol)
> MockedBeneficiary


**Execution cost**: less than 645 gas

**Deployment cost**: less than 613400 gas

**Combined cost**: less than 614045 gas




## Methods
### _reset()


**Execution cost**: No bound available




--- 
### benefits(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **wallet** *of type `address`*
2. **balance** *of type `string`*
3. **figure** *of type `tuple`*
4. **standard** *of type `string`*

--- 
### getBenefit(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

Returns:


1. **wallet** *of type `address`*
2. **balance** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*
6. **standard** *of type `string`*

--- 
### receiveEthersTo(address,string)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **wallet** *of type `address`*
2. **balance** *of type `string`*


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


[Back to the top ↑](#mockedbeneficiary)
