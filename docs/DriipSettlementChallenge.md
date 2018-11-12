# DriipSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlementChallenge.sol)
> DriipSettlementChallenge


**Execution cost**: less than 46201 gas

**Deployment cost**: less than 4396600 gas

**Combined cost**: less than 4442801 gas

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
### StartChallengeFromPaymentByProxyEvent(address,address,tuple,int256)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **payment** *of type `tuple`*
4. **stageAmount** *of type `int256`*

--- 
### StartChallengeFromPaymentEvent(address,tuple,int256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*
3. **stageAmount** *of type `int256`*

--- 
### StartChallengeFromTradeByProxyEvent(address,address,tuple,int256,int256)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **trade** *of type `tuple`*
4. **intendedStageAmount** *of type `int256`*
5. **conjugateStageAmount** *of type `int256`*

--- 
### StartChallengeFromTradeEvent(address,tuple,int256,int256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **intendedStageAmount** *of type `int256`*
4. **conjugateStageAmount** *of type `int256`*


## Methods
### startChallengeFromTrade(tuple,int256,int256)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **intendedStageAmount** *of type `int256`*
3. **conjugateStageAmount** *of type `int256`*


--- 
### unchallengeOrderCandidateByTrade(tuple,tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **trade** *of type `tuple`*


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
9. **operatorId** *of type `uint256`*

--- 
### setValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### proposalCurrency(address,uint256)
>
>Get the settlement proposal currency of the given wallet at the given index


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **index** *of type `uint256`*

    > The index of the concerned currency


Returns:

> The settlement proposal currency

1. **output_0** *of type `tuple`*

--- 
### setProposalTimeout(address,uint256)
>
>Set settlement proposal status property of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **timeout** *of type `uint256`*

    > The timeout value



--- 
### setProposalStatus(address,uint8)
>
>Set settlement proposal status property of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **status** *of type `uint8`*

    > The status value



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
6. **operatorId** *of type `uint256`*

--- 
### challengePhase(address)
>
>Get settlement challenge phase of given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenge phase and nonce

1. **output_0** *of type `uint8`*

--- 
### setProposalChallenger(address,address)
>
>Set settlement proposal challenger property of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **challenger** *of type `address`*

    > The challenger value



--- 
### challengeCandidatePaymentsCount()
>
>Get the count of challenge candidate payments


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The count of challenge candidate payments

1. **output_0** *of type `uint256`*

--- 
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 984 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### startChallengeFromPayment(tuple,int256)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **stageAmount** *of type `int256`*


--- 
### challengeByTrade(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*


--- 
### startChallengeFromPaymentByProxy(address,tuple,int256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*
3. **stageAmount** *of type `int256`*


--- 
### proposalDriipType(address)
>
>Get the driip type of the given wallet's settlement proposal


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The driip type of the settlement proposal

1. **output_0** *of type `uint8`*

--- 
### operator()


**Execution cost**: less than 1094 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1754 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setDriipSettlementDispute(address)
>
>Change the settlement dispute contract


**Execution cost**: No bound available


Params:

1. **newDriipSettlementDispute** *of type `address`*

    > The (address of) DriipSettlementDispute contract instance



--- 
### proposalStageAmount(address,tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currency** *of type `tuple`*

Returns:


1. **output_0** *of type `int256`*

--- 
### proposalCandidateIndex(address)
>
>Get the candidate index of the given wallet's settlement proposal


**Execution cost**: less than 1413 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The candidate index of the settlement proposal

1. **output_0** *of type `uint256`*

--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### proposalCandidateType(address)
>
>Get the candidate type of the given wallet's settlement proposal


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The candidate type of the settlement proposal

1. **output_0** *of type `uint8`*

--- 
### challengeCandidateOrder(uint256)
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
### proposalNonce(address)
>
>Get the challenge nonce of the given wallet


**Execution cost**: less than 1495 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenge nonce

1. **output_0** *of type `uint256`*

--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### setProposalCandidateType(address,uint8)
>
>Set settlement proposal candidate type property of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **candidateType** *of type `uint8`*

    > The candidate type value



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### challengeByPayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


--- 
### pushChallengeCandidatePayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


--- 
### challengeCandidateOrdersCount()
>
>Get the count of challenge candidate orders


**Execution cost**: less than 1274 gas

**Attributes**: constant



Returns:

> The count of challenge candidate orders

1. **output_0** *of type `uint256`*

--- 
### pushChallengeCandidateTrade(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*


--- 
### startChallengeFromTradeByProxy(address,tuple,int256,int256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **intendedStageAmount** *of type `int256`*
4. **conjugateStageAmount** *of type `int256`*


--- 
### proposalChallenger(address)
>
>Get the challenger of the given wallet's settlement proposal


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The challenger of the settlement proposal

1. **output_0** *of type `address`*

--- 
### challengeCandidateTradesCount()
>
>Get the count of challenge candidate trades


**Execution cost**: less than 1362 gas

**Attributes**: constant



Returns:

> The count of challenge candidate trades

1. **output_0** *of type `uint256`*

--- 
### pushChallengeCandidateOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### proposalDriipIndex(address)
>
>Get the driip index of the given wallet's settlement proposal


