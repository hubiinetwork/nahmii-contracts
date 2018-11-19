# MockedSecurityBond
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedSecurityBond.sol)
> MockedSecurityBond


**Execution cost**: less than 343 gas

**Deployment cost**: less than 303000 gas

**Combined cost**: less than 303343 gas

## Constructor




## Events
### DepriveEvent(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

--- 
### RewardEvent(address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **rewardFraction** *of type `uint256`*
3. **unlockTimeoutInSeconds** *of type `uint256`*


## Methods
### _deprivalsCount()


**Execution cost**: less than 595 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### _reset()


**Execution cost**: No bound available




--- 
### _rewardsCount()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### deprivals(uint256)


**Execution cost**: less than 994 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### deprive(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*


--- 
### reward(address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **rewardFraction** *of type `uint256`*
3. **unlockTimeoutInSeconds** *of type `uint256`*


--- 
### rewards(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **wallet** *of type `address`*
2. **rewardFraction** *of type `uint256`*
3. **unlockTimeoutInSeconds** *of type `uint256`*

[Back to the top ↑](#mockedsecuritybond)
