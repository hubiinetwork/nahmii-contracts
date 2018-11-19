# DriipSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlementChallenge.sol)
> DriipSettlementChallenge


**Execution cost**: less than 45578 gas

**Deployment cost**: less than 3928600 gas

**Combined cost**: less than 3974178 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### SetConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### SetDriipSettlementDisputeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDriipSettlementDispute** *of type `address`*
2. **newDriipSettlementDispute** *of type `address`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SetValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### StartChallengeFromPaymentByProxyEvent(address,address,bytes32,int256)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **paymentHash** *of type `bytes32`*
4. **stageAmount** *of type `int256`*

--- 
### StartChallengeFromPaymentEvent(address,bytes32,int256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **paymentHash** *of type `bytes32`*
3. **stageAmount** *of type `int256`*

--- 
### StartChallengeFromTradeByProxyEvent(address,address,bytes32,int256,int256)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **tradeHash** *of type `bytes32`*
4. **intendedStageAmount** *of type `int256`*
5. **conjugateStageAmount** *of type `int256`*

--- 
### StartChallengeFromTradeEvent(address,bytes32,int256,int256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **tradeHash** *of type `bytes32`*
3. **intendedStageAmount** *of type `int256`*
4. **conjugateStageAmount** *of type `int256`*


## Methods
### walletChallengePaymentHashIndicesCount(address)
>
>Get the number of current and past settlement challenges from payment for given wallet


**Execution cost**: less than 1605 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return count


Returns:

> The count of settlement challenges from payment

1. **output_0** *of type `uint256`*

--- 
### proposalBlockNumber(address,address,uint256)
>
>Get the settlement proposal block number of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The settlement proposal block number

1. **output_0** *of type `uint256`*

--- 
### lockedWalletsCount()
>
>Get the number of locked wallets, i.e. wallets whose driip settlement challenge has disqualified


**Execution cost**: less than 1846 gas

**Attributes**: constant



Returns:

> The number of locked wallets

1. **output_0** *of type `uint256`*

--- 
### isLockedWallet(address)
>
>Gauge whether the wallet is (temporarily) locked


**Execution cost**: less than 1000 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> true if wallet is locked, else false

1. **output_0** *of type `bool`*

--- 
### challengeTradeHashesCount()
>
>Get the number of challenged trade hashes


**Execution cost**: less than 1824 gas

**Attributes**: constant



Returns:

> The count of challenged trade hashes

1. **output_0** *of type `uint256`*

--- 
### disqualificationChallenger(address,address,uint256)
>
>Get the disqualification challenger of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The challenger of the settlement disqualification

1. **output_0** *of type `address`*

--- 
### lockedByWallet(address)


**Execution cost**: less than 2092 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### disqualifications(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **candidateHash** *of type `bytes32`*
6. **candidateType** *of type `uint8`*
7. **challenger** *of type `address`*

--- 
### challengePaymentHashIndicesByWallet(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### deployer()


**Execution cost**: less than 1864 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeWalletsCount()
>
>Get the number of challenge wallets, i.e. wallets that have started driip settlement challenge


**Execution cost**: less than 790 gas

**Attributes**: constant



Returns:

> The number of challenge wallets

1. **output_0** *of type `uint256`*

--- 
### challengePaymentHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### challengeTradeHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### disqualificationsCount()
>
>Get the number of challenges


**Execution cost**: less than 856 gas

**Attributes**: constant



Returns:

> The number of challenges

1. **output_0** *of type `uint256`*

--- 
### lockWallet(address)
>
>Disqualify the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet



--- 
### hasProposalExpired(address,address,uint256)
>
>Gauge whether the proposal for the given wallet and currency has expired


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> true if proposal has expired, else false

1. **output_0** *of type `bool`*

--- 
### challengePaymentHashesCount()
>
>Get the number of challenged payment hashes


**Execution cost**: less than 922 gas

**Attributes**: constant



Returns:

> The count of challenged payment hashes

1. **output_0** *of type `uint256`*

--- 
### driipSettlementDispute()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 1116 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### lockedWallets(uint256)


**Execution cost**: less than 2207 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### challengeByTrade(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*


--- 
### proposalBalanceReward(address,address,uint256)
>
>Get the balance reward of the given wallet's settlement proposal


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The balance reward of the settlement proposal

1. **output_0** *of type `bool`*

--- 
### challengeTradeHashIndicesByWallet(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### disqualificationIndexByWalletCurrency(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### operator()


**Execution cost**: less than 1248 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### addDisqualification(address,address,uint256,bytes32,uint8,address)
>
>Add a disqualification instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)

4. **candidateHash** *of type `bytes32`*

    > The candidate hash

5. **candidateType** *of type `uint8`*

    > The candidate type

