# MockedValidator
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedValidator.sol)
> MockedValidator


**Execution cost**: No bound available

**Deployment cost**: less than 2924000 gas

**Combined cost**: No bound available

## Constructor



Params:

1. **owner** *of type `address`*
2. **signerManager** *of type `address`*

## Events
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeSignerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldSignerManager** *of type `address`*
2. **newSignerManager** *of type `address`*


## Methods
### isSuccessivePaymentsPartyNonces(tuple,uint8,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **firstPayment** *of type `tuple`*
2. **firstPaymentPartyRole** *of type `uint8`*
3. **lastPayment** *of type `tuple`*
4. **lastPaymentPartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineSuccessiveTradePaymentTotalFees(tuple,uint8,tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **tradePartyRole** *of type `uint8`*
3. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setSignerManager(address)
>
>Change the signer manager of this contract


**Execution cost**: No bound available


Params:

1. **newSignerManager** *of type `address`*

    > The address of the new signer



--- 
### isGenuinePaymentSender(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### isGenuineSuccessivePaymentsBalances(tuple,uint8,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **firstPayment** *of type `tuple`*
2. **firstPaymentPartyRole** *of type `uint8`*
3. **lastPayment** *of type `tuple`*
4. **lastPaymentPartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineOrderWalletSeal(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **order** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### isGenuinePaymentWalletSeal(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineOrderOperatorSeal(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **order** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineOrderWalletHash(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **order** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### deployer()


**Execution cost**: less than 2153 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isGenuineOrderSeals(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **order** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuinePaymentWalletHash(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuinePaymentSeals(tuple)


**Execution cost**: No bound available


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineSuccessivePaymentTradeTotalFees(tuple,uint8,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*
2. **paymentPartyRole** *of type `uint8`*
3. **trade** *of type `tuple`*
4. **tradePartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineSuccessiveTradePaymentBalances(tuple,uint8,uint8,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **tradePartyRole** *of type `uint8`*
3. **tradeCurrencyRole** *of type `uint8`*
4. **payment** *of type `tuple`*
5. **paymentPartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineSuccessivePaymentTradeBalances(tuple,uint8,tuple,uint8,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*
2. **paymentPartyRole** *of type `uint8`*
3. **trade** *of type `tuple`*
4. **tradePartyRole** *of type `uint8`*
5. **tradeCurrencyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuinePaymentOperatorSeal(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuinePaymentRecipient(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineSuccessiveTradeOrderResiduals(tuple,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **firstTrade** *of type `tuple`*
2. **lastTrade** *of type `tuple`*
3. **tradePartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuinePaymentFee(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### ethrecover(bytes32,uint8,bytes32,bytes32)
>
>Prefix input hash and do ecrecover on prefixed hash


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash message that was signed

2. **v** *of type `uint8`*

    > The v property of the ECDSA signature

3. **r** *of type `bytes32`*

    > The r property of the ECDSA signature

4. **s** *of type `bytes32`*

    > The s property of the ECDSA signature


Returns:

> The address recovered

1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 1142 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isGenuineSuccessivePaymentsTotalFees(tuple,tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **firstPayment** *of type `tuple`*
2. **lastPayment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setPaymentRecipient(bool)


**Execution cost**: less than 21758 gas


Params:

1. **_paymentRecipient** *of type `bool`*


--- 
### isPaymentRecipient(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineTradeBuyer(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineSuccessiveTradesTotalFees(tuple,uint8,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **firstTrade** *of type `tuple`*
2. **firstTradePartyRole** *of type `uint8`*
3. **lastTrade** *of type `tuple`*
4. **lastTradePartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineSuccessiveTradesBalances(tuple,uint8,uint8,tuple,uint8,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **firstTrade** *of type `tuple`*
2. **firstTradePartyRole** *of type `uint8`*
3. **firstCurrencyRole** *of type `uint8`*
4. **lastTrade** *of type `tuple`*
5. **lastTradePartyRole** *of type `uint8`*
6. **lastCurrencyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isPaymentParty(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineTradeSeller(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineTradeSeal(tuple)


**Execution cost**: No bound available


Params:

1. **trade** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineTradeSellerFee(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineTradeBuyerFee(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineWalletSignature(bytes32,tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*
2. **signature** *of type `tuple`*
3. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setGenuineTradeSeller(bool)


**Execution cost**: less than 21230 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineSuccessivePaymentsTotalFees(bool)


**Execution cost**: less than 22418 gas


Params:

1. **genuine** *of type `bool`*


--- 
### isSignedByRegisteredSigner(bytes32,uint8,bytes32,bytes32)
>
>Gauge whether a signature of a hash has been signed by a registered signer


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash message that was signed

2. **v** *of type `uint8`*

    > The v property of the ECDSA signature

3. **r** *of type `bytes32`*

    > The r property of the ECDSA signature

4. **s** *of type `bytes32`*

    > The s property of the ECDSA signature


Returns:

> true if the recovered signer is one of the registered signers, else false

1. **output_0** *of type `bool`*

--- 
### isSuccessiveTradePaymentPartyNonces(tuple,uint8,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **tradePartyRole** *of type `uint8`*
3. **payment** *of type `tuple`*
4. **paymentPartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setGenuinePaymentSender(bool)


**Execution cost**: less than 22352 gas


Params:

1. **genuine** *of type `bool`*


--- 
### isTradeBuyer(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setGenuineSuccessivePaymentTradeBalances(bool)


**Execution cost**: less than 20658 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineSuccessivePaymentsBalances(bool)


**Execution cost**: less than 22242 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineOrderSeals(bool)


**Execution cost**: less than 20702 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineOrderWalletHash(bool)


**Execution cost**: less than 21538 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuinePaymentSeals(bool)


**Execution cost**: less than 44075 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuinePaymentFee(bool)


**Execution cost**: less than 20966 gas


Params:

1. **genuine** *of type `bool`*


--- 
### isSuccessivePaymentTradePartyNonces(tuple,uint8,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*
2. **paymentPartyRole** *of type `uint8`*
3. **trade** *of type `tuple`*
4. **tradePartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isSuccessiveTradesPartyNonces(tuple,uint8,tuple,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **firstTrade** *of type `tuple`*
2. **firstTradePartyRole** *of type `uint8`*
3. **lastTrade** *of type `tuple`*
4. **lastTradePartyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### reset()


**Execution cost**: No bound available




--- 
### isPaymentSender(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setGenuinePaymentWalletSeal(bool)


**Execution cost**: less than 22000 gas


Params:

1. **genuine** *of type `bool`*


--- 
### isTradeOrder(tuple,tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **order** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setGenuineSuccessivePaymentTradeTotalFees(bool)


**Execution cost**: less than 21736 gas


Params:

1. **genuine** *of type `bool`*


--- 
### isSignedBy(bytes32,uint8,bytes32,bytes32,address)
>
>Gauge whether a signature of a hash has been signed by the claimed signer


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*

    > The hash message that was signed

2. **v** *of type `uint8`*

    > The v property of the ECDSA signature

3. **r** *of type `bytes32`*

    > The r property of the ECDSA signature

4. **s** *of type `bytes32`*

    > The s property of the ECDSA signature

5. **signer** *of type `address`*

    > The claimed signer


Returns:

> true if the recovered signer equals the input signer, else false

1. **output_0** *of type `bool`*

--- 
### setGenuineOrderOperatorSeal(bool)


**Execution cost**: less than 20944 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuinePaymentOperatorSeal(bool)


**Execution cost**: less than 21802 gas


Params:

1. **genuine** *of type `bool`*


--- 
### isTradeParty(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isTradeSeller(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setGenuinePaymentRecipient(bool)


**Execution cost**: less than 20922 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineOrderWalletSeal(bool)


**Execution cost**: less than 21362 gas


Params:

1. **genuine** *of type `bool`*


--- 
### operator()


**Execution cost**: less than 1251 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setGenuinePaymentWalletHash(bool)


**Execution cost**: less than 21208 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineTradeSellerFee(bool)


**Execution cost**: less than 21010 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setTradeOrder(bool)


**Execution cost**: less than 20878 gas


Params:

1. **_tradeOrder** *of type `bool`*


--- 
### setTradeBuyer(bool)


**Execution cost**: less than 21406 gas


Params:

1. **_tradeBuyer** *of type `bool`*


--- 
### setGenuineSuccessiveTradePaymentTotalFees(bool)


**Execution cost**: less than 20614 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setPaymentParty(bool)


**Execution cost**: less than 21282 gas


Params:

1. **_paymentParty** *of type `bool`*


--- 
### setSuccessiveTradesPartyNonces(bool)


**Execution cost**: less than 20790 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setSuccessivePaymentTradePartyNonces(bool)


**Execution cost**: less than 20724 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineTradeSeal(bool)


**Execution cost**: less than 43019 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineSuccessiveTradePaymentBalances(bool)


**Execution cost**: less than 21648 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setSuccessiveTradePaymentPartyNonces(bool)


**Execution cost**: less than 22154 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setPaymentSender(bool)


**Execution cost**: less than 21626 gas


Params:

1. **_paymentSender** *of type `bool`*


--- 
### setGenuineWalletSignature(bool)


**Execution cost**: less than 21274 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setSuccessivePaymentsPartyNonces(bool)


**Execution cost**: less than 21516 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineSuccessiveTradesTotalFees(bool)


**Execution cost**: less than 21318 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineTradeBuyerFee(bool)


**Execution cost**: less than 22264 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineSuccessiveTradeOrderResiduals(bool)


**Execution cost**: less than 21032 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineSuccessiveTradesBalances(bool)


**Execution cost**: less than 22308 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setGenuineTradeBuyer(bool)


**Execution cost**: less than 21472 gas


Params:

1. **genuine** *of type `bool`*


--- 
### setTradeParty(bool)


**Execution cost**: less than 21326 gas


Params:

1. **_tradeParty** *of type `bool`*


--- 
### setTradeSeller(bool)


**Execution cost**: less than 22286 gas


Params:

1. **_tradeSeller** *of type `bool`*


--- 
### signerManager()


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
### isGenuineOrderOperatorSeal((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineOrderSeals((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineOrderWalletHash((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineOrderWalletSeal((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuinePaymentFee((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuinePaymentOperatorSeal((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuinePaymentRecipient((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuinePaymentSeals((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuinePaymentSender((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuinePaymentWalletHash((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuinePaymentWalletSeal((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineSuccessivePaymentTradeBalances((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8,uint8)


**Execution cost**: No bound available




--- 
### isGenuineSuccessivePaymentTradeTotalFees((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isGenuineSuccessivePaymentsBalances((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isGenuineSuccessivePaymentsTotalFees((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineSuccessiveTradeOrderResiduals((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isGenuineSuccessiveTradePaymentBalances((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8,uint8,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isGenuineSuccessiveTradePaymentTotalFees((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineSuccessiveTradesBalances((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8,uint8,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8,uint8)


**Execution cost**: No bound available




--- 
### isGenuineSuccessiveTradesTotalFees((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isGenuineTradeBuyer((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineTradeBuyerFee((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineTradeSeal((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineTradeSeller((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineTradeSellerFee((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


**Execution cost**: No bound available




--- 
### isGenuineWalletSignature(bytes32,(bytes32,bytes32,uint8),address)


**Execution cost**: No bound available




--- 
### isPaymentParty((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)


**Execution cost**: No bound available




--- 
### isPaymentRecipient((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)


**Execution cost**: No bound available




--- 
### isPaymentSender((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),address)


**Execution cost**: No bound available




--- 
### isSuccessivePaymentTradePartyNonces((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isSuccessivePaymentsPartyNonces((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isSuccessiveTradePaymentPartyNonces((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8,(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isSuccessiveTradesPartyNonces((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8,(uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),uint8)


**Execution cost**: No bound available




--- 
### isTradeBuyer((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),address)


**Execution cost**: No bound available




--- 
### isTradeOrder((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),(uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


**Execution cost**: No bound available




--- 
### isTradeParty((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),address)


**Execution cost**: No bound available




--- 
### isTradeSeller((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256),address)


**Execution cost**: No bound available




[Back to the top ↑](#mockedvalidator)
