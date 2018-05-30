const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');
const mocks = require('../mocks');
// const SafeMathInt = artifacts.require("SafeMathInt");
const MockedClientFund = artifacts.require("MockedClientFund");
const MockedReserveFund = artifacts.require("MockedReserveFund");
const MockedRevenueFund = artifacts.require("MockedRevenueFund");
const MockedDealSettlementChallenge = artifacts.require("MockedDealSettlementChallenge");
const MockedCommunityVote = artifacts.require("MockedCommunityVote");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;
const Wallet = ethers.Wallet;

let provider;

module.exports = (glob) => {
    describe('Exchange', () => {
        let web3Exchange, ethersExchange;
        let web3Configuration, ethersConfiguration;
        let web3RevenueFund, ethersRevenueFund;
        let web3DealSettlementChallenge, ethersDealSettlementChallenge;
        let web3CommunityVote, ethersCommunityVote;
        let web3ClientFund, ethersClientFund;
        let web3ReserveFund, ethersReserveFund;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Exchange = glob.web3Exchange;
            ethersExchange = glob.ethersIoExchange;
            web3Configuration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;

            web3RevenueFund = await MockedRevenueFund.new(/*glob.owner*/);
            ethersRevenueFund = new ethers.Contract(web3RevenueFund.address, MockedRevenueFund.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new ethers.Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);
            web3ReserveFund = await MockedReserveFund.new(/*glob.owner*/);
            ethersReserveFund = new ethers.Contract(web3ReserveFund.address, MockedReserveFund.abi, glob.signer_owner);
            web3DealSettlementChallenge = await MockedDealSettlementChallenge.new(/*glob.owner*/);
            ethersDealSettlementChallenge = new ethers.Contract(web3DealSettlementChallenge.address, MockedDealSettlementChallenge.abi, glob.signer_owner);

            // const safeMathInt = await SafeMathInt.deployed();
            // console.log(JSON.stringify(safeMathInt, null, 2));
            // MockedCommunityVote.link(safeMathInt);
            web3CommunityVote = await MockedCommunityVote.new(/*glob.owner*/);
            ethersCommunityVote = new ethers.Contract(web3CommunityVote.address, MockedCommunityVote.abi, glob.signer_owner);

            await ethersExchange.changeConfiguration(web3Configuration.address);
            await ethersExchange.changeCommunityVote(web3CommunityVote.address);
            await ethersExchange.changeTradesRevenueFund(web3RevenueFund.address);
            await ethersExchange.changePaymentsRevenueFund(web3RevenueFund.address);
            await ethersExchange.changeClientFund(web3ClientFund.address);
            await ethersExchange.changeTradesReserveFund(web3ReserveFund.address);
            await ethersExchange.changePaymentsReserveFund(web3ReserveFund.address);
            await ethersExchange.changeDealSettlementChallenge(web3DealSettlementChallenge.address);
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3Exchange.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3Exchange.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await web3Exchange.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3Exchange.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersExchange.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3Exchange.configuration.call();
                });

                afterEach(async () => {
                    await web3Exchange.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3Exchange.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeClientFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let clientFund;

                beforeEach(async () => {
                    clientFund = await web3Exchange.clientFund.call();
                });

                afterEach(async () => {
                    await web3Exchange.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changeClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await web3Exchange.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeTradesReserveFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let tradesReserveFund;

                beforeEach(async () => {
                    tradesReserveFund = await web3Exchange.tradesReserveFund.call();
                });

                afterEach(async () => {
                    await web3Exchange.changeTradesReserveFund(tradesReserveFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changeTradesReserveFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeTradesReserveFundEvent');
                    const reserveFund = await web3Exchange.tradesReserveFund();
                    utils.getAddress(reserveFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changeTradesReserveFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changePaymentsReserveFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let paymentsReserveFund;

                beforeEach(async () => {
                    paymentsReserveFund = await web3Exchange.paymentsReserveFund.call();
                });

                afterEach(async () => {
                    await web3Exchange.changePaymentsReserveFund(paymentsReserveFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changePaymentsReserveFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangePaymentsReserveFundEvent');
                    const reserveFund = await web3Exchange.paymentsReserveFund();
                    utils.getAddress(reserveFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changePaymentsReserveFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeTradesRevenueFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let tradesRevenueFund;

                beforeEach(async () => {
                    tradesRevenueFund = await web3Exchange.tradesRevenueFund.call();
                });

                afterEach(async () => {
                    await web3Exchange.changeTradesRevenueFund(tradesRevenueFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changeTradesRevenueFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeTradesRevenueFundEvent');
                    const revenueFund = await web3Exchange.tradesRevenueFund();
                    utils.getAddress(revenueFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changeTradesRevenueFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changePaymentsRevenueFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let paymentsRevenueFund;

                beforeEach(async () => {
                    paymentsRevenueFund = await web3Exchange.paymentsRevenueFund.call();
                });

                afterEach(async () => {
                    await web3Exchange.changePaymentsRevenueFund(paymentsRevenueFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changePaymentsRevenueFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangePaymentsRevenueFundEvent');
                    const revenueFund = await web3Exchange.paymentsRevenueFund();
                    utils.getAddress(revenueFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changePaymentsRevenueFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('communityVoteUpdateDisabled()', () => {
            it('should return value initialized', async () => {
                const result = await ethersExchange.communityVoteUpdateDisabled();
                result.should.be.false;
            });
        });

        describe('changeCommunityVote()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let communityVote;

                beforeEach(async () => {
                    communityVote = await web3Exchange.communityVote.call();
                });

                afterEach(async () => {
                    await web3Exchange.changeCommunityVote(communityVote);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changeCommunityVote(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCommunityVoteEvent');
                    const communityVote = await web3Exchange.communityVote();
                    utils.getAddress(communityVote).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changeCommunityVote(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('disableUpdateOfCommunityVote()', () => {
            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.disableUpdateOfCommunityVote({from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with owner as sender', () => {
                let address;

                before(async () => {
                    address = Wallet.createRandom().address;
                });

                it('should disable changing community vote', async () => {
                    await web3Exchange.disableUpdateOfCommunityVote();
                    web3Exchange.changeCommunityVote(address).should.be.rejected;
                    // const result1 = await web3Exchange.changeCommunityVote(address);
                    // result1.logs.should.be.an('array').that.is.empty;
                    // const result2 = await web3Exchange.communityVote.call();
                    // result2.should.equal(communityVote);
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                const result = await ethersExchange.isSeizedWallet(glob.user_a);
                result.should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersExchange.seizedWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('seizedWallets()', () => {
            it('should equal value initialized', async () => {
                ethersExchange.seizedWallets(0).should.be.rejected;
            })
        });

        describe('settlementsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersExchange.seizedWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('walletSettlementsCount()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersExchange.walletSettlementsCount(address);
                count.toNumber().should.equal(0);
            })
        });

        describe('walletSettlement', () => {
            describe('if index is out of bounds', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersExchange.walletSettlement(address, 0).should.be.rejected;
                })
            });
        });

        describe('highestAbsoluteDealNonce()', () => {
            it('should equal value initialized', async () => {
                const highestAbsoluteDealNonce = await ethersExchange.highestAbsoluteDealNonce();
                highestAbsoluteDealNonce.eq(utils.bigNumberify(0)).should.be.true;
            });
        });

        describe('updateHighestAbsoluteDealNonce()', () => {
            describe('if community vote returns 0', () => {
                let highestAbsoluteDealNonce;

                before(async () => {
                    highestAbsoluteDealNonce = await ethersExchange.highestAbsoluteDealNonce();
                    await ethersCommunityVote.setHighestAbsoluteDealNonce(utils.bigNumberify(0));
                });

                it('should not update highestAbsoluteDealNonce property', async () => {
                    await ethersExchange.updateHighestAbsoluteDealNonce();
                    const result = await ethersExchange.highestAbsoluteDealNonce();
                    result.eq(highestAbsoluteDealNonce).should.be.true;
                });
            });

            describe('if community vote returns non-zero value', () => {
                let highestAbsoluteDealNonce;

                before(async () => {
                    highestAbsoluteDealNonce = utils.bigNumberify(10);
                    await ethersCommunityVote.setHighestAbsoluteDealNonce(highestAbsoluteDealNonce);
                });

                it('should update highestAbsoluteDealNonce property', async () => {
                    await ethersExchange.updateHighestAbsoluteDealNonce();
                    const result = await ethersExchange.highestAbsoluteDealNonce();
                    result.eq(highestAbsoluteDealNonce).should.be.true;
                });
            });
        });

        describe('settleDealAsTrade()', () => {
            let trade, overrideOptions;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                await ethersConfiguration.setTradeMakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.001', 18), [], [], overrideOptions);
                await ethersConfiguration.setTradeMakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0001', 18), overrideOptions);
                await ethersConfiguration.setTradeTakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [1], [utils.parseUnits('0.1', 18)], overrideOptions);
                await ethersConfiguration.setTradeTakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
            });

            describe('if deal settlement challenge status is Qualified', () => {
                describe('if immediateSettlement is true', () => {
                    beforeEach(async () => {
                        trade = await mocks.mockTrade(glob.owner, {
                            blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                        });
                        await ethersDealSettlementChallenge.setDealSettlementChallengeStatus(trade.buyer.wallet, trade.nonce, mocks.challengeStatuses.indexOf('Qualified'), overrideOptions);
                    });

                    it('should settle both trade parties', async () => {
                        await ethersExchange.settleDealAsTrade(trade, trade.buyer.wallet, overrideOptions);

                        const clientFundTransferEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.TransferFromDepositedToSettledBalanceEvent.topics[0]
                        ));
                        clientFundTransferEvents.should.have.lengthOf(2);
                        const clientFundWithdrawEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.WithdrawFromDepositedBalanceEvent.topics[0]
                        ));
                        clientFundWithdrawEvents.should.have.lengthOf(2);
                        const revenueFundRecordEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersRevenueFund.interface.events.RecordDepositTokensEvent.topics[0]
                        ));
                        revenueFundRecordEvents.should.have.lengthOf(2);
                        const settleDealEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersExchange.interface.events.SettleDealAsTradeEvent.topics[0]
                        ));
                        settleDealEvents.should.have.lengthOf(1);

                        const transfer0 = await ethersClientFund.transfers(0);
                        transfer0.source.should.equal(trade.seller.wallet);
                        transfer0.destination.should.equal(trade.buyer.wallet);
                        transfer0.amount.eq(trade.transfers.intended.net.sub(trade.buyer.netFees.intended)).should.be.true;
                        transfer0.currency.should.equal(trade.currencies.intended);

                        const transfer1 = await ethersClientFund.transfers(1);
                        transfer1.source.should.equal(trade.buyer.wallet);
                        transfer1.destination.should.equal(trade.seller.wallet);
                        transfer1.amount.eq(trade.transfers.conjugate.net.sub(trade.seller.netFees.conjugate)).should.be.true;
                        transfer1.currency.should.equal(trade.currencies.conjugate);

                        const withdrawal0 = await ethersClientFund.withdrawals(0);
                        withdrawal0.source.should.equal(trade.buyer.wallet);
                        withdrawal0.destination.should.equal(utils.getAddress(ethersRevenueFund.address));
                        withdrawal0.amount.eq(trade.buyer.netFees.intended).should.be.true;
                        withdrawal0.currency.should.equal(trade.currencies.intended);

                        const withdrawal1 = await ethersClientFund.withdrawals(1);
                        withdrawal1.source.should.equal(trade.seller.wallet);
                        withdrawal1.destination.should.equal(utils.getAddress(ethersRevenueFund.address));
                        withdrawal1.amount.eq(trade.seller.netFees.conjugate).should.be.true;
                        withdrawal1.currency.should.equal(trade.currencies.conjugate);

                        const nBuyerSettlements = await ethersExchange.walletSettlementsCount(trade.buyer.wallet);
                        const buyerSettlement = await ethersExchange.walletSettlement(trade.buyer.wallet, nBuyerSettlements - 1);
                        buyerSettlement.nonce.eq(trade.nonce).should.be.true;
                        buyerSettlement.dealType.should.equal(mocks.dealTypes.indexOf('Trade'));
                        buyerSettlement.sidedness.should.equal(mocks.sidednesses.indexOf('TwoSided'));
                        buyerSettlement.wallets.should.have.members([trade.buyer.wallet, trade.seller.wallet]);

                        const nSellerSettlements = await ethersExchange.walletSettlementsCount(trade.seller.wallet);
                        const sellerSettlement = await ethersExchange.walletSettlement(trade.seller.wallet, nSellerSettlements - 1);
                        sellerSettlement.should.deep.equal(buyerSettlement);
                    });
                });

                describe('if immediateSettlement is false', () => {
                    describe('if reserve fund does not support settlement', () => {
                        beforeEach(async () => {
                            trade = await mocks.mockTrade(glob.owner, {
                                immediateSettlement: false,
                                blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                            });
                            await ethersDealSettlementChallenge.setDealSettlementChallengeStatus(trade.buyer.wallet, trade.nonce, mocks.challengeStatuses.indexOf('Qualified'), overrideOptions);
                            await ethersReserveFund.setMaxOutboundTransfer(trade.currencies.intended, 0, overrideOptions);
                            await ethersReserveFund.setMaxOutboundTransfer(trade.currencies.conjugate, 0, overrideOptions);
                        });

                        it('should settle both trade parties', async () => {
                            await ethersExchange.settleDealAsTrade(trade, trade.buyer.wallet, overrideOptions);

                            const clientFundTransferEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersClientFund.interface.events.TransferFromDepositedToSettledBalanceEvent.topics[0]
                            ));
                            clientFundTransferEvents.should.have.lengthOf(2);
                            const clientFundWithdrawEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersClientFund.interface.events.WithdrawFromDepositedBalanceEvent.topics[0]
                            ));
                            clientFundWithdrawEvents.should.have.lengthOf(2);
                            const revenueFundRecordEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersRevenueFund.interface.events.RecordDepositTokensEvent.topics[0]
                            ));
                            revenueFundRecordEvents.should.have.lengthOf(2);
                            const settleDealEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersExchange.interface.events.SettleDealAsTradeEvent.topics[0]
                            ));
                            settleDealEvents.should.have.lengthOf(1);

                            const transfer0 = await ethersClientFund.transfers(0);
                            transfer0.source.should.equal(trade.seller.wallet);
                            transfer0.destination.should.equal(trade.buyer.wallet);
                            transfer0.amount.eq(trade.transfers.intended.net.sub(trade.buyer.netFees.intended)).should.be.true;
                            transfer0.currency.should.equal(trade.currencies.intended);

                            const transfer1 = await ethersClientFund.transfers(1);
                            transfer1.source.should.equal(trade.buyer.wallet);
                            transfer1.destination.should.equal(trade.seller.wallet);
                            transfer1.amount.eq(trade.transfers.conjugate.net.sub(trade.seller.netFees.conjugate)).should.be.true;
                            transfer1.currency.should.equal(trade.currencies.conjugate);

                            const withdrawal0 = await ethersClientFund.withdrawals(0);
                            withdrawal0.source.should.equal(trade.buyer.wallet);
                            withdrawal0.destination.should.equal(utils.getAddress(ethersRevenueFund.address));
                            withdrawal0.amount.eq(trade.buyer.netFees.intended).should.be.true;
                            withdrawal0.currency.should.equal(trade.currencies.intended);

                            const withdrawal1 = await ethersClientFund.withdrawals(1);
                            withdrawal1.source.should.equal(trade.seller.wallet);
                            withdrawal1.destination.should.equal(utils.getAddress(ethersRevenueFund.address));
                            withdrawal1.amount.eq(trade.seller.netFees.conjugate).should.be.true;
                            withdrawal1.currency.should.equal(trade.currencies.conjugate);

                            const nBuyerSettlements = await ethersExchange.walletSettlementsCount(trade.buyer.wallet);
                            const buyerSettlement = await ethersExchange.walletSettlement(trade.buyer.wallet, nBuyerSettlements - 1);
                            buyerSettlement.nonce.eq(trade.nonce).should.be.true;
                            buyerSettlement.dealType.should.equal(mocks.dealTypes.indexOf('Trade'));
                            buyerSettlement.sidedness.should.equal(mocks.sidednesses.indexOf('TwoSided'));
                            buyerSettlement.wallets.should.have.members([trade.buyer.wallet, trade.seller.wallet]);

                            const nSellerSettlements = await ethersExchange.walletSettlementsCount(trade.seller.wallet);
                            const sellerSettlement = await ethersExchange.walletSettlement(trade.seller.wallet, nSellerSettlements - 1);
                            sellerSettlement.should.deep.equal(buyerSettlement);
                        });
                    });

                    describe('if reserve fund does support settlement', () => {
                        beforeEach(async () => {
                            trade = await mocks.mockTrade(glob.owner, {
                                immediateSettlement: false,
                                blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                            });
                            await ethersDealSettlementChallenge.setDealSettlementChallengeStatus(trade.buyer.wallet, trade.nonce, mocks.challengeStatuses.indexOf('Qualified'), overrideOptions);
                            await ethersReserveFund.setMaxOutboundTransfer(trade.currencies.intended, utils.parseUnits('1000', 18), overrideOptions);
                            await ethersReserveFund.setMaxOutboundTransfer(trade.currencies.conjugate, utils.parseUnits('1', 18), overrideOptions);
                        });

                        it('should settle only provided party', async () => {
                            await ethersExchange.settleDealAsTrade(trade, trade.buyer.wallet, overrideOptions);

                            const clientFundTransferEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersClientFund.interface.events.TransferFromDepositedToSettledBalanceEvent.topics[0]
                            ));
                            clientFundTransferEvents.should.be.empty;
                            const clientFundWithdrawEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersClientFund.interface.events.WithdrawFromDepositedBalanceEvent.topics[0]
                            ));
                            clientFundWithdrawEvents.should.be.empty;
                            const revenueFundRecordEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersRevenueFund.interface.events.RecordDepositTokensEvent.topics[0]
                            ));
                            revenueFundRecordEvents.should.be.empty;
                            const settleDealEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersExchange.interface.events.SettleDealAsTradeEvent.topics[0]
                            ));
                            settleDealEvents.should.have.lengthOf(1);

                            const nBuyerSettlements = await ethersExchange.walletSettlementsCount(trade.buyer.wallet);
                            const buyerSettlement = await ethersExchange.walletSettlement(trade.buyer.wallet, nBuyerSettlements - 1);
                            buyerSettlement.nonce.eq(trade.nonce).should.be.true;
                            buyerSettlement.dealType.should.equal(mocks.dealTypes.indexOf('Trade'));
                            buyerSettlement.sidedness.should.equal(mocks.sidednesses.indexOf('OneSided'));
                            buyerSettlement.wallets.should.have.members([trade.buyer.wallet, '0x0000000000000000000000000000000000000000']);

                            const nSellerSettlements = await ethersExchange.walletSettlementsCount(trade.seller.wallet);
                            nSellerSettlements.eq(utils.bigNumberify(0)).should.be.true;
                        });
                    });
                });
            });

            describe('if deal settlement challenge status is Disqualified', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                    });
                    ethersDealSettlementChallenge.setDealSettlementChallengeStatus(trade.buyer.wallet, trade.nonce, mocks.challengeStatuses.indexOf('Disqualified'));
                });

                it('should seize the wallet', async () => {
                    await ethersExchange.settleDealAsTrade(trade, trade.buyer.wallet, overrideOptions);
                    const seized = await ethersExchange.isSeizedWallet(trade.buyer.wallet);
                    seized.should.be.true;
                });
            });
        });

        describe('settleDealAsPayment()', () => {
            let payment, overrideOptions;

            before(async () => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);

                await ethersConfiguration.setPaymentFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [], [], overrideOptions);
                await ethersConfiguration.setPaymentMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
            });

            describe('if deal settlement challenge status is Qualified', () => {
                describe('if immediateSettlement is true', () => {
                    beforeEach(async () => {
                        payment = await mocks.mockPayment(glob.owner, {
                            blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                        });
                        await ethersDealSettlementChallenge.setDealSettlementChallengeStatus(payment.sender.wallet, payment.nonce, mocks.challengeStatuses.indexOf('Qualified'), overrideOptions);
                    });

                    it('should settle both payment parties', async () => {
                        await ethersExchange.settleDealAsPayment(payment, payment.sender.wallet, overrideOptions);

                        const clientFundTransferEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.TransferFromDepositedToSettledBalanceEvent.topics[0]
                        ));
                        clientFundTransferEvents.should.have.lengthOf(1);
                        const clientFundWithdrawEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.WithdrawFromDepositedBalanceEvent.topics[0]
                        ));
                        clientFundWithdrawEvents.should.have.lengthOf(1);
                        const revenueFundRecordEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersRevenueFund.interface.events.RecordDepositTokensEvent.topics[0]
                        ));
                        revenueFundRecordEvents.should.have.lengthOf(1);
                        const settleDealEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersExchange.interface.events.SettleDealAsPaymentEvent.topics[0]
                        ));
                        settleDealEvents.should.have.lengthOf(1);

                        const transfer = await ethersClientFund.transfers(0);
                        transfer.source.should.equal(payment.sender.wallet);
                        transfer.destination.should.equal(payment.recipient.wallet);
                        transfer.amount.eq(payment.transfers.net.sub(payment.sender.netFee)).should.be.true;
                        transfer.currency.should.equal(payment.currency);

                        const withdrawal = await ethersClientFund.withdrawals(0);
                        withdrawal.source.should.equal(payment.sender.wallet);
                        withdrawal.destination.should.equal(utils.getAddress(ethersRevenueFund.address));
                        withdrawal.amount.eq(payment.sender.netFee).should.be.true;
                        withdrawal.currency.should.equal(payment.currency);

                        const nSenderSettlements = await ethersExchange.walletSettlementsCount(payment.sender.wallet);
                        const senderSettlement = await ethersExchange.walletSettlement(payment.sender.wallet, nSenderSettlements - 1);
                        senderSettlement.nonce.eq(payment.nonce).should.be.true;
                        senderSettlement.dealType.should.equal(mocks.dealTypes.indexOf('Payment'));
                        senderSettlement.sidedness.should.equal(mocks.sidednesses.indexOf('TwoSided'));
                        senderSettlement.wallets.should.have.members([payment.sender.wallet, payment.recipient.wallet]);

                        const nRecipientSettlements = await ethersExchange.walletSettlementsCount(payment.recipient.wallet);
                        const recipientSettlement = await ethersExchange.walletSettlement(payment.recipient.wallet, nRecipientSettlements - 1);
                        recipientSettlement.should.deep.equal(senderSettlement);
                    });
                });

                describe('if immediateSettlement is false', () => {
                    describe('if reserve fund does not support settlement', () => {
                        beforeEach(async () => {
                            payment = await mocks.mockPayment(glob.owner, {
                                immediateSettlement: false,
                                blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                            });
                            await ethersDealSettlementChallenge.setDealSettlementChallengeStatus(payment.sender.wallet, payment.nonce, mocks.challengeStatuses.indexOf('Qualified'), overrideOptions);
                            await ethersReserveFund.setMaxOutboundTransfer(payment.currency, 0, overrideOptions);
                        });

                        it('should settle both payment parties', async () => {
                            await ethersExchange.settleDealAsPayment(payment, payment.sender.wallet, overrideOptions);

                            const clientFundTransferEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersClientFund.interface.events.TransferFromDepositedToSettledBalanceEvent.topics[0]
                            ));
                            clientFundTransferEvents.should.have.lengthOf(1);
                            const clientFundWithdrawEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersClientFund.interface.events.WithdrawFromDepositedBalanceEvent.topics[0]
                            ));
                            clientFundWithdrawEvents.should.have.lengthOf(1);
                            const revenueFundRecordEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersRevenueFund.interface.events.RecordDepositTokensEvent.topics[0]
                            ));
                            revenueFundRecordEvents.should.have.lengthOf(1);
                            const settleDealEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersExchange.interface.events.SettleDealAsPaymentEvent.topics[0]
                            ));
                            settleDealEvents.should.have.lengthOf(1);

                            const transfer = await ethersClientFund.transfers(0);
                            transfer.source.should.equal(payment.sender.wallet);
                            transfer.destination.should.equal(payment.recipient.wallet);
                            transfer.amount.eq(payment.transfers.net.sub(payment.sender.netFee)).should.be.true;
                            transfer.currency.should.equal(payment.currency);

                            const withdrawal = await ethersClientFund.withdrawals(0);
                            withdrawal.source.should.equal(payment.sender.wallet);
                            withdrawal.destination.should.equal(utils.getAddress(ethersRevenueFund.address));
                            withdrawal.amount.eq(payment.sender.netFee).should.be.true;
                            withdrawal.currency.should.equal(payment.currency);

                            const nSenderSettlements = await ethersExchange.walletSettlementsCount(payment.sender.wallet);
                            const senderSettlement = await ethersExchange.walletSettlement(payment.sender.wallet, nSenderSettlements - 1);
                            senderSettlement.nonce.eq(payment.nonce).should.be.true;
                            senderSettlement.dealType.should.equal(mocks.dealTypes.indexOf('Payment'));
                            senderSettlement.sidedness.should.equal(mocks.sidednesses.indexOf('TwoSided'));
                            senderSettlement.wallets.should.have.members([payment.sender.wallet, payment.recipient.wallet]);

                            const nRecipientSettlements = await ethersExchange.walletSettlementsCount(payment.recipient.wallet);
                            const recipientSettlement = await ethersExchange.walletSettlement(payment.recipient.wallet, nRecipientSettlements - 1);
                            recipientSettlement.should.deep.equal(senderSettlement);
                        });
                    });

                    describe('if reserve fund does support settlement', () => {
                        beforeEach(async () => {
                            payment = await mocks.mockPayment(glob.owner, {
                                immediateSettlement: false,
                                blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                            });
                            await ethersDealSettlementChallenge.setDealSettlementChallengeStatus(payment.sender.wallet, payment.nonce, mocks.challengeStatuses.indexOf('Qualified'), overrideOptions);
                            await ethersReserveFund.setMaxOutboundTransfer(payment.currency, utils.parseUnits('1000', 18), overrideOptions);
                        });

                        it('should settle only provided party', async () => {
                            await ethersExchange.settleDealAsPayment(payment, payment.sender.wallet, overrideOptions);

                            const clientFundTransferEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersClientFund.interface.events.TransferFromDepositedToSettledBalanceEvent.topics[0]
                            ));
                            clientFundTransferEvents.should.be.empty;
                            const clientFundWithdrawEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersClientFund.interface.events.WithdrawFromDepositedBalanceEvent.topics[0]
                            ));
                            clientFundWithdrawEvents.should.be.empty;
                            const revenueFundRecordEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersRevenueFund.interface.events.RecordDepositTokensEvent.topics[0]
                            ));
                            revenueFundRecordEvents.should.be.empty;
                            const settleDealEvents = await provider.getLogs(await fromBlockTopicsFilter(
                                ethersExchange.interface.events.SettleDealAsPaymentEvent.topics[0]
                            ));
                            settleDealEvents.should.have.lengthOf(1);

                            const nSenderSettlements = await ethersExchange.walletSettlementsCount(payment.sender.wallet);
                            const senderSettlement = await ethersExchange.walletSettlement(payment.sender.wallet, nSenderSettlements - 1);
                            senderSettlement.nonce.eq(payment.nonce).should.be.true;
                            senderSettlement.dealType.should.equal(mocks.dealTypes.indexOf('Payment'));
                            senderSettlement.sidedness.should.equal(mocks.sidednesses.indexOf('OneSided'));
                            senderSettlement.wallets.should.have.members([payment.sender.wallet, '0x0000000000000000000000000000000000000000']);

                            const nRecipientSettlements = await ethersExchange.walletSettlementsCount(payment.recipient.wallet);
                            nRecipientSettlements.eq(utils.bigNumberify(0)).should.be.true;
                        });
                    });
                });
            });

            describe('if deal settlement challenge status is Disqualified', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                    });
                    ethersDealSettlementChallenge.setDealSettlementChallengeStatus(payment.sender.wallet, payment.nonce, mocks.challengeStatuses.indexOf('Disqualified'));
                });

                it('should seize the wallet', async () => {
                    await ethersExchange.settleDealAsPayment(payment, payment.sender.wallet, overrideOptions);
                    const seized = await ethersExchange.isSeizedWallet(payment.sender.wallet);
                    seized.should.be.true;
                });
            });
        });
    });
};

const fromBlockTopicsFilter = async (...topics) => {
    return {
        fromBlock: await provider.getBlockNumber(),
        topics
    };
};
