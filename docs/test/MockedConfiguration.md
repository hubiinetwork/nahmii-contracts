# MockedConfiguration
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/test/MockedConfiguration.sol)
> MockedConfiguration


**Execution cost**: No bound available

**Deployment cost**: less than 2483800 gas

**Combined cost**: No bound available

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### SetUnchallengeDriipSettlementOrderByTradeStakeEvent(int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

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
### SetFalseWalletSignatureStakeEvent(int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

--- 
### SetOperationalModeExitEvent()


**Execution cost**: No bound available



--- 
### SetCurrencyPaymentFeeEvent(address,uint256,uint256,int256,int256[],int256[])


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*
3. **blockNumber** *of type `uint256`*
4. **nominal** *of type `int256`*
5. **discountTiers** *of type `int256[]`*
6. **discountValues** *of type `int256[]`*

--- 
### DisableServiceActionEvent(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*

--- 
### EnableServiceActionEvent(address,string)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **action** *of type `string`*

--- 
### DeregisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### SetCurrencyPaymentMinimumFeeEvent(address,uint256,uint256,int256)


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*
3. **blockNumber** *of type `uint256`*
4. **nominal** *of type `int256`*

--- 
### SetCancelOrderChallengeTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeout** *of type `uint256`*

--- 
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### SetConfirmationsEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **oldConfirmations** *of type `uint256`*
2. **newConfirmations** *of type `uint256`*

--- 
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### SetDuplicateDriipNonceStakeEvent(int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

--- 
### SetDoubleSpentOrderStakeEvent(int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

--- 
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

--- 
### SetPaymentFeeEvent(uint256,int256,int256[],int256[])


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*
3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*

--- 
### SetPaymentMinimumFeeEvent(uint256,int256)


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*

--- 
### SetSettlementChallengeTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeout** *of type `uint256`*

--- 
### SetTradeMakerFeeEvent(uint256,int256,int256[],int256[])


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*
3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*

--- 
### SetTradeMakerMinimumFeeEvent(uint256,int256)


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*

--- 
### SetTradeTakerFeeEvent(uint256,int256,int256[],int256[])


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*
3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*

--- 
### SetTradeTakerMinimumFeeEvent(uint256,int256)


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*


## Methods
### getCurrencyPaymentFee(address,uint256,uint256,int256)
>
>Get payment relative fee for given currency at given block number, possibly discounted by discount tier value


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

2. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)

3. **blockNumber** *of type `uint256`*

    > Lower block number for the tier

4. **discountTier** *of type `int256`*

    > Tiered value that determines discount


Returns:


1. **output_0** *of type `int256`*

--- 
### PARTS_PER()


**Execution cost**: less than 184 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

--- 
### OPERATIONAL_MODE_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### setCurrencyPaymentFee(address,uint256,uint256,int256,int256[],int256[])
>
>Set payment nominal relative fee and discount tiers and values for given currency at given block number tier


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

2. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)

3. **blockNumber** *of type `uint256`*

    > Lower block number tier

4. **nominal** *of type `int256`*

    > Discount values

5. **discountTiers** *of type `int256[]`*
6. **discountValues** *of type `int256[]`*


--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: less than 44303 gas


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### duplicateDriipNonceStake()


**Execution cost**: less than 1053 gas

**Attributes**: constant



Returns:


1. **amount** *of type `int256`*
2. **currency** *of type `tuple`*

--- 
### isRegisteredActiveService(address)
>
>Gauge whether a service contract is registered and active


**Execution cost**: less than 1173 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered and activate, else false

1. **output_0** *of type `bool`*

--- 
### getTradeTakerFee(uint256,int256)
>
>Get trade taker relative fee at given block number, possibly discounted by discount tier value


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number for the tier

2. **discountTier** *of type `int256`*

    > Tiered value that determines discount


Returns:


1. **output_0** *of type `int256`*

--- 
### getCurrencyPaymentFeesCount(address,uint256)
>
>Get number of payment fee tiers of given currency


**Execution cost**: less than 866 gas

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

2. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)


Returns:


1. **output_0** *of type `uint256`*

--- 
### getDuplicateDriipNonceStake()
>
>Get the figure that will be gained when someone successfully challenges duplicate driip nonce


**Execution cost**: less than 2525 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*
2. **output_1** *of type `address`*
3. **output_2** *of type `uint256`*

--- 
### isOperationalModeNormal()
>
>Return true if operational mode is Normal


**Execution cost**: less than 1947 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### getTradeTakerMinimumFee(uint256)
>
>Get trade taker minimum relative fee at given block number


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number for the tier


Returns:


1. **output_0** *of type `int256`*

--- 
### getTradeMakerMinimumFeesCount()
>
>Get number of minimum trade maker fee tiers


**Execution cost**: less than 648 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### enableServiceAction(address,string)
>
>Enable a named action in an already registered service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the registered service contract

2. **action** *of type `string`*

    > The name of the action to be enabled



--- 
### isRegisteredService(address)
>
>Gauge whether a service contract is registered


**Execution cost**: less than 926 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### getTradeMakerFeesCount()
>
>Get number of trade maker fee tiers


