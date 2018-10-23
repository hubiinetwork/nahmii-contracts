# ClientFund
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/ClientFund.sol)
> Client fund


**Execution cost**: less than 64973 gas

**Deployment cost**: less than 3455800 gas

**Combined cost**: less than 3520773 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### UnauthorizeRegisteredServiceEvent(address,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*

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
### AuthorizeRegisteredServiceActionEvent(address,address,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*
3. **action** *of type `string`*

--- 
### AuthorizeRegisteredServiceEvent(address,address)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*

--- 
### RegisterServiceEvent(address)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

--- 
### DepositEvent(address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*

--- 
### ChangeTransferControllerManagerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldTransferControllerManager** *of type `address`*
2. **newTransferControllerManager** *of type `address`*

--- 
### RegisterServiceDeferredEvent(address,uint256)


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*
2. **timeout** *of type `uint256`*

--- 
### SeizeAllBalancesEvent(address,address)


**Execution cost**: No bound available


Params:

1. **sourceWallet** *of type `address`*
2. **targetWallet** *of type `address`*

--- 
### DeregisterBeneficiaryEvent(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

--- 
### RegisterBeneficiaryEvent(address)


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

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
### ServiceActivationTimeoutEvent(uint256)


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

--- 
### StageEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### StageToBeneficiaryEvent(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **sourceWallet** *of type `address`*
2. **beneficiary** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

--- 
### StageToBeneficiaryUntargetedEvent(address,address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **sourceWallet** *of type `address`*
2. **beneficiary** *of type `address`*
3. **amount** *of type `int256`*
4. **currencyCt** *of type `address`*
5. **currencyId** *of type `uint256`*

--- 
### UnauthorizeRegisteredServiceActionEvent(address,address,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **service** *of type `address`*
3. **action** *of type `string`*

