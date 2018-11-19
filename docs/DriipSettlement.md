# DriipSettlement
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlement.sol)
> DriipSettlement


**Execution cost**: less than 45436 gas

**Deployment cost**: less than 3819000 gas

**Combined cost**: less than 3864436 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### StageTotalFeeEvent(address,int256,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **deltaAmount** *of type `int256`*
3. **cumulativeAmount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

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
### SetDriipSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDriipSettlementChallenge** *of type `address`*
2. **newDriipSettlementChallenge** *of type `address`*

--- 
### SetClientFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### SetCommunityVoteEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldCommunityVote** *of type `address`*
2. **newCommunityVote** *of type `address`*

--- 
### SetFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldFraudChallenge** *of type `address`*
2. **newFraudChallenge** *of type `address`*

--- 
### SetPaymentsRevenueFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldRevenueFund** *of type `address`*
2. **newRevenueFund** *of type `address`*

--- 
### SetTradesRevenueFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldRevenueFund** *of type `address`*
2. **newRevenueFund** *of type `address`*

--- 
### SetValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### SettlePaymentByProxyEvent(address,address,tuple)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **payment** *of type `tuple`*

--- 
### SettlePaymentEvent(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*

--- 
### SettleTradeByProxyEvent(address,address,tuple)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **trade** *of type `tuple`*

--- 
### SettleTradeEvent(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*


## Methods
### walletCurrencyFeeNonce(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### setDriipSettlementChallenge(address)
>
>Set the driip settlement challenge contract


**Execution cost**: No bound available


Params:

1. **newDriipSettlementChallenge** *of type `address`*

    > The (address of) DriipSettlementChallenge contract instance



--- 
### driipSettlementChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setCommunityVote(address)
>
>Set the community vote contract


**Execution cost**: No bound available


Params:

1. **newCommunityVote** *of type `address`*

    > The (address of) CommunityVote contract instance



--- 
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1380 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### disableUpdateOfCommunityVote()
>
>Disable future updates of community vote contract


**Execution cost**: less than 21013 gas




--- 
### communityVoteUpdateDisabled()


**Execution cost**: less than 1250 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

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


**Execution cost**: less than 896 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 918 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setConfiguration(address)
>
>Set the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### hasSettlementByNonce(uint256)
>
>Return boolean indicating whether there is already a settlement for the given (global) nonce


**Execution cost**: less than 1068 gas

**Attributes**: constant


Params:

1. **nonce** *of type `uint256`*

    > The nonce for which to check for settlement


Returns:

> true if there exists a settlement for the provided nonce, false otherwise

1. **output_0** *of type `bool`*

--- 
### maxDriipNonce()


**Execution cost**: less than 856 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### communityVote()


**Execution cost**: No bound available

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
### paymentsRevenueFund()


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
### nonceSettlementIndex(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### setTradesRevenueFund(address)
>
>Set the trades revenue fund contract


**Execution cost**: No bound available


Params:

1. **newTradesRevenueFund** *of type `address`*

    > The (address of) trades RevenueFund contract instance



--- 
### setPaymentsRevenueFund(address)
>
>Set the payments revenue fund contract


**Execution cost**: No bound available


Params:

1. **newPaymentsRevenueFund** *of type `address`*

    > The (address of) payments RevenueFund contract instance



--- 
### setFraudChallenge(address)
>
>Set the fraud challenge contract


**Execution cost**: No bound available


Params:

1. **newFraudChallenge** *of type `address`*

    > The (address of) FraudChallenge contract instance



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### walletCurrencyMaxDriipNonce(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### settlementByNonce(uint256)
>
>Get the settlement for the given (global) nonce


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **nonce** *of type `uint256`*

    > The nonce of the settlement


Returns:

> settlement of the provided nonce

1. **output_0** *of type `tuple`*

--- 
### settleTrade(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*


--- 
### settlePayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


--- 
### setValidator(address)
>
>Set the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### settlePaymentByProxy(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*


--- 
### settleTradeByProxy(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*


--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### settlementsCount()
>
>Get the count of settlements


**Execution cost**: less than 878 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### settlements(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **nonce** *of type `uint256`*
2. **driipType** *of type `uint8`*
3. **origin** *of type `tuple`*
4. **target** *of type `tuple`*

--- 
### settlementByWalletAndNonce(address,uint256)
>
>Get settlement of given wallet and (wallet) nonce


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address for which to return settlement

2. **nonce** *of type `uint256`*

    > The wallet's nonce


Returns:

> settlement for the provided wallet and index

1. **output_0** *of type `tuple`*

--- 
### settlementByWalletAndIndex(address,uint256)
>
>Get settlement of given wallet and index


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address for which to return settlement

2. **index** *of type `uint256`*

    > The wallet's settlement index


Returns:

> settlement for the provided wallet and index

1. **output_0** *of type `tuple`*

--- 
### settlementsCountByWallet(address)
>
>Get the count of settlements for given wallet


**Execution cost**: less than 1781 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address for which to return settlement count


Returns:

> count of settlements for the provided wallet

1. **output_0** *of type `uint256`*

--- 
### tradesRevenueFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### updateMaxDriipNonce()
>
>Update the max driip nonce property from CommunityVote contract


**Execution cost**: No bound available




--- 
### walletCurrencyFeeCharged(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `address`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### walletNonceSettlementIndex(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### walletSettlementIndices(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### settlePayment((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Settle driip that is a payment


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The payment to be settled



--- 
### settlePaymentByProxy(address,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))
>
>Settle driip that is a payment


**Execution cost**: No bound available


Params:

1. **payment** *of type `undefined`*

    > The payment to be settled

2. **wallet** *of type `undefined`*

    > The wallet whose side of the payment is to be settled



--- 
### settleTrade((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))
>
>Settle driip that is a trade


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The trade to be settled



--- 
### settleTradeByProxy(address,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))
>
>Settle driip that is a trade


**Execution cost**: No bound available


Params:

1. **trade** *of type `undefined`*

    > The trade to be settled

2. **wallet** *of type `undefined`*

    > The wallet whose side of the trade is to be settled



[Back to the top ↑](#driipsettlement)