6. **challenger** *of type `address`*

    > The concerned challenger



--- 
### candidateHashes(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### challengeByPayment(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*


--- 
### candidateHashesCount()
>
>Get the count of challenge candidate hashes


**Execution cost**: less than 1472 gas

**Attributes**: constant



Returns:

> The count of challenge candidate order hashes

1. **output_0** *of type `uint256`*

--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### disqualificationCandidateHash(address,address,uint256)
>
>Get the disqualification candidate hash of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The candidate hash of the settlement disqualification

1. **output_0** *of type `bytes32`*

--- 
### disqualificationCandidateType(address,address,uint256)
>
>Get the disqualification candidate type of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The candidate type of the settlement disqualification

1. **output_0** *of type `uint8`*

--- 
### challengeWallets(uint256)


**Execution cost**: less than 1877 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### startChallengeFromPayment(tuple,int256)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*
2. **stageAmount** *of type `int256`*


--- 
### proposals(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **blockNumber** *of type `uint256`*
4. **expirationTime** *of type `uint256`*
5. **status** *of type `uint8`*
6. **currencyCt** *of type `address`*
7. **currencyId** *of type `uint256`*
8. **stageAmount** *of type `int256`*
9. **targetBalanceAmount** *of type `int256`*
10. **driipHash** *of type `bytes32`*
11. **driipType** *of type `uint8`*
12. **balanceReward** *of type `bool`*

--- 
### proposalIndicesByWallet(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### proposalExpirationTime(address,address,uint256)
>
>Get the settlement proposal end time of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The settlement proposal end time

1. **output_0** *of type `uint256`*

--- 
### proposalStatus(address,address,uint256)
>
>Get the challenge status of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The challenge status

1. **output_0** *of type `uint8`*

--- 
### proposalTargetBalanceAmount(address,address,uint256)
>
>Get the settlement proposal target balance amount of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The settlement proposal target balance amount

1. **output_0** *of type `int256`*

--- 
### proposalDriipHash(address,address,uint256)
>
>Get the settlement proposal driip hash of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The settlement proposal driip hash

1. **output_0** *of type `bytes32`*

--- 
### proposalNonce(address,address,uint256)
>
>Get the challenge nonce of the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The challenge nonce

1. **output_0** *of type `uint256`*

--- 
### proposalIndexByWalletCurrency(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### proposalDriipType(address,address,uint256)
>
>Get the settlement proposal driip type of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The settlement proposal driip type

1. **output_0** *of type `uint8`*

--- 
### proposalStageAmount(address,address,uint256)
>
>Get the settlement proposal stage amount of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The settlement proposal stage amount

1. **output_0** *of type `int256`*

--- 
### setProposalExpirationTime(address,address,uint256,uint256)
>
>Set settlement proposal end time property of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **expirationTime** *of type `uint256`*

    > The end time value



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setDriipSettlementDispute(address)
>
>Set the settlement dispute contract


**Execution cost**: No bound available


Params:

1. **newDriipSettlementDispute** *of type `address`*

    > The (address of) DriipSettlementDispute contract instance



--- 
### proposalsCount()
>
>Get the number of proposals


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The number of proposals

1. **output_0** *of type `uint256`*

--- 
### setConfiguration(address)
>
>Set the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### removeDisqualification(address,address,uint256)
>
>Remove a disqualification instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setProposalStatus(address,address,uint256,uint8)
>
>Set settlement proposal status property of the given wallet
>
> This function can only be called by this contract's dispute instance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The concerned wallet

2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **status** *of type `uint8`*

    > The status value



--- 
### setValidator(address)
>
>Set the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### startChallengeFromPaymentByProxy(address,tuple,int256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*
3. **stageAmount** *of type `int256`*


--- 
### startChallengeFromTrade(tuple,int256,int256)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*
2. **intendedStageAmount** *of type `int256`*
3. **conjugateStageAmount** *of type `int256`*


--- 
### startChallengeFromTradeByProxy(address,tuple,int256,int256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **intendedStageAmount** *of type `int256`*
4. **conjugateStageAmount** *of type `int256`*


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
### unlockTimeByWallet(address)


**Execution cost**: less than 2102 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### walletChallengeTradeHashIndicesCount(address)
>
>Get the number of current and past settlement challenges from trade for given wallet


**Execution cost**: less than 1957 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The wallet for which to return count


Returns:

> The count of settlement challenges from trade

1. **output_0** *of type `uint256`*

--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Challenge the settlement by providing order candidate


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The order candidate that challenges the challenged driip



--- 
### challengeByPayment(address,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Challenge the settlement by providing payment candidate


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The payment candidate that challenges the challenged driip

2. **wallet** *of type `undefined`*

    > The wallet whose settlement is being challenged



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
