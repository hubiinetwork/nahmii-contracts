# NullSettlementDispute
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/NullSettlementDispute.sol)
> NullSettlementDispute


**Execution cost**: less than 44822 gas

**Deployment cost**: less than 3337600 gas

**Combined cost**: less than 3382422 gas

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
### SetNullSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldNullSettlementChallenge** *of type `address`*
2. **newNullSettlementChallenge** *of type `address`*

--- 
### ChallengeByTradeEvent(address,uint256,bytes32,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **candidateHash** *of type `bytes32`*
4. **challenger** *of type `address`*

--- 
### ChallengeByPaymentEvent(address,uint256,bytes32,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **candidateHash** *of type `bytes32`*
4. **challenger** *of type `address`*

--- 
### SetCancelOrdersChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldCancelOrdersChallenge** *of type `address`*
2. **newCancelOrdersChallenge** *of type `address`*

--- 
### SetFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldFraudChallenge** *of type `address`*
2. **newFraudChallenge** *of type `address`*

--- 
### ChallengeByOrderEvent(address,uint256,bytes32,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **nonce** *of type `uint256`*
3. **candidateHash** *of type `bytes32`*
4. **challenger** *of type `address`*

--- 
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### SetConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SetSecurityBondEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### SetValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*


## Methods
### setSecurityBond(address)
>
>Set the security bond contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) SecurityBond contract instance



--- 
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeByTrade(address,tuple,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **challenger** *of type `address`*


--- 
### challengeByOrder(tuple,address)


**Execution cost**: No bound available


Params:

1. **order** *of type `tuple`*
2. **challenger** *of type `address`*


--- 
### challengeByPayment(address,tuple,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*
3. **challenger** *of type `address`*


--- 
### cancelOrdersChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setNullSettlementChallenge(address)
>
>Set the settlement challenge contract


**Execution cost**: No bound available


Params:

1. **newNullSettlementChallenge** *of type `address`*

    > The (address of) NullSettlementChallenge contract instance



--- 
### fraudChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 874 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1160 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setFraudChallenge(address)
>
>Set the fraud challenge contract


**Execution cost**: No bound available


Params:

1. **newFraudChallenge** *of type `address`*

    > The (address of) FraudChallenge contract instance



--- 
### setConfiguration(address)
>
>Set the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### setCancelOrdersChallenge(address)
>
>Set the cancel orders challenge contract


**Execution cost**: No bound available


Params:

1. **newCancelOrdersChallenge** *of type `address`*

    > The (address of) CancelOrdersChallenge contract instance



--- 
### operator()


**Execution cost**: less than 896 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setClientFund(address)
>
>Set the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### securityBond()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### nullSettlementChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### setValidator(address)
>
>Set the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challengeByOrder((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)
>
>Challenge the settlement by providing order candidate
>
> If (candidate) order has buy intention consider _conjugate_ currency and amount, else if (candidate) order has sell intention consider _intended_ currency and amount


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **order** *of type `undefined`*

    > The order candidate that challenges



--- 
### challengeByPayment(address,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)
>
>Challenge the settlement by providing payment candidate
>
> This challenges the payment sender's side of things


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **payment** *of type `undefined`*

    > The payment candidate that challenges

3. **wallet** *of type `undefined`*

    > The wallet whose settlement is being challenged



--- 
### challengeByTrade(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),address)
>
>Challenge the settlement by providing trade candidate
>
> If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade


**Execution cost**: No bound available


Params:

1. **challenger** *of type `undefined`*

    > The address of the challenger

2. **trade** *of type `undefined`*

    > The trade candidate that challenges

3. **wallet** *of type `undefined`*

    > The wallet whose settlement is being challenged



[Back to the top ↑](#nullsettlementdispute)
