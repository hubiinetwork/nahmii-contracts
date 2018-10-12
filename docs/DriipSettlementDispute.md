# DriipSettlementDispute
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlementDispute.sol)
> DriipSettlementDispute


**Execution cost**: less than 44910 gas

**Deployment cost**: less than 3409600 gas

**Combined cost**: less than 3454510 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### UnchallengeOrderCandidateByTradeEvent(tuple,tuple,uint256,uint8,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **trade** *of type `tuple`*
3. **nonce** *of type `uint256`*
4. **driipType** *of type `uint8`*
5. **reporter** *of type `address`*

--- 
### ChangeDriipSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDriipSettlementChallenge** *of type `address`*
2. **newDriipSettlementChallenge** *of type `address`*

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
4. **reporter** *of type `address`*

--- 
### ChallengeByTradeEvent(tuple,address,uint256,uint8,address)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*
3. **nonce** *of type `uint256`*
4. **driipType** *of type `uint8`*
5. **reporter** *of type `address`*

--- 
### ChallengeByPaymentEvent(tuple,address,uint256,uint8,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*
3. **nonce** *of type `uint256`*
4. **driipType** *of type `uint8`*
5. **reporter** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### ChangeFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldFraudChallenge** *of type `address`*
2. **newFraudChallenge** *of type `address`*

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
### challengeByTrade(tuple,address,address)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*
3. **challenger** *of type `address`*


--- 
### changeDriipSettlementChallenge(address)
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
### changeCancelOrdersChallenge(address)
>
>Change the cancel orders challenge contract


**Execution cost**: No bound available


Params:

1. **newCancelOrdersChallenge** *of type `address`*

    > The (address of) CancelOrdersChallenge contract instance



--- 
### challengeByPayment(tuple,address,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*
3. **challenger** *of type `address`*


--- 
### cancelOrdersChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### changeConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### fraudChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### changeValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### changeSecurityBond(address)
>
>Change the security bond contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) SecurityBond contract instance



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


**Execution cost**: less than 808 gas

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
### operator()


**Execution cost**: less than 830 gas

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
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256),address)
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
### challengeByPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256),address,address)
>
>Challenge the driip settlement by providing payment candidate
>
> If wallet is recipient in (candidate) payment there is nothing here to challenge


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The payment candidate that challenges the challenged driip

2. **wallet** *of type `undefined`*

    > The wallet whose driip settlement is being challenged



--- 
### challengeByTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256),address,address)
>
>Challenge the driip settlement by providing trade candidate
>
> If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The trade candidate that challenges the challenged driip

2. **wallet** *of type `undefined`*

    > The wallet whose driip settlement is being challenged



--- 
### unchallengeOrderCandidateByTrade((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256),(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256),address)
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
