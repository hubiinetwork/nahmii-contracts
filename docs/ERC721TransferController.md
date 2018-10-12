# ERC721TransferController
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/ERC721TransferController.sol)
> ERC721TransferController


**Execution cost**: less than 331 gas

**Deployment cost**: less than 291200 gas

**Combined cost**: less than 291531 gas


## Events
### CurrencyTransferred(address,address,uint256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **to** *of type `address`*
3. **amount** *of type `uint256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*


## Methods
### approve(address,uint256,address,uint256)
>
>MUST be called with DELEGATECALL


**Execution cost**: No bound available


Params:

1. **to** *of type `address`*
2. **amount** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


--- 
### getApproveSignature()


**Execution cost**: less than 402 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes4`*

--- 
### getReceiveSignature()


**Execution cost**: less than 512 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes4`*

--- 
### getSendSignature()


**Execution cost**: less than 446 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes4`*

--- 
### isQuantifiable()


**Execution cost**: less than 253 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### isTyped()


**Execution cost**: less than 319 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### receive(address,address,uint256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **to** *of type `address`*
3. **amount** *of type `uint256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*


--- 
### send(address,address,uint256,address,uint256)
>
>MUST be called with DELEGATECALL


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **to** *of type `address`*
3. **amount** *of type `uint256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*


[Back to the top ↑](#erc721transfercontroller)
