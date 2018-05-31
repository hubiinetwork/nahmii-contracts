/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import "./Ownable.sol";
import "./Configuration.sol";
import "./RevenueFund.sol";
import "./ClientFund.sol";
import "./CommunityVote.sol";
import "./ERC20.sol";
import "./Types.sol";

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

    Configuration public configuration;
    CommunityVote public communityVote;
    ClientFund public clientFund;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeEvent(Types.Trade trade, address challenger, address seizedWallet);
    event ChallengeByPaymentEvent(Types.Payment payment, address challenger, address seizedWallet);
    event ChallengeBySuccessiveTradesEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeBySuccessivePaymentsEvent(Types.Payment firstPayment, Types.Payment lastPayment, address challenger, address seizedWallet);
    event ChallengeByPaymentSucceedingTradeEvent(Types.Trade trade, Types.Payment payment, address challenger, address seizedWallet);
    event ChallengeByTradeSucceedingPaymentEvent(Types.Payment payment, Types.Trade trade, address challenger, address seizedWallet);
    event ChallengeByTradeOrderResidualsEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeByDoubleSpentOrdersEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address[] doubleSpenderWallets);
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);
    event ChangeCommunityVoteEvent(CommunityVote oldCommunityVote, CommunityVote newCommunityVote);
    event ChangeClientFundEvent(ClientFund oldClientFund, ClientFund newClientFund);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------

    /// @notice Change the configuration contract
    /// @param newConfiguration The (address of) Configuration contract instance
    function changeConfiguration(Configuration newConfiguration)
    public
    onlyOwner
    notNullAddress(newConfiguration)
    notEqualAddresses(newConfiguration, configuration)
    {
        Configuration oldConfiguration = configuration;
        configuration = newConfiguration;
        emit ChangeConfigurationEvent(oldConfiguration, configuration);
    }

    /// @notice Change the community vote contract
    /// @param newCommunityVote The (address of) CommunityVote contract instance
    function changeCommunityVote(CommunityVote newCommunityVote)
    public
    onlyOwner
    notNullAddress(newCommunityVote)
    notEqualAddresses(newCommunityVote, communityVote)
    {
        CommunityVote oldCommunityVote = communityVote;
        communityVote = newCommunityVote;
        emit ChangeCommunityVoteEvent(oldCommunityVote, communityVote);
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
        // Gauge the genuineness of maker and taker fees. Depending on whether maker is buyer or seller
        // this result is baked into genuineness by buyer and seller below.
        bool genuineMakerFee = isGenuineTradeMakerFee(trade);
        bool genuineTakerFee = isGenuineTradeTakerFee(trade);

        // Genuineness that does not related to buyer or seller
        bool genuineSeal = isGenuineTradeSeal(trade);

        // Genuineness affected by buyer
        bool genuineByBuyer = isGenuineByTradeBuyer(trade)
        && (Types.LiquidityRole.Maker == trade.buyer.liquidityRole ? genuineMakerFee : genuineTakerFee);

        // Genuineness affected by seller
        bool genuineBySeller = isGenuineByTradeSeller(trade)
        && (Types.LiquidityRole.Maker == trade.seller.liquidityRole ? genuineMakerFee : genuineTakerFee);

        require(!genuineSeal || !genuineByBuyer || !genuineBySeller);

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
        // Genuineness that does not related to buyer or seller
        bool genuineSeals = isGenuinePaymentSeals(payment);

        // Genuineness affected by sender
        bool genuineBySender = isGenuineByPaymentSender(payment) && isGenuinePaymentFee(payment);

        // Genuineness affected by recipient
        bool genuineByRecipient = isGenuineByPaymentRecipient(payment);

        require(!genuineSeals || !genuineBySender || !genuineByRecipient);

        configuration.setOperationalModeExit();
        fraudulentPayment = payment;

        address seizedWallet;
        if (!genuineBySender)
            seizedWallet = payment.sender.wallet;
        if (!genuineByRecipient)
            seizedWallet = payment.recipient.wallet;
        if (address(0) != seizedWallet) {
            clientFund.seizeDepositedAndSettledBalances(seizedWallet, msg.sender);
            addToSeizedWallets(seizedWallet);
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

        require(isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        Types.CurrencyRole firstCurrencyRole = (currency == firstTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);
        Types.CurrencyRole lastCurrencyRole = (currency == lastTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
        || !isGenuineSuccessiveTradesNetFees(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
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

        require(isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole));

        require(
            !isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
        || !isGenuineSuccessivePaymentsNetFees(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
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

        require(isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
        || !isGenuineSuccessiveTradePaymentNetFees(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
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

        require(isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
        || !isGenuineSuccessivePaymentTradeNetFees(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
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

        require(isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        require(!isGenuineSuccessiveTradeOrderResiduals(firstTrade, lastTrade, firstTradePartyRole));

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
    function challengeDoubleSpentOrders(
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

    function isGenuineTradeMakerFee(Types.Trade trade) private view returns (bool) {
        int256 feePartsPer = configuration.PARTS_PER();
        int256 discountTier = int256(Types.LiquidityRole.Maker == trade.buyer.liquidityRole ? trade.buyer.rollingVolume : trade.seller.rollingVolume);
        return (trade.singleFees.intended <= trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
        && (trade.singleFees.intended == trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
        && (trade.singleFees.intended >= trade.amount.mul(configuration.getTradeMakerMinimumFee(trade.blockNumber)).div(feePartsPer));
    }

    function isGenuineTradeTakerFee(Types.Trade trade) private view returns (bool) {
        int256 feePartsPer = configuration.PARTS_PER();
        int256 amountConjugate = trade.amount.div(trade.rate);
        int256 discountTier = int256(Types.LiquidityRole.Taker == trade.buyer.liquidityRole ? trade.buyer.rollingVolume : trade.seller.rollingVolume);
        return (trade.singleFees.conjugate <= amountConjugate.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
        && (trade.singleFees.conjugate == amountConjugate.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
        && (trade.singleFees.conjugate >= amountConjugate.mul(configuration.getTradeTakerMinimumFee(trade.blockNumber)).div(feePartsPer));
    }

    function isGenuineByTradeBuyer(Types.Trade trade) private view returns (bool) {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (trade.buyer.wallet != owner)
        && (trade.buyer.balances.intended.current == trade.buyer.balances.intended.previous.add(trade.transfers.intended.single).sub(trade.singleFees.intended))
        && (trade.buyer.balances.conjugate.current == trade.buyer.balances.conjugate.previous.sub(trade.transfers.conjugate.single))
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.current)
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.previous)
        && (trade.buyer.order.residuals.previous >= trade.buyer.order.residuals.current);
    }

    function isGenuineByTradeSeller(Types.Trade trade) private view returns (bool) {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (trade.seller.wallet != owner)
        && (trade.seller.balances.intended.current == trade.seller.balances.intended.previous.sub(trade.transfers.intended.single))
        && (trade.seller.balances.conjugate.current == trade.seller.balances.conjugate.previous.add(trade.transfers.conjugate.single).sub(trade.singleFees.conjugate))
        && (trade.seller.order.amount >= trade.seller.order.residuals.current)
        && (trade.seller.order.amount >= trade.seller.order.residuals.previous)
        && (trade.seller.order.residuals.previous >= trade.seller.order.residuals.current);
    }

    function isGenuineTradeSeal(Types.Trade trade) private view returns (bool) {
        return (Types.hashTrade(trade) == trade.seal.hash)
        && (Types.isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));
    }

    function isGenuinePaymentSeals(Types.Payment payment) private view returns (bool) {
        return (Types.hashPaymentAsWallet(payment) == payment.seals.wallet.hash)
        && (Types.hashPaymentAsExchange(payment) == payment.seals.exchange.hash)
        && (Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet))
        && (Types.isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));
    }

    function isGenuinePaymentFee(Types.Payment payment) private view returns (bool) {
        int256 feePartsPer = int256(configuration.PARTS_PER());
        return (payment.singleFee <= payment.amount.mul(configuration.getPaymentFee(payment.blockNumber, 0)).div(feePartsPer))
        && (payment.singleFee == payment.amount.mul(configuration.getPaymentFee(payment.blockNumber, payment.amount)).div(feePartsPer))
        && (payment.singleFee >= payment.amount.mul(configuration.getPaymentMinimumFee(payment.blockNumber)).div(feePartsPer));
    }

    function isGenuineByPaymentSender(Types.Payment payment) private pure returns (bool) {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.sender.balances.current == payment.sender.balances.previous.sub(payment.transfers.single).sub(payment.singleFee));
    }

    function isGenuineByPaymentRecipient(Types.Payment payment) private pure returns (bool) {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.recipient.balances.current == payment.recipient.balances.previous.add(payment.transfers.single));
    }

    function isSuccessiveTradesPartyNonces(
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole
    )
    private
    pure returns (bool)
    {
        uint256 firstNonce = (Types.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.nonce : firstTrade.seller.nonce);
        uint256 lastNonce = (Types.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.nonce : lastTrade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentsPartyNonces(
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
    )
    private
    pure returns (bool)
    {
        uint256 firstNonce = (Types.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.nonce : firstPayment.recipient.nonce);
        uint256 lastNonce = (Types.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.nonce : lastPayment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessiveTradePaymentPartyNonces(
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
    )
    private
    pure returns (bool)
    {
        uint256 firstNonce = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        uint256 lastNonce = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentTradePartyNonces(
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole
    )
    private
    pure returns (bool)
    {
        uint256 firstNonce = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        uint256 lastNonce = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isGenuineSuccessiveTradesBalances(
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.CurrencyRole firstCurrencyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole,
        Types.CurrencyRole lastCurrencyRole
    )
    private
    pure
    returns (bool)
    {
        Types.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (Types.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.balances : firstTrade.seller.balances);
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.CurrencyRole.Intended == firstCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        Types.IntendedConjugateCurrentPreviousInt256 memory lastIntendedConjugateCurrentPreviousBalances = (Types.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.balances : lastTrade.seller.balances);
        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.CurrencyRole.Intended == lastCurrencyRole ? lastIntendedConjugateCurrentPreviousBalances.intended : lastIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentsBalances(
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
    )
    private
    pure
    returns (bool)
    {
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.balances : firstPayment.recipient.balances);
        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.balances : lastPayment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradePaymentBalances(
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole currencyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
    )
    private
    pure
    returns (bool)
    {
        Types.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentTradeBalances(
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole currencyRole
    )
    private
    pure
    returns (bool)
    {
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        Types.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradesNetFees(
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.CurrencyRole firstCurrencyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole,
        Types.CurrencyRole lastCurrencyRole
    )
    private
    pure
    returns (bool)
    {
        Types.IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.netFees : firstTrade.seller.netFees);
        int256 firstNetFee = (Types.CurrencyRole.Intended == firstCurrencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        Types.IntendedConjugateInt256 memory lastIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.netFees : lastTrade.seller.netFees);
        int256 lastNetFee = (Types.CurrencyRole.Intended == lastCurrencyRole ? lastIntendedConjugateNetFees.intended : lastIntendedConjugateNetFees.conjugate);

        int256 lastSingleFee = 0;
        if (Types.TradePartyRole.Buyer == lastTradePartyRole && Types.CurrencyRole.Intended == lastCurrencyRole)
            lastSingleFee = lastTrade.singleFees.intended;
        else if (Types.TradePartyRole.Seller == lastTradePartyRole && Types.CurrencyRole.Conjugate == lastCurrencyRole)
            lastSingleFee = lastTrade.singleFees.conjugate;

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        Types.Trade firstTrade,
        Types.Trade lastTrade,
        Types.TradePartyRole tradePartyRole
    )
    private
    pure
    returns (bool)
    {
        int256 firstCurrentResiduals;
        int256 lastPreviousResiduals;
        (firstCurrentResiduals, lastPreviousResiduals) = (Types.TradePartyRole.Buyer == tradePartyRole) ? (firstTrade.buyer.order.residuals.current, lastTrade.buyer.order.residuals.previous) : (firstTrade.seller.order.residuals.current, lastTrade.seller.order.residuals.previous);

        return firstCurrentResiduals == lastPreviousResiduals;
    }

    function isGenuineSuccessivePaymentsNetFees(
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
    )
    private
    pure
    returns (bool)
    {
        int256 firstNetFee = (Types.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.netFee : firstPayment.recipient.netFee);

        int256 lastNetFee = (Types.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.netFee : lastPayment.recipient.netFee);

        int256 lastSingleFee = (Types.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.singleFee : 0);

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessiveTradePaymentNetFees(
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole currencyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
    )
    private
    pure
    returns (bool)
    {
        Types.IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.netFees : trade.seller.netFees);
        int256 firstNetFee = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        int256 lastNetFee = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.netFee : payment.recipient.netFee);

        int256 lastSingleFee = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.singleFee : 0);

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessivePaymentTradeNetFees(
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole currencyRole
    )
    private
    pure
    returns (bool)
    {
        int256 firstNetFee = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.netFee : payment.recipient.netFee);

        Types.IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.netFees : trade.seller.netFees);
        int256 lastNetFee = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        int256 lastSingleFee = 0;
        if (Types.TradePartyRole.Buyer == tradePartyRole && Types.CurrencyRole.Intended == currencyRole)
            lastSingleFee = trade.singleFees.intended;
        else if (Types.TradePartyRole.Seller == tradePartyRole && Types.CurrencyRole.Conjugate == currencyRole)
            lastSingleFee = trade.singleFees.conjugate;

        return lastNetFee == firstNetFee.add(lastSingleFee);
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
        require(Types.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(Types.isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(Types.isTradeParty(lastTrade, wallet));
        require(currency == lastTrade.currencies.intended || currency == lastTrade.currencies.conjugate);
        require(Types.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(Types.isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }

    modifier challengeableBySuccessionPaymentsPair(Types.Payment firstPayment, Types.Payment lastPayment, address wallet) {
        require(firstPayment.currency == lastPayment.currency);

        require(Types.isPaymentParty(firstPayment, wallet));
        require(Types.hashPaymentAsWallet(firstPayment) == firstPayment.seals.wallet.hash);
        require(Types.hashPaymentAsExchange(firstPayment) == firstPayment.seals.exchange.hash);
        require(Types.isGenuineSignature(firstPayment.seals.wallet.hash, firstPayment.seals.wallet.signature, firstPayment.sender.wallet));
        require(Types.isGenuineSignature(firstPayment.seals.exchange.hash, firstPayment.seals.exchange.signature, owner));

        require(Types.isPaymentParty(lastPayment, wallet));
        require(Types.hashPaymentAsWallet(lastPayment) == lastPayment.seals.wallet.hash);
        require(Types.hashPaymentAsExchange(lastPayment) == lastPayment.seals.exchange.hash);
        require(Types.isGenuineSignature(lastPayment.seals.wallet.hash, lastPayment.seals.wallet.signature, lastPayment.sender.wallet));
        require(Types.isGenuineSignature(lastPayment.seals.exchange.hash, lastPayment.seals.exchange.signature, owner));

        _;
    }

    modifier challengeableBySuccessionTradePaymentPair(Types.Trade trade, Types.Payment payment, address wallet, address currency) {
        require(currency == payment.currency);

        require(Types.isTradeParty(trade, wallet));
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);
        require(Types.hashTrade(trade) == trade.seal.hash);
        require(Types.isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));

        require(Types.isPaymentParty(payment, wallet));
        require(Types.hashPaymentAsWallet(payment) == payment.seals.wallet.hash);
        require(Types.hashPaymentAsExchange(payment) == payment.seals.exchange.hash);
        require(Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet));
        require(Types.isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));

        _;
    }

    modifier challengeableByOrderResidualsTradesPair(Types.Trade firstTrade, Types.Trade lastTrade, address wallet, address currency) {
        require(currency == firstTrade.currencies.intended);
        require(Types.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(Types.isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(currency == lastTrade.currencies.intended);
        require(Types.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(Types.isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }

    modifier challengeableByDoubleSpentOrderTradesPair(Types.Trade firstTrade, Types.Trade lastTrade) {
        require(Types.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(Types.isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(Types.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(Types.isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }
}