# DriipSettlementDispute
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlementDispute.sol)
> DriipSettlementDispute


**Execution cost**: less than 46280 gas

**Deployment cost**: less than 4450000 gas

**Combined cost**: less than 4496280 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### SetFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldFraudChallenge** *of type `address`*
2. **newFraudChallenge** *of type `address`*

--- 
### SetDriipSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDriipSettlementChallenge** *of type `address`*
2. **newDriipSettlementChallenge** *of type `address`*

--- 
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChallengeByTradeEvent(address,uint256,bytes32,uint8,bytes32,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **driipHash** *of type `bytes32`*
4. **driipType** *of type `uint8`*
5. **candidateHash** *of type `bytes32`*
6. **challenger** *of type `address`*

--- 
### ChallengeByPaymentEvent(address,uint256,bytes32,uint8,bytes32,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **driipHash** *of type `bytes32`*
4. **driipType** *of type `uint8`*
5. **candidateHash** *of type `bytes32`*
6. **challenger** *of type `address`*

--- 
### SetCancelOrdersChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldCancelOrdersChallenge** *of type `address`*
2. **newCancelOrdersChallenge** *of type `address`*

--- 
### ChallengeByOrderEvent(address,uint256,bytes32,uint8,bytes32,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **driipHash** *of type `bytes32`*
4. **driipType** *of type `uint8`*
5. **candidateHash** *of type `bytes32`*
6. **challenger** *of type `address`*

--- 
### SetClientFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### SetConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SetSecurityBondEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### SetValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### UnchallengeOrderCandidateByTradeEvent(address,uint256,bytes32,uint8,bytes32,address,bytes32,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **driipHash** *of type `bytes32`*
4. **driipType** *of type `uint8`*
5. **challengeCandidateHash** *of type `bytes32`*
6. **challenger** *of type `address`*
7. **unchallengeCandidateHash** *of type `bytes32`*
8. **unchallenger** *of type `address`*


## Methods
### securityBond()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setDriipSettlementChallenge(address)
>
>Set the driip settlement challenge contract


**Execution cost**: No bound available


Params:

1. **newDriipSettlementChallenge** *of type `address`*

    > The (address of) DriipSettlementChallenge contract instance



--- 
### challengeByTrade(address,tuple,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **challenger** *of type `address`*


--- 
### driipSettlementChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### clientFund()


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
### setCancelOrdersChallenge(address)
>
>Set the cancel orders challenge contract


**Execution cost**: No bound available


Params:

1. **newCancelOrdersChallenge** *of type `address`*

    > The (address of) CancelOrdersChallenge contract instance



--- 
### deployer()


**Execution cost**: less than 1138 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 874 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 896 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setConfiguration(address)
>
>Set the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### setClientFund(address)
>
>Set the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### cancelOrdersChallenge()


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
### challengeByPayment(address,tuple,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*
3. **challenger** *of type `address`*


--- 
### challengeByOrder(tuple,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **challenger** *of type `address`*


--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setFraudChallenge(address)
>
>Set the fraud challenge contract


**Execution cost**: No bound available


Params:

1. **newFraudChallenge** *of type `address`*

    > The (address of) FraudChallenge contract instance



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setSecurityBond(address)
>
>Set the security bond contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) SecurityBond contract instance



--- 
### setValidator(address)
>
>Set the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



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
### challengeByPayment(address,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)
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

3. **wallet** *of type `undefined`*

    > The concerned party



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
