# DriipSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlementChallenge.sol)
> DriipSettlementChallenge


**Execution cost**: less than 46271 gas

**Deployment cost**: less than 4443200 gas

**Combined cost**: less than 4489471 gas

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
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### getChallengePhase(address)
>
>Get driip settlement challenge phase of given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenge phase and nonce

1. **output_0** *of type `uint8`*
2. **output_1** *of type `uint256`*

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
### changeValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



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
### deployer()


**Execution cost**: less than 1534 gas

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
### getChallengeChallenger(address)
>
>Get the challenger of the given wallet's challenge


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenger of the challenge

1. **output_0** *of type `address`*

--- 
### getChallengeCandidatePaymentsLength()
>
>Get the count of challenge candidate payments


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The count of challenge candidate payments

1. **output_0** *of type `uint256`*

--- 
### challengeCandidatePaymentsCount()
>
>Get the number of challenge candidate payments


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The number of challenge candidate payments

1. **output_0** *of type `uint256`*

--- 
### getChallengeCandidateTradesLength()
>
>Get the count of challenge candidate trades


**Execution cost**: less than 1252 gas

**Attributes**: constant



Returns:

> The count of challenge candidate trades

1. **output_0** *of type `uint256`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 984 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeByTrade(tuple,address)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*


--- 
### getChallengeCandidateOrder(uint256)
>
>Get the challenge candidate order at the given index


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

    > The index of challenge order candidate


Returns:

> The challenge candidate order

1. **output_0** *of type `tuple`*

--- 
### getChallengeCandidateOrdersLength()
>
>Get the count of challenge candidate orders


**Execution cost**: less than 1230 gas

**Attributes**: constant



Returns:

> The count of challenge candidate orders

1. **output_0** *of type `uint256`*

--- 
### challengeCandidateTradesCount()
>
>Get the number of challenge candidate trades


**Execution cost**: less than 1208 gas

**Attributes**: constant



Returns:

> The number of challenge candidate trades

1. **output_0** *of type `uint256`*

--- 
### changeDriipSettlementDispute(address)
>
>Change the driip settlement challenger contract


**Execution cost**: No bound available


Params:

1. **newDriipSettlementDispute** *of type `address`*

    > The (address of) DriipSettlementDispute contract instance



--- 
### challengeCandidateOrdersCount()
>
>Get the number of challenge candidate orders


**Execution cost**: less than 1186 gas

**Attributes**: constant



Returns:

> The number of challenge candidate orders

1. **output_0** *of type `uint256`*

--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeByPayment(tuple,address)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*


--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### getChallengeNonce(address)
>
>Get the challenge nonce of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenge nonce

1. **output_0** *of type `uint256`*

--- 
### getChallengeConjugateStage(address)
>
>Get the conjugate stage, i.e. the amount of conjugate currency that is suggested staged, of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenge conjugate stage

1. **output_0** *of type `tuple`*

--- 
### changeConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### getChallengeIntendedStage(address)
>
>Get the intended stage, i.e. the amount of intended currency that is suggested staged, of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenge intended stage

1. **output_0** *of type `tuple`*

--- 
### resetWalletChallenge(address)
>
>Reset the challenge of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: less than 66797 gas


Params:

1. **wallet** *of type `address`*

    > The concerned wallet



--- 
### startChallengeFromTrade(tuple,address,int256,int256)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*
3. **intendedStageAmount** *of type `int256`*
4. **conjugateStageAmount** *of type `int256`*


--- 
### setWalletChallenge(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **challenge** *of type `tuple`*


--- 
### pushChallengeCandidatePayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


--- 
### operator()


**Execution cost**: less than 1050 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getWalletChallenge(address)
>
>Get the challenge of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenge of the wallet

1. **output_0** *of type `tuple`*

--- 
### pushChallengeCandidateTrade(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*


--- 
### getChallengeStatus(address)
>
>Get the challenge status of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenge status

1. **output_0** *of type `uint8`*

--- 
### startChallengeFromPayment(tuple,address,int256)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*
3. **stageAmount** *of type `int256`*


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

> The count of driip settlement challenges from payment

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

> The count of driip settlement challenges from trade

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
### pushChallengeCandidateOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256))
>
>Push to store the given challenge candidate order
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The challenge candidate order to push



--- 
### pushChallengeCandidatePayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256))
>
>Push to store the given challenge candidate payment
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The challenge candidate payment to push



--- 
### pushChallengeCandidateTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256))
>
>Push to store the given challenge candidate trade
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The challenge candidate trade to push



--- 
### setWalletChallenge(address,(uint256,uint256,uint8,uint8,uint256,(int256,(address,uint256)),(int256,(address,uint256)),((int256,(address,uint256)),bool),((int256,(address,uint256)),bool),uint8,uint256,address))
>
>Set the challenge of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **challenge** *of type `undefined`*

    > The challenge to be set

2. **wallet** *of type `undefined`*

    > The concerned wallet



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



[Back to the top ↑](#driipsettlementchallenge)
