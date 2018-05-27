/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./Configuration.sol";
import "./RevenueFund.sol";
import "./ClientFund.sol";
import "./CommunityVote.sol";
import "./ERC20.sol";
import "./Types.sol";
import "./SecurityBond.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract DealSettlementChallenge {
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

    Configuration public configuration;

    mapping(address => mapping(bytes32 => bool)) public walletOrderExchangeHashCancelledMap;
    mapping(address => Types.Order[]) public walletOrderCancelledListMap;
    mapping(address => mapping(bytes32 => uint256)) public walletOrderExchangeHashIndexMap;
    mapping(address => uint256) public walletOrderCancelledTimeoutMap;

    mapping(address => DealSettlementChallengeInfo) walletDealSettlementChallengeInfoMap;

    mapping(address => Types.Trade[]) public walletDealSettlementChallengedTradesMap;
    mapping(address => Types.Payment[]) public walletDealSettlementChallengedPaymentsMap;

    SecurityBond public securityBond;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event CancelOrdersEvent(Types.Order[] orders, address wallet);
    event ChallengeCancelledOrderEvent(Types.Order order, Types.Trade trade, address wallet);
    event StartDealSettlementChallengeFromTradeEvent(Types.Trade trade, address wallet);
    event StartDealSettlementChallengeFromPaymentEvent(Types.Payment payment, address wallet);
    event ChallengeDealSettlementByOrderEvent(Types.Order order, uint256 nonce, Types.DealType dealType, address wallet);
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);
    event ChangeSecurityBondEvent(SecurityBond oldSecurityBond, SecurityBond newSecurityBond);

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
    function changeOwner(address newOwner)
    public
    onlyOwner
    notNullAddress(newOwner)
    notEqualAddresses(newOwner, owner)
    {
        address oldOwner = owner;
        owner = newOwner;
        emit OwnerChangedEvent(oldOwner, newOwner);
    }

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

    /// @notice Change the security bond contract
    /// @param newSecurityBond The (address of) Configuration contract instance
    function changeSecurityBond(SecurityBond newSecurityBond)
    public
    onlyOwner
    notNullAddress(newSecurityBond)
    notEqualAddresses(newSecurityBond, securityBond)
    {
        SecurityBond oldSecurityBond = securityBond;
        securityBond = newSecurityBond;
        emit ChangeSecurityBondEvent(oldSecurityBond, securityBond);
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
    function cancelOrders(Types.Order[] orders) public
    {
        for (uint256 i = 0; i < orders.length; i++) {
            require(msg.sender == orders[i]._address);
            require(Types.isGenuineSignature(orders[i].seals.wallet.hash, orders[i].seals.wallet.signature, orders[i]._address));
            require(Types.isGenuineSignature(orders[i].seals.exchange.hash, orders[i].seals.exchange.signature, owner));
        }

        for (uint256 j = 0; j < orders.length; j++) {
            walletOrderExchangeHashCancelledMap[msg.sender][orders[j].seals.exchange.hash] = true;
            walletOrderCancelledListMap[msg.sender].push(orders[j]);
            walletOrderExchangeHashIndexMap[msg.sender][orders[j].seals.exchange.hash] = walletOrderCancelledListMap[msg.sender].length - 1;
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
    function cancelledOrdersChallengePhase(address wallet) public view returns (Types.ChallengePhase) {
        if (0 == walletOrderCancelledListMap[wallet].length)
            return Types.ChallengePhase.Closed;
        if (block.timestamp < walletOrderCancelledTimeoutMap[wallet])
            return Types.ChallengePhase.Dispute;
        else
            return Types.ChallengePhase.Closed;
    }

    /// @notice Get the number of current and past deal settlement challenges from trade for given wallet
    /// @param wallet The wallet for which to return count
    function dealSettlementChallengeFromTradeCount(address wallet) public view returns (uint256) {
        return walletDealSettlementChallengedTradesMap[wallet].length;
    }

    /// @notice Get the number of current and past deal settlement challenges from payment for given wallet
    /// @param wallet The wallet for which to return count
    function dealSettlementChallengeFromPaymentCount(address wallet) public view returns (uint256) {
        return walletDealSettlementChallengedPaymentsMap[wallet].length;
    }

    /// @notice Start deal settlement challenge on deal of trade type
    /// @param trade The challenged deal
    /// @param wallet The relevant deal party
    function startDealSettlementChallengeFromTrade(Types.Trade trade, address wallet)
    public
    signedBy(trade.seal.hash, trade.seal.signature, owner)
    {
        if (msg.sender != owner)
            wallet = msg.sender;

        require(isOwner() || Types.isTradeParty(trade, wallet));

        require(
            0 == walletDealSettlementChallengeInfoMap[wallet].nonce ||
            block.timestamp >= walletDealSettlementChallengeInfoMap[wallet].timeout
        );

        walletDealSettlementChallengedTradesMap[wallet].push(trade);

        DealSettlementChallengeInfo memory challenge = DealSettlementChallengeInfo(
            trade.nonce,
            Types.DealType.Trade,
            block.timestamp + configuration.dealSettlementChallengeTimeout(),
            Types.ChallengeStatus.Qualified,
            walletDealSettlementChallengedTradesMap[wallet].length - 1
        );
        walletDealSettlementChallengeInfoMap[wallet] = challenge;

        emit StartDealSettlementChallengeFromTradeEvent(trade, wallet);
    }

    /// @notice Start deal settlement challenge on deal of payment type
    /// @param payment The challenged deal
    /// @param wallet The relevant deal party
    function startDealSettlementChallengeFromPayment(Types.Payment payment, address wallet)
    public
    signedBy(payment.seals.exchange.hash, payment.seals.exchange.signature, owner)
    signedBy(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender._address)
    {
        if (msg.sender != owner)
            wallet = msg.sender;

        require(isOwner() || Types.isPaymentParty(payment, wallet));

        require(
            0 == walletDealSettlementChallengeInfoMap[wallet].nonce ||
            block.timestamp >= walletDealSettlementChallengeInfoMap[wallet].timeout
        );

        walletDealSettlementChallengedPaymentsMap[wallet].push(payment);

        DealSettlementChallengeInfo memory challenge = DealSettlementChallengeInfo(
            payment.nonce,
            Types.DealType.Payment,
            block.timestamp + configuration.dealSettlementChallengeTimeout(),
            Types.ChallengeStatus.Qualified,
            walletDealSettlementChallengedPaymentsMap[wallet].length - 1
        );
        walletDealSettlementChallengeInfoMap[wallet] = challenge;

        emit StartDealSettlementChallengeFromPaymentEvent(payment, wallet);
    }

    /// @notice Get challenged deal that is a trade
    /// @param wallet The wallet whose challenged deal will be searched for
    function getChallengedDealAsTrade(address wallet) public view returns (Types.Trade) {
        require(
            0 < walletDealSettlementChallengeInfoMap[wallet].nonce
            && Types.DealType.Trade == walletDealSettlementChallengeInfoMap[wallet].dealType
        );
        uint256 dealIndex = walletDealSettlementChallengeInfoMap[wallet].dealIndex;
        return walletDealSettlementChallengedTradesMap[wallet][dealIndex];
    }

    /// @notice Get challenged deal that is a payment
    /// @param wallet The wallet whose challenged deal will be searched for
    function getChallengedDealAsPayment(address wallet) public view returns (Types.Payment) {
        require(
            0 < walletDealSettlementChallengeInfoMap[wallet].nonce
            && Types.DealType.Payment == walletDealSettlementChallengeInfoMap[wallet].dealType
        );
        uint256 dealIndex = walletDealSettlementChallengeInfoMap[wallet].dealIndex;
        return walletDealSettlementChallengedPaymentsMap[wallet][dealIndex];
    }

    /// @notice Get deal settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    function dealSettlementChallengePhase(address wallet) public view returns (uint, Types.ChallengePhase) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if (0 == walletDealSettlementChallengeInfoMap[wallet].nonce)
            return (0, Types.ChallengePhase.Closed);
        else if (block.timestamp < walletDealSettlementChallengeInfoMap[wallet].timeout)
            return (walletDealSettlementChallengeInfoMap[wallet].nonce, Types.ChallengePhase.Dispute);
        else
            return (walletDealSettlementChallengeInfoMap[wallet].nonce, Types.ChallengePhase.Closed);
    }

    /// @notice Get deal settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    /// @param nonce The nonce of the challenged deal
    function dealSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeStatus) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if ((0 == walletDealSettlementChallengeInfoMap[wallet].nonce) ||
            (nonce != walletDealSettlementChallengeInfoMap[wallet].nonce))
            return Types.ChallengeStatus.Unknown;
        else
            return walletDealSettlementChallengeInfoMap[wallet].status;
    }

    /// @notice Challenge the deal settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged deal
    function challengeDealSettlementByOrder(Types.Order order)
    public
    signedBy(order.seals.exchange.hash, order.seals.exchange.signature, owner)
    signedBy(order.seals.wallet.hash, order.seals.wallet.signature, order._address)
    {
        address wallet = order._address;

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        int256 orderAmount;
        address orderCurrency;
        if (Types.Intention.Sell == order.placement.intention) {
            orderCurrency = order.placement.currencies.intended;
            orderAmount = order.placement.amount;
        }
        else {// Types.Intention.Buy == order.placement.intention
            orderCurrency = order.placement.currencies.conjugate;
            orderAmount = order.placement.amount.div(order.placement.rate);
        }

        DealSettlementChallengeInfo storage challenge = walletDealSettlementChallengeInfoMap[wallet];
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        && !walletOrderExchangeHashCancelledMap[wallet][order.seals.exchange.hash]
        );

        int256 balance;
        if (Types.DealType.Trade == challenge.dealType) {
            balance = getTradeBalance(
                walletDealSettlementChallengedTradesMap[wallet][challenge.dealIndex],
                wallet,
                orderCurrency
            );

        } else {//Types.DealType.Payment == challenge.dealType
            balance = getPaymentBalance(
                walletDealSettlementChallengedPaymentsMap[wallet][challenge.dealIndex],
                wallet,
                orderCurrency
            );
        }

        require(orderAmount > balance);

        challenge.status = Types.ChallengeStatus.Disqualified;
        emit ChallengeDealSettlementByOrderEvent(order, challenge.nonce, challenge.dealType, msg.sender);
    }

    function getTradeBalance(Types.Trade trade, address wallet, address currency) private pure returns (int256) {
        require(0 < trade.nonce);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);

        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer._address ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.CurrencyRole tradeCurrencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        if (Types.TradePartyRole.Buyer == tradePartyRole)
            if (Types.CurrencyRole.Intended == tradeCurrencyRole)
                return trade.buyer.balances.intended.current;
            else // Types.CurrencyRole.Conjugate == currencyRole
                return trade.buyer.balances.conjugate.current;
        else // Types.TradePartyRole.Seller == tradePartyRole
            if (Types.CurrencyRole.Intended == tradeCurrencyRole)
                return trade.seller.balances.intended.current;
            else // Types.CurrencyRole.Conjugate == currencyRole
                return trade.seller.balances.conjugate.current;
    }

    function getPaymentBalance(Types.Payment payment, address wallet, address currency) private pure returns (int256) {
        require(0 < payment.nonce);
        require(currency == payment.currency);

        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender._address ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);

        if (Types.PaymentPartyRole.Sender == paymentPartyRole)
            return payment.sender.balances.current;
        else //Types.PaymentPartyRole.Recipient == paymentPartyRole
            return payment.recipient.balances.current;
    }

    function isOwner() private view returns (bool) {
        return msg.sender == owner;
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