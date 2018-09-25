/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {AccesorManageable} from "./AccesorManageable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title FraudChallengeByTradeOrderResiduals
@notice Where driips are challenged wrt fraud by mismatch in trade order residuals
*/
contract FraudChallengeByTradeOrderResiduals is Ownable, AccesorManageable, FraudChallengable, Challenge, Validatable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeOrderResidualsEvent(StriimTypes.Trade firstTrade, StriimTypes.Trade lastTrade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccesorManageable(accessorManager) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// trade order residual differences
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function challenge(
        StriimTypes.Trade firstTrade,
        StriimTypes.Trade lastTrade,
        address wallet,
        address currencyCt,
        uint256 currencyId
    )
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlySealedTrade(firstTrade)
    onlySealedTrade(lastTrade)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(StriimTypes.isTradeParty(firstTrade, wallet));
        require(StriimTypes.isTradeParty(lastTrade, wallet));
        require(currencyCt == firstTrade.currencies.intended.ct && currencyId == firstTrade.currencies.intended.id);
        require(currencyCt == lastTrade.currencies.intended.ct && currencyId == lastTrade.currencies.intended.id);

        StriimTypes.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);
        StriimTypes.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);
        require(firstTradePartyRole == lastTradePartyRole);

        if (StriimTypes.TradePartyRole.Buyer == firstTradePartyRole)
            require(firstTrade.buyer.order.hashes.wallet == lastTrade.buyer.order.hashes.wallet);
        else // StriimTypes.TradePartyRole.Seller == firstTradePartyRole
            require(firstTrade.seller.order.hashes.wallet == lastTrade.seller.order.hashes.wallet);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        require(!validator.isGenuineSuccessiveTradeOrderResiduals(firstTrade, lastTrade, firstTradePartyRole));

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(lastTrade);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByTradeOrderResidualsEvent(firstTrade, lastTrade, msg.sender, wallet);
    }
}