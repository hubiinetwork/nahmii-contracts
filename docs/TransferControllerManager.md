# TransferControllerManager
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/TransferControllerManager.sol)
> TransferControllerManager


**Execution cost**: less than 41585 gas

**Deployment cost**: less than 698000 gas

**Combined cost**: less than 739585 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### BlacklistCurrencyEvent(address)


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*

--- 
### DeregisterCurrencyEvent(address)


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*

--- 
### ReassociateTransferControllerEvent(string,string,address)


**Execution cost**: No bound available


Params:

1. **oldStandard** *of type `string`*
2. **newStandard** *of type `string`*
3. **controller** *of type `address`*

--- 
### RegisterCurrencyEvent(address,string)


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*
2. **standard** *of type `string`*

--- 
### RegisterTransferControllerEvent(string,address)


**Execution cost**: No bound available


Params:

1. **standard** *of type `string`*
2. **controller** *of type `address`*

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

--- 
### WhitelistCurrencyEvent(address)


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*


## Methods
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: less than 22867 gas


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### deregisterCurrency(address)


**Execution cost**: less than 27359 gas


Params:

1. **currencyCt** *of type `address`*


--- 
### blacklistCurrency(address)


**Execution cost**: less than 22409 gas


Params:

1. **currencyCt** *of type `address`*


--- 
### deployer()


**Execution cost**: less than 757 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 559 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getTransferController(address,string)
>
>The provided standard takes priority over assigned interface to currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*
2. **standard** *of type `string`*

Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 603 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### reassociateTransferController(string,string,address)


**Execution cost**: No bound available


Params:

1. **oldStandard** *of type `string`*
2. **newStandard** *of type `string`*
3. **controller** *of type `address`*


--- 
### registerCurrency(address,string)


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*
2. **standard** *of type `string`*


--- 
### registerTransferController(string,address)


**Execution cost**: No bound available


Params:

1. **standard** *of type `string`*
2. **controller** *of type `address`*


--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: less than 22910 gas


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
### whitelistCurrency(address)


**Execution cost**: less than 22438 gas


Params:

1. **currencyCt** *of type `address`*


[Back to the top ↑](#transfercontrollermanager)