**Execution cost**: less than 1787 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The driip index of the settlement proposal

1. **output_0** *of type `uint256`*

--- 
### proposalStatus(address)
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
### proposalTargetBalanceAmount(address,tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currency** *of type `tuple`*

Returns:


1. **output_0** *of type `int256`*

--- 
### proposalCurrencyCount(address)
>
>Get the settlement proposal currency count of the given wallet


**Execution cost**: less than 1853 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement proposal currency count

1. **output_0** *of type `uint256`*

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
10. **operatorId** *of type `uint256`*

--- 
### driipSettlementDispute()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setProposalCandidateIndex(address,uint256)
>
>Set settlement proposal candidate index property of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **candidateIndex** *of type `uint256`*

    > The candidate index value



--- 
### proposalTimeout(address)
>
>Get the settlement proposal timeout of the given wallet


**Execution cost**: less than 1941 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement proposal timeout

1. **output_0** *of type `uint256`*

--- 
### proposalBlockNumber(address)
>
>Get the settlement proposal block number of the given wallet


**Execution cost**: less than 1963 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement proposal block number

1. **output_0** *of type `uint256`*

--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### walletChallengedPaymentsCount(address)
>
>Get the number of current and past settlement challenges from payment for given wallet


**Execution cost**: less than 1341 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return count


Returns:

> The count of settlement challenges from payment

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
9. **operatorId** *of type `uint256`*

--- 
### walletChallengedTradesCount(address)
>
>Get the number of current and past settlement challenges from trade for given wallet


**Execution cost**: less than 998 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return count


Returns:

> The count of settlement challenges from trade

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
10. **operatorId** *of type `uint256`*

--- 
### walletProposalMap(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **nonce** *of type `uint256`*
2. **blockNumber** *of type `uint256`*
3. **timeout** *of type `uint256`*
4. **status** *of type `uint8`*
5. **driipType** *of type `uint8`*
6. **driipIndex** *of type `uint256`*
7. **candidateType** *of type `uint8`*
8. **candidateIndex** *of type `uint256`*
9. **challenger** *of type `address`*

--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Challenge the settlement by providing order candidate


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The order candidate that challenges the challenged driip



--- 
### challengeByPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Challenge the settlement by providing payment candidate


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The payment candidate that challenges the challenged driip



--- 
### challengeByTrade(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))
>
>Challenge the settlement by providing trade candidate


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The trade candidate that challenges the challenged driip

2. **wallet** *of type `undefined`*

    > The wallet whose settlement is being challenged



--- 
### proposalStageAmount(address,(address,uint256))
>
>Get the settlement proposal stage amount of the given wallet and currency


**Execution cost**: No bound available


Params:

1. **currency** *of type `undefined`*

    > The concerned currency

2. **wallet** *of type `undefined`*

    > The concerned wallet



--- 
### proposalTargetBalanceAmount(address,(address,uint256))
>
>Get the settlement proposal target balance amount of the given wallet and currency


**Execution cost**: No bound available


Params:

1. **currency** *of type `undefined`*

    > The concerned currency

2. **wallet** *of type `undefined`*

    > The concerned wallet



--- 
### pushChallengeCandidateOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Push to store the given challenge candidate order
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The challenge candidate order to push



--- 
### pushChallengeCandidatePayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Push to store the given challenge candidate payment
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The challenge candidate payment to push



--- 
### pushChallengeCandidateTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))
>
>Push to store the given challenge candidate trade
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The challenge candidate trade to push



--- 
### startChallengeFromPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),int256)
>
>Start settlement challenge on payment


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The challenged payment

2. **stageAmount** *of type `undefined`*

    > Amount of payment currency to be staged



--- 
### startChallengeFromPaymentByProxy(address,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),int256)
>
>Start settlement challenge on payment


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The challenged payment

2. **stageAmount** *of type `undefined`*

    > Amount of payment currency to be staged

3. **wallet** *of type `undefined`*

    > The concerned party



--- 
### startChallengeFromTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),int256,int256)
>
>Start settlement challenge on trade


**Execution cost**: No bound available


Params:

1. **conjugateStageAmount** *of type `undefined`*

    > Amount of conjugate currency to be staged

2. **intendedStageAmount** *of type `undefined`*

    > Amount of intended currency to be staged

3. **trade** *of type `undefined`*

    > The challenged trade



--- 
### startChallengeFromTradeByProxy(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),int256,int256)
>
>Start settlement challenge on trade by proxy


**Execution cost**: No bound available


Params:

1. **conjugateStageAmount** *of type `undefined`*

    > Amount of conjugate currency to be staged

2. **intendedStageAmount** *of type `undefined`*

    > Amount of intended currency to be staged

3. **trade** *of type `undefined`*

    > The challenged trade

4. **wallet** *of type `undefined`*

    > The concerned party



--- 
### unchallengeOrderCandidateByTrade((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))
>
>Unchallenge settlement by providing trade that shows that challenge order candidate has been filled


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The order candidate that challenged driip

2. **trade** *of type `undefined`*

    > The trade in which order has been filled



[Back to the top ↑](#driipsettlementchallenge)