**Execution cost**: less than 714 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### falseWalletSignatureStake()


**Execution cost**: less than 1292 gas

**Attributes**: constant



Returns:


1. **amount** *of type `int256`*
2. **currency** *of type `tuple`*

--- 
### currencyPaymentFeeBlockNumbersMap(address,uint256,uint256)


**Execution cost**: less than 1280 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### paymentFeeBlockNumberList(uint256)


**Execution cost**: less than 1080 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### disableServiceAction(address,string)
>
>Enable a named action in a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract

2. **action** *of type `string`*

    > The name of the action to be disabled



--- 
### getUnchallengeOrderCandidateByTradeStake()
>
>Get the currency and amount that will be gained when someone successfully unchallenges (driip settlement) order candidate by trade


**Execution cost**: less than 2393 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*
2. **output_1** *of type `address`*
3. **output_2** *of type `uint256`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 999 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getCurrencyPaymentMinimumFeesCount(address,uint256)
>
>Get number of minimum payment fee tiers for given currency


**Execution cost**: less than 2076 gas

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

2. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)


Returns:


1. **output_0** *of type `uint256`*

--- 
### getTradeMakerMinimumFee(uint256)
>
>Get trade maker minimum relative fee at given block number


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number for the tier


Returns:


1. **output_0** *of type `int256`*

--- 
### setDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: less than 24098 gas


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### currencyPaymentMinimumFeeBlockNumbersMap(address,uint256,uint256)


**Execution cost**: less than 1456 gas

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: less than 23125 gas


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



--- 
### getPartsPer()
>
>Return the parts per constant


**Execution cost**: less than 778 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

--- 
### paymentMinimumFeeBlockNumberList(uint256)


**Execution cost**: less than 2026 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### operator()


**Execution cost**: less than 1175 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isEnabledServiceAction(address,string)
>
>Gauge whether a service contract action is enabled which implies also registered and active


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract

2. **action** *of type `string`*

    > The name of action


Returns:


1. **output_0** *of type `bool`*

--- 
### deployer()


**Execution cost**: less than 1835 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getPaymentFeesCount()
>
>Get number of payment fee tiers


**Execution cost**: less than 1088 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getCurrencyPaymentMinimumFee(address,uint256,uint256)
>
>Get payment minimum relative fee for given currency at given block number


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

2. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)

3. **blockNumber** *of type `uint256`*

    > Lower block number for the tier


Returns:


1. **output_0** *of type `int256`*

--- 
### getConfirmations()
>
>Return the number of confirmations


**Execution cost**: less than 1594 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getTradeMakerFee(uint256,int256)
>
>Get trade maker relative fee at given block number, possibly discounted by discount tier value


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number for the tier

2. **discountTier** *of type `int256`*

    > Tiered value that determines discount


Returns:


1. **output_0** *of type `int256`*

--- 
### doubleSpentOrderStake()


**Execution cost**: less than 1732 gas

**Attributes**: constant



Returns:


1. **amount** *of type `int256`*
2. **currency** *of type `tuple`*

--- 
### getPaymentMinimumFeesCount()
>
>Get number of minimum payment fee tiers


**Execution cost**: less than 407 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### isOperationalModeExit()
>
>Return true if operational mode is Exit


**Execution cost**: less than 1628 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### operationalMode()


**Execution cost**: less than 517 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### setOperator(address)
>
>Change the operator of this contract


**Execution cost**: less than 22779 gas


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### getPaymentMinimumFee(uint256)
>
>Get payment minimum relative fee at given block number


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number for the tier


Returns:


1. **output_0** *of type `int256`*

--- 
### getDoubleSpentOrderStake()
>
>Get the figure that will be gained when someone successfully challenges double spent order


**Execution cost**: less than 2085 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*
2. **output_1** *of type `address`*
3. **output_2** *of type `uint256`*

--- 
### cancelOrderChallengeTimeout()


**Execution cost**: less than 1330 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getPaymentFee(uint256,int256)
>
>Get payment relative fee at given block number, possibly discounted by discount tier value


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number for the tier

2. **discountTier** *of type `int256`*

    > Tiered value that determines discount


Returns:


1. **output_0** *of type `int256`*

--- 
### confirmations()


**Execution cost**: less than 1374 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getTradeTakerMinimumFeesCount()
>
>Get number of minimum trade taker fee tiers


**Execution cost**: less than 1396 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getTradeTakerFeesCount()
>
>Get number of trade taker fee tiers


**Execution cost**: less than 1418 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getFalseWalletSignatureStake()
>
>Get the figure that will be gained when someone successfully challenges false wallet signature on order or payment


**Execution cost**: less than 2041 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*
2. **output_1** *of type `address`*
3. **output_2** *of type `uint256`*

--- 
### setPaymentFee(uint256,int256,int256[],int256[])
>
>Set payment nominal relative fee and discount tiers and values at given block number tier


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number tier

2. **nominal** *of type `int256`*

    > Discount values

3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*


