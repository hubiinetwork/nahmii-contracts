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
    RevenueFund public revenueFund;
    CommunityVote public communityVote;

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
    event ChangeRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
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

        if (true /*dealSettlementChallengeResult(wallet, trade) == Qualified*/) {

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
                false/*reserveFund.outboundTransferSupported(trade.currencies.intended, partyInboundTransferIntended, trade.currencies.conjugate, partyInboundTransferConjugate)*/) {
                    // reserveFund.twoWayTransfer(wallet, trade.currencies.intended, partyInboundTransferIntended, trade.currencies.conjugate, partyInboundTransferConjugate);
                    addOneSidedSettlementInfoFromTrade(trade, wallet);
                } else {
                    settleTradeTransfers(trade);
                    settleTradeFees(trade);
                    addTwoSidedSettlementInfoFromTrade(trade);
                }
            }
        } else if (false /*dealSettlementChallengeResult(wallet, trade) == Disqualified*/) {
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

        if (true /*dealSettlementChallengeResult(wallet, payment) == Qualified*/) {

            if ((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (payment.nonce < maxKnownDealNonce)) {

                Types.PaymentPartyRole paymentPartyRole = (wallet == payment.source._address ? Types.PaymentPartyRole.Source : Types.PaymentPartyRole.Destination);

                int256 partyInboundTransfer;
                if ((0 < payment.transfers.net && Types.PaymentPartyRole.Source == paymentPartyRole)
                    || (0 > payment.transfers.net && Types.PaymentPartyRole.Destination == paymentPartyRole))
                    partyInboundTransfer = payment.transfers.net.abs();

                if (false == payment.immediateSettlement &&
                false/*reserveFund.outboundTransferSupported(payment.currency, partyInboundTransfer)*/) {
                    // reserveFund.oneWayTransfer(wallet, payment.currencies.intended, partyInboundTransfer);
                    addOneSidedSettlementInfoFromPayment(payment, wallet);
                } else {
                    settlePaymentTransfers(payment);
                    settlePaymentFees(payment);
                    addTwoSidedSettlementInfoFromPayment(payment);
                }
            }
        } else if (false /*dealSettlementChallengeResult(wallet, payment) == Disqualified*/) {
            // TODO Consider recipient of seized funds
            //            clientFund.seizeDepositedAndSettledBalances(wallet, owner);
            addToSeizedWallets(wallet);
        }
        emit SettleDealAsPaymentEvent(payment, wallet);
    }

    function settleTradeTransfers(Types.Trade trade) private {
        if (0 < trade.transfers.intended.net.sub(trade.buyer.netFees.intended)) {// Transfer from seller to buyer
            clientFund.transferFromDepositedToSettledBalance(
                trade.seller._address,
                trade.buyer._address,
                trade.transfers.intended.net.sub(trade.buyer.netFees.intended),
                trade.currencies.intended
            );

        } else if (0 > trade.transfers.intended.net.sub(trade.seller.netFees.intended)) {// Transfer from buyer to seller
            clientFund.transferFromDepositedToSettledBalance(
                trade.buyer._address,
                trade.seller._address,
                trade.transfers.intended.net.mul(- 1).sub(trade.seller.netFees.intended),
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

        } else if (0 > trade.transfers.conjugate.net.sub(trade.buyer.netFees.conjugate)) {// Transfer from seller to buyer
            clientFund.transferFromDepositedToSettledBalance(
                trade.seller._address,
                trade.buyer._address,
                trade.transfers.conjugate.net.mul(- 1).sub(trade.buyer.netFees.conjugate),
                trade.currencies.conjugate
            );
        }
    }

    function settlePaymentTransfers(Types.Payment payment) private {
        if (0 < payment.transfers.net.sub(payment.source.netFee)) {// Transfer from seller to buyer
            clientFund.transferFromDepositedToSettledBalance(
                payment.source._address,
                payment.destination._address,
                payment.transfers.net.sub(payment.source.netFee),
                payment.currency
            );

        } else if (0 > payment.transfers.net.sub(payment.destination.netFee)) {// Transfer from buyer to seller
            clientFund.transferFromDepositedToSettledBalance(
                payment.destination._address,
                payment.source._address,
                payment.transfers.net.sub(payment.destination.netFee),
                payment.currency
            );
        }
    }

    function addOneSidedSettlementInfoFromTrade(Types.Trade trade, address wallet) private {
        settlements.push(
            Types.Settlement(trade.nonce, Types.DealType.Trade, Types.Sidedness.OneSided, [wallet, address(0)])
        );
        walletSettlementIndexMap[wallet].push(settlements.length - 1);
    }

    function addTwoSidedSettlementInfoFromTrade(Types.Trade trade) private {
        settlements.push(
            Types.Settlement(trade.nonce, Types.DealType.Trade, Types.Sidedness.TwoSided, [trade.buyer._address, trade.seller._address])
        );
        walletSettlementIndexMap[trade.buyer._address].push(settlements.length - 1);
        walletSettlementIndexMap[trade.seller._address].push(settlements.length - 1);
    }

    function addOneSidedSettlementInfoFromPayment(Types.Payment payment, address wallet) private {
        settlements.push(
            Types.Settlement(payment.nonce, Types.DealType.Payment, Types.Sidedness.OneSided, [wallet, address(0)])
        );
        walletSettlementIndexMap[wallet].push(settlements.length - 1);
    }

    function addTwoSidedSettlementInfoFromPayment(Types.Payment payment) private {
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
                revenueFund,
                trade.buyer.netFees.intended,
                trade.currencies.intended
            );
            if (address(0) != trade.currencies.intended)
                revenueFund.recordDepositTokens(ERC20(trade.currencies.intended), trade.buyer.netFees.intended);
        }

        if (0 < trade.buyer.netFees.conjugate) {
            clientFund.withdrawFromDepositedBalance(
                trade.buyer._address,
                revenueFund,
                trade.buyer.netFees.conjugate,
                trade.currencies.conjugate
            );
            if (address(0) != trade.currencies.conjugate)
                revenueFund.recordDepositTokens(ERC20(trade.currencies.conjugate), trade.buyer.netFees.conjugate);
        }

        if (0 < trade.seller.netFees.intended) {
            clientFund.withdrawFromDepositedBalance(
                trade.seller._address,
                revenueFund,
                trade.seller.netFees.intended,
                trade.currencies.intended
            );
            if (address(0) != trade.currencies.intended)
                revenueFund.recordDepositTokens(ERC20(trade.currencies.intended), trade.seller.netFees.intended);
        }

        if (0 < trade.seller.netFees.conjugate) {
            clientFund.withdrawFromDepositedBalance(
                trade.seller._address,
                revenueFund,
                trade.seller.netFees.conjugate,
                trade.currencies.conjugate
            );
            if (address(0) != trade.currencies.conjugate)
                revenueFund.recordDepositTokens(ERC20(trade.currencies.conjugate), trade.seller.netFees.conjugate);
        }
    }

    function settlePaymentFees(Types.Payment payment) private {
        if (0 < payment.source.netFee) {
            clientFund.withdrawFromDepositedBalance(
                payment.source._address,
                revenueFund,
                payment.source.netFee,
                payment.currency
            );
            if (address(0) != payment.currency)
                revenueFund.recordDepositTokens(ERC20(payment.currency), payment.source.netFee);
        }

        if (0 < payment.destination.netFee) {
            clientFund.withdrawFromDepositedBalance(
                payment.destination._address,
                revenueFund,
                payment.destination.netFee,
                payment.currency
            );
            if (address(0) != payment.currency)
                revenueFund.recordDepositTokens(ERC20(payment.currency), payment.destination.netFee);
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

    /// @notice Change the revenue fund contract
    /// @param newRevenueFund The (address of) RevenueFund contract instance
    function changeRevenueFund(RevenueFund newRevenueFund) public onlyOwner {
        if (newRevenueFund != revenueFund) {
            RevenueFund oldRevenueFund = revenueFund;
            revenueFund = newRevenueFund;
            emit ChangeRevenueFundEvent(oldRevenueFund, revenueFund);
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