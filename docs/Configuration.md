# Configuration
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/Configuration.sol)
> Configuration


**Execution cost**: No bound available

**Deployment cost**: less than 2377200 gas

**Combined cost**: No bound available

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### SetSettlementChallengeTimeoutEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **timeoutInSeconds** *of type `uint256`*

--- 
### SetOperationalModeExitEvent()


**Execution cost**: No bound available



--- 
### SetConfirmationBlocksEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **newBlocks** *of type `uint256`*

--- 
### SetDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

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
### SetCurrencyPaymentFeeEvent(uint256,address,uint256,int256,int256[],int256[])


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **nominal** *of type `int256`*
5. **discountTiers** *of type `int256[]`*
6. **discountValues** *of type `int256[]`*

--- 
### DeregisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### SetCurrencyPaymentMinimumFeeEvent(uint256,address,uint256,int256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*
4. **nominal** *of type `int256`*

--- 
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

--- 
### SetCancelOrderChallengeTimeoutEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **timeoutInSeconds** *of type `uint256`*

--- 
### DisableEarliestSettlementBlockNumberUpdateEvent()


**Execution cost**: No bound available



--- 
### SetEarliestSettlementBlockNumberEvent(uint256)


**Execution cost**: No bound available


Params:

1. **earliestSettlementBlockNumber** *of type `uint256`*

--- 
### SetFraudStakeFractionEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **stakeFraction** *of type `uint256`*

--- 
### SetTradeTakerMinimumFeeEvent(uint256,int256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*

--- 
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SetOperatorSettlementStakeFractionEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **stakeFraction** *of type `uint256`*

--- 
### SetPaymentFeeEvent(uint256,int256,int256[],int256[])


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*
3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*

--- 
### SetPaymentMinimumFeeEvent(uint256,int256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*

--- 
### SetTradeMakerFeeEvent(uint256,int256,int256[],int256[])


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*
3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*

--- 
### SetTradeMakerMinimumFeeEvent(uint256,int256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*

--- 
### SetTradeTakerFeeEvent(uint256,int256,int256[],int256[])


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **nominal** *of type `int256`*
3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*

--- 
### SetUpdateDelayBlocksEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **newBlocks** *of type `uint256`*

--- 
### SetWalletLockTimeoutEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **timeoutInSeconds** *of type `uint256`*

--- 
### SetWalletSettlementStakeFractionEvent(uint256,uint256)


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*
2. **stakeFraction** *of type `uint256`*


## Methods
### currencyPaymentFeesCount(address,uint256)
>
>Get number of payment fee block number tiers of given currency


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
### setConfirmationBlocks(uint256,uint256)
>
>Set the number of confirmation blocks


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **newConfirmationBlocks** *of type `uint256`*

    > The new confirmation blocks value



--- 
### currencyPaymentMinimumFee(uint256,address,uint256)
>
>Get payment minimum relative fee for given currency at given block number


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > The concerned block number

2. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)


Returns:


1. **output_0** *of type `int256`*

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
### currencyPaymentFee(uint256,address,uint256,int256)
>
>Get payment relative fee for given currency at given block number, possibly discounted by discount tier value


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > The concerned block number

2. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)

4. **discountTier** *of type `int256`*

    > The concerned discount tier


Returns:


1. **output_0** *of type `int256`*

--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### isOperationalModeNormal()
>
>Return true if operational mode is Normal


**Execution cost**: less than 1957 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### paymentMinimumFee(uint256)
>
>Get payment minimum relative fee at given block number


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > The concerned block number


Returns:


1. **output_0** *of type `int256`*

--- 
### earliestSettlementBlockNumberUpdateDisabled()


**Execution cost**: less than 1792 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### paymentMinimumFeesCount()
>
>Get number of minimum payment fee block number tiers


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### deployer()


**Execution cost**: less than 1908 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

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


**Execution cost**: less than 1203 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

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
### serviceActivationTimeout()


**Execution cost**: less than 856 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### confirmationBlocksCount()
>
>Get the count of confirmation blocks values


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The count of confirmation blocks values

