/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./SafeMathInt.sol";
//import "./SafeMathUInt.sol";
import "./Configuration.sol";
import "./RevenueFund.sol";
import "./ClientFund.sol";
import "./CommunityVote.sol";
import "./ERC20.sol";
import "./Types.sol";

/**
@title AntiFraud
@notice Host of fraud detection logics
*/
contract AntiFraud {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    Types.Trade public fraudulentTrade;
    Types.Payment public fraudulentPayment;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    Configuration public configuration;
    CommunityVote public communityVote;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event ChallengeFraudulentDealByTradeEvent(Types.Trade trade, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByPaymentEvent(Types.Payment payment, address challenger, address seizedWallet);
    event ChallengeFraudulentDealBySuccessiveTradesEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeFraudulentDealBySuccessivePaymentsEvent(Types.Payment firstPayment, Types.Payment lastPayment, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByPaymentSucceedingTradeEvent(Types.Trade trade, Types.Payment payment, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByTradeSucceedingPaymentEvent(Types.Payment payment, Types.Trade trade, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByTradeOrderResidualsEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeDoubleSpentOrdersEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);
    event ChangeCommunityVoteEvent(CommunityVote oldCommunityVote, CommunityVote newCommunityVote);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public notNullAddress(_owner) {
        owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------

    /// @notice Change the owner of this contract
    /// @param newOwner The address of the new owner
    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        if (newOwner != owner) {
            address oldOwner = owner;

            // Set new owner
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    /// @notice Submit a trade candidate in continuous Fraudulent Deal Challenge (FDC)
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param trade Fraudulent trade candidate
    function challengeFraudulentDealByTrade(Types.Trade trade) public {
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
            seizedWallet = trade.buyer._address;
        if (!genuineBySeller)
            seizedWallet = trade.seller._address;
        if (address(0) != seizedWallet) {
            //            clientFund.seizeDepositedAndSettledBalances(seizedWallet, msg.sender);
            addToSeizedWallets(seizedWallet);
        }

        emit ChallengeFraudulentDealByTradeEvent(trade, msg.sender, seizedWallet);
    }

    /// @notice Submit a payment candidate in continuous Fraudulent Deal Challenge (FDC)
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param payment Fraudulent payment candidate
    function challengeFraudulentDealByPayment(Types.Payment payment) public {
        // Genuineness that does not related to buyer or seller
        bool genuineSeals = isGenuinePaymentSeals(payment);

        // Genuineness affected by source
        bool genuineBySource = isGenuineByPaymentSource(payment) && isGenuinePaymentFee(payment);

        // Genuineness affected by destination
        bool genuineByDestination = isGenuineByPaymentDestination(payment);

        require(!genuineSeals || !genuineBySource || !genuineByDestination);

        configuration.setOperationalModeExit();
        fraudulentPayment = payment;

        address seizedWallet;
        if (!genuineBySource)
            seizedWallet = payment.source._address;
        if (!genuineByDestination)
            seizedWallet = payment.destination._address;
        if (address(0) != seizedWallet) {
            //            clientFund.seizeDepositedAndSettledBalances(seizedWallet, msg.sender);
            addToSeizedWallets(seizedWallet);
        }

        emit ChallengeFraudulentDealByPaymentEvent(payment, msg.sender, seizedWallet);
    }

    /// @notice Submit two trade candidates in continuous Fraudulent Deal Challenge (FDC)
    /// to be tested for succession differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency (0 if ETH)
    function challengeFraudulentDealBySuccessiveTrades(
        Types.Trade firstTrade,
        Types.Trade lastTrade,
        address wallet,
        address currency
    )
    public
    challengeableBySuccessionTradesPair(firstTrade, lastTrade, wallet, currency)
    {
        Types.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer._address ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer._address ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        Types.CurrencyRole firstCurrencyRole = (currency == firstTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);
        Types.CurrencyRole lastCurrencyRole = (currency == lastTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
        || !isGenuineSuccessiveTradesNetFees(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentTrade = lastTrade;

        //            clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeFraudulentDealBySuccessiveTradesEvent(firstTrade, lastTrade, msg.sender, wallet);
    }

    /// @notice Submit two payment candidates in continuous Fraudulent Deal Challenge (FDC)
    /// to be tested for succession differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param firstPayment Reference payment
    /// @param lastPayment Fraudulent payment candidate
    /// @param wallet Address of concerned wallet
    function challengeFraudulentDealBySuccessivePayments(
        Types.Payment firstPayment,
        Types.Payment lastPayment,
        address wallet
    )
    public
    challengeableBySuccessionPaymentsPair(firstPayment, lastPayment, wallet)
    {
        Types.PaymentPartyRole firstPaymentPartyRole = (wallet == firstPayment.source._address ? Types.PaymentPartyRole.Source : Types.PaymentPartyRole.Destination);
        Types.PaymentPartyRole lastPaymentPartyRole = (wallet == lastPayment.source._address ? Types.PaymentPartyRole.Source : Types.PaymentPartyRole.Destination);

        require(isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole));

        require(
            !isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
        || !isGenuineSuccessivePaymentsNetFees(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentPayment = lastPayment;

        //            clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeFraudulentDealBySuccessivePaymentsEvent(firstPayment, lastPayment, msg.sender, wallet);
    }

    /// @notice Submit trade and subsequent payment candidates in continuous Fraudulent Deal Challenge (FDC)
    /// to be tested for succession differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param trade Reference trade
    /// @param payment Fraudulent payment candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency of trade (0 if ETH)
    function challengeFraudulentDealByPaymentSucceedingTrade(
        Types.Trade trade,
        Types.Payment payment,
        address wallet,
        address currency
    )
    public
    challengeableBySuccessionTradePaymentPair(trade, payment, wallet, currency)
    {
        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer._address ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.source._address ? Types.PaymentPartyRole.Source : Types.PaymentPartyRole.Destination);

        require(isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
        || !isGenuineSuccessiveTradePaymentNetFees(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentPayment = payment;

        //            clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeFraudulentDealByPaymentSucceedingTradeEvent(trade, payment, msg.sender, wallet);
    }

    /// @notice Submit payment and subsequent trade candidates in continuous Fraudulent Deal Challenge (FDC)
    /// to be tested for succession differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param payment Reference payment
    /// @param trade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency of trade (0 if ETH)
    function challengeFraudulentDealByTradeSucceedingPayment(
        Types.Payment payment,
        Types.Trade trade,
        address wallet,
        address currency
    )
    public
    challengeableBySuccessionTradePaymentPair(trade, payment, wallet, currency)
    {
        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.source._address ? Types.PaymentPartyRole.Source : Types.PaymentPartyRole.Destination);
        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer._address ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
        || !isGenuineSuccessivePaymentTradeNetFees(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
        );

        configuration.setOperationalModeExit();
        fraudulentTrade = trade;

        //            clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeFraudulentDealByTradeSucceedingPaymentEvent(payment, trade, msg.sender, wallet);
    }

    /// @notice Submit two trade candidates in continuous Fraudulent Deal Challenge (FDC) to be tested for
    /// trade order residual differences
    /// @dev The seizure of client funds remains to be enabled once implemented in ClientFund contract
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency (0 if ETH)
    function challengeFraudulentDealByTradeOrderResiduals(
        Types.Trade firstTrade,
        Types.Trade lastTrade,
        address wallet,
        address currency
    )
    public
    challengeableByOrderResidualsTradesPair(firstTrade, lastTrade, wallet, currency)
    {
        Types.TradePartyRole tradePartyRole = (wallet == firstTrade.buyer._address ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(isSuccessiveTradesPartyNonces(firstTrade, tradePartyRole, lastTrade, tradePartyRole));

        require(!isGenuineSuccessiveTradeOrderResiduals(firstTrade, lastTrade, tradePartyRole));

        configuration.setOperationalModeExit();
        fraudulentTrade = lastTrade;

        //            clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        addToSeizedWallets(wallet);

        emit ChallengeFraudulentDealByTradeOrderResidualsEvent(firstTrade, lastTrade, msg.sender, wallet);
    }

    /// @notice Submit two trade candidates in continuous Double Spent Order Challenge (DSOC)
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

        require(doubleSpentBuyOrder || doubleSpentSellOrder);

        configuration.setOperationalModeExit();
        fraudulentTrade = lastTrade;

        address seizedWallet;
        if (doubleSpentBuyOrder)
            seizedWallet = lastTrade.buyer._address;
        if (doubleSpentSellOrder)
            seizedWallet = lastTrade.seller._address;
        if (address(0) != seizedWallet) {
            //            clientFund.seizeDepositedAndSettledBalances(seizedWallet, msg.sender);
            addToSeizedWallets(seizedWallet);
        }

        emit ChallengeDoubleSpentOrdersEvent(firstTrade, lastTrade, msg.sender, seizedWallet);
    }

    /// @notice Get the seized status of given wallet
    /// @return true if wallet is seized, false otherwise
    function isSeizedWallet(address _address) public view returns (bool) {
        return seizedWalletsMap[_address];
    }

    /// @notice Get the number of wallets whose funds have be seized
    /// @return Number of wallets
    function seizedWalletsCount() public view returns (uint256) {
        return seizedWallets.length;
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
        return (trade.buyer._address != trade.seller._address)
        && (trade.buyer._address != owner)
        && (trade.buyer.balances.intended.current == trade.buyer.balances.intended.previous.add(trade.transfers.intended.single).sub(trade.singleFees.intended))
        && (trade.buyer.balances.conjugate.current == trade.buyer.balances.conjugate.previous.sub(trade.transfers.conjugate.single))
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.current)
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.previous)
        && (trade.buyer.order.residuals.previous >= trade.buyer.order.residuals.current);
    }

    function isGenuineByTradeSeller(Types.Trade trade) private view returns (bool) {
        return (trade.buyer._address != trade.seller._address)
        && (trade.seller._address != owner)
        && (trade.seller.balances.intended.current == trade.seller.balances.intended.previous.sub(trade.transfers.intended.single))
        && (trade.seller.balances.conjugate.current == trade.seller.balances.conjugate.previous.add(trade.transfers.conjugate.single).sub(trade.singleFees.conjugate))
        && (trade.seller.order.amount >= trade.seller.order.residuals.current)
        && (trade.seller.order.amount >= trade.seller.order.residuals.previous)
        && (trade.seller.order.residuals.previous >= trade.seller.order.residuals.current);
    }

    function isGenuineTradeSeal(Types.Trade trade) private view returns (bool) {
        return (Types.hashTrade(trade) == trade.seal.hash)
        && (isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));
    }

    function isGenuinePaymentSeals(Types.Payment payment) private view returns (bool) {
        return (Types.hashPaymentAsParty(payment) == payment.seals.party.hash)
        && (Types.hashPaymentAsExchange(payment) == payment.seals.exchange.hash)
        && (isGenuineSignature(payment.seals.party.hash, payment.seals.party.signature, payment.source._address))
        && (isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));
    }

    function isGenuineSignature(bytes32 hash, Types.Signature signature, address signer) private pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(prefix, hash);
        return ecrecover(prefixedHash, signature.v, signature.r, signature.s) == signer;
    }

    function isGenuinePaymentFee(Types.Payment payment) private view returns (bool) {
        int256 feePartsPer = int256(configuration.PARTS_PER());
        return (payment.singleFee <= payment.amount.mul(configuration.getPaymentFee(payment.blockNumber, 0)).div(feePartsPer))
        && (payment.singleFee == payment.amount.mul(configuration.getPaymentFee(payment.blockNumber, payment.amount)).div(feePartsPer))
        && (payment.singleFee >= payment.amount.mul(configuration.getPaymentMinimumFee(payment.blockNumber)).div(feePartsPer));
    }

    function isGenuineByPaymentSource(Types.Payment payment) private pure returns (bool) {
        return (payment.source._address != payment.destination._address)
        && (payment.source.balances.current == payment.source.balances.previous.sub(payment.transfers.single).sub(payment.singleFee));
    }

    function isGenuineByPaymentDestination(Types.Payment payment) private pure returns (bool) {
        return (payment.source._address != payment.destination._address)
        && (payment.destination.balances.current == payment.destination.balances.previous.add(payment.transfers.single));
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
        uint256 firstNonce = (Types.PaymentPartyRole.Source == firstPaymentPartyRole ? firstPayment.source.nonce : firstPayment.destination.nonce);
        uint256 lastNonce = (Types.PaymentPartyRole.Source == lastPaymentPartyRole ? lastPayment.source.nonce : lastPayment.destination.nonce);
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
        uint256 lastNonce = (Types.PaymentPartyRole.Source == paymentPartyRole ? payment.source.nonce : payment.destination.nonce);
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
        uint256 firstNonce = (Types.PaymentPartyRole.Source == paymentPartyRole ? payment.source.nonce : payment.destination.nonce);
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
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.PaymentPartyRole.Source == firstPaymentPartyRole ? firstPayment.source.balances : firstPayment.destination.balances);
        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.PaymentPartyRole.Source == lastPaymentPartyRole ? lastPayment.source.balances : lastPayment.destination.balances);

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

        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.PaymentPartyRole.Source == paymentPartyRole ? payment.source.balances : payment.destination.balances);

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
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.PaymentPartyRole.Source == paymentPartyRole ? payment.source.balances : payment.destination.balances);

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
        int256 firstNetFee = (Types.PaymentPartyRole.Source == firstPaymentPartyRole ? firstPayment.source.netFee : firstPayment.destination.netFee);

        int256 lastNetFee = (Types.PaymentPartyRole.Source == lastPaymentPartyRole ? lastPayment.source.netFee : lastPayment.destination.netFee);

        int256 lastSingleFee = (Types.PaymentPartyRole.Source == lastPaymentPartyRole ? lastPayment.singleFee : 0);

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

        int256 lastNetFee = (Types.PaymentPartyRole.Source == paymentPartyRole ? payment.source.netFee : payment.destination.netFee);

        int256 lastSingleFee = (Types.PaymentPartyRole.Source == paymentPartyRole ? payment.singleFee : 0);

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
        int256 firstNetFee = (Types.PaymentPartyRole.Source == paymentPartyRole ? payment.source.netFee : payment.destination.netFee);

        Types.IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.netFees : trade.seller.netFees);
        int256 lastNetFee = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        int256 lastSingleFee = 0;
        if (Types.TradePartyRole.Buyer == tradePartyRole && Types.CurrencyRole.Intended == currencyRole)
            lastSingleFee = trade.singleFees.intended;
        else if (Types.TradePartyRole.Seller == tradePartyRole && Types.CurrencyRole.Conjugate == currencyRole)
            lastSingleFee = trade.singleFees.conjugate;

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isTradeParty(Types.Trade trade, address wallet) private pure returns (bool) {
        return wallet == trade.buyer._address || wallet == trade.seller._address;
    }

    function isPaymentParty(Types.Payment payment, address wallet) private pure returns (bool) {
        return wallet == payment.source._address || wallet == payment.destination._address;
    }

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
        }
    }

    /// @notice Change the configuration contract
    /// @param newConfiguration The (address of) Configuration contract instance
    function changeConfiguration(Configuration newConfiguration) public onlyOwner {
        if (newConfiguration != configuration) {
            Configuration oldConfiguration = configuration;
            configuration = newConfiguration;
            emit ChangeConfigurationEvent(oldConfiguration, configuration);
        }
    }

    /// @notice Change the community vote contract
    /// @param newCommunityVote The (address of) CommunityVote contract instance
    function changeCommunityVote(CommunityVote newCommunityVote) public onlyOwner {
        if (newCommunityVote != communityVote) {
            CommunityVote oldCommunityVote = communityVote;
            communityVote = newCommunityVote;
            emit ChangeCommunityVoteEvent(oldCommunityVote, communityVote);
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier signedBy(bytes32 hash, Types.Signature signature, address signer) {
        require(isGenuineSignature(hash, signature, signer));
        _;
    }

    modifier challengeableBySuccessionTradesPair(Types.Trade firstTrade, Types.Trade lastTrade, address wallet, address currency) {
        require(isTradeParty(firstTrade, wallet));
        require(currency == firstTrade.currencies.intended || currency == firstTrade.currencies.conjugate);
        require(Types.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(isTradeParty(lastTrade, wallet));
        require(currency == lastTrade.currencies.intended || currency == lastTrade.currencies.conjugate);
        require(Types.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }

    modifier challengeableBySuccessionPaymentsPair(Types.Payment firstPayment, Types.Payment lastPayment, address wallet) {
        require(firstPayment.currency == lastPayment.currency);

        require(isPaymentParty(firstPayment, wallet));
        require(Types.hashPaymentAsParty(firstPayment) == firstPayment.seals.party.hash);
        require(Types.hashPaymentAsExchange(firstPayment) == firstPayment.seals.exchange.hash);
        require(isGenuineSignature(firstPayment.seals.party.hash, firstPayment.seals.party.signature, firstPayment.source._address));
        require(isGenuineSignature(firstPayment.seals.exchange.hash, firstPayment.seals.exchange.signature, owner));

        require(isPaymentParty(lastPayment, wallet));
        require(Types.hashPaymentAsParty(lastPayment) == lastPayment.seals.party.hash);
        require(Types.hashPaymentAsExchange(lastPayment) == lastPayment.seals.exchange.hash);
        require(isGenuineSignature(lastPayment.seals.party.hash, lastPayment.seals.party.signature, lastPayment.source._address));
        require(isGenuineSignature(lastPayment.seals.exchange.hash, lastPayment.seals.exchange.signature, owner));

        _;
    }

    modifier challengeableBySuccessionTradePaymentPair(Types.Trade trade, Types.Payment payment, address wallet, address currency) {
        require(currency == payment.currency);

        require(isTradeParty(trade, wallet));
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);
        require(Types.hashTrade(trade) == trade.seal.hash);
        require(isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));

        require(isPaymentParty(payment, wallet));
        require(Types.hashPaymentAsParty(payment) == payment.seals.party.hash);
        require(Types.hashPaymentAsExchange(payment) == payment.seals.exchange.hash);
        require(isGenuineSignature(payment.seals.party.hash, payment.seals.party.signature, payment.source._address));
        require(isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));

        _;
    }

    modifier challengeableByOrderResidualsTradesPair(Types.Trade firstTrade, Types.Trade lastTrade, address wallet, address currency) {
        require((wallet == firstTrade.buyer._address && wallet == lastTrade.buyer._address)
            || (wallet == firstTrade.seller._address && wallet == lastTrade.seller._address));

        require((firstTrade.buyer.order.hashes.party == lastTrade.buyer.order.hashes.party)
            || (firstTrade.seller.order.hashes.party == lastTrade.seller.order.hashes.party));

        require(currency == firstTrade.currencies.intended);
        require(Types.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(currency == lastTrade.currencies.intended);
        require(Types.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }

    modifier challengeableByDoubleSpentOrderTradesPair(Types.Trade firstTrade, Types.Trade lastTrade) {
        require(Types.hashTrade(firstTrade) == firstTrade.seal.hash);
        require(isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(Types.hashTrade(lastTrade) == lastTrade.seal.hash);
        require(isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }
}