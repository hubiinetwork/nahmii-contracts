/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;

import "./SafeMathInt.sol";
import "./Configuration.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract Exchange {
    using SafeMathInt for int256;

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum OperationalMode {Normal, Exit}
    enum LiquidityRole {Maker, Taker}

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

    struct Order {
        int256 amount;
        CurrentPreviousInt256 residuals;
    }

    struct Trader {
        address _address;
        uint256 nonce;
        uint256 rollingVolume;
        LiquidityRole liquidityRole;
        Order order;
        IntendedConjugateCurrentPreviousInt256 balances;
        IntendedConjugateInt256 netFees;
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

    struct Trade {
        uint256 nonce;
        bool immediateSettlement;
        int256 amount;
        int256 rate;

        IntendedConjugateAddress currencies;

        Trader buyer;
        Trader seller;

        // Intended transfer is always in direction from seller to buyer
        // Conjugate transfer is always in direction from buyer to seller
        IntendedConjugateSingleNetInt256 transfers;

        IntendedConjugateInt256 singleFees;

        Seal seal;
        uint256 blockNumber;
    }

    struct Party {
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

        Party source;
        Party destination;

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
    event ChallengeFraudulentDealByTradeEvent(Trade t, address challenger, address seizedWallet);
    event ChallengeFraudulentDealByPaymentEvent(Payment t, address challenger, address seizedWallet);
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

    function isGenuineTradeMakerFee(Trade trade) private view returns (bool) {
        int256 feePartsPer = int256(configuration.partsPer());
        uint256 rollingVolume = (LiquidityRole.Maker == trade.buyer.liquidityRole ? trade.buyer.rollingVolume : trade.seller.rollingVolume);
        return (trade.singleFees.intended <= trade.amount.mul(int(configuration.getTradeMakerFee(0, 0))).div(feePartsPer))
        && (trade.singleFees.intended == trade.amount.mul(int(configuration.getTradeMakerFee(0, rollingVolume))).div(feePartsPer))
        && (trade.singleFees.intended >= trade.amount.mul(int(configuration.getTradeMakerMinimumFee(0))).div(feePartsPer));
    }

    function isGenuineTradeTakerFee(Trade trade) private view returns (bool) {
        int256 feePartsPer = int256(configuration.partsPer());
        int256 amountConjugate = trade.amount.div(trade.rate);
        uint256 rollingVolume = (LiquidityRole.Taker == trade.buyer.liquidityRole ? trade.buyer.rollingVolume : trade.seller.rollingVolume);
        return (trade.singleFees.conjugate <= amountConjugate.mul(int(configuration.getTradeTakerFee(0, 0))).div(feePartsPer))
        && (trade.singleFees.conjugate == amountConjugate.mul(int(configuration.getTradeTakerFee(0, rollingVolume))).div(feePartsPer))
        && (trade.singleFees.conjugate >= amountConjugate.mul(int(configuration.getTradeTakerMinimumFee(0))).div(feePartsPer));
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
        bytes32 hash = hashPayment(payment);
        return (hash == payment.seals.exchange.hash)
        && (hash == payment.seals.party.hash)
        && (isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner))
        && (isGenuineSignature(hash, payment.seals.party.signature, payment.source._address));
    }

    function isGenuineSignature(bytes32 hash, Signature signature, address signer) private pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(prefix, hash);
        return ecrecover(prefixedHash, signature.v, signature.r, signature.s) == signer;
    }

    function isGenuinePaymentFee(Payment payment) private view returns (bool) {
        int256 feePartsPer = int256(configuration.partsPer());
        return (payment.singleFee <= payment.amount.mul(int(configuration.getPaymentFee(0, 0))).div(feePartsPer))
        && (payment.singleFee == payment.amount.mul(int(configuration.getPaymentFee(0, uint(payment.amount)))).div(feePartsPer))
        && (payment.singleFee >= payment.amount.mul(int(configuration.getPaymentMinimumFee(0))).div(feePartsPer));
    }

    function isGenuineByPaymentSource(Payment payment) private pure returns (bool) {
        return (payment.source._address != payment.destination._address)
        && (payment.source.balances.current == payment.source.balances.previous.sub(payment.transfers.single).sub(payment.singleFee));
    }

    function isGenuineByPaymentDestination(Payment payment) private pure returns (bool) {
        return (payment.source._address != payment.destination._address)
        && (payment.destination.balances.current == payment.destination.balances.previous.add(payment.transfers.single));
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
    function hashPayment(Payment payment) private pure returns (bytes32) {
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

    // TODO Fix
    modifier signedByOwner(bytes32 hash, Signature signature) {
        address signer = ecrecover(hash, signature.v, signature.r, signature.s);
        require(signer == owner);
        _;
    }
}