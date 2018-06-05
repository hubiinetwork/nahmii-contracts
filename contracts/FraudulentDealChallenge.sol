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
import {AbstractFraudulentDealValidator} from "./FraudulentDealValidator.sol";
// TODO Enable
//import {AbstractSecurityBond} from "./SecurityBond.sol";

/**
@title FraudulentDealChallenge
@notice Host of fraud detection logics
*/
contract FraudulentDealChallenge is Ownable {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Types.Trade public fraudulentTrade;
    Types.Payment public fraudulentPayment;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    address[] public doubleSpenderWallets;
    mapping(address => bool) public doubleSpenderWalletsMap;

    AbstractConfiguration public configuration;
    ClientFund public clientFund;
    // TODO Enable
    //    AbstractSecurityBond public securityBond;
    AbstractHasher public hasher;
    AbstractFraudulentDealValidator public fraudulentDealValidator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeConfigurationEvent(AbstractConfiguration oldConfiguration, AbstractConfiguration newConfiguration);
    event ChangeClientFundEvent(ClientFund oldClientFund, ClientFund newClientFund);
    // TODO Enable
    //    event ChangeSecurityBondEvent(AbstractSecurityBond oldSecurityBond, AbstractSecurityBond newSecurityBond);
    event ChangeHasherEvent(AbstractHasher oldHasher, AbstractHasher newHasher);
    event ChangeFraudulentDealValidatorEvent(AbstractFraudulentDealValidator oldFraudulentDealValidator, AbstractFraudulentDealValidator newFraudulentDealValidator);
    event ChallengeByTradeEvent(Types.Trade trade, address challenger, address seizedWallet);
    event ChallengeByPaymentEvent(Types.Payment payment, address challenger, address seizedWallet);
    event ChallengeBySuccessiveTradesEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeBySuccessivePaymentsEvent(Types.Payment firstPayment, Types.Payment lastPayment, address challenger, address seizedWallet);
    event ChallengeByPaymentSucceedingTradeEvent(Types.Trade trade, Types.Payment payment, address challenger, address seizedWallet);
    event ChallengeByTradeSucceedingPaymentEvent(Types.Payment payment, Types.Trade trade, address challenger, address seizedWallet);
    event ChallengeByTradeOrderResidualsEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeByDoubleSpentOrdersEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address[] doubleSpenderWallets);

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

    // TODO Enable
    /// @notice Change the security bond contract
    /// @param newSecurityBond The (address of) AbstractSecurityBond contract instance
    //    function changeSecurityBond(AbstractSecurityBond newSecurityBond)
    //    public
    //    onlyOwner
    //    notNullAddress(newSecurityBond)
    //    notEqualAddresses(newSecurityBond, securityBond)
    //    {
    //        AbstractSecurityBond oldSecurityBond = securityBond;
    //        securityBond = newSecurityBond;
    //        emit ChangeSecurityBondEvent(oldSecurityBond, securityBond);
    //    }

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
    /// @param newFraudulentDealValidator The (address of) AbstractFraudulentDealValidator contract instance
    function changeFraudulentDealValidator(AbstractFraudulentDealValidator newFraudulentDealValidator)
    public
    onlyOwner
    notNullAddress(newFraudulentDealValidator)
    notEqualAddresses(newFraudulentDealValidator, fraudulentDealValidator)
    {
        AbstractFraudulentDealValidator oldFraudulentDealValidator = fraudulentDealValidator;
        fraudulentDealValidator = newFraudulentDealValidator;
        emit ChangeFraudulentDealValidatorEvent(oldFraudulentDealValidator, fraudulentDealValidator);
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

    /// @notice Submit a trade candidate in continuous Fraudulent Deal Challenge (FDC)
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param trade Fraudulent trade candidate
    function challengeByTrade(Types.Trade trade) public {
        require(hasher.hashTrade(trade) == trade.seal.hash);
        require(Types.isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));

        // Gauge the genuineness of maker and taker fees. Depending on whether maker is buyer or seller
        // this result is baked into genuineness by buyer and seller below.
        bool genuineMakerFee = fraudulentDealValidator.isGenuineTradeMakerFee(trade);
        bool genuineTakerFee = fraudulentDealValidator.isGenuineTradeTakerFee(trade);

        // Genuineness affected by buyer
        bool genuineByBuyer = fraudulentDealValidator.isGenuineByTradeBuyer(trade, owner)
        && (Types.LiquidityRole.Maker == trade.buyer.liquidityRole ? genuineMakerFee : genuineTakerFee);

        // Genuineness affected by seller
        bool genuineBySeller = fraudulentDealValidator.isGenuineByTradeSeller(trade, owner)
        && (Types.LiquidityRole.Maker == trade.seller.liquidityRole ? genuineMakerFee : genuineTakerFee);

        require(!genuineByBuyer || !genuineBySeller);

        configuration.setOperationalModeExit();
        fraudulentTrade = trade;

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

    /// @notice Submit a payment candidate in continuous Fraudulent Deal Challenge (FDC)
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param payment Fraudulent payment candidate
    function challengeByPayment(Types.Payment payment) public {
        require(hasher.hashPaymentAsWallet(payment) == payment.seals.wallet.hash);
        require(hasher.hashPaymentAsExchange(payment) == payment.seals.exchange.hash);
        require(Types.isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);

        // Genuineness affected by sender
        bool genuineBySender = fraudulentDealValidator.isGenuineByPaymentSender(payment) &&
        fraudulentDealValidator.isGenuinePaymentFee(payment);

        // Genuineness affected by recipient
        bool genuineByRecipient = fraudulentDealValidator.isGenuineByPaymentRecipient(payment);

        require(!genuineWalletSignature || !genuineBySender || !genuineByRecipient);

        configuration.setOperationalModeExit();
        fraudulentPayment = payment;

        if (!genuineWalletSignature) {
            (address stakeCurrency, int256 stakeAmount) = configuration.getFalseWalletSignatureStake();
            // TODO Enable
            //            securityBond.stage(stakeAmount, stakeCurrency, msg.sender);
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

    /// @notice Submit two trade candidates in continuous Fraudulent Deal Challenge (FDC)
    /// to be tested for succession differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
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
    challengeableBySuccessionTradesPair(firstTrade, lastTrade, wallet, currency)
    {
        Types.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(fraudulentDealValidator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        Types.CurrencyRole firstCurrencyRole = (currency == firstTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);
        Types.CurrencyRole lastCurrencyRole = (currency == lastTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !fraudulentDealValidator.isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole) ||
        !fraudulentDealValidator.isGenuineSuccessiveTradesNetFees(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentTrade = lastTrade;

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeBySuccessiveTradesEvent(firstTrade, lastTrade, msg.sender, wallet);
    }

    /// @notice Submit two payment candidates in continuous Fraudulent Deal Challenge (FDC)
    /// to be tested for succession differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param firstPayment Reference payment
    /// @param lastPayment Fraudulent payment candidate
    /// @param wallet Address of concerned wallet
    function challengeBySuccessivePayments(
        Types.Payment firstPayment,
        Types.Payment lastPayment,
        address wallet
    )
    public
    challengeableBySuccessionPaymentsPair(firstPayment, lastPayment, wallet)
    {
        Types.PaymentPartyRole firstPaymentPartyRole = (wallet == firstPayment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);
        Types.PaymentPartyRole lastPaymentPartyRole = (wallet == lastPayment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);

        require(fraudulentDealValidator.isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole));

        require(
            !fraudulentDealValidator.isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole) ||
        !fraudulentDealValidator.isGenuineSuccessivePaymentsNetFees(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentPayment = lastPayment;

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeBySuccessivePaymentsEvent(firstPayment, lastPayment, msg.sender, wallet);
    }

    /// @notice Submit trade and subsequent payment candidates in continuous Fraudulent Deal Challenge (FDC)
    /// to be tested for succession differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
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
    challengeableBySuccessionTradePaymentPair(trade, payment, wallet, currency)
    {
        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);

        require(fraudulentDealValidator.isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !fraudulentDealValidator.isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, currencyRole, payment, paymentPartyRole) ||
        !fraudulentDealValidator.isGenuineSuccessiveTradePaymentNetFees(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentPayment = payment;

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeByPaymentSucceedingTradeEvent(trade, payment, msg.sender, wallet);
    }

    /// @notice Submit payment and subsequent trade candidates in continuous Fraudulent Deal Challenge (FDC)
    /// to be tested for succession differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
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
    challengeableBySuccessionTradePaymentPair(trade, payment, wallet, currency)
    {
        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);
        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(fraudulentDealValidator.isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !fraudulentDealValidator.isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, currencyRole) ||
        !fraudulentDealValidator.isGenuineSuccessivePaymentTradeNetFees(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentTrade = trade;

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeByTradeSucceedingPaymentEvent(payment, trade, msg.sender, wallet);
    }

    /// @notice Submit two trade candidates in continuous Fraudulent Deal Challenge (FDC) to be tested for
    /// trade order residual differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
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
    challengeableByOrderResidualsTradesPair(firstTrade, lastTrade, wallet, currency)
    {
        Types.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        require(firstTradePartyRole == lastTradePartyRole);

        if (Types.TradePartyRole.Buyer == firstTradePartyRole)
            require(firstTrade.buyer.order.hashes.wallet == lastTrade.buyer.order.hashes.wallet);
        else // Types.TradePartyRole.Seller == firstTradePartyRole
            require(firstTrade.seller.order.hashes.wallet == lastTrade.seller.order.hashes.wallet);

        require(fraudulentDealValidator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        require(!fraudulentDealValidator.isGenuineSuccessiveTradeOrderResiduals(firstTrade, lastTrade, firstTradePartyRole));

        configuration.setOperationalModeExit();
        fraudulentTrade = lastTrade;

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeByTradeOrderResidualsEvent(firstTrade, lastTrade, msg.sender, wallet);
    }

    /// @notice Submit two trade candidates in continuous Fraudulent Deal Challenge (FDC) to be tested for
    /// trade order double spenditure
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    function challengeByDoubleSpentOrders(
        Types.Trade firstTrade,
        Types.Trade lastTrade
    )
    public
    challengeableByDoubleSpentOrderTradesPair(firstTrade, lastTrade)
    {
        bool doubleSpentBuyOrder = firstTrade.buyer.order.hashes.exchange == lastTrade.buyer.order.hashes.exchange;
        bool doubleSpentSellOrder = firstTrade.seller.order.hashes.exchange == lastTrade.seller.order.hashes.exchange;
        bool doubledNonce = firstTrade.nonce == lastTrade.nonce;

        require(doubleSpentBuyOrder || doubleSpentSellOrder || doubledNonce);

        configuration.setOperationalModeExit();
        fraudulentTrade = lastTrade;

        if (doubleSpentBuyOrder)
            addToDoubleSpenderWallets(lastTrade.buyer.wallet);
        if (doubleSpentSellOrder)
            addToDoubleSpenderWallets(lastTrade.seller.wallet);

        emit ChallengeByDoubleSpentOrdersEvent(firstTrade, lastTrade, msg.sender, doubleSpenderWallets);
    }

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
        }
    }

    function addToDoubleSpenderWallets(address _address) private {
        if (!doubleSpenderWalletsMap[_address]) {
            doubleSpenderWallets.push(_address);
            doubleSpenderWalletsMap[_address] = true;
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

    modifier signedBy(bytes32 hash, Types.Signature signature, address signer) {
        require(Types.isGenuineSignature(hash, signature, signer));
        _;
    }

    modifier challengeableBySuccessionTradesPair(Types.Trade firstTrade, Types.Trade lastTrade, address wallet, address currency) {
        require(Types.isTradeParty(firstTrade, wallet));
        require(currency == firstTrade.currencies.intended || currency == firstTrade.currencies.conjugate);
        require(hasher.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(Types.isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(Types.isTradeParty(lastTrade, wallet));
        require(currency == lastTrade.currencies.intended || currency == lastTrade.currencies.conjugate);
        require(hasher.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(Types.isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }

    modifier challengeableBySuccessionPaymentsPair(Types.Payment firstPayment, Types.Payment lastPayment, address wallet) {
        require(firstPayment.currency == lastPayment.currency);

        require(Types.isPaymentParty(firstPayment, wallet));
        require(hasher.hashPaymentAsWallet(firstPayment) == firstPayment.seals.wallet.hash);
        require(hasher.hashPaymentAsExchange(firstPayment) == firstPayment.seals.exchange.hash);
        require(Types.isGenuineSignature(firstPayment.seals.wallet.hash, firstPayment.seals.wallet.signature, firstPayment.sender.wallet));
        require(Types.isGenuineSignature(firstPayment.seals.exchange.hash, firstPayment.seals.exchange.signature, owner));

        require(Types.isPaymentParty(lastPayment, wallet));
        require(hasher.hashPaymentAsWallet(lastPayment) == lastPayment.seals.wallet.hash);
        require(hasher.hashPaymentAsExchange(lastPayment) == lastPayment.seals.exchange.hash);
        require(Types.isGenuineSignature(lastPayment.seals.wallet.hash, lastPayment.seals.wallet.signature, lastPayment.sender.wallet));
        require(Types.isGenuineSignature(lastPayment.seals.exchange.hash, lastPayment.seals.exchange.signature, owner));

        _;
    }

    modifier challengeableBySuccessionTradePaymentPair(Types.Trade trade, Types.Payment payment, address wallet, address currency) {
        require(currency == payment.currency);

        require(Types.isTradeParty(trade, wallet));
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);
        require(hasher.hashTrade(trade) == trade.seal.hash);
        require(Types.isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));

        require(Types.isPaymentParty(payment, wallet));
        require(hasher.hashPaymentAsWallet(payment) == payment.seals.wallet.hash);
        require(hasher.hashPaymentAsExchange(payment) == payment.seals.exchange.hash);
        require(Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet));
        require(Types.isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));

        _;
    }

    modifier challengeableByOrderResidualsTradesPair(Types.Trade firstTrade, Types.Trade lastTrade, address wallet, address currency) {
        require(currency == firstTrade.currencies.intended);
        require(hasher.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(Types.isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(currency == lastTrade.currencies.intended);
        require(hasher.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(Types.isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }

    modifier challengeableByDoubleSpentOrderTradesPair(Types.Trade firstTrade, Types.Trade lastTrade) {
        require(hasher.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(Types.isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(hasher.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(Types.isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }
}