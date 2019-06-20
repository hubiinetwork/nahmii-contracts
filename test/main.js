/*!
 * Hubii Network - DEX Trade Smart Contract test suite.
 *
 * Copyright (C) 2017-2018 Hubii
 */

const ethers = require('ethers');
const Helpers = require('./helpers');
const w3prov = new ethers.providers.Web3Provider(web3.currentProvider);

Helpers.augmentWeb3(web3);

contract('Unit tests', function () {
    const glob = {
        owner: web3.eth.coinbase,
        user_a: web3.eth.accounts[1],
        user_b: web3.eth.accounts[2],
        user_c: web3.eth.accounts[3],
        user_d: web3.eth.accounts[4],
        user_e: web3.eth.accounts[5],
        user_f: web3.eth.accounts[6],
        user_g: web3.eth.accounts[7],
        user_h: web3.eth.accounts[8],
        user_i: web3.eth.accounts[9],

        gasLimit: 1800000
    };

    glob.signer_owner = w3prov.getSigner(glob.owner);
    glob.signer_a = w3prov.getSigner(glob.user_a);
    glob.signer_b = w3prov.getSigner(glob.user_b);
    glob.signer_c = w3prov.getSigner(glob.user_c);
    glob.signer_d = w3prov.getSigner(glob.user_d);
    glob.signer_e = w3prov.getSigner(glob.user_e);
    glob.signer_f = w3prov.getSigner(glob.user_f);
    glob.signer_g = w3prov.getSigner(glob.user_g);
    glob.signer_h = w3prov.getSigner(glob.user_h);
    glob.signer_i = w3prov.getSigner(glob.user_i);

    before('Check available account addresses and balances', async () => {
        assert.notEqual(glob.user_a, null);
        assert.notEqual(glob.user_b, null);
        assert.notEqual(glob.user_c, null);
        assert.notEqual(glob.user_d, null);
        assert.notEqual(glob.user_e, null);
        assert.notEqual(glob.user_f, null);
        assert.notEqual(glob.user_g, null);
        assert.notEqual(glob.user_h, null);
        assert.notEqual(glob.user_i, null);
    });

    require('./scenarios/NahmiiToken')(glob);
    require('./scenarios/AuthorizableServable')(glob);
    require('./scenarios/BalanceTracker')(glob);
    require('./scenarios/ClientFund')(glob);
    require('./scenarios/Configuration')(glob);
    require('./scenarios/ERC20TransferController')(glob);
    require('./scenarios/RevenueTokenManager')(glob);
    require('./scenarios/Servable')(glob);
    require('./scenarios/TokenMultiTimelock')(glob);
    require('./scenarios/TransactionTracker')(glob);
    require('./scenarios/CancelOrdersChallenge')(glob);
    require('./scenarios/CommunityVote')(glob);
    require('./scenarios/DriipSettlementByPayment')(glob);
    require('./scenarios/DriipSettlementByTrade')(glob);
    require('./scenarios/DriipSettlementChallengeByOrder')(glob);
    require('./scenarios/DriipSettlementChallengeByPayment')(glob);
    require('./scenarios/DriipSettlementChallengeByTrade')(glob);
    require('./scenarios/DriipSettlementChallengeState')(glob);
    require('./scenarios/DriipSettlementDisputeByOrder')(glob);
    require('./scenarios/DriipSettlementDisputeByPayment')(glob);
    require('./scenarios/DriipSettlementDisputeByTrade')(glob);
    require('./scenarios/DriipSettlementState')(glob);
    // require('./scenarios/ERC721TransferController')(glob);
    require('./scenarios/FraudChallenge')(glob);
    require('./scenarios/FraudChallengeByOrder')(glob);
    require('./scenarios/FraudChallengeByTrade')(glob);
    require('./scenarios/FraudChallengeByPayment')(glob);
    require('./scenarios/FraudChallengeBySuccessiveTrades')(glob);
    require('./scenarios/FraudChallengeBySuccessivePayments')(glob);
    require('./scenarios/FraudChallengeByPaymentSucceedingTrade')(glob);
    require('./scenarios/FraudChallengeByTradeSucceedingPayment')(glob);
    require('./scenarios/FraudChallengeByTradeOrderResiduals')(glob);
    require('./scenarios/FraudChallengeByDoubleSpentOrders')(glob);
    require('./scenarios/FraudChallengeByDuplicateDriipNonceOfTrades')(glob);
    require('./scenarios/NullSettlement')(glob);
    require('./scenarios/NullSettlementChallengeByOrder')(glob);
    require('./scenarios/NullSettlementChallengeByPayment')(glob);
    require('./scenarios/NullSettlementChallengeByTrade')(glob);
    require('./scenarios/NullSettlementChallengeState')(glob);
    require('./scenarios/NullSettlementDisputeByOrder')(glob);
    require('./scenarios/NullSettlementDisputeByPayment')(glob);
    require('./scenarios/NullSettlementDisputeByTrade')(glob);
    require('./scenarios/NullSettlementState')(glob);
    require('./scenarios/PartnerBenefactor')(glob);
    require('./scenarios/PartnerFund')(glob);
    require('./scenarios/PaymentHasher')(glob);
    require('./scenarios/RevenueFund1')(glob);
    require('./scenarios/SecurityBond')(glob);
    require('./scenarios/SignerManager')(glob);
    require('./scenarios/TokenHolderRevenueFund')(glob);
    require('./scenarios/TradeHasher')(glob);
    require('./scenarios/Validator')(glob);
    require('./scenarios/WalletLocker')(glob);
});
