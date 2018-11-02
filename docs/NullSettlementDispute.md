# NullSettlementDispute
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/NullSettlementDispute.sol)
> NullSettlementDispute


**Execution cost**: less than 44207 gas

**Deployment cost**: less than 2837800 gas

**Combined cost**: less than 2882007 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### ChallengeByOrderEvent(tuple,uint256,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **nonce** *of type `uint256`*
3. **challenger** *of type `address`*

--- 
### ChallengeByPaymentEvent(tuple,uint256,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **nonce** *of type `uint256`*
3. **challenger** *of type `address`*

--- 
### ChallengeByTradeEvent(address,tuple,uint256,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **nonce** *of type `uint256`*
4. **challenger** *of type `address`*

--- 
### ChangeCancelOrdersChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldCancelOrdersChallenge** *of type `address`*
2. **newCancelOrdersChallenge** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldFraudChallenge** *of type `address`*
2. **newFraudChallenge** *of type `address`*

--- 
### ChangeNullSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldNullSettlementChallenge** *of type `address`*
2. **newNullSettlementChallenge** *of type `address`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*


## Methods
### changeCancelOrdersChallenge(address)
>
>Change the cancel orders challenge contract


**Execution cost**: No bound available


Params:

1. **newCancelOrdersChallenge** *of type `address`*

    > The (address of) CancelOrdersChallenge contract instance



--- 
### changeNullSettlementChallenge(address)
>
>Change the settlement challenge contract


**Execution cost**: No bound available


Params:

1. **newNullSettlementChallenge** *of type `address`*

    > The (address of) NullSettlementChallenge contract instance



--- 
### cancelOrdersChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeByTrade(address,tuple,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **challenger** *of type `address`*


--- 
### changeFraudChallenge(address)
>
>Change the fraud challenge contract


**Execution cost**: No bound available


Params:

1. **newFraudChallenge** *of type `address`*

    > The (address of) FraudChallenge contract instance



--- 
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### challengeByOrder(tuple,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **challenger** *of type `address`*


--- 
### challengeByPayment(tuple,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **challenger** *of type `address`*


--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### changeValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### deployer()


**Execution cost**: less than 984 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 830 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### fraudChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### nullSettlementChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 852 gas

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
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)
>
>Challenge the settlement by providing order candidate
>
> If (candidate) order has buy intention consider _conjugate_ currency and amount, else if (candidate) order has sell intention consider _intended_ currency and amount


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **order** *of type `undefined`*

    > The order candidate that challenges



--- 
### challengeByPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)
>
>Challenge the settlement by providing payment candidate
>
> This challenges the payment sender's side of things


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **payment** *of type `undefined`*

    > The payment candidate that challenges



--- 
### challengeByTrade(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),address)
>
>Challenge the settlement by providing trade candidate
>
> If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **trade** *of type `undefined`*

    > The trade candidate that challenges

3. **wallet** *of type `undefined`*

    > The wallet whose settlement is being challenged



[Back to the top ↑](#nullsettlementdispute)
