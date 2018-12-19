# NullSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/NullSettlementChallenge.sol)
> NullSettlementChallenge


**Execution cost**: less than 44346 gas

**Deployment cost**: less than 2955000 gas

**Combined cost**: less than 2999346 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
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
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### SetNullSettlementDisputeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldNullSettlementDispute** *of type `address`*
2. **newNullSettlementDispute** *of type `address`*

--- 
### SetOperatorEvent(address,address)


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
### proposalIndicesByWallet(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


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
### isLockedWallet(address)
>
>Gauge whether the wallet is (temporarily) locked


**Execution cost**: less than 978 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The concerned wallet


Returns:

> true if wallet is locked, else false

1. **output_0** *of type `bool`*

--- 
### lockedWalletsCount()
>
>Get the number of locked wallets, i.e. wallets whose null settlement challenge has disqualified


**Execution cost**: less than 1538 gas

**Attributes**: constant



Returns:

> The number of locked wallets

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
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeWalletsCount()
>
>Get the number of challenge wallets, i.e. wallets that have started null settlement challenge


**Execution cost**: less than 702 gas

**Attributes**: constant



Returns:

> The number of challenge wallets

1. **output_0** *of type `uint256`*

--- 
### disqualificationsCount()
>
>Get the number of challenges


**Execution cost**: less than 724 gas

**Attributes**: constant



Returns:

> The number of challenges

1. **output_0** *of type `uint256`*

--- 
### lockedByWallet(address)


**Execution cost**: less than 1784 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

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
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 962 gas

**Attributes**: constant



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
### operator()


**Execution cost**: less than 1028 gas

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
### deployer()


**Execution cost**: less than 1578 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

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
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeWallets(uint256)


**Execution cost**: less than 1635 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### lockedWallets(uint256)


**Execution cost**: less than 1965 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

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
### nonce()


**Execution cost**: less than 1230 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### candidateHashesCount()
>
>Get the count of challenge candidate hashes


**Execution cost**: less than 1208 gas

**Attributes**: constant



Returns:

> The count of challenge candidate order hashes

1. **output_0** *of type `uint256`*

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
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



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
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



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
### setNullSettlementDispute(address)
>
>Set the settlement dispute contract


**Execution cost**: No bound available


Params:

1. **newNullSettlementDispute** *of type `address`*

    > The (address of) NullSettlementDispute contract instance



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
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### unlockTimeByWallet(address)


**Execution cost**: less than 1816 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Challenge the settlement by providing order candidate


**Execution cost**: No bound available


Params:

1. **order** *of type `undefined`*

    > The order candidate that challenges the null



--- 
### challengeByPayment(address,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Challenge the settlement by providing payment candidate


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The payment candidate that challenges the null

2. **wallet** *of type `undefined`*

    > The wallet whose settlement is being challenged



--- 
### challengeByTrade(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))
>
>Challenge the settlement by providing trade candidate


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The trade candidate that challenges the null

2. **wallet** *of type `undefined`*

    > The wallet whose settlement is being challenged



[Back to the top ↑](#nullsettlementchallenge)