1. **output_0** *of type `uint256`*

--- 
### isOperationalModeExit()
>
>Return true if operational mode is Exit


**Execution cost**: less than 1726 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `bool`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 1072 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### confirmationBlocks()
>
>Get the current value of confirmation blocks


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The value of confirmation blocks

1. **output_0** *of type `uint256`*

--- 
### OPERATIONAL_MODE_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### currencyPaymentMinimumFeesCount(address,uint256)
>
>Get number of minimum payment fee block number tiers for given currency


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
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



--- 
### earliestSettlementBlockNumber()


**Execution cost**: less than 1626 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### operator()


**Execution cost**: less than 1204 gas

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
### paymentFee(uint256,int256)
>
>Get payment relative fee at given block number, possibly discounted by discount tier value


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > The concerned block number

2. **discountTier** *of type `int256`*

    > The concerned discount tier


Returns:


1. **output_0** *of type `int256`*

--- 
### operatorSettlementStakeFraction()
>
>Get the current value of operator settlement stake fraction


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The value of operator settlement stake fraction

1. **output_0** *of type `uint256`*

--- 
### disableEarliestSettlementBlockNumberUpdate()
>
>Disable further updates to the earliest settlement block number
>
> This operation can not be undone


**Execution cost**: less than 22483 gas




--- 
### fraudStakeFraction()
>
>Get the current value of fraud stake fraction


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The value of fraud stake fraction

1. **output_0** *of type `uint256`*

--- 
### cancelOrderChallengeTimeout()
>
>Get the current value of cancel order challenge timeout


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The value of cancel order challenge timeout

1. **output_0** *of type `uint256`*

--- 
### setCancelOrderChallengeTimeout(uint256,uint256)
>
>Set timeout of cancel order challenge


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **timeoutInSeconds** *of type `uint256`*

    > Timeout duration in seconds



--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### paymentFeesCount()
>
>Get number of payment fee block number tiers


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### operationalMode()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint8`*

--- 
### setPaymentFee(uint256,int256,int256[],int256[])
>
>Set payment nominal relative fee and discount tiers and values at given block number tier


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

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

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

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

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **nominal** *of type `int256`*

    > Minimum relative fee



--- 
### setFraudStakeFraction(uint256,uint256)
>
>Set fraction of security bond that will be gained from successfully challenging in fraud challenge


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **stakeFraction** *of type `uint256`*

    > The fraction gained



--- 
### setOperationalModeExit()
>
>Set operational mode to Exit
>
> Once operational mode is set to Exit it may not be set back to Normal


**Execution cost**: less than 24538 gas




--- 
### setSettlementChallengeTimeout(uint256,uint256)
>
>Set timeout of settlement challenges


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **timeoutInSeconds** *of type `uint256`*

    > Timeout duration in seconds



--- 
### setCurrencyPaymentFee(uint256,address,uint256,int256,int256[],int256[])
>
>Set payment nominal relative fee and discount tiers and values for given currency at given block number tier


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)

4. **nominal** *of type `int256`*

    > Discount values

5. **discountTiers** *of type `int256[]`*
6. **discountValues** *of type `int256[]`*


--- 
### setDeployer(address)
>
>Set the deployer of this contract


**Execution cost**: No bound available


Params:

1. **newDeployer** *of type `address`*

    > The address of the new deployer



--- 
### setOperatorSettlementStakeFraction(uint256,uint256)
>
>Set fraction of security bond that will be gained from successfully challenging in settlement challenge triggered by operator


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **stakeFraction** *of type `uint256`*

    > The fraction gained



--- 
### setEarliestSettlementBlockNumber(uint256)
>
>Set the block number of the earliest settlement initiation


**Execution cost**: No bound available


Params:

1. **_earliestSettlementBlockNumber** *of type `uint256`*

    > The block number of the earliest settlement



