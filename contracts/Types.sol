pragma solidity ^0.4.24;

/**
 * @title     Types
 * @dev       Data types
 * Copyright  (C) 2017-2018 Hubii AS
 */
library Types {

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum LiquidityRole {Maker, Taker}
    enum CurrencyRole {Intended, Conjugate}
    enum DealType {Trade, Payment}
    enum Sidedness {OneSided, TwoSided}
    enum Intention {Buy, Sell}
    enum TradePartyRole {Buyer, Seller}
    enum PaymentPartyRole {Sender, Recipient}
    enum ChallengePhase {Dispute, Closed}
    enum ChallengeResult {Unknown, Qualified, Disqualified}

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

    struct WalletExchangeHashes {
        bytes32 wallet;
        bytes32 exchange;
    }

    struct TradeOrder {
        int256 amount;
        WalletExchangeHashes hashes;
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

    struct WalletExchangeSeals {
        Seal wallet;
        Seal exchange;
    }

    struct TradeParty {
        address wallet;
        uint256 nonce;
        uint256 rollingVolume;
        LiquidityRole liquidityRole;
        TradeOrder order;
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

        // Positive intended transfer is always in direction from seller to buyer
        // Positive conjugate transfer is always in direction from buyer to seller
        IntendedConjugateSingleNetInt256 transfers;

        IntendedConjugateInt256 singleFees;

        Seal seal;
        uint256 blockNumber;
    }

    struct PaymentParty {
        address wallet;
        uint256 nonce;
        CurrentPreviousInt256 balances;
        int256 netFee;
    }

    struct Payment {
        uint256 nonce;
        bool immediateSettlement;
        int256 amount;

        address currency;

        PaymentParty sender;
        PaymentParty recipient;

        // Positive transfer is always in direction from sender to recipient
        SingleNetInt256 transfers;

        int256 singleFee;

        WalletExchangeSeals seals;
        uint256 blockNumber;
    }

    struct OrderPlacement {
        Intention intention;
        bool immediateSettlement;
        int256 amount;
        int256 rate;

        IntendedConjugateAddress currencies;

        CurrentPreviousInt256 residuals;
    }

    struct Order {
        uint256 nonce;
        address wallet;
        OrderPlacement placement;
        WalletExchangeSeals seals;
        uint256 blockNumber;
    }

    struct Settlement {
        uint256 nonce;
        DealType dealType;
        Sidedness sidedness;
        address[2] wallets;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function hashTrade(Trade trade) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(trade.nonce));
        //        return keccak256(packTradeData(trade));
    }

    function hashPaymentAsWallet(Payment payment) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(payment.nonce));
        //        return keccak256(packPaymentDataAsWallet(payment));
    }

    function hashPaymentAsExchange(Payment payment) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(payment.nonce));
        //        return keccak256(packPaymentDataAsExchange(payment));
    }

    function hashOrderAsWallet(Order order) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(order.nonce));
        //        return keccak256(packOrderDataAsWallet(order));
    }

    function hashOrderAsExchange(Order order) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(order.nonce));
        //        return keccak256(packOrderDataAsExchange(order));
    }

    //    function packTradeData(Trade trade) internal pure returns (bytes32[]) {
    //        uint256 numParams = 37;
    //        uint256 index = 0;
    //        bytes32[] memory data = new bytes32[](numParams);
    //
    //        index = packTradeGlobalData(trade, data, index);
    //        index = packTradeBuyerData(trade, data, index);
    //        index = packTradeSellerData(trade, data, index);
    //        index = packTradeTransfersData(trade, data, index);
    //        index = packTradeSingleFeesData(trade, data, index);
    //
    //        assert(numParams == index);
    //        return data;
    //    }
    //
    //    function packPaymentDataAsWallet(Payment payment) internal pure returns (bytes32[]) {
    //        uint256 numParams = 14;
    //        uint256 index = 0;
    //        bytes32[] memory data = new bytes32[](numParams);
    //
    //        index = packPaymentAmountData(payment, data, index);
    //        index = packPaymentSenderData(payment, data, index);
    //        index = packPaymentRecipientData(payment, data, index);
    //        index = packPaymentTransfersData(payment, data, index);
    //        index = packPaymentSingleFeeData(payment, data, index);
    //
    //        assert(numParams == index);
    //        return data;
    //    }
    //
    //    function packPaymentDataAsExchange(Payment payment) internal pure returns (bytes32[]) {
    //        uint256 numParams = 4;
    //        uint256 index = 0;
    //        bytes32[] memory data = new bytes32[](numParams);
    //
    //        index = packPaymentWalletSignatureData(payment, data, index);
    //        index = packPaymentNonceData(payment, data, index);
    //
    //        assert(numParams == index);
    //        return data;
    //    }
    //
    //    function packOrderDataAsWallet(Order order) internal pure returns (bytes32[]) {
    //        uint256 numParams = 7;
    //        uint256 index = 0;
    //        bytes32[] memory data = new bytes32[](numParams);
    //
    //        index = packOrderGlobalData(order, data, index);
    //        index = packOrderPlacementData(order, data, index);
    //
    //        assert(numParams == index);
    //        return data;
    //    }
    //
    //    function packOrderDataAsExchange(Order order) internal pure returns (bytes32[]) {
    //        uint256 numParams = 5;
    //        uint256 index = 0;
    //        bytes32[] memory data = new bytes32[](numParams);
    //
    //        index = packOrderWalletSignatureData(order, data, index);
    //        index = packOrderPlacementResidualsData(order, data, index);
    //
    //        assert(numParams == index);
    //        return data;
    //    }
    //
    //    function packTradeGlobalData(Trade trade, bytes32[] memory data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(trade.nonce);
    //        data[index++] = bytes32(trade.amount);
    //        data[index++] = bytes32(trade.currencies.intended);
    //        data[index++] = bytes32(trade.currencies.conjugate);
    //        data[index++] = bytes32(trade.rate);
    //        return index;
    //    }
    //
    //    function packTradeBuyerData(Trade trade, bytes32[] memory data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(trade.buyer.nonce);
    //        data[index++] = bytes32(trade.buyer.wallet);
    //        data[index++] = bytes32(trade.buyer.order.hashes.wallet);
    //        data[index++] = bytes32(trade.buyer.order.hashes.exchange);
    //        data[index++] = bytes32(trade.buyer.order.amount);
    //        data[index++] = bytes32(trade.buyer.order.residuals.current);
    //        data[index++] = bytes32(trade.buyer.order.residuals.previous);
    //        data[index++] = bytes32(trade.buyer.balances.intended.current);
    //        data[index++] = bytes32(trade.buyer.balances.intended.previous);
    //        data[index++] = bytes32(trade.buyer.balances.conjugate.current);
    //        data[index++] = bytes32(trade.buyer.balances.conjugate.previous);
    //        data[index++] = bytes32(trade.buyer.netFees.intended);
    //        data[index++] = bytes32(trade.buyer.netFees.conjugate);
    //        return index;
    //    }
    //
    //    function packTradeSellerData(Trade trade, bytes32[] memory data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(trade.seller.nonce);
    //        data[index++] = bytes32(trade.seller.wallet);
    //        data[index++] = bytes32(trade.seller.order.hashes.wallet);
    //        data[index++] = bytes32(trade.seller.order.hashes.exchange);
    //        data[index++] = bytes32(trade.seller.order.amount);
    //        data[index++] = bytes32(trade.seller.order.residuals.current);
    //        data[index++] = bytes32(trade.seller.order.residuals.previous);
    //        data[index++] = bytes32(trade.seller.balances.intended.current);
    //        data[index++] = bytes32(trade.seller.balances.intended.previous);
    //        data[index++] = bytes32(trade.seller.balances.conjugate.current);
    //        data[index++] = bytes32(trade.seller.balances.conjugate.previous);
    //        data[index++] = bytes32(trade.seller.netFees.intended);
    //        data[index++] = bytes32(trade.seller.netFees.conjugate);
    //        return index;
    //    }
    //
    //    function packTradeTransfersData(Trade trade, bytes32[] memory data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(trade.transfers.intended.single);
    //        data[index++] = bytes32(trade.transfers.intended.net);
    //        data[index++] = bytes32(trade.transfers.conjugate.single);
    //        data[index++] = bytes32(trade.transfers.conjugate.net);
    //        return index;
    //    }
    //
    //    function packTradeSingleFeesData(Trade trade, bytes32[] memory data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(trade.singleFees.intended);
    //        data[index++] = bytes32(trade.singleFees.conjugate);
    //        return index;
    //    }
    //
    //    function packPaymentAmountData(Payment payment, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(payment.amount);
    //        return index;
    //    }
    //
    //    function packPaymentSenderData(Payment payment, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(payment.sender.nonce);
    //        data[index++] = bytes32(payment.sender.wallet);
    //        data[index++] = bytes32(payment.sender.balances.current);
    //        data[index++] = bytes32(payment.sender.balances.previous);
    //        data[index++] = bytes32(payment.sender.netFee);
    //        return index;
    //    }
    //
    //    function packPaymentRecipientData(Payment payment, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(payment.recipient.nonce);
    //        data[index++] = bytes32(payment.recipient.wallet);
    //        data[index++] = bytes32(payment.recipient.balances.current);
    //        data[index++] = bytes32(payment.recipient.balances.previous);
    //        data[index++] = bytes32(payment.recipient.netFee);
    //        return index;
    //    }
    //
    //    function packPaymentTransfersData(Payment payment, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(payment.transfers.single);
    //        data[index++] = bytes32(payment.transfers.net);
    //        return index;
    //    }
    //
    //    function packPaymentSingleFeeData(Payment payment, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(payment.singleFee);
    //        return index;
    //    }
    //
    //    function packPaymentWalletSignatureData(Payment payment, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(payment.seals.wallet.signature.v);
    //        data[index++] = bytes32(payment.seals.wallet.signature.r);
    //        data[index++] = bytes32(payment.seals.wallet.signature.s);
    //        return index;
    //    }
    //
    //    function packPaymentNonceData(Payment payment, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(payment.nonce);
    //        return index;
    //    }
    //
    //    function packOrderGlobalData(Order order, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(order.nonce);
    //        data[index++] = bytes32(order.wallet);
    //        return index;
    //    }
    //
    //    function packOrderPlacementData(Order order, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(uint256(order.placement.intention));
    //        data[index++] = bytes32(order.placement.amount);
    //        data[index++] = bytes32(order.placement.currencies.intended);
    //        data[index++] = bytes32(order.placement.currencies.conjugate);
    //        data[index++] = bytes32(order.placement.rate);
    //        return index;
    //    }
    //
    //    function packOrderWalletSignatureData(Order order, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(order.seals.wallet.signature.v);
    //        data[index++] = bytes32(order.seals.wallet.signature.r);
    //        data[index++] = bytes32(order.seals.wallet.signature.s);
    //        return index;
    //    }
    //
    //    function packOrderPlacementResidualsData(Order order, bytes32[] data, uint256 index) private pure returns (uint256) {
    //        data[index++] = bytes32(order.placement.residuals.current);
    //        data[index++] = bytes32(order.placement.residuals.previous);
    //        return index;
    //    }

    function isTradeParty(Types.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.buyer.wallet || wallet == trade.seller.wallet;
    }

    function isTradeBuyer(Types.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.buyer.wallet;
    }

    function isTradeSeller(Types.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.seller.wallet;
    }

    function isPaymentParty(Types.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.sender.wallet || wallet == payment.recipient.wallet;
    }

    function isPaymentSender(Types.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.sender.wallet;
    }

    function isPaymentRecipient(Types.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.recipient.wallet;
    }

    function isTradeOrder(Types.Trade trade, Types.Order order) internal pure returns (bool) {
        return (trade.buyer.order.hashes.exchange == order.seals.exchange.hash ||
        trade.seller.order.hashes.exchange == order.seals.exchange.hash);
    }

    function isGenuineSignature(bytes32 hash, Types.Signature signature, address signer) internal pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        return ecrecover(prefixedHash, signature.v, signature.r, signature.s) == signer;
    }
}