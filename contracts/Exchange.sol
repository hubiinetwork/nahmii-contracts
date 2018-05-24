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
import "./DealSettlementChallenge.sol";
import "./ReserveFund.sol";

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
    struct DealSettlementChallengeInfo {
        uint256 nonce;
        Types.DealType dealType;
        uint256 timeout;
        Types.ChallengeStatus status;
        uint256 dealIndex;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    uint256 public maxKnownDealNonce;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    Configuration public configuration;
    ClientFund public clientFund;
    ReserveFund public tradesReserveFund;
    ReserveFund public paymentsReserveFund;
    RevenueFund public tradesRevenueFund;
    RevenueFund public paymentsRevenueFund;
    CommunityVote public communityVote;
    DealSettlementChallenge public dealSettlementChallenge;

    Types.Settlement[] public settlements;
    mapping(address => uint256[]) walletSettlementIndexMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
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
            owner = newOwner;

            emit OwnerChangedEvent(oldOwner, newOwner);
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

        Types.ChallengeStatus status = dealSettlementChallenge.dealSettlementChallengeStatus(wallet, trade.nonce);
        if (Types.ChallengeStatus.Qualified == status) {

            if ((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (trade.nonce < maxKnownDealNonce)) {

                Types.TradePartyRole tradePartyRole = (wallet == trade.buyer._address ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

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

        } else if (Types.ChallengeStatus.Disqualified == status) {
            // TODO Consider recipient of seized funds
            //            clientFund.seizeDepositedAndSettledBalances(wallet, owner);
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
    signedBy(payment.seals.party.hash, payment.seals.party.signature, payment.source._address)
    {
        if (msg.sender != owner)
            wallet = msg.sender;

        require(Types.isPaymentParty(payment, wallet));

        Types.ChallengeStatus status = dealSettlementChallenge.dealSettlementChallengeStatus(wallet, payment.nonce);
        if (Types.ChallengeStatus.Qualified == status) {

            if ((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (payment.nonce < maxKnownDealNonce)) {

                Types.PaymentPartyRole paymentPartyRole = (wallet == payment.source._address ? Types.PaymentPartyRole.Source : Types.PaymentPartyRole.Destination);

                int256 partyInboundTransfer;
                if ((0 < payment.transfers.net && Types.PaymentPartyRole.Source == paymentPartyRole)
                    || (0 > payment.transfers.net && Types.PaymentPartyRole.Destination == paymentPartyRole))
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
        } else if (Types.ChallengeStatus.Disqualified == status) {
            // TODO Consider recipient of seized funds
            //            clientFund.seizeDepositedAndSettledBalances(wallet, owner);
            addToSeizedWallets(wallet);
        }
        emit SettleDealAsPaymentEvent(payment, wallet);
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

    /// @notice Change the client fund contract
    /// @param newClientFund The (address of) ClientFund contract instance
    function changeClientFund(ClientFund newClientFund) public onlyOwner {
        if (newClientFund != clientFund) {
            ClientFund oldClientFund = clientFund;
            clientFund = newClientFund;
            emit ChangeClientFundEvent(oldClientFund, clientFund);
        }
    }

    /// @notice Change the trades reserve fund contract
    /// @param newTradesReserveFund The (address of) trades ReserveFund contract instance
    function changeTradesReserveFund(ReserveFund newTradesReserveFund) public onlyOwner {
        if (newTradesReserveFund != tradesReserveFund) {
            ReserveFund oldTradesReserveFund = tradesReserveFund;
            tradesReserveFund = newTradesReserveFund;
            emit ChangeTradesReserveFundEvent(oldTradesReserveFund, tradesReserveFund);
        }
    }

    /// @notice Change the payments reserve fund contract
    /// @param newPaymentsReserveFund The (address of) payments ReserveFund contract instance
    function changePaymentsReserveFund(ReserveFund newPaymentsReserveFund) public onlyOwner {
        if (newPaymentsReserveFund != paymentsReserveFund) {
            ReserveFund oldPaymentsReserveFund = paymentsReserveFund;
            paymentsReserveFund = newPaymentsReserveFund;
            emit ChangePaymentsReserveFundEvent(oldPaymentsReserveFund, paymentsReserveFund);
        }
    }

    /// @notice Change the trades revenue fund contract
    /// @param newTradesRevenueFund The (address of) trades RevenueFund contract instance
    function changeTradesRevenueFund(RevenueFund newTradesRevenueFund) public onlyOwner {
        if (newTradesRevenueFund != tradesRevenueFund) {
            RevenueFund oldTradesRevenueFund = tradesRevenueFund;
            tradesRevenueFund = newTradesRevenueFund;
            emit ChangeTradesRevenueFundEvent(oldTradesRevenueFund, tradesRevenueFund);
        }
    }

    /// @notice Change the payments revenue fund contract
    /// @param newPaymentsRevenueFund The (address of) payments RevenueFund contract instance
    function changePaymentsRevenueFund(RevenueFund newPaymentsRevenueFund) public onlyOwner {
        if (newPaymentsRevenueFund != paymentsRevenueFund) {
            RevenueFund oldPaymentsRevenueFund = paymentsRevenueFund;
            paymentsRevenueFund = newPaymentsRevenueFund;
            emit ChangePaymentsRevenueFundEvent(oldPaymentsRevenueFund, paymentsRevenueFund);
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

    /// @notice Change the deal settlement challenge contract
    /// @param newDealSettlementChallenge The (address of) DealSettlementChallenge contract instance
    function changeDealSettlementChallenge(DealSettlementChallenge newDealSettlementChallenge) public onlyOwner {
        if (newDealSettlementChallenge != dealSettlementChallenge) {
            DealSettlementChallenge oldDealSettlementChallenge = dealSettlementChallenge;
            dealSettlementChallenge = newDealSettlementChallenge;
            emit ChangeDealSettlementChallengeEvent(oldDealSettlementChallenge, dealSettlementChallenge);
        }
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

    function settleTradeTransfers(Types.Trade trade) private {
        if (0 < trade.transfers.intended.net.sub(trade.buyer.netFees.intended)) {// Transfer from seller to buyer
            clientFund.transferFromDepositedToSettledBalance(
                trade.seller._address,
                trade.buyer._address,
                trade.transfers.intended.net.sub(trade.buyer.netFees.intended),
                trade.currencies.intended
            );

        } else if (0 > trade.transfers.intended.net.add(trade.seller.netFees.intended)) {// Transfer from buyer to seller
            clientFund.transferFromDepositedToSettledBalance(
                trade.buyer._address,
                trade.seller._address,
                trade.transfers.intended.net.add(trade.seller.netFees.intended).abs(),
                trade.currencies.intended
            );
        }

        if (0 < trade.transfers.conjugate.net.sub(trade.seller.netFees.conjugate)) {// Transfer from buyer to seller
            clientFund.transferFromDepositedToSettledBalance(
                trade.buyer._address,
                trade.seller._address,
                trade.transfers.conjugate.net.sub(trade.seller.netFees.conjugate),
                trade.currencies.conjugate
            );

        } else if (0 > trade.transfers.conjugate.net.add(trade.buyer.netFees.conjugate)) {// Transfer from seller to buyer
            clientFund.transferFromDepositedToSettledBalance(
                trade.seller._address,
                trade.buyer._address,
                trade.transfers.conjugate.net.add(trade.buyer.netFees.conjugate).abs(),
                trade.currencies.conjugate
            );
        }
    }

    function settlePaymentTransfers(Types.Payment payment) private {
        if (0 < payment.transfers.net.sub(payment.source.netFee)) {// Transfer from source to destination
            clientFund.transferFromDepositedToSettledBalance(
                payment.source._address,
                payment.destination._address,
                payment.transfers.net.sub(payment.source.netFee),
                payment.currency
            );

        } else if (0 > payment.transfers.net.add(payment.destination.netFee)) {// Transfer from destination to source
            clientFund.transferFromDepositedToSettledBalance(
                payment.destination._address,
                payment.source._address,
                payment.transfers.net.add(payment.destination.netFee).abs(),
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
            Types.Settlement(trade.nonce, Types.DealType.Trade, Types.Sidedness.TwoSided, [trade.buyer._address, trade.seller._address])
        );
        walletSettlementIndexMap[trade.buyer._address].push(settlements.length - 1);
        walletSettlementIndexMap[trade.seller._address].push(settlements.length - 1);
    }

    function addOneSidedSettlementFromPayment(Types.Payment payment, address wallet) private {
        settlements.push(
            Types.Settlement(payment.nonce, Types.DealType.Payment, Types.Sidedness.OneSided, [wallet, address(0)])
        );
        walletSettlementIndexMap[wallet].push(settlements.length - 1);
    }

    function addTwoSidedSettlementFromPayment(Types.Payment payment) private {
        settlements.push(
            Types.Settlement(payment.nonce, Types.DealType.Payment, Types.Sidedness.TwoSided, [payment.source._address, payment.destination._address])
        );
        walletSettlementIndexMap[payment.source._address].push(settlements.length - 1);
        walletSettlementIndexMap[payment.destination._address].push(settlements.length - 1);
    }

    function settleTradeFees(Types.Trade trade) private {
        if (0 < trade.buyer.netFees.intended) {
            clientFund.withdrawFromDepositedBalance(
                trade.buyer._address,
                tradesRevenueFund,
                trade.buyer.netFees.intended,
                trade.currencies.intended
            );
            if (address(0) != trade.currencies.intended)
                tradesRevenueFund.recordDepositTokens(ERC20(trade.currencies.intended), trade.buyer.netFees.intended);
        }

        if (0 < trade.buyer.netFees.conjugate) {
            clientFund.withdrawFromDepositedBalance(
                trade.buyer._address,
                tradesRevenueFund,
                trade.buyer.netFees.conjugate,
                trade.currencies.conjugate
            );
            if (address(0) != trade.currencies.conjugate)
                tradesRevenueFund.recordDepositTokens(ERC20(trade.currencies.conjugate), trade.buyer.netFees.conjugate);
        }

        if (0 < trade.seller.netFees.intended) {
            clientFund.withdrawFromDepositedBalance(
                trade.seller._address,
                tradesRevenueFund,
                trade.seller.netFees.intended,
                trade.currencies.intended
            );
            if (address(0) != trade.currencies.intended)
                tradesRevenueFund.recordDepositTokens(ERC20(trade.currencies.intended), trade.seller.netFees.intended);
        }

        if (0 < trade.seller.netFees.conjugate) {
            clientFund.withdrawFromDepositedBalance(
                trade.seller._address,
                tradesRevenueFund,
                trade.seller.netFees.conjugate,
                trade.currencies.conjugate
            );
            if (address(0) != trade.currencies.conjugate)
                tradesRevenueFund.recordDepositTokens(ERC20(trade.currencies.conjugate), trade.seller.netFees.conjugate);
        }
    }

    function settlePaymentFees(Types.Payment payment) private {
        if (0 < payment.source.netFee) {
            clientFund.withdrawFromDepositedBalance(
                payment.source._address,
                paymentsRevenueFund,
                payment.source.netFee,
                payment.currency
            );
            if (address(0) != payment.currency)
                paymentsRevenueFund.recordDepositTokens(ERC20(payment.currency), payment.source.netFee);
        }

        if (0 < payment.destination.netFee) {
            clientFund.withdrawFromDepositedBalance(
                payment.destination._address,
                paymentsRevenueFund,
                payment.destination.netFee,
                payment.currency
            );
            if (address(0) != payment.currency)
                paymentsRevenueFund.recordDepositTokens(ERC20(payment.currency), payment.destination.netFee);
        }
    }

    function isOwner() private view returns (bool) {
        return msg.sender == owner;
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