--- 
### setCurrencyPaymentMinimumFee(uint256,address,uint256,int256)
>
>Set payment minimum relative fee for given currency at given block number tier


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **currencyCt** *of type `address`*

    > Concerned currency contract address (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > Concerned currency ID (0 for ETH and ERC20)

4. **nominal** *of type `int256`*

    > Minimum relative fee



--- 
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### tradeMakerMinimumFee(uint256)
>
>Get trade maker minimum relative fee at given block number


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > The concerned block number


Returns:


1. **output_0** *of type `int256`*

--- 
### tradeMakerFeesCount()
>
>Get number of trade maker fee block number tiers


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### settlementChallengeTimeout()
>
>Get the current value of settlement challenge timeout


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The value of settlement challenge timeout

1. **output_0** *of type `uint256`*

--- 
### setUpdateDelayBlocks(uint256,uint256)
>
>Set the number of update delay blocks


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **newUpdateDelayBlocks** *of type `uint256`*

    > The new update delay blocks value



--- 
### setWalletSettlementStakeFraction(uint256,uint256)
>
>Set fraction of security bond that will be gained from successfully challenging in settlement challenge triggered by wallet


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **stakeFraction** *of type `uint256`*

    > The fraction gained



--- 
### setWalletLockTimeout(uint256,uint256)
>
>Set timeout of wallet lock


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **timeoutInSeconds** *of type `uint256`*

    > Timeout duration in seconds



--- 
### setTradeTakerMinimumFee(uint256,int256)
>
>Set trade taker minimum relative fee at given block number tier


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **nominal** *of type `int256`*

    > Minimum relative fee



--- 
### tradeMakerFee(uint256,int256)
>
>Get trade maker relative fee at given block number, possibly discounted by discount tier value


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > The concerned block number

2. **discountTier** *of type `int256`*

    > The concerned discount tier


Returns:


1. **output_0** *of type `int256`*

--- 
### setTradeMakerMinimumFee(uint256,int256)
>
>Set trade maker minimum relative fee at given block number tier


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **nominal** *of type `int256`*

    > Minimum relative fee



--- 
### setTradeTakerFee(uint256,int256,int256[],int256[])
>
>Set trade taker nominal relative fee and discount tiers and values at given block number tier


**Execution cost**: No bound available


Params:

1. **fromBlockNumber** *of type `uint256`*

    > Block number from which the update applies

2. **nominal** *of type `int256`*

    > Discount values

3. **discountTiers** *of type `int256[]`*
4. **discountValues** *of type `int256[]`*


--- 
### tradeMakerMinimumFeesCount()
>
>Get number of minimum trade maker fee block number tiers


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### tradeTakerFee(uint256,int256)
>
>Get trade taker relative fee at given block number, possibly discounted by discount tier value


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > The concerned block number

2. **discountTier** *of type `int256`*

    > The concerned discount tier


Returns:


1. **output_0** *of type `int256`*

--- 
### tradeTakerFeesCount()
>
>Get number of trade taker fee block number tiers


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### tradeTakerMinimumFee(uint256)
>
>Get trade taker minimum relative fee at given block number


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **blockNumber** *of type `uint256`*

    > The concerned block number


Returns:


1. **output_0** *of type `int256`*

--- 
### tradeTakerMinimumFeesCount()
>
>Get number of minimum trade taker fee block number tiers


**Execution cost**: No bound available

**Attributes**: constant



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
### updateDelayBlocks()
>
>Get the current value of update delay blocks


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The value of update delay blocks

1. **output_0** *of type `uint256`*

--- 
### updateDelayBlocksCount()
>
>Get the count of update delay blocks values


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The count of update delay blocks values

1. **output_0** *of type `uint256`*

--- 
### walletLockTimeout()
>
>Get the current value of wallet lock timeout


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The value of wallet lock timeout

1. **output_0** *of type `uint256`*

--- 
### walletSettlementStakeFraction()
>
>Get the current value of wallet settlement stake fraction


**Execution cost**: No bound available

**Attributes**: constant



Returns:

> The value of wallet settlement stake fraction

1. **output_0** *of type `uint256`*

[Back to the top ↑](#configuration)
