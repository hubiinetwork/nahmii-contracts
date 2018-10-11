# FraudChallengeBySuccessivePayments
[see the source](git+https://github.com/hubiinetwork/nahmii-contracts/tree/master/contracts/FraudChallengeBySuccessivePayments.sol)
> FraudChallengeBySuccessivePayments


**Execution cost**: less than 42456 gas

**Deployment cost**: less than 1294200 gas

**Combined cost**: less than 1336656 gas

## Constructor



Params:

1. **owner** *of type `address`*

## Events
### ChallengeBySuccessivePaymentsEvent(tuple,tuple,address,address)


**Execution cost**: No bound available


Params:

1. **firstPayment** *of type `tuple`*
2. **lastPayment** *of type `tuple`*
3. **challenger** *of type `address`*
4. **seizedWallet** *of type `address`*

--- 
### ChangeClientFundEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### ChangeConfigurationEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldConfiguration** *of type `address`*
2. **newConfiguration** *of type `address`*

--- 
### ChangeDeployerEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldDeployer** *of type `address`*
2. **newDeployer** *of type `address`*

--- 
### ChangeFraudChallengeEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*

--- 
### ChangeOperatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldOperator** *of type `address`*
2. **newOperator** *of type `address`*

--- 
### ChangeValidatorEvent(address,address)


**Execution cost**: No bound available


Params:

1. **oldAddress** *of type `address`*
2. **newAddress** *of type `address`*


## Methods
### configuration()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challenge(tuple,tuple,address)


**Execution cost**: No bound available


Params:

1. **firstPayment** *of type `tuple`*
2. **lastPayment** *of type `tuple`*
3. **wallet** *of type `address`*


--- 
### changeConfiguration(address)
>
>Change the configuration contract


**Execution cost**: No bound available


Params:

1. **newConfiguration** *of type `address`*

    > The (address of) Configuration contract instance



--- 
### changeClientFund(address)
>
>Change the client fund contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) ClientFund contract instance



--- 
### triggerDestroy()
>
>Destroy this contract
>
> Requires that msg.sender is the defined destructor


**Execution cost**: No bound available




--- 
### changeValidator(address)
>
>Change the validator contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) Validator contract instance



--- 
### changeFraudChallenge(address)
>
>Change the fraudChallenge contract


**Execution cost**: No bound available


Params:

1. **newAddress** *of type `address`*

    > The (address of) FraudChallenge contract instance



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
### clientFund()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### deployer()


**Execution cost**: less than 918 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### destructor()
>
>Return the address that is able to initiate self-destruction


**Execution cost**: less than 808 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### fraudChallenge()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### operator()


**Execution cost**: less than 830 gas

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### validator()


**Execution cost**: No bound available

**Attributes**: constant



Returns:


1. **output_0** *of type `address`*

--- 
### challenge((uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256),(uint256,int256,(address,uint256),(uint256,address,(int256,int256),((int256,(address,uint256)),(int256,(address,uint256))[])),(uint256,address,(int256,int256),((int256,(address,uint256))[])),(int256,int256),((bytes32,(bytes32,bytes32,uint8)),(bytes32,(bytes32,bytes32,uint8))),uint256),address)
>
>Submit two payment candidates in continuous Fraud Challenge (FC) to be tested for succession differences


**Execution cost**: No bound available


Params:

1. **firstPayment** *of type `undefined`*

    > Reference payment

2. **lastPayment** *of type `undefined`*

    > Fraudulent payment candidate

3. **wallet** *of type `undefined`*

    > Address of concerned wallet



[Back to the top ↑](#fraudchallengebysuccessivepayments)
