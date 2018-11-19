# MockedClientFundService
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedClientFundService.sol)
> MockedClientFundService


**Execution cost**: less than 41815 gas

**Deployment cost**: less than 677200 gas

**Combined cost**: less than 719015 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### SetClientFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*


## Methods
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



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
### operator()


**Execution cost**: less than 679 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### lockBalancesByProxy(address,address)


**Execution cost**: No bound available


Params:

1. **lockedWallet** *of type `address`*
2. **lockerWallet** *of type `address`*


--- 
### stageToBeneficiary(address,address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **beneficiary** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*
6. **standard** *of type `string`*


--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 657 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setClientFund(address)
>
>Set the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### stage(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


--- 
### deployer()


**Execution cost**: less than 855 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### unlockBalancesByProxy(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*


--- 
### updateSettledBalance(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


[Back to the top ↑](#mockedclientfundservice)
