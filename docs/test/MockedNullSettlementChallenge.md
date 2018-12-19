# MockedNullSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedNullSettlementChallenge.sol)
> MockedNullSettlementChallenge


**Execution cost**: less than 1729 gas

**Deployment cost**: less than 1646200 gas

**Combined cost**: less than 1647929 gas




## Methods
### _proposalStageAmounts(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### _proposalStatus()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### _disqualificationCandidateHash()


**Execution cost**: less than 1431 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bytes32`*

--- 
### _proposalExpired()


**Execution cost**: less than 563 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### _proposalBalanceReward()


**Execution cost**: less than 1410 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### _disqualificationChallenger()


**Execution cost**: less than 1405 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### _proposalExpirationTime()


**Execution cost**: less than 1233 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _proposalBlockNumber()


**Execution cost**: less than 1057 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _proposalStageAmountIndex()


**Execution cost**: less than 859 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _addProposalStageAmount(int256)


**Execution cost**: less than 40726 gas


Params:

1. **proposalStageAmount** *of type `int256`*


--- 
### _disqualificationCandidateType()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### _nullSettlementDispute()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### _proposalNonce()


**Execution cost**: less than 815 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _setDisqualificationChallenger(address)


**Execution cost**: less than 21316 gas


Params:

1. **challenger** *of type `address`*


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
### disqualificationsCount()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _setProposalBalanceReward(bool)


**Execution cost**: less than 20900 gas


Params:

1. **balanceReward** *of type `bool`*


--- 
### isLockedWallet(address)


**Execution cost**: less than 788 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### _setDisqualificationCandidateType(uint8)


**Execution cost**: less than 20984 gas


Params:

1. **candidateType** *of type `uint8`*


--- 
### _setProposalBlockNumber(uint256)


**Execution cost**: less than 20710 gas


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
### _setProposalTargetBalanceAmount(int256)


**Execution cost**: less than 21216 gas


Params:

1. **proposalTargetBalanceAmount** *of type `int256`*


--- 
### challengeByTrade(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*


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
### _reset()


**Execution cost**: No bound available




--- 
### _setProposalExpired(bool)


**Execution cost**: less than 21414 gas


Params:

1. **proposalExpired** *of type `bool`*


--- 
### _setProposalNonce(uint256)


**Execution cost**: less than 20908 gas


Params:

1. **proposalNonce** *of type `uint256`*


--- 
### _setDisqualificationCandidateHash(bytes32)


**Execution cost**: less than 20600 gas


Params:

1. **candidateHash** *of type `bytes32`*


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
### _proposalTargetBalanceAmount()


**Execution cost**: less than 1343 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

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
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### _setDisqualificationsCount(uint256)


**Execution cost**: less than 21128 gas


Params:

1. **count** *of type `uint256`*


--- 
### lockWallet(address)


**Execution cost**: less than 21382 gas


Params:

1. **wallet** *of type `address`*


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
### proposalStageAmount(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

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
### setNullSettlementDispute(address)


**Execution cost**: less than 21004 gas


Params:

1. **nullSettlementDispute** *of type `address`*


--- 
### setProposalExpirationTime(address,address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **expirationTime** *of type `uint256`*


--- 
### setProposalStatus(address,address,uint256,uint8)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **status** *of type `uint8`*


--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### challengeByPayment(address,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### challengeByTrade(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




[Back to the top ↑](#mockednullsettlementchallenge)
