# MockedCancelOrdersChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedCancelOrdersChallenge.sol)
> MockedCancelOrdersChallenge


**Execution cost**: less than 606 gas

**Deployment cost**: less than 574600 gas

**Combined cost**: less than 575206 gas

## Constructor




## Events
### CancelOrdersByHashEvent(bytes32[],address)


**Execution cost**: No bound available


Params:

1. **orders** *of type `bytes32[]`*
2. **wallet** *of type `address`*

--- 
### CancelOrdersEvent(tuple[],address)


**Execution cost**: No bound available


Params:

1. **orders** *of type `tuple[]`*
2. **wallet** *of type `address`*


## Methods
### _reset()


**Execution cost**: No bound available




--- 
### cancelOrders(tuple[])


**Execution cost**: No bound available


Params:

1. **orders** *of type `tuple[]`*


--- 
### cancelOrdersByHash(bytes32[])


**Execution cost**: No bound available


Params:

1. **orderHashes** *of type `bytes32[]`*


--- 
### isOrderCancelled(address,bytes32)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **orderHash** *of type `bytes32`*

Returns:


1. **output_0** *of type `bool`*

--- 
### cancelOrders((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256)[])


**Execution cost**: No bound available




[Back to the top ↑](#mockedcancelorderschallenge)
