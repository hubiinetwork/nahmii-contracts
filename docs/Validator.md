# Validator
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/Validator.sol)
> Validatable


**Execution cost**: No bound available

**Deployment cost**: less than 3641600 gas

**Combined cost**: No bound available

## Constructor



Params:

1. **deployer** *of type `address`*
2. **signerManager** *of type `address`*

## Events
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
### SetHasherEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldHasher** *of type `address`*
2. **newHasher** *of type `address`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SetSignerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldSignerManager** *of type `address`*
2. **newSignerManager** *of type `address`*


## Methods
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
### isGenuinePaymentSender(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuinePaymentOperatorHash(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

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
### isGenuineOrderSeals(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **order** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### hasher()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isGenuinePaymentSeals(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### deployer()


**Execution cost**: less than 1754 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isGenuineOperatorSignature(bytes32,tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **hash** *of type `bytes32`*
2. **signature** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 940 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isGenuineOrderOperatorHash(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **order** *of type `tuple`*

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
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isGenuineTradeSeller(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*

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
### isGenuinePaymentWalletHash(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

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
### isGenuinePaymentWalletSeal(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*

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
### isGenuineSuccessiveTradesBalances(tuple,uint8,uint8,tuple,uint8,uint8)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **firstTrade** *of type `tuple`*
2. **firstTradePartyRole** *of type `uint8`*
3. **firstTradeCurrencyRole** *of type `uint8`*
4. **lastTrade** *of type `tuple`*
5. **lastTradePartyRole** *of type `uint8`*
6. **lastTradeCurrencyRole** *of type `uint8`*

Returns:


1. **output_0** *of type `bool`*

--- 
### isGenuineTradeHash(tuple)


**Execution cost**: No bound available

**Attributes**: constant


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
### isGenuineTradeBuyer(tuple)


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
### isGenuineTradeSeal(tuple)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*

Returns:


1. **output_0** *of type `bool`*

--- 
### setSignerManager(address)
>
>Set the signer manager of this contract


**Execution cost**: No bound available


Params:

1. **newSignerManager** *of type `address`*

    > The address of the new signer



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
### isPaymentParty(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*

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
### isTradeParty(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

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
### isPaymentRecipient(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **payment** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

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
### isTradeBuyer(tuple,address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **trade** *of type `tuple`*
2. **wallet** *of type `address`*

Returns:


1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 1050 gas

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
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setHasher(address)
>
>Set the hasher contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Hasher contract instance



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



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
### isGenuineOperatorSignature(bytes32,(bytes32,bytes32,uint8))


**Execution cost**: No bound available




--- 
### isGenuineOrderOperatorHash((uint256,address,(uint8,int256,((address,uint256),(address,uint256)),int256,(int256,int256)),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


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
### isGenuinePaymentOperatorHash((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256,uint256))


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
### isGenuineTradeHash((uint256,int256,((address,uint256),(address,uint256)),int256,(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,uint256,uint8,(int256,(bytes32,bytes32),(int256,int256)),((int256,int256),(int256,int256)),((int256,(address,uint256)),(int256,(address,uint256))[])),((int256,int256),(int256,int256)),(bytes32,(bytes32,bytes32,uint8)),uint256,uint256))


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




[Back to the top ↑](#validator)
