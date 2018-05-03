/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2 ;

import "./SafeMathUint.sol";
import "./Configuration.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract Exchange {
    using SafeMathUint for uint256;

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum OperationalMode {Normal, Exit}
    enum LiquidityRole {Maker, Taker}

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct CurrentPreviousUint256 {
        uint256 current;
        uint256 previous;
    }

    struct SingleNetUint256 {
        uint256 single;
        uint256 net;
    }

    struct IntendedConjugateCurrentPreviousUint256 {
        CurrentPreviousUint256 intended;
        CurrentPreviousUint256 conjugate;
    }

    struct IntendedConjugateSingleNetUint256 {
        SingleNetUint256 intended;
        SingleNetUint256 conjugate;
    }

    struct IntendedConjugateAddress {
        address intended;
        address conjugate;
    }

    struct IntendedConjugateUint256 {
        uint256 intended;
        uint256 conjugate;
    }

    struct Order {
        uint256 amount;
        CurrentPreviousUint256 residuals;
    }

    struct Trader {
        address _address;
        uint256 nonce;
        uint256 rollingVolume;
        LiquidityRole liquidityRole;
        Order order;
        IntendedConjugateCurrentPreviousUint256 balances;
        IntendedConjugateUint256 netFees;
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

    struct Trade {
        uint256 nonce;
        bool immediateSettlement;
        uint256 amount;
        uint256 rate;

        IntendedConjugateAddress currencies;

        Trader buyer;
        Trader seller;

        // Intended transfer is always in direction from seller to buyer
        // Conjugate transfer is always in direction from buyer to seller
        IntendedConjugateSingleNetUint256 transfers;

        IntendedConjugateUint256 singleFees;

        Seal seal;
        uint256 blockNumber;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    OperationalMode public operationalMode = OperationalMode.Normal;

    Trade public fraudulentTrade;

    address[] public seizedWallets;
    mapping(address => bool) seizedWalletsMap;

    Configuration public configuration;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event ChallengeFraudulentDealByTradeEvent(Trade t, address challenger, address seizedWallet);
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function Exchange(address _owner) public notNullAddress(_owner) {
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
        bool genuineMakerFee = isGenuineMakerFee(trade);
        bool genuineTakerFee = isGenuineTakerFee(trade);

        // Genuineness that does not related to buyer or seller
        bool genuine = (getHashOfTrade(trade) == trade.seal.hash);

        // Genuineness affected by buyer
        bool genuineByBuyer = isGenuineByBuyer(trade)
        && (LiquidityRole.Maker == trade.buyer.liquidityRole ? genuineMakerFee : genuineTakerFee);

        // Genuineness affected by seller
        bool genuineBySeller = isGenuineBySeller(trade)
        && (LiquidityRole.Maker == trade.seller.liquidityRole ? genuineMakerFee : genuineTakerFee);

        require(!genuine || !genuineByBuyer || !genuineBySeller);

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

    function isGenuineMakerFee(Trade trade) private view returns (bool) {
        uint256 feePartsPer = configuration.partsPer();
        uint256 rollingVolume = (LiquidityRole.Maker == trade.buyer.liquidityRole ? trade.buyer.rollingVolume : trade.seller.rollingVolume);
        return (trade.singleFees.intended <= trade.amount.mul(configuration.getTradeMakerFee(0, 0)).div(feePartsPer))
        && (trade.singleFees.intended == trade.amount.mul(configuration.getTradeMakerFee(0, rollingVolume)).div(feePartsPer))
        && (trade.singleFees.intended >= trade.amount.mul(configuration.getTradeMakerMinimumFee(0)).div(feePartsPer));
    }

    function isGenuineTakerFee(Trade trade) private view returns (bool) {
        uint256 feePartsPer = configuration.partsPer();
        uint256 amountConjugate = trade.amount.div(trade.rate);
        uint256 rollingVolume = (LiquidityRole.Taker == trade.buyer.liquidityRole ? trade.buyer.rollingVolume : trade.seller.rollingVolume);
        return (trade.singleFees.conjugate <= amountConjugate.mul(configuration.getTradeTakerFee(0, 0)).div(feePartsPer))
        && (trade.singleFees.conjugate == amountConjugate.mul(configuration.getTradeTakerFee(0, rollingVolume)).div(feePartsPer))
        && (trade.singleFees.conjugate >= amountConjugate.mul(configuration.getTradeTakerMinimumFee(0)).div(feePartsPer));
    }

    function isGenuineByBuyer(Trade trade) private view returns (bool) {
        return (trade.buyer._address != trade.seller._address)
        && (trade.buyer._address != owner)
        && (trade.buyer.balances.intended.current == trade.buyer.balances.intended.previous.add(trade.transfers.intended.single).sub(trade.singleFees.intended))
        && (trade.buyer.balances.conjugate.current == trade.buyer.balances.conjugate.previous.sub(trade.transfers.conjugate.single))
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.current)
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.previous)
        && (trade.buyer.order.residuals.previous >= trade.buyer.order.residuals.current);
    }

    function isGenuineBySeller(Trade trade) private view returns (bool) {
        return (trade.buyer._address != trade.seller._address)
        && (trade.seller._address != owner)
        && (trade.seller.balances.intended.current == trade.seller.balances.intended.previous.sub(trade.transfers.intended.single))
        && (trade.seller.balances.conjugate.current == trade.seller.balances.conjugate.previous.add(trade.transfers.conjugate.single).sub(trade.singleFees.conjugate))
        && (trade.seller.order.amount >= trade.seller.order.residuals.current)
        && (trade.seller.order.amount >= trade.seller.order.residuals.previous)
        && (trade.seller.order.residuals.previous >= trade.seller.order.residuals.current);
    }

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
        }
    }

    // TODO Implement fully
    function getHashOfTrade(Trade trade) private pure returns (bytes32) {
        return keccak256(bytes32(trade.nonce));
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

    modifier signedByOwner(bytes32 hash, Signature signature) {
        address signer = ecrecover(hash, signature.v, signature.r, signature.s);
        require(signer == owner);
        _;
    }
}