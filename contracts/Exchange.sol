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
    enum ChallengePhase {Dispute, Closed}

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

    mapping(address => mapping(bytes32 => bool)) walletOrderExchangeHashCancelledMap;
    mapping(address => Types.Order[]) walletOrderCancelledListMap;
    mapping(address => mapping(bytes32 => uint256)) walletOrderExchangeHashIndexMap;
    mapping(address => uint256) walletOrderCancelledTimeoutMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event CancelOrdersEvent(Types.Order[] orders, address wallet);
    event ChallengeCancelledOrderEvent(Types.Order order, Types.Trade trade, address wallet);
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

    /// @notice Get count of cancelled orders for given wallet
    /// @param wallet The wallet for which to return the count of cancelled orders
    function getCancelledOrdersCount(address wallet) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < walletOrderCancelledListMap[wallet].length; i++) {
            Types.Order storage order = walletOrderCancelledListMap[wallet][i];
            if (walletOrderExchangeHashCancelledMap[wallet][order.seals.exchange.hash])
                count++;
        }
        return count;
    }

    /// @notice Get 10 cancelled orders for given wallet starting at given start index
    /// @param wallet The wallet for which to return the nonces of cancelled orders
    /// @param startIndex The start index from which to extract order nonces, used for pagination
    function getCancelledOrders(address wallet, uint256 startIndex) public view returns (Types.Order[10]) {
        Types.Order[10] memory returnOrders;
        uint256 i = 0;
        uint256 j = startIndex;
        while (i < 10 && j < walletOrderCancelledListMap[wallet].length) {
            Types.Order storage order = walletOrderCancelledListMap[wallet][j];
            if (walletOrderExchangeHashCancelledMap[wallet][order.seals.exchange.hash]) {
                returnOrders[i] = order;
                i++;
            }
            j++;
        }
        return returnOrders;
    }

    /// @notice Cancel orders
    /// @param orders The orders to cancel
    function cancelOrders(Types.Order[] orders)
    public
    {
        for (uint256 i = 0; i < orders.length; i++) {
            require(msg.sender == orders[i]._address);
            require(isGenuineSignature(orders[i].seals.party.hash, orders[i].seals.party.signature, orders[i]._address));
            require(isGenuineSignature(orders[i].seals.exchange.hash, orders[i].seals.exchange.signature, owner));

            walletOrderExchangeHashCancelledMap[msg.sender][orders[i].seals.exchange.hash] = true;
            walletOrderCancelledListMap[msg.sender].push(orders[i]);
            walletOrderExchangeHashIndexMap[msg.sender][orders[i].seals.exchange.hash] = walletOrderCancelledListMap[msg.sender].length - 1;
        }

        walletOrderCancelledTimeoutMap[msg.sender] = block.timestamp.add(configuration.cancelOrderChallengeTimeout());

        emit CancelOrdersEvent(orders, msg.sender);
    }

    /// @notice Challenge cancelled order
    /// @param trade The trade that challenges a cancelled order
    /// @param wallet The concerned wallet
    function challengeCancelledOrder(Types.Trade trade, address wallet)
    public
    signedBy(trade.seal.hash, trade.seal.signature, owner)
    {
        require(block.timestamp < walletOrderCancelledTimeoutMap[wallet]);

        bytes32 orderExchangeHash = (
        wallet == trade.buyer._address ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange
        );

        require(walletOrderExchangeHashCancelledMap[wallet][orderExchangeHash]);

        walletOrderExchangeHashCancelledMap[wallet][orderExchangeHash] = false;

        uint256 orderIndex = walletOrderExchangeHashIndexMap[wallet][orderExchangeHash];
        Types.Order memory order = walletOrderCancelledListMap[wallet][orderIndex];
        emit ChallengeCancelledOrderEvent(order, trade, msg.sender);
    }

    /// @notice Get current phase of a wallets cancelled order challenge
    /// @param wallet The address of wallet for which the cancelled order challenge phase is returned
    function cancelledOrdersChallengePhase(address wallet) public view returns (ChallengePhase) {
        if (0 == walletOrderCancelledListMap[wallet].length)
            return ChallengePhase.Closed;
        if (block.timestamp < walletOrderCancelledTimeoutMap[wallet])
            return ChallengePhase.Dispute;
        else
            return ChallengePhase.Closed;
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

        require(isTradeParty(trade, wallet));

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

        require(isPaymentParty(payment, wallet));

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

    function isGenuineSignature(bytes32 hash, Types.Signature signature, address signer) private pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(prefix, hash);
        return ecrecover(prefixedHash, signature.v, signature.r, signature.s) == signer;
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
        require(msg.sender == owner);
        _;
    }

    modifier equalAddresses(address _address1, address _address2) {
        require(_address1 == _address2);
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