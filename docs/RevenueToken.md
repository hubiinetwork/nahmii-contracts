# RevenueToken
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/RevenueToken.sol)
> RevenueToken


**Execution cost**: No bound available

**Deployment cost**: less than 1123800 gas

**Combined cost**: No bound available


## Events
### Approval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **owner** *of type `address`*
2. **spender** *of type `address`*
3. **value** *of type `uint256`*

--- 
### DisableMinting()


**Execution cost**: No bound available



--- 
### MinterAdded(address)


**Execution cost**: No bound available


Params:

1. **account** *of type `address`*

--- 
### MinterRemoved(address)


**Execution cost**: No bound available


Params:

1. **account** *of type `address`*

--- 
### Transfer(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **to** *of type `address`*
3. **value** *of type `uint256`*


## Methods
### balanceBlocks(address,uint256)


**Execution cost**: less than 1077 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### allowance(address,address)
>
> Function to check the amount of tokens that an owner allowed to a spender.


**Execution cost**: less than 1192 gas

**Attributes**: constant


Params:

1. **owner** *of type `address`*

    > address The address which owns the funds.

2. **spender** *of type `address`*

    > address The address which will spend the funds.


Returns:

> A uint256 specifying the amount of tokens still available for the spender.

1. **output_0** *of type `uint256`*

--- 
### addMinter(address)


**Execution cost**: No bound available


Params:

1. **account** *of type `address`*


--- 
### balanceBlockNumbers(address,uint256)


**Execution cost**: less than 879 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### approve(address,uint256)
>
>Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
>
> Beware that to change the approve amount you first have to reduce the addresses' allowance to zero by calling `approve(spender, 0)` if it is not already 0 to mitigate the race condition described here: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729


**Execution cost**: less than 22992 gas


Params:

1. **spender** *of type `address`*

    > The address which will spend the funds.

2. **value** *of type `uint256`*

    > The amount of tokens to be spent.


Returns:


1. **output_0** *of type `bool`*

--- 
### renounceMinter()


**Execution cost**: No bound available




--- 
### totalSupply()
>
> Total number of tokens in existence


**Execution cost**: less than 450 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### increaseAllowance(address,uint256)
>
> Increase the amount of tokens that an owner allowed to a spender. approve should be called when allowed_[_spender] == 0. To increment allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol


**Execution cost**: No bound available


Params:

1. **spender** *of type `address`*

    > The address which will spend the funds.

2. **addedValue** *of type `uint256`*

    > The amount of tokens to increase the allowance by.


Returns:


1. **output_0** *of type `bool`*

--- 
### mint(address,uint256)
>
>Mint tokens


**Execution cost**: No bound available


Params:

1. **to** *of type `address`*

    > The address that will receive the minted tokens.

2. **value** *of type `uint256`*

    > The amount of tokens to mint.


Returns:

> A boolean that indicates if the operation was successful.

1. **output_0** *of type `bool`*

--- 
### holdersCount()
>
>Get the count of holders


**Execution cost**: less than 582 gas

**Attributes**: constant



Returns:

> The count of holders

1. **output_0** *of type `uint256`*

--- 
### balanceOf(address)
>
> Gets the balance of the specified address.


**Execution cost**: less than 829 gas

**Attributes**: constant


Params:

1. **owner** *of type `address`*

    > The address to query the balance of.


Returns:

> An uint256 representing the amount owned by the passed address.

1. **output_0** *of type `uint256`*

--- 
### holdersMap(address)


**Execution cost**: less than 565 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### disableMinting()
>
>Disable further minting
>
> This operation can not be undone


**Execution cost**: No bound available




--- 
### mintingDisabled()


**Execution cost**: less than 484 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### holders(uint256)


**Execution cost**: less than 969 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### decreaseAllowance(address,uint256)
>
> Decrease the amount of tokens that an owner allowed to a spender. approve should be called when allowed_[_spender] == 0. To decrement allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol


**Execution cost**: No bound available


Params:

1. **spender** *of type `address`*

    > The address which will spend the funds.

2. **subtractedValue** *of type `uint256`*

    > The amount of tokens to decrease the allowance by.


Returns:


1. **output_0** *of type `bool`*

--- 
### balanceBlocksIn(address,uint256,uint256)
>
>Calculate the amount of balance blocks, i.e. the area under the curve (AUC) of balance as function of block number
>
> The AUC is used as weight for the share of revenue that a token holder may claim


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **account** *of type `address`*

    > The account address for which calculation is done

2. **startBlock** *of type `uint256`*

    > The start block number considered

3. **endBlock** *of type `uint256`*

    > The end block number considered


Returns:

> The calculated AUC

1. **output_0** *of type `uint256`*

--- 
### balances(address,uint256)


**Execution cost**: less than 1297 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### isMinter(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **account** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### balanceUpdatesCount(address)
>
>Get the count of balance updates for the given account


**Execution cost**: less than 1024 gas

**Attributes**: constant


Params:

1. **account** *of type `address`*

Returns:

> The count of balance updates

1. **output_0** *of type `uint256`*

--- 
### holdersByIndices(uint256,uint256,bool)
>
>Get the subset of holders (optionally with positive balance only) in the given 0 based index range


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **low** *of type `uint256`*

    > The lower inclusive index

2. **up** *of type `uint256`*

    > The upper inclusive index

3. **posOnly** *of type `bool`*

    > List only positive balance holders


Returns:

> The subset of positive balance registered holders in the given range

1. **output_0** *of type `address[]`*

--- 
### transfer(address,uint256)
>
>Transfer token for a specified address


**Execution cost**: No bound available


Params:

1. **to** *of type `address`*

    > The address to transfer to.

2. **value** *of type `uint256`*

    > The amount to be transferred.


Returns:

> A boolean that indicates if the operation was successful.

1. **output_0** *of type `bool`*

--- 
### transferFrom(address,address,uint256)
>
> Transfer tokens from one address to another


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*

    > address The address which you want to send tokens from

2. **to** *of type `address`*

    > address The address which you want to transfer to

3. **value** *of type `uint256`*

    > uint256 the amount of tokens to be transferred


Returns:

> A boolean that indicates if the operation was successful.

1. **output_0** *of type `bool`*

[Back to the top ↑](#revenuetoken)
