# MockedDriipSettlementChallenge
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedDriipSettlementChallenge.sol)
> MockedDriipSettlementChallenge


**Execution cost**: less than 530 gas

**Deployment cost**: less than 493400 gas

**Combined cost**: less than 493930 gas

## Constructor






## Methods
### getChallengeChallenger(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `address`*

--- 
### getChallengeConjugateStage(address)


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
### getChallengeNonce(address)


**Execution cost**: less than 907 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### getChallengeStatus(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `uint8`*

--- 
### updateDriipSettlementChallenge(address,uint256,uint8,int256,address,uint256,int256,address,uint256,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **status** *of type `uint8`*
4. **intendedAmount** *of type `int256`*
5. **intendedCurrencyCt** *of type `address`*
6. **intendedCurrencyId** *of type `uint256`*
7. **conjugateAmount** *of type `int256`*
8. **conjugateCurrencyCt** *of type `address`*
9. **conjugateCurrencyId** *of type `uint256`*
10. **challenger** *of type `address`*


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

[Back to the top ↑](#mockeddriipsettlementchallenge)
