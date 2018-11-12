# DriipSettlementDispute
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlementDispute.sol)
> DriipSettlementDispute


**Execution cost**: less than 45586 gas

**Deployment cost**: less than 3930200 gas

**Combined cost**: less than 3975786 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### ChangeFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldFraudChallenge** *of type `address`*
2. **newFraudChallenge** *of type `address`*

--- 
### ChangeDriipSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDriipSettlementChallenge** *of type `address`*
2. **newDriipSettlementChallenge** *of type `address`*

--- 
### ChallengeByTradeEvent(address,tuple,uint256,uint8,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **nonce** *of type `uint256`*
4. **driipType** *of type `uint8`*
5. **challenger** *of type `address`*

--- 
### ChallengeByPaymentEvent(tuple,uint256,uint8,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **nonce** *of type `uint256`*
3. **driipType** *of type `uint8`*
4. **challenger** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeCancelOrdersChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldCancelOrdersChallenge** *of type `address`*
2. **newCancelOrdersChallenge** *of type `address`*

--- 
### ChallengeByOrderEvent(tuple,uint256,uint8,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **nonce** *of type `uint256`*
3. **driipType** *of type `uint8`*
4. **challenger** *of type `address`*

--- 
### ChangeConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeSecurityBondEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### ChangeValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### UnchallengeOrderCandidateByTradeEvent(tuple,tuple,uint256,uint8,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **trade** *of type `tuple`*
3. **nonce** *of type `uint256`*
4. **driipType** *of type `uint8`*
5. **challenger** *of type `address`*


## Methods
### challengeByPayment(tuple,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **challenger** *of type `address`*


--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### challengeByTrade(address,tuple,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **challenger** *of type `address`*


--- 
### setFraudChallenge(address)
>
>Change the fraud challenge contract


**Execution cost**: No bound available


Params:

1. **newFraudChallenge** *of type `address`*

    > The (address of) FraudChallenge contract instance



--- 
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setDriipSettlementChallenge(address)
>
>Change the driip settlement challenge contract


**Execution cost**: No bound available


Params:

1. **newDriipSettlementChallenge** *of type `address`*

    > The (address of) DriipSettlementChallenge contract instance



--- 
### challengeByOrder(tuple,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **challenger** *of type `address`*


--- 
### setConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### setCancelOrdersChallenge(address)
>
>Change the cancel orders challenge contract


**Execution cost**: No bound available


Params:

1. **newCancelOrdersChallenge** *of type `address`*

    > The (address of) CancelOrdersChallenge contract instance



--- 
### cancelOrdersChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setSecurityBond(address)
>
>Change the security bond contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) SecurityBond contract instance



--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### deployer()


**Execution cost**: less than 1072 gas

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
### driipSettlementChallenge()


**Execution cost**: No bound available

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
### operator()


**Execution cost**: less than 852 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### securityBond()


**Execution cost**: No bound available

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
### unchallengeOrderCandidateByTrade(tuple,tuple,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **trade** *of type `tuple`*
3. **unchallenger** *of type `address`*


--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)
>
>Challenge the driip settlement by providing order candidate
>
> If (candidate) order has buy intention consider _conjugate_ currency and amount, else if (candidate) order has sell intention consider _intended_ currency and amount


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **order** *of type `undefined`*

    > The order candidate that challenges the challenged driip



--- 
### challengeByPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)
>
>Challenge the driip settlement by providing payment candidate
>
> This challenges the payment sender's side of things


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **payment** *of type `undefined`*

    > The payment candidate that challenges the challenged driip



--- 
### challengeByTrade(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),address)
>
>Challenge the driip settlement by providing trade candidate
>
> If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **trade** *of type `undefined`*

    > The trade candidate that challenges the challenged driip

3. **wallet** *of type `undefined`*

    > The wallet whose driip settlement is being challenged



--- 
### unchallengeOrderCandidateByTrade((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),address)
>
>Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The order candidate that challenged driip

2. **trade** *of type `undefined`*

    > The trade in which order has been filled

3. **unchallenger** *of type `undefined`*

    > The address of the unchallenger



[Back to the top ↑](#driipsettlementdispute)
