# MockedDriipSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedDriipSettlementChallenge.sol)
> MockedDriipSettlementChallenge


**Execution cost**: less than 1820 gas

**Deployment cost**: less than 1731200 gas

**Combined cost**: less than 1733020 gas




## Methods
### _proposalStageAmounts(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### proposalBlockNumber(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### _disqualificationCandidateHash()


**Execution cost**: less than 1541 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### isLockedWallet(address)


**Execution cost**: less than 810 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### _proposalExpired()


**Execution cost**: less than 585 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### disqualificationChallenger(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### _setProposalTargetBalanceAmount(int256)


**Execution cost**: less than 21326 gas


Params:

1. **proposalTargetBalanceAmount** *of type `int256`*


--- 
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### _proposalDriipType()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### _reset()


**Execution cost**: No bound available




--- 
### _proposalBalanceReward()


**Execution cost**: less than 1509 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### _setProposalExpired(bool)


**Execution cost**: less than 21524 gas


Params:

1. **proposalExpired** *of type `bool`*


--- 
### _addProposalStageAmount(int256)


**Execution cost**: less than 40792 gas


Params:

1. **proposalStageAmount** *of type `int256`*


--- 
### _disqualificationCandidateType()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### disqualificationsCount()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _setDisqualificationCandidateHash(bytes32)


**Execution cost**: less than 20622 gas


Params:

1. **candidateHash** *of type `bytes32`*


--- 
### _proposalNonce()


**Execution cost**: less than 837 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _setProposalBalanceReward(bool)


**Execution cost**: less than 20908 gas


Params:

1. **balanceReward** *of type `bool`*


--- 
### _proposalStageAmountIndex()


**Execution cost**: less than 881 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _setDisqualificationCandidateType(uint8)


**Execution cost**: less than 21006 gas


Params:

1. **candidateType** *of type `uint8`*


--- 
### _setProposalBlockNumber(uint256)


**Execution cost**: less than 20732 gas


Params:

1. **proposalBlockNumber** *of type `uint256`*


--- 
### hasProposalExpired(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### _proposalTargetBalanceAmount()


**Execution cost**: less than 1453 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

--- 
### challengeByTrade(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*


--- 
### _proposalDriipHash()


**Execution cost**: less than 1013 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### _proposalStatus()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### proposalBalanceReward(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `bool`*

--- 
### challengeByPayment(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*


--- 
### _setDisqualificationsCount(uint256)


**Execution cost**: less than 21238 gas


Params:

1. **count** *of type `uint256`*


--- 
### _proposalBlockNumber()


**Execution cost**: less than 1123 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### lockWallet(address)


**Execution cost**: less than 21492 gas


Params:

1. **wallet** *of type `address`*


--- 
### _setProposalNonce(uint256)


**Execution cost**: less than 20974 gas


Params:

1. **proposalNonce** *of type `uint256`*


--- 
### _setDisqualificationChallenger(address)


**Execution cost**: less than 21382 gas


Params:

1. **challenger** *of type `address`*


--- 
### disqualificationCandidateType(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint8`*

--- 
### _disqualificationChallenger()


**Execution cost**: less than 1493 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### disqualificationCandidateHash(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### addDisqualification(address,address,uint256,bytes32,uint8,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **candidateHash** *of type `bytes32`*
5. **candidateType** *of type `uint8`*
6. **challenger** *of type `address`*


--- 
### _proposalExpirationTime()


**Execution cost**: less than 1299 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _driipSettlementDispute()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### proposalDriipHash(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `bytes32`*

--- 
### setProposalExpirationTime(address,address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **expirationTime** *of type `uint256`*


--- 
### proposalExpirationTime(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### proposalNonce(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### setDriipSettlementDispute(address)


**Execution cost**: less than 21334 gas


Params:

1. **driipSettlementDispute** *of type `address`*


--- 
### proposalStageAmount(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### proposalDriipType(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint8`*

--- 
### proposalTargetBalanceAmount(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### removeDisqualification(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*


--- 
### proposalStatus(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint8`*

--- 
### setProposalStatus(address,address,uint256,uint8)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **status** *of type `uint8`*


--- 
### unchallengeOrderCandidateByTrade(tuple,tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **trade** *of type `tuple`*


--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### challengeByPayment(address,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### challengeByTrade(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




--- 
### unchallengeOrderCandidateByTrade((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




[Back to the top ↑](#mockeddriipsettlementchallenge)
