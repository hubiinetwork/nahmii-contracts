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
import "./SafeMathUInt.sol";
import "./Configuration.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract Exchange {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum OperationalMode {Normal, Exit}
    enum LiquidityRole {Maker, Taker}
    enum CurrencyRole {Intended, Conjugate}
    enum TradePartyRole {Buyer, Seller}
    enum PaymentPartyRole {Source, Destination}

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct CurrentPreviousInt256 {
        int256 current;
        int256 previous;
    }

    struct SingleNetInt256 {
        int256 single;
        int256 net;
    }

    struct IntendedConjugateCurrentPreviousInt256 {
        CurrentPreviousInt256 intended;
        CurrentPreviousInt256 conjugate;
    }

    struct IntendedConjugateSingleNetInt256 {
        SingleNetInt256 intended;
        SingleNetInt256 conjugate;
    }

    struct IntendedConjugateAddress {
        address intended;
        address conjugate;
    }

    struct IntendedConjugateInt256 {
        int256 intended;
        int256 conjugate;
    }

    struct PartyExchangeHashes {
        bytes32 party;
        bytes32 exchange;
    }

    struct Order {
        int256 amount;
        PartyExchangeHashes hashes;
        CurrentPreviousInt256 residuals;
    }

    struct Signature {
        bytes32 r;
        bytes32 s;
        uint8 v;
    }

    struct Seal {
        bytes32 hash;
        Signature signature;
    }

    struct PartyExchangeSeals {
        Seal party;
        Seal exchange;
    }

    struct TradeParty {
        address _address;
        uint256 nonce;
        uint256 rollingVolume;
        LiquidityRole liquidityRole;
        Order order;
        IntendedConjugateCurrentPreviousInt256 balances;
        IntendedConjugateInt256 netFees;
    }

    struct Trade {
        uint256 nonce;
        bool immediateSettlement;
        int256 amount;
        int256 rate;

        IntendedConjugateAddress currencies;

        TradeParty buyer;
        TradeParty seller;

        // Intended transfer is always in direction from seller to buyer
        // Conjugate transfer is always in direction from buyer to seller
        IntendedConjugateSingleNetInt256 transfers;

        IntendedConjugateInt256 singleFees;

        Seal seal;
        uint256 blockNumber;
    }

    struct PaymentParty {
        address _address;
        uint256 nonce;
        CurrentPreviousInt256 balances;
        int256 netFee;
    }

    struct Payment {
        uint256 nonce;
        bool immediateSettlement;
        int256 amount;

        address currency;

        PaymentParty source;
        PaymentParty destination;

        // Transfer is always in direction from source to destination
        SingleNetInt256 transfers;

        int256 singleFee;

        PartyExchangeSeals seals;
        uint256 blockNumber;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    OperationalMode public operationalMode = OperationalMode.Normal;

    Trade public fraudulentTrade;
    Payment public fraudulentPayment;

    address[] public seizedWallets;
    mapping(address => bool) seizedWalletsMap;

    Configuration public configuration;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event ChallengeFraudulentDealByTradeEvent(Trade trade, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByPaymentEvent(Payment payment, address challenger, address seizedWallet);
    event ChallengeFraudulentDealBySuccessiveTradesEvent(Trade firstTrade, Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeFraudulentDealBySuccessivePaymentsEvent(Payment firstPayment, Payment lastPayment, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByPaymentSucceedingTradeEvent(Trade trade, Payment payment, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByTradeSucceedingPaymentEvent(Payment payment, Trade trade, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByTradeOrderResidualsEvent(Trade firstTrade, Trade lastTrade, address challenger, address seizedWallet);
    event ChallengeDoubleSpentOrdersEvent(Trade firstTrade, Trade lastTrade, address challenger, address seizedWallet);
    event SettleDealAsTradeEvent(Trade trade, address wallet);
    event SettleDealAsPaymentEvent(Payment payment, address wallet);
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);

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
    function challengeFraudulentDealByTrade(Trade trade) public {
        // Gauge the genuineness of maker and taker fees. Depending on whether maker is buyer or seller
        // this result is baked into genuineness by buyer and seller below.
        bool genuineMakerFee = isGenuineTradeMakerFee(trade);
        bool genuineTakerFee = isGenuineTradeTakerFee(trade);

        // Genuineness that does not related to buyer or seller
        bool genuineSeal = isGenuineTradeSeal(trade);

        // Genuineness affected by buyer
        bool genuineByBuyer = isGenuineByTradeBuyer(trade)
        && (LiquidityRole.Maker == trade.buyer.liquidityRole ? genuineMakerFee : genuineTakerFee);

        // Genuineness affected by seller
        bool genuineBySeller = isGenuineByTradeSeller(trade)
        && (LiquidityRole.Maker == trade.seller.liquidityRole ? genuineMakerFee : genuineTakerFee);

        require(!genuineSeal || !genuineByBuyer || !genuineBySeller);

        operationalMode = OperationalMode.Exit;
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
    function challengeFraudulentDealByPayment(Payment payment) public {
        // Genuineness that does not related to buyer or seller
        bool genuineSeals = isGenuinePaymentSeals(payment);

        // Genuineness affected by source
        bool genuineBySource = isGenuineByPaymentSource(payment) && isGenuinePaymentFee(payment);

        // Genuineness affected by destination
        bool genuineByDestination = isGenuineByPaymentDestination(payment);

        require(!genuineSeals || !genuineBySource || !genuineByDestination);

        operationalMode = OperationalMode.Exit;
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
        Trade firstTrade,
        Trade lastTrade,
        address wallet,
        address currency
    )
    public
    challengeableBySuccessionTradesPair(firstTrade, lastTrade, wallet, currency)
    {
        TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer._address ? TradePartyRole.Buyer : TradePartyRole.Seller);
        TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer._address ? TradePartyRole.Buyer : TradePartyRole.Seller);

        require(isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        CurrencyRole firstCurrencyRole = (currency == firstTrade.currencies.intended ? CurrencyRole.Intended : CurrencyRole.Conjugate);
        CurrencyRole lastCurrencyRole = (currency == lastTrade.currencies.intended ? CurrencyRole.Intended : CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
        || !isGenuineSuccessiveTradesNetFees(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
        );

        operationalMode = OperationalMode.Exit;
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
        Payment firstPayment,
        Payment lastPayment,
        address wallet
    )
    public
    challengeableBySuccessionPaymentsPair(firstPayment, lastPayment, wallet)
    {
        PaymentPartyRole firstPaymentPartyRole = (wallet == firstPayment.source._address ? PaymentPartyRole.Source : PaymentPartyRole.Destination);
        PaymentPartyRole lastPaymentPartyRole = (wallet == lastPayment.source._address ? PaymentPartyRole.Source : PaymentPartyRole.Destination);

        require(isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole));

        require(
            !isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
        || !isGenuineSuccessivePaymentsNetFees(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
        );

        operationalMode = OperationalMode.Exit;
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
        Trade trade,
        Payment payment,
        address wallet,
        address currency
    )
    public
    challengeableBySuccessionTradePaymentPair(trade, payment, wallet, currency)
    {
        TradePartyRole tradePartyRole = (wallet == trade.buyer._address ? TradePartyRole.Buyer : TradePartyRole.Seller);
        PaymentPartyRole paymentPartyRole = (wallet == payment.source._address ? PaymentPartyRole.Source : PaymentPartyRole.Destination);

        require(isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        CurrencyRole currencyRole = (currency == trade.currencies.intended ? CurrencyRole.Intended : CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
        || !isGenuineSuccessiveTradePaymentNetFees(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
        );

        operationalMode = OperationalMode.Exit;
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
        Payment payment,
        Trade trade,
        address wallet,
        address currency
    )
    public
    challengeableBySuccessionTradePaymentPair(trade, payment, wallet, currency)
    {
        PaymentPartyRole paymentPartyRole = (wallet == payment.source._address ? PaymentPartyRole.Source : PaymentPartyRole.Destination);
        TradePartyRole tradePartyRole = (wallet == trade.buyer._address ? TradePartyRole.Buyer : TradePartyRole.Seller);

        require(isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        CurrencyRole currencyRole = (currency == trade.currencies.intended ? CurrencyRole.Intended : CurrencyRole.Conjugate);

        require(
            !isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
        || !isGenuineSuccessivePaymentTradeNetFees(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
        );

        operationalMode = OperationalMode.Exit;
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
        Trade firstTrade,
        Trade lastTrade,
        address wallet,
        address currency
    )
    public
    challengeableByOrderResidualsTradesPair(firstTrade, lastTrade, wallet, currency)
    {
        TradePartyRole tradePartyRole = (wallet == firstTrade.buyer._address ? TradePartyRole.Buyer : TradePartyRole.Seller);

        require(isSuccessiveTradesPartyNonces(firstTrade, tradePartyRole, lastTrade, tradePartyRole));

        require(!isGenuineSuccessiveTradeOrderResiduals(firstTrade, lastTrade, tradePartyRole));

        operationalMode = OperationalMode.Exit;
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
        Trade firstTrade,
        Trade lastTrade
    )
    public
    challengeableByDoubleSpentOrderTradesPair(firstTrade, lastTrade)
    {
        bool doubleSpentBuyOrder = firstTrade.buyer.order.hashes.exchange == lastTrade.buyer.order.hashes.exchange;
        bool doubleSpentSellOrder = firstTrade.seller.order.hashes.exchange == lastTrade.seller.order.hashes.exchange;

        require(doubleSpentBuyOrder || doubleSpentSellOrder);

        operationalMode = OperationalMode.Exit;
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

    function settleDealAsTrade(Trade trade, address wallet) public {

        emit SettleDealAsTradeEvent(trade, wallet);
    }

    function settleDealAsPayment(Payment payment, address wallet) public {

        emit SettleDealAsPaymentEvent(payment, wallet);
    }

    function isGenuineTradeMakerFee(Trade trade) private view returns (bool) {
        int256 feePartsPer = configuration.PARTS_PER();
        int256 discountTier = int256(LiquidityRole.Maker == trade.buyer.liquidityRole ? trade.buyer.rollingVolume : trade.seller.rollingVolume);
        return (trade.singleFees.intended <= trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
        && (trade.singleFees.intended == trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
        && (trade.singleFees.intended >= trade.amount.mul(configuration.getTradeMakerMinimumFee(trade.blockNumber)).div(feePartsPer));
    }

    function isGenuineTradeTakerFee(Trade trade) private view returns (bool) {
        int256 feePartsPer = configuration.PARTS_PER();
        int256 amountConjugate = trade.amount.div(trade.rate);
        int256 discountTier = int256(LiquidityRole.Taker == trade.buyer.liquidityRole ? trade.buyer.rollingVolume : trade.seller.rollingVolume);
        return (trade.singleFees.conjugate <= amountConjugate.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
        && (trade.singleFees.conjugate == amountConjugate.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
        && (trade.singleFees.conjugate >= amountConjugate.mul(configuration.getTradeTakerMinimumFee(trade.blockNumber)).div(feePartsPer));
    }

    function isGenuineByTradeBuyer(Trade trade) private view returns (bool) {
        return (trade.buyer._address != trade.seller._address)
        && (trade.buyer._address != owner)
        && (trade.buyer.balances.intended.current == trade.buyer.balances.intended.previous.add(trade.transfers.intended.single).sub(trade.singleFees.intended))
        && (trade.buyer.balances.conjugate.current == trade.buyer.balances.conjugate.previous.sub(trade.transfers.conjugate.single))
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.current)
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.previous)
        && (trade.buyer.order.residuals.previous >= trade.buyer.order.residuals.current);
    }

    function isGenuineByTradeSeller(Trade trade) private view returns (bool) {
        return (trade.buyer._address != trade.seller._address)
        && (trade.seller._address != owner)
        && (trade.seller.balances.intended.current == trade.seller.balances.intended.previous.sub(trade.transfers.intended.single))
        && (trade.seller.balances.conjugate.current == trade.seller.balances.conjugate.previous.add(trade.transfers.conjugate.single).sub(trade.singleFees.conjugate))
        && (trade.seller.order.amount >= trade.seller.order.residuals.current)
        && (trade.seller.order.amount >= trade.seller.order.residuals.previous)
        && (trade.seller.order.residuals.previous >= trade.seller.order.residuals.current);
    }

    function isGenuineTradeSeal(Trade trade) private view returns (bool) {
        return (hashTrade(trade) == trade.seal.hash)
        && (isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));
    }

    function isGenuinePaymentSeals(Payment payment) private view returns (bool) {
        return (hashPaymentAsParty(payment) == payment.seals.party.hash)
        && (hashPaymentAsExchange(payment) == payment.seals.exchange.hash)
        && (isGenuineSignature(payment.seals.party.hash, payment.seals.party.signature, payment.source._address))
        && (isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));
    }

    function isGenuineSignature(bytes32 hash, Signature signature, address signer) private pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(prefix, hash);
        return ecrecover(prefixedHash, signature.v, signature.r, signature.s) == signer;
    }

    function isGenuinePaymentFee(Payment payment) private view returns (bool) {
        int256 feePartsPer = int256(configuration.PARTS_PER());
        return (payment.singleFee <= payment.amount.mul(configuration.getPaymentFee(payment.blockNumber, 0)).div(feePartsPer))
        && (payment.singleFee == payment.amount.mul(configuration.getPaymentFee(payment.blockNumber, payment.amount)).div(feePartsPer))
        && (payment.singleFee >= payment.amount.mul(configuration.getPaymentMinimumFee(payment.blockNumber)).div(feePartsPer));
    }

    function isGenuineByPaymentSource(Payment payment) private pure returns (bool) {
        return (payment.source._address != payment.destination._address)
        && (payment.source.balances.current == payment.source.balances.previous.sub(payment.transfers.single).sub(payment.singleFee));
    }

    function isGenuineByPaymentDestination(Payment payment) private pure returns (bool) {
        return (payment.source._address != payment.destination._address)
        && (payment.destination.balances.current == payment.destination.balances.previous.add(payment.transfers.single));
    }

    function isSuccessiveTradesPartyNonces(
        Trade firstTrade,
        TradePartyRole firstTradePartyRole,
        Trade lastTrade,
        TradePartyRole lastTradePartyRole
    )
    private
    pure returns (bool)
    {
        uint256 firstNonce = (TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.nonce : firstTrade.seller.nonce);
        uint256 lastNonce = (TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.nonce : lastTrade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentsPartyNonces(
        Payment firstPayment,
        PaymentPartyRole firstPaymentPartyRole,
        Payment lastPayment,
        PaymentPartyRole lastPaymentPartyRole
    )
    private
    pure returns (bool)
    {
        uint256 firstNonce = (PaymentPartyRole.Source == firstPaymentPartyRole ? firstPayment.source.nonce : firstPayment.destination.nonce);
        uint256 lastNonce = (PaymentPartyRole.Source == lastPaymentPartyRole ? lastPayment.source.nonce : lastPayment.destination.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessiveTradePaymentPartyNonces(
        Trade trade,
        TradePartyRole tradePartyRole,
        Payment payment,
        PaymentPartyRole paymentPartyRole
    )
    private
    pure returns (bool)
    {
        uint256 firstNonce = (TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        uint256 lastNonce = (PaymentPartyRole.Source == paymentPartyRole ? payment.source.nonce : payment.destination.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentTradePartyNonces(
        Payment payment,
        PaymentPartyRole paymentPartyRole,
        Trade trade,
        TradePartyRole tradePartyRole
    )
    private
    pure returns (bool)
    {
        uint256 firstNonce = (PaymentPartyRole.Source == paymentPartyRole ? payment.source.nonce : payment.destination.nonce);
        uint256 lastNonce = (TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isGenuineSuccessiveTradesBalances(
        Trade firstTrade,
        TradePartyRole firstTradePartyRole,
        CurrencyRole firstCurrencyRole,
        Trade lastTrade,
        TradePartyRole lastTradePartyRole,
        CurrencyRole lastCurrencyRole
    )
    private
    pure
    returns (bool)
    {
        IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.balances : firstTrade.seller.balances);
        CurrentPreviousInt256 memory firstCurrentPreviousBalances = (CurrencyRole.Intended == firstCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        IntendedConjugateCurrentPreviousInt256 memory lastIntendedConjugateCurrentPreviousBalances = (TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.balances : lastTrade.seller.balances);
        CurrentPreviousInt256 memory lastCurrentPreviousBalances = (CurrencyRole.Intended == lastCurrencyRole ? lastIntendedConjugateCurrentPreviousBalances.intended : lastIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentsBalances(
        Payment firstPayment,
        PaymentPartyRole firstPaymentPartyRole,
        Payment lastPayment,
        PaymentPartyRole lastPaymentPartyRole
    )
    private
    pure
    returns (bool)
    {
        CurrentPreviousInt256 memory firstCurrentPreviousBalances = (PaymentPartyRole.Source == firstPaymentPartyRole ? firstPayment.source.balances : firstPayment.destination.balances);
        CurrentPreviousInt256 memory lastCurrentPreviousBalances = (PaymentPartyRole.Source == lastPaymentPartyRole ? lastPayment.source.balances : lastPayment.destination.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradePaymentBalances(
        Trade trade,
        TradePartyRole tradePartyRole,
        CurrencyRole currencyRole,
        Payment payment,
        PaymentPartyRole paymentPartyRole
    )
    private
    pure
    returns (bool)
    {
        IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        CurrentPreviousInt256 memory firstCurrentPreviousBalances = (CurrencyRole.Intended == currencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        CurrentPreviousInt256 memory lastCurrentPreviousBalances = (PaymentPartyRole.Source == paymentPartyRole ? payment.source.balances : payment.destination.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentTradeBalances(
        Payment payment,
        PaymentPartyRole paymentPartyRole,
        Trade trade,
        TradePartyRole tradePartyRole,
        CurrencyRole currencyRole
    )
    private
    pure
    returns (bool)
    {
        CurrentPreviousInt256 memory firstCurrentPreviousBalances = (PaymentPartyRole.Source == paymentPartyRole ? payment.source.balances : payment.destination.balances);

        IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        CurrentPreviousInt256 memory lastCurrentPreviousBalances = (CurrencyRole.Intended == currencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradesNetFees(
        Trade firstTrade,
        TradePartyRole firstTradePartyRole,
        CurrencyRole firstCurrencyRole,
        Trade lastTrade,
        TradePartyRole lastTradePartyRole,
        CurrencyRole lastCurrencyRole
    )
    private
    pure
    returns (bool)
    {
        IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.netFees : firstTrade.seller.netFees);
        int256 firstNetFee = (CurrencyRole.Intended == firstCurrencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        IntendedConjugateInt256 memory lastIntendedConjugateNetFees = (TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.netFees : lastTrade.seller.netFees);
        int256 lastNetFee = (CurrencyRole.Intended == lastCurrencyRole ? lastIntendedConjugateNetFees.intended : lastIntendedConjugateNetFees.conjugate);

        int256 lastSingleFee = 0;
        if (TradePartyRole.Buyer == lastTradePartyRole && CurrencyRole.Intended == lastCurrencyRole)
            lastSingleFee = lastTrade.singleFees.intended;
        else if (TradePartyRole.Seller == lastTradePartyRole && CurrencyRole.Conjugate == lastCurrencyRole)
            lastSingleFee = lastTrade.singleFees.conjugate;

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        Trade firstTrade,
        Trade lastTrade,
        TradePartyRole tradePartyRole
    )
    private
    pure
    returns (bool)
    {
        int256 firstCurrentResiduals;
        int256 lastPreviousResiduals;
        (firstCurrentResiduals, lastPreviousResiduals) = (TradePartyRole.Buyer == tradePartyRole) ? (firstTrade.buyer.order.residuals.current, lastTrade.buyer.order.residuals.previous) : (firstTrade.seller.order.residuals.current, lastTrade.seller.order.residuals.previous);

        return firstCurrentResiduals == lastPreviousResiduals;
    }

    function isGenuineSuccessivePaymentsNetFees(
        Payment firstPayment,
        PaymentPartyRole firstPaymentPartyRole,
        Payment lastPayment,
        PaymentPartyRole lastPaymentPartyRole
    )
    private
    pure
    returns (bool)
    {
        int256 firstNetFee = (PaymentPartyRole.Source == firstPaymentPartyRole ? firstPayment.source.netFee : firstPayment.destination.netFee);

        int256 lastNetFee = (PaymentPartyRole.Source == lastPaymentPartyRole ? lastPayment.source.netFee : lastPayment.destination.netFee);

        int256 lastSingleFee = (PaymentPartyRole.Source == lastPaymentPartyRole ? lastPayment.singleFee : 0);

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessiveTradePaymentNetFees(
        Trade trade,
        TradePartyRole tradePartyRole,
        CurrencyRole currencyRole,
        Payment payment,
        PaymentPartyRole paymentPartyRole
    )
    private
    pure
    returns (bool)
    {
        IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (TradePartyRole.Buyer == tradePartyRole ? trade.buyer.netFees : trade.seller.netFees);
        int256 firstNetFee = (CurrencyRole.Intended == currencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        int256 lastNetFee = (PaymentPartyRole.Source == paymentPartyRole ? payment.source.netFee : payment.destination.netFee);

        int256 lastSingleFee = (PaymentPartyRole.Source == paymentPartyRole ? payment.singleFee : 0);

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessivePaymentTradeNetFees(
        Payment payment,
        PaymentPartyRole paymentPartyRole,
        Trade trade,
        TradePartyRole tradePartyRole,
        CurrencyRole currencyRole
    )
    private
    pure
    returns (bool)
    {
        int256 firstNetFee = (PaymentPartyRole.Source == paymentPartyRole ? payment.source.netFee : payment.destination.netFee);

        IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (TradePartyRole.Buyer == tradePartyRole ? trade.buyer.netFees : trade.seller.netFees);
        int256 lastNetFee = (CurrencyRole.Intended == currencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        int256 lastSingleFee = 0;
        if (TradePartyRole.Buyer == tradePartyRole && CurrencyRole.Intended == currencyRole)
            lastSingleFee = trade.singleFees.intended;
        else if (TradePartyRole.Seller == tradePartyRole && CurrencyRole.Conjugate == currencyRole)
            lastSingleFee = trade.singleFees.conjugate;

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
        }
    }

    // TODO Implement fully
    function hashTrade(Trade trade) private pure returns (bytes32) {
        return keccak256(bytes32(trade.nonce));
    }

    // TODO Implement fully
    function hashPaymentAsParty(Payment payment) private pure returns (bytes32) {
        return keccak256(bytes32(payment.nonce));
    }

    // TODO Implement fully
    function hashPaymentAsExchange(Payment payment) private pure returns (bytes32) {
        return keccak256(bytes32(payment.nonce));
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

    function isSignedByOwner(bytes32 hash, Signature signature) private view returns (bool) {
        address signer = ecrecover(hash, signature.v, signature.r, signature.s);
        return signer == owner;
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

    modifier signedByOwner(bytes32 hash, Signature signature) {
        require(isGenuineSignature(hash, signature, owner));
        _;
    }

    modifier challengeableBySuccessionTradesPair(Trade firstTrade, Trade lastTrade, address wallet, address currency) {
        require(wallet == firstTrade.buyer._address || wallet == firstTrade.seller._address);
        require(currency == firstTrade.currencies.intended || currency == firstTrade.currencies.conjugate);
        require(hashTrade(firstTrade) == firstTrade.seal.hash);
        require(isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(wallet == lastTrade.buyer._address || wallet == lastTrade.seller._address);
        require(currency == lastTrade.currencies.intended || currency == lastTrade.currencies.conjugate);
        require(hashTrade(lastTrade) == lastTrade.seal.hash);
        require(isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }

    modifier challengeableBySuccessionPaymentsPair(Payment firstPayment, Payment lastPayment, address wallet) {
        require(firstPayment.currency == lastPayment.currency);

        require(wallet == firstPayment.source._address || wallet == firstPayment.destination._address);
        require(hashPaymentAsParty(firstPayment) == firstPayment.seals.party.hash);
        require(hashPaymentAsExchange(firstPayment) == firstPayment.seals.exchange.hash);
        require(isGenuineSignature(firstPayment.seals.party.hash, firstPayment.seals.party.signature, firstPayment.source._address));
        require(isGenuineSignature(firstPayment.seals.exchange.hash, firstPayment.seals.exchange.signature, owner));

        require(wallet == lastPayment.source._address || wallet == lastPayment.destination._address);
        require(hashPaymentAsParty(lastPayment) == lastPayment.seals.party.hash);
        require(hashPaymentAsExchange(lastPayment) == lastPayment.seals.exchange.hash);
        require(isGenuineSignature(lastPayment.seals.party.hash, lastPayment.seals.party.signature, lastPayment.source._address));
        require(isGenuineSignature(lastPayment.seals.exchange.hash, lastPayment.seals.exchange.signature, owner));

        _;
    }

    modifier challengeableBySuccessionTradePaymentPair(Trade trade, Payment payment, address wallet, address currency) {
        require(currency == payment.currency);

        require(wallet == trade.buyer._address || wallet == trade.seller._address);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);
        require(hashTrade(trade) == trade.seal.hash);
        require(isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));

        require(wallet == payment.source._address || wallet == payment.destination._address);
        require(hashPaymentAsParty(payment) == payment.seals.party.hash);
        require(hashPaymentAsExchange(payment) == payment.seals.exchange.hash);
        require(isGenuineSignature(payment.seals.party.hash, payment.seals.party.signature, payment.source._address));
        require(isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));

        _;
    }

    modifier challengeableByOrderResidualsTradesPair(Trade firstTrade, Trade lastTrade, address wallet, address currency) {
        require((wallet == firstTrade.buyer._address && wallet == lastTrade.buyer._address)
            || (wallet == firstTrade.seller._address && wallet == lastTrade.seller._address));

        require((firstTrade.buyer.order.hashes.party == lastTrade.buyer.order.hashes.party)
            || (firstTrade.seller.order.hashes.party == lastTrade.seller.order.hashes.party));

        require(currency == firstTrade.currencies.intended);
        require(hashTrade(firstTrade) == firstTrade.seal.hash);
        require(isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(currency == lastTrade.currencies.intended);
        require(hashTrade(lastTrade) == lastTrade.seal.hash);
        require(isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }

    modifier challengeableByDoubleSpentOrderTradesPair(Trade firstTrade, Trade lastTrade) {
        require(hashTrade(firstTrade) == firstTrade.seal.hash);
        require(isGenuineSignature(firstTrade.seal.hash, firstTrade.seal.signature, owner));

        require(hashTrade(lastTrade) == lastTrade.seal.hash);
        require(isGenuineSignature(lastTrade.seal.hash, lastTrade.seal.signature, owner));

        _;
    }
}