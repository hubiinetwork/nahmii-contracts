# RevenueToken
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/RevenueToken.sol)
> RevenueToken


**Execution cost**: No bound available

**Deployment cost**: less than 1253600 gas

**Combined cost**: No bound available

## Constructor




## Events
### Approval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **owner** *of type `address`*
2. **spender** *of type `address`*
3. **value** *of type `uint256`*

--- 
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
### Mint(address,uint256)


**Execution cost**: No bound available


Params:

1. **to** *of type `address`*
2. **amount** *of type `uint256`*

--- 
### SetTokenInformation(string,string)


**Execution cost**: No bound available


Params:

1. **name** *of type `string`*
2. **symbol** *of type `string`*

--- 
### Transfer(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **to** *of type `address`*
3. **value** *of type `uint256`*


## Methods
### setTokenInformation(string,string)


**Execution cost**: No bound available


Params:

1. **newName** *of type `string`*
2. **newSymbol** *of type `string`*


--- 
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: less than 23218 gas


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### approve(address,uint256)
>
>Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.


**Execution cost**: less than 22849 gas


Params:

1. **spender** *of type `address`*

    > The address which will spend the funds.

2. **value** *of type `uint256`*

    > The amount of tokens to be spent.


Returns:


1. **success** *of type `bool`*

--- 
### allowance(address,address)
>
>Function to check the amount of tokens than an owner allowed to a spender.


**Execution cost**: less than 1170 gas

**Attributes**: constant


Params:

1. **account** *of type `address`*

    > address The address which owns the funds.

2. **spender** *of type `address`*

    > address The address which will spend the funds.


Returns:

> A uint256 specifing the amount of tokens still avaible for the spender.

1. **output_0** *of type `uint256`*

--- 
### balanceBlocksIn(address,uint256,uint256)
>
>Calculate the amount of balance blocks, i.e. the area under the curve (AUC) of balance as function of block number
>
> The AUC is used as weight for the share of revenue that a token holder may claim


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet address for which calculation is done

2. **startBlock** *of type `uint256`*

    > The start block number considered

3. **endBlock** *of type `uint256`*

    > The end block number considered


Returns:

> The calculated AUC

1. **output_0** *of type `uint256`*

--- 
### balanceOf(address)
>
>Gets the balance of the specified address.


**Execution cost**: less than 914 gas

**Attributes**: constant


Params:

1. **account** *of type `address`*

    > The address whose balance is to be queried.


Returns:

> An uint256 representing the amount owned by the passed address.

1. **balance** *of type `uint256`*

--- 
### transferFrom(address,address,uint256)
>
>Transfer tokens from one address to another


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*

    > address The address which you want to send tokens from

2. **to** *of type `address`*

    > address The address which you want to transfer to

3. **value** *of type `uint256`*

    > uint256 the amout of tokens to be transfered


Returns:


1. **success** *of type `bool`*

--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: less than 22735 gas


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### holders(uint256)


**Execution cost**: less than 969 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 758 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 955 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### decimals()


**Execution cost**: less than 347 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### decreaseApproval(address,uint256)
>
>Decrease the amount of tokens that an owner allowed to a spender.     * approve should be called when allowed[_spender] == 0. To decrement allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol


**Execution cost**: No bound available


Params:

1. **_spender** *of type `address`*

    > The address which will spend the funds.

2. **_subtractedValue** *of type `uint256`*

    > The amount of tokens to decrease the allowance by.


Returns:


1. **success** *of type `bool`*

--- 
### holdersEnum()


**Execution cost**: No bound available



Returns:


1. **output_0** *of type `address[]`*

--- 
### increaseApproval(address,uint256)
>
>Increase the amount of tokens that an owner allowed to a spender.     * approve should be called when allowed[_spender] == 0. To increment allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol


**Execution cost**: No bound available


Params:

1. **_spender** *of type `address`*

    > The address which will spend the funds.

2. **_addedValue** *of type `uint256`*

    > The amount of tokens to increase the allowance by.


Returns:


1. **output_0** *of type `bool`*

--- 
### mint(address,uint256)
>
>Function to mint tokens


**Execution cost**: No bound available


Params:

1. **_to** *of type `address`*

    > The address that will receive the minted tokens.

2. **_amount** *of type `uint256`*

    > The amount of tokens to mint.


Returns:

> A boolean that indicates if the operation was successful.

1. **output_0** *of type `bool`*

--- 
### name()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### operator()


**Execution cost**: less than 801 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### startHoldersEnum()


**Execution cost**: less than 5642 gas




--- 
### symbol()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### totalSupply()


**Execution cost**: less than 450 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### transfer(address,uint256)
>
>transfer token for a specified address


**Execution cost**: No bound available


Params:

1. **_to** *of type `address`*

    > The address to transfer to.

2. **value** *of type `uint256`*

    > The amount to be transferred.


Returns:


1. **success** *of type `bool`*

[Back to the top ↑](#revenuetoken)
