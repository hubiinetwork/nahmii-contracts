# MockedClientFundService
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedClientFundService.sol)
> MockedClientFundService


**Execution cost**: less than 41637 gas

**Deployment cost**: less than 493000 gas

**Combined cost**: less than 534637 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### ChangeClientFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

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


## Methods
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### changeClientFund(address)
>
>Change the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 833 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 701 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 723 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### seizeAllBalances(address,address)


**Execution cost**: No bound available


Params:

1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*


--- 
### stage(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


--- 
### stageToBeneficiaryUntargeted(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **sourceWallet** *of type `address`*
2. **beneficiary** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*


--- 
### updateSettledBalance(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*


[Back to the top ↑](#mockedclientfundservice)
