/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {AccessorManageable} from "./AccessorManageable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title FraudChallengeByTradeOrderResiduals
@notice Where driips are challenged wrt fraud by mismatch in trade order residuals
*/
contract FraudChallengeByTradeOrderResiduals is Ownable, AccessorManageable, FraudChallengable, Challenge, Validatable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeOrderResidualsEvent(NahmiiTypes.Trade firstTrade, NahmiiTypes.Trade lastTrade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccessorManageable(accessorManager) public {
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
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.Trade lastTrade,
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

        require(NahmiiTypes.isTradeParty(firstTrade, wallet));
        require(NahmiiTypes.isTradeParty(lastTrade, wallet));
        require(currencyCt == firstTrade.currencies.intended.ct && currencyId == firstTrade.currencies.intended.id);
        require(currencyCt == lastTrade.currencies.intended.ct && currencyId == lastTrade.currencies.intended.id);

        NahmiiTypes.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? NahmiiTypes.TradePartyRole.Buyer : NahmiiTypes.TradePartyRole.Seller);
        NahmiiTypes.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? NahmiiTypes.TradePartyRole.Buyer : NahmiiTypes.TradePartyRole.Seller);
        require(firstTradePartyRole == lastTradePartyRole);

        if (NahmiiTypes.TradePartyRole.Buyer == firstTradePartyRole)
            require(firstTrade.buyer.order.hashes.wallet == lastTrade.buyer.order.hashes.wallet);
        else // NahmiiTypes.TradePartyRole.Seller == firstTradePartyRole
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