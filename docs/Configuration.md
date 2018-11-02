# Configuration
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/Configuration.sol)
> Configuration


**Execution cost**: less than 124083 gas

**Deployment cost**: less than 2540600 gas

**Combined cost**: less than 2664683 gas

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
### SetCancelOrderChallengeTimeout(uint256)


**Execution cost**: No bound available


Params:

1. **timeout** *of type `uint256`*

--- 
### SetDriipSettlementChallengeTimeout(uint256)


**Execution cost**: No bound available


Params:

1. **timeout** *of type `uint256`*

--- 
### SetConfirmationsEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **oldConfirmations** *of type `uint256`*
2. **newConfirmations** *of type `uint256`*

--- 
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

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
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

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
### doubleSpentOrderStake()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **amount** *of type `int256`*
2. **currency** *of type `tuple`*

--- 
### PARTS_PER()


**Execution cost**: less than 285 gas

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
### changeOperator(address)
>
>Change the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### changeDeployer(address)
>
>Change the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### cancelOrderChallengeTimeout()


**Execution cost**: less than 1497 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
### isRegisteredActiveService(address)
>
>Gauge whether a service contract is registered and active


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered and activate, else false

1. **output_0** *of type `bool`*

--- 
### getCurrencyPaymentFeesCount(address,uint256)
>
>Get number of payment fee tiers of given currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

2. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)


Returns:


1. **output_0** *of type `uint256`*

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
### getDuplicateDriipNonceStake()
>
>Get the figure that will be gained when someone successfully challenges duplicate driip nonce


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*
2. **output_1** *of type `address`*
3. **output_2** *of type `uint256`*

--- 
### cancelOrderChallengeTimeout()
>
>Get timeout of cancel order challenge


**Execution cost**: less than 749 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getTradeMakerMinimumFeesCount()
>
>Get number of minimum trade maker fee tiers


**Execution cost**: less than 771 gas

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
### isOperationalModeNormal()
>
>Return true if operational mode is Normal


**Execution cost**: less than 2092 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### getTradeMakerFeesCount()
>
>Get number of trade maker fee tiers


**Execution cost**: less than 837 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### falseWalletSignatureStake()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **amount** *of type `int256`*
2. **currency** *of type `tuple`*

--- 
### currencyPaymentFeeBlockNumbersMap(address,uint256,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*
2. **param_1** *of type `uint256`*
3. **param_2** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

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


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*
2. **output_1** *of type `address`*
3. **output_2** *of type `uint256`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 1119 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### getCurrencyPaymentMinimumFeesCount(address,uint256)
>
>Get number of minimum payment fee tiers for given currency


**Execution cost**: No bound available

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
### deployer()


**Execution cost**: less than 1999 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### currencyPaymentMinimumFeeBlockNumbersMap(address,uint256,uint256)


**Execution cost**: No bound available

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


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



--- 
### getPartsPer()
>
>Return the parts per constant


**Execution cost**: less than 901 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*

--- 
### getConfirmations()
>
>Return the number of confirmations


**Execution cost**: less than 1761 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### isOperationalModeExit()
>
>Return true if operational mode is Exit


**Execution cost**: less than 1795 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### settlementChallengeTimeout()
>
>Get timeout of driip challenge


**Execution cost**: less than 1167 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
### getPaymentMinimumFeesCount()
>
>Get number of minimum payment fee tiers


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getPaymentFeesCount()
>
>Get number of payment fee tiers


**Execution cost**: less than 1233 gas

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
### settlementChallengeTimeout()


**Execution cost**: less than 507 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getDoubleSpentOrderStake()
>
>Get the figure that will be gained when someone successfully challenges double spent order


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*
2. **output_1** *of type `address`*
3. **output_2** *of type `uint256`*

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
### getFalseWalletSignatureStake()
>
>Get the figure that will be gained when someone successfully challenges false wallet signature on order or payment


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `int256`*
2. **output_1** *of type `address`*
3. **output_2** *of type `uint256`*

--- 
### getTradeTakerFeesCount()
>
>Get number of trade taker fee tiers


**Execution cost**: less than 1585 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### getTradeTakerMinimumFeesCount()
>
>Get number of minimum trade taker fee tiers


**Execution cost**: less than 1563 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### confirmations()


**Execution cost**: less than 1541 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### duplicateDriipNonceStake()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **amount** *of type `int256`*
2. **currency** *of type `tuple`*

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
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### isRegisteredService(address)
>
>Gauge whether a service contract is registered


**Execution cost**: less than 1206 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### paymentFeeBlockNumberList(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### operationalMode()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### paymentMinimumFeeBlockNumberList(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### operator()


**Execution cost**: less than 1295 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### setUnchallengeOrderCandidateByTradeStake(int256,address,uint256)
>
>Set currency and amount that will be gained when someone successfully unchallenges (driip settlement) order candidate by trade


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*

    > Amount gained

2. **currencyCt** *of type `address`*

    > Contract address of currency gained (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > ID of currency gained (0 for ETH and ERC20)



--- 
### setDriipSettlementChallengeTimeout(uint256)
>
>Set timeout of driip challenge


**Execution cost**: No bound available


Params:

1. **timeout** *of type `uint256`*

    > Timeout duration



--- 
### setDoubleSpentOrderStake(int256,address,uint256)
>
>Set currency and amount that will be gained when someone successfully challenges double spent order


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*

    > Amount gained

2. **currencyCt** *of type `address`*

    > Contract address of currency gained (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > ID of currency gained (0 for ETH and ERC20)



--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### serviceActivationTimeout()


**Execution cost**: less than 947 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### setConfirmations(uint256)
>
>Set the number of confirmations


**Execution cost**: No bound available


Params:

1. **newConfirmations** *of type `uint256`*

    > The new confirmations value



--- 
### setCancelOrderChallengeTimeout(uint256)
>
>Set timeout of cancel order challenge


**Execution cost**: No bound available


Params:

1. **timeout** *of type `uint256`*

    > Timeout duration



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
### setFalseWalletSignatureStake(int256,address,uint256)
>
>Set currency and amount that will be gained when someone successfully challenges false wallet signature on order or payment


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*

    > Amount gained

2. **currencyCt** *of type `address`*

    > Contract address of currency gained (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > ID of currency gained (0 for ETH and ERC20)



--- 
### setDuplicateDriipNonceStake(int256,address,uint256)
>
>Set currency and amount that will be gained when someone successfully challenges duplicate driip nonce


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*

    > Amount gained

2. **currencyCt** *of type `address`*

    > Contract address of currency gained (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > ID of currency gained (0 for ETH and ERC20)



--- 
### tradeTakerFeeBlockNumberList(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

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
### setServiceActivationTimeout(uint256)
>
>Set the service activation timeout


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

    > The set timeout in unit of seconds



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
### setOperationalModeExit()
>
>Set operational mode to Exit
>
> Once operational mode is set to Exit it may not be set back to Normal


**Execution cost**: less than 24979 gas




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


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### tradeMakerMinimumFeeBlockNumberList(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### tradeTakerMinimumFeeBlockNumberList(uint256)


**Execution cost**: No bound available

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


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **amount** *of type `int256`*
2. **currency** *of type `tuple`*

[Back to the top ↑](#configuration)
