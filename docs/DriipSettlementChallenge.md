# DriipSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlementChallenge.sol)
> DriipSettlementChallenge


**Execution cost**: less than 46323 gas

**Deployment cost**: less than 4480200 gas

**Combined cost**: less than 4526523 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### ChangeConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeDriipSettlementDisputeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDriipSettlementDispute** *of type `address`*
2. **newDriipSettlementDispute** *of type `address`*

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

--- 
### StartChallengeFromPaymentEvent(tuple,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*

--- 
### StartChallengeFromTradeEvent(tuple,address)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*


## Methods
### getChallengeNonce(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### challengeCandidateOrders(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **wallet** *of type `address`*
3. **placement** *of type `tuple`*
4. **seals** *of type `tuple`*
5. **blockNumber** *of type `uint256`*

--- 
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### challengeCandidateTrades(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **amount** *of type `int256`*
3. **currencies** *of type `tuple`*
4. **rate** *of type `int256`*
5. **buyer** *of type `tuple`*
6. **seller** *of type `tuple`*
7. **transfers** *of type `tuple`*
8. **seal** *of type `tuple`*
9. **blockNumber** *of type `uint256`*

--- 
### challengeCandidateTradesCount()
>
>Return the number of (challenge) candidate trades


**Execution cost**: less than 1208 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### challengeCandidateOrdersCount()
>
>Return the number of (challenge) candidate orders


**Execution cost**: less than 1186 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### challengeByPayment(tuple,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*


--- 
### changeConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### challengeCandidatePayments(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **amount** *of type `int256`*
3. **currency** *of type `tuple`*
4. **sender** *of type `tuple`*
5. **recipient** *of type `tuple`*
6. **transfers** *of type `tuple`*
7. **seals** *of type `tuple`*
8. **blockNumber** *of type `uint256`*

--- 
### challengeCandidatePaymentsCount()
>
>Return the number of (challenge) candidate payments


**Execution cost**: less than 768 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### changeDriipSettlementDispute(address)
>
>Change the driip settlement challenger contract


**Execution cost**: No bound available


Params:

1. **newDriipSettlementDispute** *of type `address`*

    > The (address of) DriipSettlementDispute contract instance



--- 
### challengeByTrade(tuple,address)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*


--- 
### resetWalletChallenge(address)


**Execution cost**: less than 66775 gas


Params:

1. **wallet** *of type `address`*


