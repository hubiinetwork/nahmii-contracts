# StandardTokenEx
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/StandardTokenEx.sol)
> Standard token


**Execution cost**: less than 449 gas

**Deployment cost**: less than 411600 gas

**Combined cost**: less than 412049 gas


## Events
### Approval(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **owner** *of type `address`*
2. **spender** *of type `address`*
3. **value** *of type `uint256`*

--- 
### Transfer(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **to** *of type `address`*
3. **value** *of type `uint256`*


## Methods
### addApproval(address,uint256)
>
>Atomic increment of approved spending     * Works around https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729


**Execution cost**: No bound available


Params:

1. **spender** *of type `address`*
2. **addedValue** *of type `uint256`*

Returns:


1. **success** *of type `bool`*

--- 
### allowance(address,address)
>
> Function to check the amount of tokens than an owner allowed to a spender.


**Execution cost**: less than 840 gas

**Attributes**: constant


Params:

1. **account** *of type `address`*

    > address The address which owns the funds.

2. **spender** *of type `address`*

    > address The address which will spend the funds.


Returns:

> A uint specifing the amount of tokens still avaible for the spender.

1. **remaining** *of type `uint256`*

--- 
### approve(address,uint256)
>
> Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.


**Execution cost**: less than 22804 gas


Params:

1. **spender** *of type `address`*

    > The address which will spend the funds.

2. **value** *of type `uint256`*

    > The amount of tokens to be spent.


Returns:


1. **success** *of type `bool`*

--- 
### balanceOf(address)
>
> Gets the balance of the specified address.


**Execution cost**: less than 672 gas

**Attributes**: constant


Params:

1. **account** *of type `address`*

    > The address whose balance is to be queried.


Returns:

> An uint representing the amount owned by the passed address.

1. **balance** *of type `uint256`*

--- 
### subApproval(address,uint256)
>
>Atomic decrement of approved spending.     * Works around https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729


**Execution cost**: No bound available


Params:

1. **spender** *of type `address`*
2. **subtractedValue** *of type `uint256`*

Returns:


1. **success** *of type `bool`*

--- 
### testMint(address,uint256)


**Execution cost**: No bound available


Params:

1. **receiver** *of type `address`*
2. **amount** *of type `uint256`*


--- 
### totalSupply()


**Execution cost**: less than 406 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### transfer(address,uint256)
>
> transfer token for a specified address


**Execution cost**: No bound available


Params:

1. **to** *of type `address`*

    > The address to transfer to.

2. **value** *of type `uint256`*

    > The amount to be transferred.


Returns:


1. **success** *of type `bool`*

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

    > uint the amout of tokens to be transfered


Returns:


1. **success** *of type `bool`*

[Back to the top ↑](#standardtokenex)