--- 
### UnstageEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### UpdateSettledBalanceEvent(address,int256,address,uint256)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### WithdrawEvent(address,int256,address,uint256,string)


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*
2. **amount** *of type `int256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*
5. **standard** *of type `string`*

## Fallback


**Execution cost**: No bound available

**Attributes**: payable



## Methods
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
### authorizeRegisteredService(address)
>
>Authorize the given registered service by enabling all of actions
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service



--- 
### authorizeRegisteredServiceAction(address,string)
>
>Authorize the given registered service action
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service

2. **action** *of type `string`*

    > The concerned service action



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
### unstage(int256,address,uint256)
>
>Unstage a staged amount


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*

    > The concerned balance amount

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



--- 
### registerService(address)
>
>Register a service contract whose activation is immediate


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### deregisterBeneficiary(address)
>
>Deregister the given beneficiary


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

    > Address of beneficiary to be deregistered


Returns:


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
### isRegisteredService(address)
>
>Gauge whether a service contract is registered


**Execution cost**: less than 1133 gas

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the service contract


Returns:

> true if service is registered, else false

1. **output_0** *of type `bool`*

--- 
### depositEthersTo(address)
>
>Deposit ethers to the given wallet's deposited balance


**Execution cost**: No bound available

**Attributes**: payable


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet



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
### isAuthorizedServiceActionForWallet(address,string,address)
>
>Gauge whether the given service action is authorized for the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service

2. **action** *of type `string`*

    > The concerned service action

3. **wallet** *of type `address`*

    > The address of the concerned wallet


Returns:

> true if service action is authorized for the given wallet, else false

1. **output_0** *of type `bool`*

--- 
### depositTokens(int256,address,uint256,string)
>
>Deposit token to msg.sender's deposited balance
>
> The wallet must approve of this ClientFund's transfer prior to calling this function


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*

    > The amount to deposit

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)

4. **standard** *of type `string`*

    > The standard of token ("ERC20", "ERC721")



--- 
### depositsCount(address)
>
>Get the count of the given wallet's deposits


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet


Returns:

> The count of the concerned wallet's deposits

1. **output_0** *of type `uint256`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 1029 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deposit(address,uint256)
>
>Get metadata of the given wallet's deposit at the given index


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet

2. **index** *of type `uint256`*

    > The index of wallet's deposit


Returns:

> The deposit metadata

1. **amount** *of type `int256`*
2. **timestamp** *of type `uint256`*
3. **currencyCt** *of type `address`*
4. **currencyId** *of type `uint256`*

--- 
### depositTokensTo(address,int256,address,uint256,string)
>
>Deposit token to the given wallet's deposited balance
>
> The wallet must approve of this ClientFund's transfer prior to calling this function


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet

2. **amount** *of type `int256`*

    > The amount to deposit

3. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

4. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)

5. **standard** *of type `string`*

    > The standard of the token ("ERC20", "ERC721")



--- 
### deregisterService(address)
>
>Deregister a service contract


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be deregistered



--- 
### isAuthorizedServiceForWallet(address,address)
>
>Gauge whether the given service is authorized for the given wallet


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service

2. **wallet** *of type `address`*

    > The address of the concerned wallet


Returns:

> true if service is authorized for the given wallet, else false

1. **output_0** *of type `bool`*

--- 
### operator()


**Execution cost**: less than 1138 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 1556 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### isRegisteredBeneficiary(address)
>
>Gauge whether the given address is the one of a registered beneficiary


**Execution cost**: less than 954 gas

**Attributes**: constant


Params:

1. **beneficiary** *of type `address`*

    > Address of beneficiary


Returns:

> true if beneficiary is registered, else false

1. **output_0** *of type `bool`*

--- 
### depositedBalance(address,address,uint256)
>
>Get deposited balance of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The deposited balance of the concerned wallet and currency

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
### registerBeneficiary(address)
>
>Register the given beneficiary


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

    > Address of beneficiary to be registered


Returns:


1. **output_0** *of type `bool`*

--- 
### changeTransferControllerManager(address)
>
>Change the currency manager contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) TransferControllerManager contract instance



--- 
### withdrawalsCount(address)
>
>Get the count of the given wallet's withdrawals


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet


Returns:

> The count of the concerned wallet's withdrawals

1. **output_0** *of type `uint256`*

--- 
### seizeAllBalances(address,address)
>
>Transfer all balances of the given source wallet to the given target wallet


**Execution cost**: No bound available


Params:

1. **sourceWallet** *of type `address`*

    > The address of concerned source wallet

2. **targetWallet** *of type `address`*

    > The address of concerned target wallet



--- 
### registerServiceDeferred(address)
>
>Register a service contract whose activation is deferred by the service activation timeout


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the service contract to be registered



--- 
### stage(address,int256,address,uint256)
>
>Stage the amount for subsequent withdrawal


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet

2. **amount** *of type `int256`*

    > The concerned amount

3. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

4. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



--- 
### settledBalance(address,address,uint256)
>
>Get settled balance of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The settled balance of the concerned wallet and currency

1. **output_0** *of type `int256`*

--- 
### serviceActivationTimeout()


**Execution cost**: less than 812 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `uint256`*

--- 
### setServiceActivationTimeout(uint256)
>
>Set the service activation timeout


**Execution cost**: No bound available


Params:

1. **timeoutInSeconds** *of type `uint256`*

    > The set timeout in unit of seconds



--- 
### stageToBeneficiary(address,int256,address,uint256)
>
>Stage the amount from msg.sender to the given beneficiary and targeted to msg.sender 


**Execution cost**: No bound available


Params:

1. **beneficiary** *of type `address`*

    > The (address of) concerned beneficiary contract

2. **amount** *of type `int256`*

    > The concerned amount

3. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

4. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



--- 
### stageToBeneficiaryUntargeted(address,address,int256,address,uint256)
>
>Stage the amount from the given source wallet to the given beneficiary without target wallet


**Execution cost**: No bound available


Params:

1. **sourceWallet** *of type `address`*

    > The address of concerned source wallet

2. **beneficiary** *of type `address`*

    > The (address of) concerned beneficiary contract

3. **amount** *of type `int256`*

    > The concerned amount

4. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

5. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



--- 
### stagedBalance(address,address,uint256)
>
>Get staged balance of the given wallet and currency


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)


Returns:

> The staged balance of the concerned wallet and currency

1. **output_0** *of type `int256`*

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




--- 
### unauthorizeRegisteredService(address)
>
>Unauthorize the given registered service by enabling all of actions
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service



--- 
### unauthorizeRegisteredServiceAction(address,string)
>
>Unauthorize the given registered service action
>
> The service must be registered already


**Execution cost**: No bound available


Params:

1. **service** *of type `address`*

    > The address of the concerned registered service

2. **action** *of type `string`*

    > The concerned service action



--- 
### updateSettledBalance(address,int256,address,uint256)
>
>Update the settled balance by the difference between provided amount and deposited on-chain balance


**Execution cost**: No bound available


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet

2. **amount** *of type `int256`*

    > The off-chain balance amount

3. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

4. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)



--- 
### withdraw(int256,address,uint256,string)
>
>Withdraw the given amount from staged balance


**Execution cost**: No bound available


Params:

1. **amount** *of type `int256`*

    > The concerned amount

2. **currencyCt** *of type `address`*

    > The address of the concerned currency contract (address(0) == ETH)

3. **currencyId** *of type `uint256`*

    > The ID of the concerned currency (0 for ETH and ERC20)

4. **standard** *of type `string`*

    > The standard of token ("ERC20", "ERC721")



--- 
### withdrawal(address,uint256)
>
>Get metadata of the given wallet's withdrawal at the given index


**Execution cost**: No bound available

**Attributes**: constant


Params:

1. **wallet** *of type `address`*

    > The address of the concerned wallet

2. **index** *of type `uint256`*

    > The index of wallet's deposit


Returns:

> The withdrawal metadata

1. **amount** *of type `int256`*
2. **timestamp** *of type `uint256`*
3. **token** *of type `address`*
4. **id** *of type `uint256`*

[Back to the top ↑](#clientfund)