--- 
### getChallengeCandidateOrder(uint256)
>
>Return the challenge candidate order at the given index
>
> This acts as a double of challengeCandidateOrders() which rather then returning NahmiiTypes.Order returns (uint256, address, NahmiiTypes.OrderPlacement, NahmiiTypes.WalletExchangeSeal, uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

    > The index of challenge order candidate


Returns:


1. **output_0** *of type `tuple`*

--- 
### changeValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 962 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1534 gas

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
### driipSettlementDispute()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### pushChallengeCandidateTrade(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*


--- 
### startChallengeFromTrade(tuple,address,int256,int256)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*
3. **intendedStageAmount** *of type `int256`*
4. **conjugateStageAmount** *of type `int256`*


--- 
### getChallengeConjugateStage(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `tuple`*

--- 
### getChallengeStatus(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint8`*

--- 
### getPhase(address)
>
>Get driip settlement challenge phase of given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet whose challenge phase will be returned


Returns:


1. **output_0** *of type `uint256`*
2. **output_1** *of type `uint8`*

--- 
### getWalletChallenge(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `tuple`*

--- 
### getChallengeIntendedStage(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `tuple`*

--- 
### setWalletChallenge(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **challenge** *of type `tuple`*


--- 
### operator()


**Execution cost**: less than 1028 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### startChallengeFromPayment(tuple,address,int256)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*
3. **stageAmount** *of type `int256`*


--- 
### getChallengeCandidateOrdersLength()


**Execution cost**: less than 1535 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getChallengeCandidateTradesLength()


**Execution cost**: less than 1557 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getChallengeCandidatePaymentsLength()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getChallengeChallenger(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### pushChallengeCandidatePayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


--- 
### pushChallengeCandidateOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### unchallengeOrderCandidateByTrade(tuple,tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **trade** *of type `tuple`*


--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### walletChallengeMap(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **nonce** *of type `uint256`*
2. **timeout** *of type `uint256`*
3. **status** *of type `uint8`*
4. **driipType** *of type `uint8`*
5. **driipIndex** *of type `uint256`*
6. **intendedStage** *of type `tuple`*
7. **conjugateStage** *of type `tuple`*
8. **intendedTargetBalance** *of type `tuple`*
9. **conjugateTargetBalance** *of type `tuple`*
10. **candidateType** *of type `uint8`*
11. **candidateIndex** *of type `uint256`*
12. **challenger** *of type `address`*

--- 
### walletChallengedPaymentsCount(address)
>
>Get the number of current and past driip settlement challenges from payment for given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return count


Returns:


1. **output_0** *of type `uint256`*

--- 
### walletChallengedPaymentsMap(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **amount** *of type `int256`*
3. **currency** *of type `tuple`*
4. **sender** *of type `tuple`*
5. **recipient** *of type `tuple`*
6. **transfers** *of type `tuple`*
7. **seals** *of type `tuple`*
8. **blockNumber** *of type `uint256`*

--- 
### walletChallengedTradesCount(address)
>
>Get the number of current and past driip settlement challenges from trade for given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return count


Returns:


1. **output_0** *of type `uint256`*

--- 
### walletChallengedTradesMap(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **amount** *of type `int256`*
3. **currencies** *of type `tuple`*
4. **rate** *of type `int256`*
5. **buyer** *of type `tuple`*
6. **seller** *of type `tuple`*
7. **transfers** *of type `tuple`*
8. **seal** *of type `tuple`*
9. **blockNumber** *of type `uint256`*

--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256))
>
>Challenge the driip settlement by providing order candidate


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The order candidate that challenges the challenged driip



--- 
### challengeByPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256),address)
>
>Challenge the driip settlement by providing payment candidate


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The payment candidate that challenges the challenged driip

2. **wallet** *of type `undefined`*

    > The wallet whose driip settlement is being challenged



--- 
### challengeByTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256),address)
>
>Challenge the driip settlement by providing trade candidate


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The trade candidate that challenges the challenged driip

2. **wallet** *of type `undefined`*

    > The wallet whose driip settlement is being challenged



--- 
### startChallengeFromPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256),address,int256)
>
>Start driip settlement challenge on driip of payment type


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The challenged driip

2. **stageAmount** *of type `undefined`*

    > Amount of payment currency to be staged

3. **wallet** *of type `undefined`*

    > The relevant driip party



--- 
### startChallengeFromTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256),address,int256,int256)
>
>Start driip settlement challenge on driip of trade type


**Execution cost**: No bound available


Params:

1. **conjugateStageAmount** *of type `undefined`*

    > Amount of conjugate currency to be staged

2. **intendedStageAmount** *of type `undefined`*

    > Amount of intended currency to be staged

3. **trade** *of type `undefined`*

    > The challenged driip

4. **wallet** *of type `undefined`*

    > The relevant driip party



--- 
### unchallengeOrderCandidateByTrade((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256),(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256))
>
>Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The order candidate that challenged driip

2. **trade** *of type `undefined`*

    > The trade in which order has been filled



--- 
### pushChallengeCandidateOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256))


**Execution cost**: No bound available




--- 
### pushChallengeCandidatePayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256))


**Execution cost**: No bound available




--- 
### pushChallengeCandidateTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256))


**Execution cost**: No bound available




--- 
### setWalletChallenge(address,(uint256,uint256,uint8,uint8,uint256,(int256,(address,uint256)),(int256,(address,uint256)),((int256,(address,uint256)),bool),((int256,(address,uint256)),bool),uint8,uint256,address))


**Execution cost**: No bound available




[Back to the top ↑](#driipsettlementchallenge)
