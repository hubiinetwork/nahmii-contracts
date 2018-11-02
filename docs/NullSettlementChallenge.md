# NullSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/NullSettlementChallenge.sol)
> NullSettlementChallenge


**Execution cost**: less than 45171 gas

**Deployment cost**: less than 3612400 gas

**Combined cost**: less than 3657571 gas

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
### ChangeNullSettlementDisputeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldNullSettlementDispute** *of type `address`*
2. **newNullSettlementDispute** *of type `address`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### StartChallengeByProxyEvent(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **amount** *of type `int256`*
4. **stageCurrencyCt** *of type `address`*
5. **stageCurrencyId** *of type `uint256`*

--- 
### StartChallengeEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **stageCurrencyCt** *of type `address`*
4. **stageCurrencyId** *of type `uint256`*


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
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


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
>Get settlement challenge phase of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement challenge phase

1. **output_0** *of type `uint8`*

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
10. **operatorId** *of type `uint256`*

--- 
### challengeCandidateTradesCount()
>
>Get the count of challenge candidate trades


**Execution cost**: less than 1208 gas

**Attributes**: constant



Returns:

> The count of challenge candidate trades

1. **output_0** *of type `uint256`*

--- 
### challengeCandidateOrdersCount()
>
>Get the count of challenge candidate orders


**Execution cost**: less than 1120 gas

**Attributes**: constant



Returns:

> The count of challenge candidate orders

1. **output_0** *of type `uint256`*

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
### changeClientFund(address)
>
>Change the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### challengeByPayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


--- 
### challengeByTrade(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
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
### changeConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### changeNullSettlementDispute(address)
>
>Change the settlement dispute contract


**Execution cost**: No bound available


Params:

1. **newNullSettlementDispute** *of type `address`*

    > The (address of) NullSettlementDispute contract instance



--- 
### pushChallengeCandidateOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### proposalCandidateIndex(address)
>
>Get the candidate index of the given wallet's settlement proposal


**Execution cost**: less than 1281 gas

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
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1578 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### nullSettlementDispute()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### proposalBlockNumber(address)
>
>Get the settlement proposal block number of the given wallet


**Execution cost**: less than 1787 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement proposal block number

1. **output_0** *of type `uint256`*

--- 
### operator()


**Execution cost**: less than 984 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 940 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### nonce()


**Execution cost**: less than 1164 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### walletChallengeCount(address)
>
>Get the number of current and past settlement challenges for given wallet


**Execution cost**: less than 1064 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return count


Returns:

> The count of settlement challenges

1. **output_0** *of type `uint256`*

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
### pushChallengeCandidatePayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


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
### proposalStageAmount(address,tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currency** *of type `tuple`*

Returns:


1. **output_0** *of type `int256`*

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
### proposalStatus(address)
>
>Get the settlement proposal status of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement proposal status

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


**Execution cost**: less than 1699 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement proposal currency count

1. **output_0** *of type `uint256`*

--- 
### pushChallengeCandidateTrade(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*


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


**Execution cost**: less than 1765 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement proposal timeout

1. **output_0** *of type `uint256`*

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
### proposalNonce(address)
>
>Get the settlement proposal nonce of the given wallet


**Execution cost**: less than 1372 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> The settlement proposal nonce

1. **output_0** *of type `uint256`*

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
### startChallenge(int256,address,uint256)
>
>Start settlement challenge


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*

    > The concerned amount to stage

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



--- 
### startChallengeByProxy(address,int256,address,uint256)
>
>Start settlement challenge for the given wallet


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **amount** *of type `int256`*

    > The concerned amount to stage

3. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

4. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



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



[Back to the top ↑](#nullsettlementchallenge)
