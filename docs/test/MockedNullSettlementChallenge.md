# MockedNullSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedNullSettlementChallenge.sol)
> MockedNullSettlementChallenge


**Execution cost**: less than 1617 gas

**Deployment cost**: less than 1548400 gas

**Combined cost**: less than 1550017 gas




## Methods
### _proposalBlockNumber()


**Execution cost**: less than 969 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _proposalStatus()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### _challengeCandidatePaymentsCount()


**Execution cost**: less than 1299 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _proposalStageAmount()


**Execution cost**: less than 1211 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

--- 
### _proposalChallenger()


**Execution cost**: less than 1273 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### _proposalCandidateType()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### _proposalCandidateIndex()


**Execution cost**: less than 991 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _nullSettlementDispute()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### _proposalNonce()


**Execution cost**: less than 661 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _challengeCandidateTradesCount()


**Execution cost**: less than 837 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _challengePhase()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### _challengeCandidateOrdersCount()


**Execution cost**: less than 771 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### challengeCandidateOrdersCount()


**Execution cost**: less than 1101 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _setProposalCurrency(tuple)


**Execution cost**: No bound available


Params:

1. **proposalCurrency** *of type `tuple`*


--- 
### _setProposalBlockNumber(uint256)


**Execution cost**: less than 20512 gas


Params:

1. **proposalBlockNumber** *of type `uint256`*


--- 
### _proposalTargetBalanceAmount()


**Execution cost**: less than 1365 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

--- 
### _setChallengePhase(uint8)


**Execution cost**: less than 20786 gas


Params:

1. **challengePhase** *of type `uint8`*


--- 
### _reset()


**Execution cost**: less than 95929 gas




--- 
### proposalChallenger(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### challengeCandidatePaymentsCount()


**Execution cost**: less than 749 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
### challengeByOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### _setProposalStageAmount(int256)


**Execution cost**: less than 20336 gas


Params:

1. **proposalStageAmount** *of type `int256`*


--- 
### _setProposalNonce(uint256)


**Execution cost**: less than 20820 gas


Params:

1. **proposalNonce** *of type `uint256`*


--- 
### challengeByPayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


--- 
### proposalStatus(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint8`*

--- 
### proposalCandidateIndex(address)


**Execution cost**: less than 1117 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### challengePhase(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint8`*

--- 
### proposalBlockNumber(address)


**Execution cost**: less than 1579 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### challengeCandidateTradesCount()


**Execution cost**: less than 1189 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### changeNullSettlementDispute(address)


**Execution cost**: less than 21136 gas


Params:

1. **nullSettlementDispute** *of type `address`*


--- 
### setProposalCandidateIndex(address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **candidateIndex** *of type `uint256`*


--- 
### pushChallengeCandidateTrade(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*


--- 
### pushChallengeCandidateOrder(tuple)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*


--- 
### pushChallengeCandidatePayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


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
### proposalCandidateType(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint8`*

--- 
### proposalCurrency(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **index** *of type `uint256`*

Returns:


1. **output_0** *of type `tuple`*

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
### proposalNonce(address)


**Execution cost**: less than 1183 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### setProposalCandidateType(address,uint8)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **candidateType** *of type `uint8`*


--- 
### setProposalChallenger(address,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **challenger** *of type `address`*


--- 
### setProposalStatus(address,uint8)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **status** *of type `uint8`*


--- 
### _setProposalCurrency((address,uint256))


**Execution cost**: No bound available




--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### challengeByPayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### challengeByTrade(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




--- 
### proposalStageAmount(address,(address,uint256))


**Execution cost**: No bound available




--- 
### proposalTargetBalanceAmount(address,(address,uint256))


**Execution cost**: No bound available




--- 
### pushChallengeCandidateOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### pushChallengeCandidatePayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### pushChallengeCandidateTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




[Back to the top ↑](#mockednullsettlementchallenge)
