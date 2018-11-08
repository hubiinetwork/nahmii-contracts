# DriipSettlement
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/DriipSettlement.sol)
> DriipSettlement


**Execution cost**: less than 45620 gas

**Deployment cost**: less than 3958200 gas

**Combined cost**: less than 4003820 gas

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
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### ChangeDriipSettlementChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDriipSettlementChallenge** *of type `address`*
2. **newDriipSettlementChallenge** *of type `address`*

--- 
### ChangeClientFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### ChangeCommunityVoteEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldCommunityVote** *of type `address`*
2. **newCommunityVote** *of type `address`*

--- 
### ChangeFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldFraudChallenge** *of type `address`*
2. **newFraudChallenge** *of type `address`*

--- 
### ChangePaymentsRevenueFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldRevenueFund** *of type `address`*
2. **newRevenueFund** *of type `address`*

--- 
### ChangeTradesRevenueFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldRevenueFund** *of type `address`*
2. **newRevenueFund** *of type `address`*

--- 
### ChangeValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### SettlePaymentByProxyEvent(address,address,tuple,uint8)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **payment** *of type `tuple`*
4. **proposalStatus** *of type `uint8`*

--- 
### SettlePaymentEvent(address,tuple,uint8)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*
3. **proposalStatus** *of type `uint8`*

--- 
### SettleTradeByProxyEvent(address,address,tuple,uint8)


**Execution cost**: No bound available


Params:

1. **proxy** *of type `address`*
2. **wallet** *of type `address`*
3. **trade** *of type `tuple`*
4. **proposalStatus** *of type `uint8`*

--- 
### SettleTradeEvent(address,tuple,uint8)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*
3. **proposalStatus** *of type `uint8`*


## Methods
### changeDriipSettlementChallenge(address)
>
>Change the driip settlement challenge contract


**Execution cost**: No bound available


Params:

1. **newDriipSettlementChallenge** *of type `address`*

    > The (address of) DriipSettlementChallenge contract instance



--- 
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### changeFraudChallenge(address)
>
>Change the fraud challenge contract


**Execution cost**: No bound available


Params:

1. **newFraudChallenge** *of type `address`*

    > The (address of) FraudChallenge contract instance



--- 
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### changeCommunityVote(address)
>
>Change the community vote contract


**Execution cost**: No bound available


Params:

1. **newCommunityVote** *of type `address`*

    > The (address of) CommunityVote contract instance



--- 
### changeClientFund(address)
>
>Change the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### changeConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



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
### changeTradesRevenueFund(address)
>
>Change the trades revenue fund contract


**Execution cost**: No bound available


Params:

1. **newTradesRevenueFund** *of type `address`*

    > The (address of) trades RevenueFund contract instance



--- 
### changePaymentsRevenueFund(address)
>
>Change the payments revenue fund contract


**Execution cost**: No bound available


Params:

1. **newPaymentsRevenueFund** *of type `address`*

    > The (address of) payments RevenueFund contract instance



--- 
### tradesRevenueFund()


**Execution cost**: No bound available

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
### changeValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### communityVoteUpdateDisabled()


**Execution cost**: less than 1272 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### communityVote()


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
### fraudChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### driipSettlementChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1424 gas

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
### disableUpdateOfCommunityVote()
>
>Disable future updates of community vote contract


**Execution cost**: less than 20969 gas




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
### paymentsRevenueFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 896 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### nonceSettlementIndex(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### maxDriipNonce()


**Execution cost**: less than 878 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### isSeizedWallet(address)
>
>Get the seized status of given wallet


**Execution cost**: less than 1595 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

Returns:

> true if wallet is seized, false otherwise

1. **output_0** *of type `bool`*

--- 
### hasSettlementByNonce(uint256)
>
>Return boolean indicating whether there is already a settlement for the given (global) nonce


**Execution cost**: less than 1090 gas

**Attributes**: constant


Params:

1. **nonce** *of type `uint256`*

    > The nonce for which to check for settlement


Returns:

> true if there exists a settlement for the provided nonce, false otherwise

1. **output_0** *of type `bool`*

--- 
### settlePaymentByProxy(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **payment** *of type `tuple`*


--- 
### seizedWalletsMap(address)


**Execution cost**: less than 1102 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### seizedWalletsCount()
>
>Get the number of wallets whose funds have be seized


**Execution cost**: less than 592 gas

**Attributes**: constant



Returns:

> Number of wallets

1. **output_0** *of type `uint256`*

--- 
### seizedWallets(uint256)


**Execution cost**: less than 1701 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `address`*

--- 
### settlePayment(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*


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
### settleTrade(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*


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
### settleTradeByProxy(address,tuple)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **trade** *of type `tuple`*


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
### settlementsCount()
>
>Get the count of settlements


**Execution cost**: less than 900 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### settlementsCountByWallet(address)
>
>Get the count of settlements for given wallet


**Execution cost**: less than 1825 gas

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address for which to return settlement count


Returns:

> count of settlements for the provided wallet

1. **output_0** *of type `uint256`*

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
