# SecurityBond
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/SecurityBond.sol)
> SecurityBond


**Execution cost**: less than 43727 gas

**Deployment cost**: less than 2433000 gas

**Combined cost**: less than 2476727 gas

## Constructor



Params:

1. **deployer** *of type `address`*

## Events
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### ReceiveEvent(address,string,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **balanceType** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

--- 
### DepriveEvent(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

--- 
### CloseAccrualPeriodEvent()


**Execution cost**: No bound available



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
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### RewardEvent(address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **rewardFraction** *of type `uint256`*
3. **unlockTimeoutInSeconds** *of type `uint256`*

--- 
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

--- 
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
### SetOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### SetTransferControllerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldTransferControllerManager** *of type `address`*
2. **newTransferControllerManager** *of type `address`*

--- 
### StageToBeneficiaryEvent(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **from** *of type `address`*
2. **beneficiary** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

## Fallback


**Execution cost**: No bound available

**Attributes**: payable



## Methods
### setServiceActivationTimeout(uint256)
>
>Set the service activation timeout


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

    > The set timeout in unit of seconds



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
### closeAccrualPeriod()


**Execution cost**: less than 1687 gas




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
### deployer()


**Execution cost**: less than 1402 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 830 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### depositsCount()


**Execution cost**: less than 737 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### inUseCurrenciesByIndices(uint256,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **low** *of type `uint256`*
2. **up** *of type `uint256`*

Returns:


1. **output_0** *of type `tuple[]`*

--- 
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



--- 
### deposit(uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **index** *of type `uint256`*

Returns:


1. **amount** *of type `int256`*
2. **blockNumber** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

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
### REWARD_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### inUseCurrenciesCount()


**Execution cost**: less than 988 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### DEPOSIT_BALANCE_TYPE()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### deprive(address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*


--- 
### depositedBalance(address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **currencyCt** *of type `address`*
2. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `int256`*

--- 
### DEPRIVE_ACTION()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `string`*

--- 
### operator()


**Execution cost**: less than 918 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### receiveTokensTo(address,string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **balanceType** *of type `string`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*
6. **standard** *of type `string`*


--- 
### isRegisteredService(address)
>
>Gauge whether a service contract is registered


**Execution cost**: less than 1001 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### receiveTokens(string,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **balanceType** *of type `string`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*


--- 
### receiveEthersTo(address,string)


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **wallet** *of type `address`*
2. **balanceType** *of type `string`*


--- 
### setTransferControllerManager(address)
>
>Set the currency manager contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### reward(address,uint256,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **rewardFraction** *of type `uint256`*
3. **unlockTimeoutInSeconds** *of type `uint256`*


--- 
### rewardMetaByWallet(address)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **param_0** *of type `address`*

Returns:


1. **rewardFraction** *of type `uint256`*
2. **rewardNonce** *of type `uint256`*
3. **unlockTime** *of type `uint256`*

--- 
### serviceActivationTimeout()


**Execution cost**: less than 658 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

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
### setOperator(address)
>
>Set the operator of this contract


**Execution cost**: No bound available


Params:

1. **newOperator** *of type `address`*

    > The address of the new operator



--- 
### stageNonceByWalletCurrency(address,address,uint256)


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*

Returns:


1. **output_0** *of type `uint256`*

--- 
### stageToBeneficiary(address,address,uint256)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*
2. **currencyCt** *of type `address`*
3. **currencyId** *of type `uint256`*


--- 
### transferControllerManager()


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




[Back to the top ↑](#securitybond)