--- 
### setTradeMakerFee(uint256,int256,int256[],int256[])
>
>Set trade maker nominal relative fee and discount tiers and values at given block number tier


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number tier

2. **nominal** *of type `int256`*

    > Discount values

3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*


--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: less than 44263 gas


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### setCancelOrderChallengeTimeout(uint256)
>
>Set timeout of cancel order challenge


**Execution cost**: less than 21691 gas


Params:

1. **timeout** *of type `uint256`*

    > Timeout duration



--- 
### setDuplicateDriipNonceStake(int256,address,uint256)
>
>Set currency and amount that will be gained when someone successfully challenges duplicate driip nonce


**Execution cost**: less than 62829 gas


Params:

1. **amount** *of type `int256`*

    > Amount gained

2. **currencyCt** *of type `address`*

    > Contract address of currency gained (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > ID of currency gained (0 for ETH and ERC20)



--- 
### setServiceActivationTimeout(uint256)
>
>Set the service activation timeout


**Execution cost**: less than 22373 gas


Params:

1. **timeoutInSeconds** *of type `uint256`*

    > The set timeout in unit of seconds



--- 
### setOperationalModeExit()
>
>Set operational mode to Exit
>
> Once operational mode is set to Exit it may not be set back to Normal


**Execution cost**: less than 24935 gas




--- 
### setSettlementChallengeTimeout(uint256)
>
>Set timeout of settlement challenges


**Execution cost**: less than 21757 gas


Params:

1. **timeout** *of type `uint256`*

    > Timeout duration



--- 
### setFalseWalletSignatureStake(int256,address,uint256)
>
>Set currency and amount that will be gained when someone successfully challenges false wallet signature on order or payment


**Execution cost**: less than 63885 gas


Params:

1. **amount** *of type `int256`*

    > Amount gained

2. **currencyCt** *of type `address`*

    > Contract address of currency gained (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > ID of currency gained (0 for ETH and ERC20)



--- 
### setCurrencyPaymentMinimumFee(address,uint256,uint256,int256)
>
>Set payment minimum relative fee for given currency at given block number tier


**Execution cost**: No bound available


Params:

1. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

2. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)

3. **blockNumber** *of type `uint256`*

    > Lower block number tier

4. **nominal** *of type `int256`*

    > Minimum relative fee



--- 
### setPaymentMinimumFee(uint256,int256)
>
>Set payment minimum relative fee at given block number tier


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number tier

2. **nominal** *of type `int256`*

    > Minimum relative fee



--- 
### reset()


**Execution cost**: less than 21668 gas




--- 
### setConfirmations(uint256)
>
>Set the number of confirmations


**Execution cost**: less than 22872 gas


Params:

1. **newConfirmations** *of type `uint256`*

    > The new confirmations value



--- 
### setDoubleSpentOrderStake(int256,address,uint256)
>
>Set currency and amount that will be gained when someone successfully challenges double spent order


**Execution cost**: less than 63555 gas


Params:

1. **amount** *of type `int256`*

    > Amount gained

2. **currencyCt** *of type `address`*

    > Contract address of currency gained (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > ID of currency gained (0 for ETH and ERC20)



--- 
### serviceActivationTimeout()


**Execution cost**: less than 824 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### setTradeTakerMinimumFee(uint256,int256)
>
>Set trade taker minimum relative fee at given block number tier


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number tier

2. **nominal** *of type `int256`*

    > Minimum relative fee



--- 
### tradeMakerFeeBlockNumberList(uint256)


**Execution cost**: less than 1168 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### setTradeTakerFee(uint256,int256,int256[],int256[])
>
>Set trade taker nominal relative fee and discount tiers and values at given block number tier


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number tier

2. **nominal** *of type `int256`*

    > Discount values

3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*


--- 
### settlementChallengeTimeout()


**Execution cost**: less than 1968 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### setUnchallengeOrderCandidateByTradeStake(int256,address,uint256)
>
>Set currency and amount that will be gained when someone successfully unchallenges (driip settlement) order candidate by trade


**Execution cost**: less than 63511 gas


Params:

1. **amount** *of type `int256`*

    > Amount gained

2. **currencyCt** *of type `address`*

    > Contract address of currency gained (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > ID of currency gained (0 for ETH and ERC20)



--- 
### setTradeMakerMinimumFee(uint256,int256)
>
>Set trade maker minimum relative fee at given block number tier


**Execution cost**: No bound available


Params:

1. **blockNumber** *of type `uint256`*

    > Lower block number tier

2. **nominal** *of type `int256`*

    > Minimum relative fee



--- 
### tradeMakerMinimumFeeBlockNumberList(uint256)


**Execution cost**: less than 1916 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### tradeTakerFeeBlockNumberList(uint256)


**Execution cost**: less than 2158 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### tradeTakerMinimumFeeBlockNumberList(uint256)


**Execution cost**: less than 1828 gas

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### unchallengeOrderCandidateByTradeStake()


**Execution cost**: less than 2502 gas

**Attributes**: constant



Returns:


1. **amount** *of type `int256`*
2. **currency** *of type `tuple`*

[Back to the top ↑](#mockedconfiguration)
