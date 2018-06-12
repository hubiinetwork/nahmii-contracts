/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import "./Ownable.sol";
import {AbstractConfiguration} from "./Configuration.sol";
import "./ClientFund.sol";
import "./Types.sol";
import {AbstractHasher} from "./Hasher.sol";
import {AbstractValidator} from "./Validator.sol";
import {AbstractSecurityBond} from "./SecurityBond.sol";

/**
@title FraudChallenge
@notice Host of fraud detection logics
*/
contract FraudChallenge is Ownable {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Types.Order[] public fraudulentOrders;
    Types.Trade[] public fraudulentTrades;
    Types.Payment[] public fraudulentPayments;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    address[] public doubleSpenderWallets;
    mapping(address => bool) public doubleSpenderWalletsMap;

    AbstractConfiguration public configuration;
    ClientFund public clientFund;
    AbstractSecurityBond public securityBond;
    AbstractHasher public hasher;
    AbstractValidator public validator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeConfigurationEvent(AbstractConfiguration oldConfiguration, AbstractConfiguration newConfiguration);
    event ChangeClientFundEvent(ClientFund oldClientFund, ClientFund newClientFund);
    event ChangeSecurityBondEvent(AbstractSecurityBond oldSecurityBond, AbstractSecurityBond newSecurityBond);
    event ChangeHasherEvent(AbstractHasher oldHasher, AbstractHasher newHasher);
    event ChangeValidatorEvent(AbstractValidator oldValidator, AbstractValidator newValidator);
    event ChallengeByOrderEvent(Types.Order order, address challenger);
    event ChallengeByTradeEvent(Types.Trade trade, address challenger, address seizedWallet);
    event ChallengeByPaymentEvent(Types.Payment payment, address challenger, address seizedWallet);
    event ChallengeBySuccessiveTradesEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeBySuccessivePaymentsEvent(Types.Payment firstPayment, Types.Payment lastPayment, address challenger, address seizedWallet);
    event ChallengeByPaymentSucceedingTradeEvent(Types.Trade trade, Types.Payment payment, address challenger, address seizedWallet);
    event ChallengeByTradeSucceedingPaymentEvent(Types.Payment payment, Types.Trade trade, address challenger, address seizedWallet);
    event ChallengeByTradeOrderResidualsEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeByDoubleSpentOrdersEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address[] doubleSpenderWallets);
    event ChallengeByDuplicateDealNonceOfTradesEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger);
    event ChallengeByDuplicateDealNonceOfPaymentsEvent(Types.Payment firstTrade, Types.Payment lastTrade, address challenger);
    event ChallengeByDuplicateDealNonceOfTradeAndPaymentEvent(Types.Trade trade, Types.Payment payment, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the configuration contract
    /// @param newConfiguration The (address of) Configuration contract instance
    function changeConfiguration(AbstractConfiguration newConfiguration)
    public
    onlyOwner
    notNullAddress(newConfiguration)
    notEqualAddresses(newConfiguration, configuration)
    {
        AbstractConfiguration oldConfiguration = configuration;
        configuration = newConfiguration;
        emit ChangeConfigurationEvent(oldConfiguration, configuration);
    }

    /// @notice Change the client fund contract
    /// @param newClientFund The (address of) ClientFund contract instance
    function changeClientFund(ClientFund newClientFund)
    public
    onlyOwner
    notNullAddress(newClientFund)
    notEqualAddresses(newClientFund, clientFund)
    {
        ClientFund oldClientFund = clientFund;
        clientFund = newClientFund;
        emit ChangeClientFundEvent(oldClientFund, clientFund);
    }

    /// @notice Change the security bond contract
    /// @param newSecurityBond The (address of) AbstractSecurityBond contract instance
    function changeSecurityBond(AbstractSecurityBond newSecurityBond)
    public
    onlyOwner
    notNullAddress(newSecurityBond)
    notEqualAddresses(newSecurityBond, securityBond)
    {
        AbstractSecurityBond oldSecurityBond = securityBond;
        securityBond = newSecurityBond;
        emit ChangeSecurityBondEvent(oldSecurityBond, securityBond);
    }

    /// @notice Change the hasher contract
    /// @param newHasher The (address of) AbstractHasher contract instance
    function changeHasher(AbstractHasher newHasher)
    public
    onlyOwner
    notNullAddress(newHasher)
    notEqualAddresses(newHasher, hasher)
    {
        AbstractHasher oldHasher = hasher;
        hasher = newHasher;
        emit ChangeHasherEvent(oldHasher, hasher);
    }

    /// @notice Change the fraudulent deal validator contract
    /// @param newValidator The (address of) AbstractValidator contract instance
    function changeValidator(AbstractValidator newValidator)
    public
    onlyOwner
    notNullAddress(newValidator)
    notEqualAddresses(newValidator, validator)
    {
        AbstractValidator oldValidator = validator;
        validator = newValidator;
        emit ChangeValidatorEvent(oldValidator, validator);
    }

    /// @notice Get the seized status of given wallet
    /// @param wallet The wallet address for which to check seized status
    /// @return true if wallet is seized, false otherwise
    function isSeizedWallet(address wallet) public view returns (bool) {
        return seizedWalletsMap[wallet];
    }

    /// @notice Get the number of wallets whose funds have be seized
    /// @return Number of seized wallets
    function seizedWalletsCount() public view returns (uint256) {
        return seizedWallets.length;
    }

    /// @notice Get the double spender status of given wallet
    /// @param wallet The wallet address for which to check double spender status
    /// @return true if wallet is double spender, false otherwise
    function isDoubleSpenderWallet(address wallet) public view returns (bool) {
        return doubleSpenderWalletsMap[wallet];
    }

    /// @notice Get the number of wallets tagged as double spenders
    /// @return Number of double spender wallets
    function doubleSpenderWalletsCount() public view returns (uint256) {
        return doubleSpenderWallets.length;
    }

    /// @notice Submit an order candidate in continuous Fraud Challenge (FC)
    /// @param order Fraudulent order candidate
    function challengeByOrder(Types.Order order)
    public
    validatorInitialized
    onlyExchangeSealedOrder(order)
    {
        require(hasher != address(0), "Hasher is missing");
        require(configuration != address(0), "Configuration is missing");
        require(clientFund != address(0), "ClientFund is missing");

        require(hasher.hashOrderAsWallet(order) == order.seals.wallet.hash);

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = Types.isGenuineSignature(order.seals.wallet.hash, order.seals.wallet.signature, order.wallet);
        require(!genuineWalletSignature);

        configuration.setOperationalModeExit();
        fraudulentOrders.push(order);

        (address stakeCurrency, int256 stakeAmount) = configuration.getFalseWalletSignatureStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByOrderEvent(order, msg.sender);
    }

    /// @notice Submit a trade candidate in continuous Fraud Challenge (FC)
    /// @param trade Fraudulent trade candidate
    function challengeByTrade(Types.Trade trade)
    public
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(configuration != address(0), "Configuration is missing");
        require(clientFund != address(0), "ClientFund is missing");

        // Gauge the genuineness of maker and taker fees. Depending on whether maker is buyer or seller
        // this result is baked into genuineness by buyer and seller below.
        bool genuineMakerFee = validator.isGenuineTradeMakerFee(trade);
        bool genuineTakerFee = validator.isGenuineTradeTakerFee(trade);

        // Genuineness affected by buyer
        bool genuineByBuyer = validator.isGenuineByTradeBuyer(trade, owner)
        && (Types.LiquidityRole.Maker == trade.buyer.liquidityRole ? genuineMakerFee : genuineTakerFee);

        // Genuineness affected by seller
        bool genuineBySeller = validator.isGenuineByTradeSeller(trade, owner)
        && (Types.LiquidityRole.Maker == trade.seller.liquidityRole ? genuineMakerFee : genuineTakerFee);

        require(!genuineByBuyer || !genuineBySeller);

        configuration.setOperationalModeExit();
        fraudulentTrades.push(trade);

        address seizedWallet;
        if (!genuineByBuyer)
            seizedWallet = trade.buyer.wallet;
        if (!genuineBySeller)
            seizedWallet = trade.seller.wallet;
        if (address(0) != seizedWallet) {
            clientFund.seizeDepositedAndSettledBalances(seizedWallet, msg.sender);
            addToSeizedWallets(seizedWallet);
        }

        emit ChallengeByTradeEvent(trade, msg.sender, seizedWallet);
    }

    /// @notice Submit a payment candidate in continuous Fraud Challenge (FC)
    /// @param payment Fraudulent payment candidate
    function challengeByPayment(Types.Payment payment)
    public
    validatorInitialized
    onlyExchangeSealedPayment(payment)
    {
        require(hasher != address(0), "Hasher is missing");
        require(configuration != address(0), "Configuration is missing");
        require(clientFund != address(0), "ClientFund is missing");

        require(hasher.hashPaymentAsWallet(payment) == payment.seals.wallet.hash);

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);

        // Genuineness affected by sender
        bool genuineBySender = validator.isGenuineByPaymentSender(payment) &&
        validator.isGenuinePaymentFee(payment);

        // Genuineness affected by recipient
        bool genuineByRecipient = validator.isGenuineByPaymentRecipient(payment);

        require(!genuineWalletSignature || !genuineBySender || !genuineByRecipient);

        configuration.setOperationalModeExit();
        fraudulentPayments.push(payment);

        if (!genuineWalletSignature) {
            (address stakeCurrency, int256 stakeAmount) = configuration.getFalseWalletSignatureStake();
            securityBond.stage(stakeAmount, stakeCurrency, msg.sender);
        } else {
            address seizedWallet;
            if (!genuineBySender)
                seizedWallet = payment.sender.wallet;
            if (!genuineByRecipient)
                seizedWallet = payment.recipient.wallet;
            if (address(0) != seizedWallet) {
                clientFund.seizeDepositedAndSettledBalances(seizedWallet, msg.sender);
                addToSeizedWallets(seizedWallet);
            }
        }

        emit ChallengeByPaymentEvent(payment, msg.sender, seizedWallet);
    }

    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency (0 if ETH)
    function challengeBySuccessiveTrades(
        Types.Trade firstTrade,
        Types.Trade lastTrade,
        address wallet,
        address currency
    )
    public
    validatorInitialized
    onlySealedTrade(firstTrade)
    onlySealedTrade(lastTrade)
    {
        require(configuration != address(0), "Configuration is missing");
        require(clientFund != address(0), "ClientFund is missing");

        require(Types.isTradeParty(firstTrade, wallet));
        require(Types.isTradeParty(lastTrade, wallet));
        require(currency == firstTrade.currencies.intended || currency == firstTrade.currencies.conjugate);
        require(currency == lastTrade.currencies.intended || currency == lastTrade.currencies.conjugate);

        Types.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        Types.CurrencyRole firstCurrencyRole = (currency == firstTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);
        Types.CurrencyRole lastCurrencyRole = (currency == lastTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole) ||
        !validator.isGenuineSuccessiveTradesNetFees(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentTrades.push(lastTrade);

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeBySuccessiveTradesEvent(firstTrade, lastTrade, msg.sender, wallet);
    }

    /// @notice Submit two payment candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param firstPayment Reference payment
    /// @param lastPayment Fraudulent payment candidate
    /// @param wallet Address of concerned wallet
    function challengeBySuccessivePayments(
        Types.Payment firstPayment,
        Types.Payment lastPayment,
        address wallet
    )
    public
    validatorInitialized
    onlySealedPayment(firstPayment)
    onlySealedPayment(lastPayment)
    {
        require(configuration != address(0), "Configuration is missing");
        require(clientFund != address(0), "ClientFund is missing");

        require(Types.isPaymentParty(firstPayment, wallet));
        require(Types.isPaymentParty(lastPayment, wallet));
        require(firstPayment.currency == lastPayment.currency);

        Types.PaymentPartyRole firstPaymentPartyRole = (wallet == firstPayment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);
        Types.PaymentPartyRole lastPaymentPartyRole = (wallet == lastPayment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);

        require(validator.isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole));

        require(
            !validator.isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole) ||
        !validator.isGenuineSuccessivePaymentsNetFees(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentPayments.push(lastPayment);

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeBySuccessivePaymentsEvent(firstPayment, lastPayment, msg.sender, wallet);
    }

    /// @notice Submit trade and subsequent payment candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param trade Reference trade
    /// @param payment Fraudulent payment candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency of trade (0 if ETH)
    function challengeByPaymentSucceedingTrade(
        Types.Trade trade,
        Types.Payment payment,
        address wallet,
        address currency
    )
    public
    validatorInitialized
    onlySealedTrade(trade)
    onlySealedPayment(payment)
    {
        require(configuration != address(0), "Configuration is missing");
        require(clientFund != address(0), "ClientFund is missing");

        require(Types.isTradeParty(trade, wallet));
        require(Types.isPaymentParty(payment, wallet));
        require(currency == payment.currency);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);

        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);

        require(validator.isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, currencyRole, payment, paymentPartyRole) ||
        !validator.isGenuineSuccessiveTradePaymentNetFees(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentPayments.push(payment);

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeByPaymentSucceedingTradeEvent(trade, payment, msg.sender, wallet);
    }

    /// @notice Submit payment and subsequent trade candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param payment Reference payment
    /// @param trade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency of trade (0 if ETH)
    function challengeByTradeSucceedingPayment(
        Types.Payment payment,
        Types.Trade trade,
        address wallet,
        address currency
    )
    public
    validatorInitialized
    onlySealedPayment(payment)
    onlySealedTrade(trade)
    {
        require(configuration != address(0), "Configuration is missing");
        require(clientFund != address(0), "ClientFund is missing");

        require(Types.isTradeParty(trade, wallet));
        require(Types.isPaymentParty(payment, wallet));
        require(currency == payment.currency);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);

        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);
        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(validator.isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, currencyRole) ||
        !validator.isGenuineSuccessivePaymentTradeNetFees(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentTrades.push(trade);

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeByTradeSucceedingPaymentEvent(payment, trade, msg.sender, wallet);
    }

    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// trade order residual differences
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency (0 if ETH)
    function challengeByTradeOrderResiduals(
        Types.Trade firstTrade,
        Types.Trade lastTrade,
        address wallet,
        address currency
    )
    public
    validatorInitialized
    onlySealedTrade(firstTrade)
    onlySealedTrade(lastTrade)
    {
        require(configuration != address(0), "Configuration is missing");
        require(clientFund != address(0), "ClientFund is missing");

        require(Types.isTradeParty(firstTrade, wallet));
        require(Types.isTradeParty(lastTrade, wallet));
        require(currency == firstTrade.currencies.intended);
        require(currency == lastTrade.currencies.intended);

        Types.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        require(firstTradePartyRole == lastTradePartyRole);

        if (Types.TradePartyRole.Buyer == firstTradePartyRole)
            require(firstTrade.buyer.order.hashes.wallet == lastTrade.buyer.order.hashes.wallet);
        else // Types.TradePartyRole.Seller == firstTradePartyRole
            require(firstTrade.seller.order.hashes.wallet == lastTrade.seller.order.hashes.wallet);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        require(!validator.isGenuineSuccessiveTradeOrderResiduals(firstTrade, lastTrade, firstTradePartyRole));

        configuration.setOperationalModeExit();
        fraudulentTrades.push(lastTrade);

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeByTradeOrderResidualsEvent(firstTrade, lastTrade, msg.sender, wallet);
    }

    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// trade order double spenditure
    /// @param trade1 First trade with double spent order
    /// @param trade2 Last trade with double spent order
    function challengeByDoubleSpentOrders(
        Types.Trade trade1,
        Types.Trade trade2
    )
    public
    validatorInitialized
    onlySealedTrade(trade1)
    onlySealedTrade(trade2)
    {
        require(configuration != address(0), "Configuration is missing");

        bool doubleSpentBuyOrder = trade1.buyer.order.hashes.exchange == trade2.buyer.order.hashes.exchange;
        bool doubleSpentSellOrder = trade1.seller.order.hashes.exchange == trade2.seller.order.hashes.exchange;

        require(doubleSpentBuyOrder || doubleSpentSellOrder);

        configuration.setOperationalModeExit();
        fraudulentTrades.push(trade1);
        fraudulentTrades.push(trade2);

        (address stakeCurrency, int256 stakeAmount) = configuration.getDoubleSpentOrderStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        if (doubleSpentBuyOrder)
            addToDoubleSpenderWallets(trade1.buyer.wallet, trade2.buyer.wallet);
        if (doubleSpentSellOrder)
            addToDoubleSpenderWallets(trade1.seller.wallet, trade2.seller.wallet);

        emit ChallengeByDoubleSpentOrdersEvent(trade1, trade2, msg.sender, doubleSpenderWallets);
    }

    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate deal nonce
    /// @param trade1 First trade with duplicate deal nonce
    /// @param trade2 Second trade with duplicate deal nonce
    function challengeByDuplicateDealNonceOfTrades(
        Types.Trade trade1,
        Types.Trade trade2
    )
    public
    validatorInitialized
    onlySealedTrade(trade1)
    onlySealedTrade(trade2)
    {
        require(configuration != address(0), "Configuration is missing");

        require(trade1.seal.hash != trade2.seal.hash);
        require(trade1.nonce == trade2.nonce);

        configuration.setOperationalModeExit();
        fraudulentTrades.push(trade1);
        fraudulentTrades.push(trade2);

        (address stakeCurrency, int256 stakeAmount) = configuration.getDuplicateDealNonceStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByDuplicateDealNonceOfTradesEvent(trade1, trade2, msg.sender);
    }

    /// @notice Submit two payment candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate deal nonce
    /// @param payment1 First payment with duplicate deal nonce
    /// @param payment2 Second payment with duplicate deal nonce
    function challengeByDuplicateDealNonceOfPayments(
        Types.Payment payment1,
        Types.Payment payment2
    )
    public
    validatorInitialized
    onlySealedPayment(payment1)
    onlySealedPayment(payment2)
    {
        require(configuration != address(0), "Configuration is missing");

        require(payment1.seals.wallet.hash != payment2.seals.wallet.hash);
        require(payment1.nonce == payment2.nonce);

        configuration.setOperationalModeExit();
        fraudulentPayments.push(payment1);
        fraudulentPayments.push(payment2);

        (address stakeCurrency, int256 stakeAmount) = configuration.getDuplicateDealNonceStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByDuplicateDealNonceOfPaymentsEvent(payment1, payment2, msg.sender);
    }


    /// @notice Submit one trade candidate and one payment candidate in continuous Fraud
    /// Challenge (FC) to be tested for duplicate deal nonce
    /// @param trade Trade with duplicate deal nonce
    /// @param payment Payment with duplicate deal nonce
    function challengeByDuplicateDealNonceOfTradeAndPayment(
        Types.Trade trade,
        Types.Payment payment
    )
    public
    validatorInitialized
    onlySealedTrade(trade)
    onlySealedPayment(payment)
    {
        require(configuration != address(0), "Configuration is missing");

        require(trade.nonce == payment.nonce);

        configuration.setOperationalModeExit();
        fraudulentTrades.push(trade);
        fraudulentPayments.push(payment);

        (address stakeCurrency, int256 stakeAmount) = configuration.getDuplicateDealNonceStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByDuplicateDealNonceOfTradeAndPaymentEvent(trade, payment, msg.sender);
    }

    /// @notice Get the number of fraudulent orders
    function getFraudulentOrdersCount() public view returns (uint256) {
        return fraudulentOrders.length;
    }

    /// @notice Get the number of fraudulent trades
    function getFraudulentTradesCount() public view returns (uint256) {
        return fraudulentTrades.length;
    }

    /// @notice Get the number of fraudulent payments
    function getFraudulentPaymentsCount() public view returns (uint256) {
        return fraudulentPayments.length;
    }

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
        }
    }

    function addToDoubleSpenderWallets(address firstAddress, address lastAddress) private {
        if (!doubleSpenderWalletsMap[firstAddress]) {
            doubleSpenderWallets.push(firstAddress);
            doubleSpenderWalletsMap[firstAddress] = true;
        }

        if (!doubleSpenderWalletsMap[lastAddress]) {
            doubleSpenderWallets.push(lastAddress);
            doubleSpenderWalletsMap[lastAddress] = true;
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier notEqualAddresses(address address1, address address2) {
        require(address1 != address2);
        _;
    }

    modifier validatorInitialized() {
        require(validator != address(0), "Validator is missing");
        _;
    }

    modifier onlyExchangeSealedOrder(Types.Order order) {
        require(validator.isGenuineOrderExchangeSeal(order, owner), "Order is not sealed by exchange");
        _;
    }

    modifier onlySealedTrade(Types.Trade trade) {
        require(validator.isGenuineTradeSeal(trade, owner), "Trade is not sealed");
        _;
    }

    modifier onlyExchangeSealedPayment(Types.Payment payment) {
        require(validator.isGenuinePaymentExchangeSeal(payment, owner), "Payment is not sealed by exchange");
        _;
    }

    modifier onlySealedPayment(Types.Payment payment) {
        require(validator.isGenuinePaymentSeals(payment, owner), "Payment is not sealed");
        _;
    }
}