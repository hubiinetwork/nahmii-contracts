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
import "./Types.sol";
import "./ERC20.sol";
import "./Configuration.sol";
import "./CommunityVote.sol";
import "./ClientFund.sol";
import "./ReserveFund.sol";
import "./RevenueFund.sol";
import "./DealSettlementChallenge.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract Exchange is Ownable {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public highestAbsoluteDealNonce;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    Configuration public configuration;
    ClientFund public clientFund;
    ReserveFund public tradesReserveFund;
    ReserveFund public paymentsReserveFund;
    RevenueFund public tradesRevenueFund;
    RevenueFund public paymentsRevenueFund;
    bool public communityVoteUpdateDisabled;
    CommunityVote public communityVote;
    DealSettlementChallenge public dealSettlementChallenge;

    Types.Settlement[] public settlements;
    mapping(address => uint256[]) walletSettlementIndexMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettleDealAsTradeEvent(Types.Trade trade, address wallet);
    event SettleDealAsPaymentEvent(Types.Payment payment, address wallet);
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);
    event ChangeClientFundEvent(ClientFund oldClientFund, ClientFund newClientFund);
    event ChangeTradesReserveFundEvent(ReserveFund oldReserveFund, ReserveFund newReserveFund);
    event ChangePaymentsReserveFundEvent(ReserveFund oldReserveFund, ReserveFund newReserveFund);
    event ChangeTradesRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
    event ChangePaymentsRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
    event ChangeCommunityVoteEvent(CommunityVote oldCommunityVote, CommunityVote newCommunityVote);
    event ChangeDealSettlementChallengeEvent(DealSettlementChallenge oldDealSettlementChallenge, DealSettlementChallenge newDealSettlementChallenge);

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

    /// @notice Change the trades reserve fund contract
    /// @param newTradesReserveFund The (address of) trades ReserveFund contract instance
    function changeTradesReserveFund(ReserveFund newTradesReserveFund)
    public
    onlyOwner
    notNullAddress(newTradesReserveFund)
    notEqualAddresses(newTradesReserveFund, tradesReserveFund)
    {
        ReserveFund oldTradesReserveFund = tradesReserveFund;
        tradesReserveFund = newTradesReserveFund;
        emit ChangeTradesReserveFundEvent(oldTradesReserveFund, tradesReserveFund);
    }

    /// @notice Change the payments reserve fund contract
    /// @param newPaymentsReserveFund The (address of) payments ReserveFund contract instance
    function changePaymentsReserveFund(ReserveFund newPaymentsReserveFund)
    public
    onlyOwner
    notNullAddress(newPaymentsReserveFund)
    notEqualAddresses(newPaymentsReserveFund, paymentsReserveFund)
    {
        ReserveFund oldPaymentsReserveFund = paymentsReserveFund;
        paymentsReserveFund = newPaymentsReserveFund;
        emit ChangePaymentsReserveFundEvent(oldPaymentsReserveFund, paymentsReserveFund);
    }

    /// @notice Change the trades revenue fund contract
    /// @param newTradesRevenueFund The (address of) trades RevenueFund contract instance
    function changeTradesRevenueFund(RevenueFund newTradesRevenueFund)
    public
    onlyOwner
    notNullAddress(newTradesRevenueFund)
    notEqualAddresses(newTradesRevenueFund, tradesRevenueFund)
    {
        RevenueFund oldTradesRevenueFund = tradesRevenueFund;
        tradesRevenueFund = newTradesRevenueFund;
        emit ChangeTradesRevenueFundEvent(oldTradesRevenueFund, tradesRevenueFund);
    }

    /// @notice Change the payments revenue fund contract
    /// @param newPaymentsRevenueFund The (address of) payments RevenueFund contract instance
    function changePaymentsRevenueFund(RevenueFund newPaymentsRevenueFund)
    public
    onlyOwner
    notNullAddress(newPaymentsRevenueFund)
    notEqualAddresses(newPaymentsRevenueFund, paymentsRevenueFund)
    {
        RevenueFund oldPaymentsRevenueFund = paymentsRevenueFund;
        paymentsRevenueFund = newPaymentsRevenueFund;
        emit ChangePaymentsRevenueFundEvent(oldPaymentsRevenueFund, paymentsRevenueFund);
    }

    /// @notice Disable future updates of community vote contract
    function disableUpdateOfCommunityVote() public onlyOwner {
        communityVoteUpdateDisabled = true;
    }

    /// @notice Change the community vote contract
    /// @param newCommunityVote The (address of) CommunityVote contract instance
    function changeCommunityVote(CommunityVote newCommunityVote)
    public
    onlyOwner
    notNullAddress(newCommunityVote)
    notEqualAddresses(newCommunityVote, communityVote)
    {
        require(!communityVoteUpdateDisabled);
        CommunityVote oldCommunityVote = communityVote;
        communityVote = newCommunityVote;
        emit ChangeCommunityVoteEvent(oldCommunityVote, communityVote);
    }

    /// @notice Change the deal settlement challenge contract
    /// @param newDealSettlementChallenge The (address of) DealSettlementChallenge contract instance
    function changeDealSettlementChallenge(DealSettlementChallenge newDealSettlementChallenge)
    public
    onlyOwner
    notNullAddress(newDealSettlementChallenge)
    notEqualAddresses(newDealSettlementChallenge, dealSettlementChallenge)
    {
        DealSettlementChallenge oldDealSettlementChallenge = dealSettlementChallenge;
        dealSettlementChallenge = newDealSettlementChallenge;
        emit ChangeDealSettlementChallengeEvent(oldDealSettlementChallenge, dealSettlementChallenge);
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

    /// @notice Get the count of settlements
    function settlementsCount() public view returns (uint256) {
        return settlements.length;
    }

    /// @notice Get the count of settlements for given wallet
    /// @param wallet The address for which to return settlement count
    function walletSettlementsCount(address wallet) public view returns (uint256) {
        return walletSettlementIndexMap[wallet].length;
    }

    /// @notice Get settlement of given wallet
    /// @param wallet The address for which to return settlement
    /// @param index The wallet's settlement index
    function walletSettlement(address wallet, uint256 index) public view returns (Types.Settlement) {
        require(walletSettlementIndexMap[wallet].length > index);
        return settlements[walletSettlementIndexMap[wallet][index]];
    }

    /// @notice Update the highest absolute deal nonce property from CommunityVote contract
    function updateHighestAbsoluteDealNonce() public {
        uint256 _highestAbsoluteDealNonce = communityVote.getHighestAbsoluteDealNonce();
        if (_highestAbsoluteDealNonce > 0) {
            highestAbsoluteDealNonce = _highestAbsoluteDealNonce;
        }
    }

    /// @notice Settle deal that is a trade
    /// @param trade The trade to be settled
    /// @param wallet The wallet whose side of the deal is to be settled one-sidedly if supported by reserve fund
    function settleDealAsTrade(Types.Trade trade, address wallet)
    public
    signedBy(trade.seal.hash, trade.seal.signature, owner)
    {
        if (msg.sender != owner)
            wallet = msg.sender;

        require(Types.isTradeParty(trade, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        (Types.ChallengeResult result, address challenger) = dealSettlementChallenge.dealSettlementChallengeStatus(wallet, trade.nonce);

        if (Types.ChallengeResult.Qualified == result) {

            if ((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (trade.nonce < highestAbsoluteDealNonce)) {

                Types.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

                int256 partyInboundTransferIntended;
                int256 partyInboundTransferConjugate;
                if ((0 < trade.transfers.intended.net && Types.TradePartyRole.Buyer == tradePartyRole)
                    || (0 > trade.transfers.intended.net && Types.TradePartyRole.Seller == tradePartyRole))
                    partyInboundTransferIntended = trade.transfers.intended.net.abs();
                if ((0 < trade.transfers.conjugate.net && Types.TradePartyRole.Seller == tradePartyRole)
                    || (0 > trade.transfers.conjugate.net && Types.TradePartyRole.Buyer == tradePartyRole))
                    partyInboundTransferConjugate = trade.transfers.conjugate.net.abs();

                if (false == trade.immediateSettlement &&
                tradesReserveFund.outboundTransferSupported(trade.currencies.intended, partyInboundTransferIntended) && // TODO Replace arguments by ReserveFund.TransferInfo
                tradesReserveFund.outboundTransferSupported(trade.currencies.conjugate, partyInboundTransferConjugate)) {// TODO Replace arguments by ReserveFund.TransferInfo
                    // TODO Uncomment and replace last 4 arguments by 2 instances of ReserveFund.TransferInfo
                    // tradesReserveFund.twoWayTransfer(wallet, trade.currencies.intended, partyInboundTransferIntended, trade.currencies.conjugate, partyInboundTransferConjugate);
                    addOneSidedSettlementFromTrade(trade, wallet);
                } else {
                    settleTradeTransfers(trade);
                    settleTradeFees(trade);
                    addTwoSidedSettlementFromTrade(trade);
                }
            }

            if (trade.nonce > highestAbsoluteDealNonce)
                highestAbsoluteDealNonce = trade.nonce;

        } else if (Types.ChallengeResult.Disqualified == result) {
            clientFund.seizeDepositedAndSettledBalances(wallet, challenger);
            addToSeizedWallets(wallet);
        }

        emit SettleDealAsTradeEvent(trade, wallet);
    }

    /// @notice Settle deal that is a payment
    /// @param payment The payment to be settled
    /// @param wallet The wallet whose side of the deal is to be settled one-sidedly if supported by reserve fund
    function settleDealAsPayment(Types.Payment payment, address wallet)
    public
    signedBy(payment.seals.exchange.hash, payment.seals.exchange.signature, owner)
    signedBy(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet)
    {
        if (msg.sender != owner)
            wallet = msg.sender;

        require(Types.isPaymentParty(payment, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        (Types.ChallengeResult result, address challenger) = dealSettlementChallenge.dealSettlementChallengeStatus(wallet, payment.nonce);

        if (Types.ChallengeResult.Qualified == result) {

            if ((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (payment.nonce < highestAbsoluteDealNonce)) {

                Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);

                int256 partyInboundTransfer;
                if ((0 < payment.transfers.net && Types.PaymentPartyRole.Sender == paymentPartyRole)
                    || (0 > payment.transfers.net && Types.PaymentPartyRole.Recipient == paymentPartyRole))
                    partyInboundTransfer = payment.transfers.net.abs();

                if (false == payment.immediateSettlement &&
                paymentsReserveFund.outboundTransferSupported(payment.currency, partyInboundTransfer)) {// TODO Replace arguments by ReserveFund.TransferInfo
                    // TODO Uncomment and replace last 2 arguments by 1 instance of ReserveFund.TransferInfo
                    // paymentsReserveFund.oneWayTransfer(wallet, payment.currency, partyInboundTransfer);
                    addOneSidedSettlementFromPayment(payment, wallet);
                } else {
                    settlePaymentTransfers(payment);
                    settlePaymentFees(payment);
                    addTwoSidedSettlementFromPayment(payment);
                }
            }

            if (payment.nonce > highestAbsoluteDealNonce)
                highestAbsoluteDealNonce = payment.nonce;

        } else if (Types.ChallengeResult.Disqualified == result) {
            clientFund.seizeDepositedAndSettledBalances(wallet, challenger);
            addToSeizedWallets(wallet);
        }
        emit SettleDealAsPaymentEvent(payment, wallet);
    }

    function settleTradeTransfers(Types.Trade trade) private {
        if (0 < trade.transfers.intended.net.sub(trade.buyer.netFees.intended)) {// Transfer from seller to buyer
            clientFund.transferFromDepositedToSettledBalance(
                trade.seller.wallet,
                trade.buyer.wallet,
                trade.transfers.intended.net.sub(trade.buyer.netFees.intended),
                trade.currencies.intended
            );

        } else if (0 > trade.transfers.intended.net.add(trade.seller.netFees.intended)) {// Transfer from buyer to seller
            clientFund.transferFromDepositedToSettledBalance(
                trade.buyer.wallet,
                trade.seller.wallet,
                trade.transfers.intended.net.add(trade.seller.netFees.intended).abs(),
                trade.currencies.intended
            );
        }

        if (0 < trade.transfers.conjugate.net.sub(trade.seller.netFees.conjugate)) {// Transfer from buyer to seller
            clientFund.transferFromDepositedToSettledBalance(
                trade.buyer.wallet,
                trade.seller.wallet,
                trade.transfers.conjugate.net.sub(trade.seller.netFees.conjugate),
                trade.currencies.conjugate
            );

        } else if (0 > trade.transfers.conjugate.net.add(trade.buyer.netFees.conjugate)) {// Transfer from seller to buyer
            clientFund.transferFromDepositedToSettledBalance(
                trade.seller.wallet,
                trade.buyer.wallet,
                trade.transfers.conjugate.net.add(trade.buyer.netFees.conjugate).abs(),
                trade.currencies.conjugate
            );
        }
    }

    function settlePaymentTransfers(Types.Payment payment) private {
        if (0 < payment.transfers.net.sub(payment.sender.netFee)) {// Transfer from sender to recipient
            clientFund.transferFromDepositedToSettledBalance(
                payment.sender.wallet,
                payment.recipient.wallet,
                payment.transfers.net.sub(payment.sender.netFee),
                payment.currency
            );

        } else if (0 > payment.transfers.net.add(payment.recipient.netFee)) {// Transfer from recipient to sender
            clientFund.transferFromDepositedToSettledBalance(
                payment.recipient.wallet,
                payment.sender.wallet,
                payment.transfers.net.add(payment.recipient.netFee).abs(),
                payment.currency
            );
        }
    }

    function addOneSidedSettlementFromTrade(Types.Trade trade, address wallet) private {
        settlements.push(
            Types.Settlement(trade.nonce, Types.DealType.Trade, Types.Sidedness.OneSided, [wallet, address(0)])
        );
        walletSettlementIndexMap[wallet].push(settlements.length - 1);
    }

    function addTwoSidedSettlementFromTrade(Types.Trade trade) private {
        settlements.push(
            Types.Settlement(trade.nonce, Types.DealType.Trade, Types.Sidedness.TwoSided, [trade.buyer.wallet, trade.seller.wallet])
        );
        walletSettlementIndexMap[trade.buyer.wallet].push(settlements.length - 1);
        walletSettlementIndexMap[trade.seller.wallet].push(settlements.length - 1);
    }

    function addOneSidedSettlementFromPayment(Types.Payment payment, address wallet) private {
        settlements.push(
            Types.Settlement(payment.nonce, Types.DealType.Payment, Types.Sidedness.OneSided, [wallet, address(0)])
        );
        walletSettlementIndexMap[wallet].push(settlements.length - 1);
    }

    function addTwoSidedSettlementFromPayment(Types.Payment payment) private {
        settlements.push(
            Types.Settlement(payment.nonce, Types.DealType.Payment, Types.Sidedness.TwoSided, [payment.sender.wallet, payment.recipient.wallet])
        );
        walletSettlementIndexMap[payment.sender.wallet].push(settlements.length - 1);
        walletSettlementIndexMap[payment.recipient.wallet].push(settlements.length - 1);
    }

    function settleTradeFees(Types.Trade trade) private {
        if (0 < trade.buyer.netFees.intended) {
            clientFund.withdrawFromDepositedBalance(
                trade.buyer.wallet,
                tradesRevenueFund,
                trade.buyer.netFees.intended,
                trade.currencies.intended
            );
            if (address(0) != trade.currencies.intended)
                tradesRevenueFund.recordDepositTokens(ERC20(trade.currencies.intended), trade.buyer.netFees.intended);
        }

        if (0 < trade.buyer.netFees.conjugate) {
            clientFund.withdrawFromDepositedBalance(
                trade.buyer.wallet,
                tradesRevenueFund,
                trade.buyer.netFees.conjugate,
                trade.currencies.conjugate
            );
            if (address(0) != trade.currencies.conjugate)
                tradesRevenueFund.recordDepositTokens(ERC20(trade.currencies.conjugate), trade.buyer.netFees.conjugate);
        }

        if (0 < trade.seller.netFees.intended) {
            clientFund.withdrawFromDepositedBalance(
                trade.seller.wallet,
                tradesRevenueFund,
                trade.seller.netFees.intended,
                trade.currencies.intended
            );
            if (address(0) != trade.currencies.intended)
                tradesRevenueFund.recordDepositTokens(ERC20(trade.currencies.intended), trade.seller.netFees.intended);
        }

        if (0 < trade.seller.netFees.conjugate) {
            clientFund.withdrawFromDepositedBalance(
                trade.seller.wallet,
                tradesRevenueFund,
                trade.seller.netFees.conjugate,
                trade.currencies.conjugate
            );
            if (address(0) != trade.currencies.conjugate)
                tradesRevenueFund.recordDepositTokens(ERC20(trade.currencies.conjugate), trade.seller.netFees.conjugate);
        }
    }

    function settlePaymentFees(Types.Payment payment) private {
        if (0 < payment.sender.netFee) {
            clientFund.withdrawFromDepositedBalance(
                payment.sender.wallet,
                paymentsRevenueFund,
                payment.sender.netFee,
                payment.currency
            );
            if (address(0) != payment.currency)
                paymentsRevenueFund.recordDepositTokens(ERC20(payment.currency), payment.sender.netFee);
        }

        if (0 < payment.recipient.netFee) {
            clientFund.withdrawFromDepositedBalance(
                payment.recipient.wallet,
                paymentsRevenueFund,
                payment.recipient.netFee,
                payment.currency
            );
            if (address(0) != payment.currency)
                paymentsRevenueFund.recordDepositTokens(ERC20(payment.currency), payment.recipient.netFee);
        }
    }

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
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

    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    modifier onlyTradeParty(Types.Trade trade, address wallet) {
        require(Types.isTradeParty(trade, wallet));
        _;
    }

    modifier onlyPaymentParty(Types.Payment payment, address wallet) {
        require(Types.isPaymentParty(payment, wallet));
        _;
    }

    modifier signedBy(bytes32 hash, Types.Signature signature, address signer) {
        require(Types.isGenuineSignature(hash, signature, signer));
        _;
    }
}