const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedConfiguration = artifacts.require("MockedConfiguration");
const MockedClientFund = artifacts.require("MockedClientFund");
const MockedRevenueFund = artifacts.require("MockedRevenueFund");
const MockedFraudChallenge = artifacts.require("MockedFraudChallenge");
const MockedDriipSettlementChallenge = artifacts.require("MockedDriipSettlementChallenge");
const MockedCommunityVote = artifacts.require("MockedCommunityVote");
const MockedValidator = artifacts.require("MockedValidator");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('Exchange', () => {
        let web3Exchange, ethersExchange;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3RevenueFund, ethersRevenueFund;
        let web3CommunityVote, ethersCommunityVote;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3DriipSettlementChallenge, ethersDriipSettlementChallenge;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Exchange = glob.web3Exchange;
            ethersExchange = glob.ethersIoExchange;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);
            web3RevenueFund = await MockedRevenueFund.new(/*glob.owner*/);
            ethersRevenueFund = new Contract(web3RevenueFund.address, MockedRevenueFund.abi, glob.signer_owner);
            web3CommunityVote = await MockedCommunityVote.new(/*glob.owner*/);
            ethersCommunityVote = new Contract(web3CommunityVote.address, MockedCommunityVote.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner, glob.web3AccesorManager.address);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3DriipSettlementChallenge = await MockedDriipSettlementChallenge.new(/*glob.owner*/);
            ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, MockedDriipSettlementChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3AccesorManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);

            await ethersConfiguration.setConfirmations(utils.bigNumberify(0));

            await ethersExchange.changeConfiguration(web3Configuration.address);
            await ethersExchange.changeClientFund(web3ClientFund.address);
            await ethersExchange.changeTradesRevenueFund(web3RevenueFund.address);
            await ethersExchange.changePaymentsRevenueFund(web3RevenueFund.address);
            await ethersExchange.changeCommunityVote(web3CommunityVote.address);
            await ethersExchange.changeFraudChallenge(web3FraudChallenge.address);
            await ethersExchange.changeDriipSettlementChallenge(web3DriipSettlementChallenge.address);
            await ethersExchange.changeValidator(web3Validator.address);
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
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
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

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersExchange.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3Exchange.validator.call();
                });

                afterEach(async () => {
                    await web3Exchange.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3Exchange.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallenge()', () => {
            it('should equal value initialized', async () => {
                const driipSettlementChallenge = await ethersExchange.driipSettlementChallenge();
                driipSettlementChallenge.should.equal(utils.getAddress(ethersDriipSettlementChallenge.address));
            });
        });

        describe('changeDriipSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let driipSettlementChallenge;

                beforeEach(async () => {
                    driipSettlementChallenge = await web3Exchange.driipSettlementChallenge.call();
                });

                afterEach(async () => {
                    await web3Exchange.changeDriipSettlementChallenge(driipSettlementChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Exchange.changeDriipSettlementChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDriipSettlementChallengeEvent');
                    const driipSettlementChallenge = await web3Exchange.driipSettlementChallenge();
                    utils.getAddress(driipSettlementChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Exchange.changeDriipSettlementChallenge(address, {from: glob.user_a}).should.be.rejected;
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
                const count = await ethersExchange.settlementsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('hasSettlementByNonce()', () => {
            it('should equal value initialized', async () => {
                const result = await ethersExchange.hasSettlementByNonce(1);
                result.should.equal(false);
            })
        });

        describe('settlementByNonce()', () => {
            it('should revert', async () => {
                ethersExchange.settlementByNonce(1).should.be.rejected;
            })
        });

        describe('settlementsCountByWallet()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const count = await ethersExchange.settlementsCountByWallet(address);
                count.toNumber().should.equal(0);
            })
        });

        describe('settlementByWalletAndIndex', () => {
            describe('if no matching settlement exists', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersExchange.settlementByWalletAndIndex(address, 1).should.be.rejected;
                })
            });
        });

        describe('settlementByWalletAndNonce', () => {
            describe('if no matching settlement exists', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersExchange.settlementByWalletAndNonce(address, 1).should.be.rejected;
                })
            });
        });

        describe('maxDriipNonce()', () => {
            it('should equal value initialized', async () => {
                const maxDriipNonce = await ethersExchange.maxDriipNonce();
                maxDriipNonce.should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('updateMaxDriipNonce()', () => {
            describe('if community vote returns 0', () => {
                let maxDriipNonce;

                before(async () => {
                    maxDriipNonce = await ethersExchange.maxDriipNonce();
                    await ethersCommunityVote.setMaxDriipNonce(utils.bigNumberify(0));
                });

                it('should not update maxDriipNonce property', async () => {
                    await ethersExchange.updateMaxDriipNonce();
                    const result = await ethersExchange.maxDriipNonce();
                    result.should.deep.equal(maxDriipNonce);
                });
            });

            describe('if community vote returns non-zero value', () => {
                let maxDriipNonce;

                before(async () => {
                    maxDriipNonce = utils.bigNumberify(10);
                    await ethersCommunityVote.setMaxDriipNonce(maxDriipNonce);
                });

                it('should update maxDriipNonce property', async () => {
                    await ethersExchange.updateMaxDriipNonce();
                    const result = await ethersExchange.maxDriipNonce();
                    result.should.deep.equal(maxDriipNonce);
                });
            });
        });

        describe('walletCurrencyMaxDriipNonce()', () => {
            it('should equal value initialized', async () => {
                const maxDriipNonce = await ethersExchange.walletCurrencyMaxDriipNonce(
                    Wallet.createRandom().address, Wallet.createRandom().address, 0
                );
                maxDriipNonce.should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('settleDriipAsTrade()', () => {
            let trade, overrideOptions;

            before(async () => {
                overrideOptions = {gasLimit: 5e6};
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);
                await ethersCommunityVote.reset(overrideOptions);
                await ethersConfiguration.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);

                await ethersConfiguration.setTradeMakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.001', 18), [], [], overrideOptions);
                await ethersConfiguration.setTradeMakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0001', 18), overrideOptions);
                await ethersConfiguration.setTradeTakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [1], [utils.parseUnits('0.1', 18)], overrideOptions);
                await ethersConfiguration.setTradeTakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false, overrideOptions);
                    trade = await mocks.mockTrade(glob.user_a);
                });

                it('should revert', async () => {
                    await ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.setFraudulentTradeHash(true);
                    trade = await mocks.mockTrade(glob.owner);
                });

                afterEach(async () => {
                    await ethersFraudChallenge.reset(overrideOptions);
                });

                it('should revert', async () => {
                    ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is not trade party', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersExchange.settleDriipAsTrade(trade, address, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is flagged as double spender', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                    await ethersCommunityVote.setDoubleSpenderWallet(trade.buyer.wallet, true);
                });

                it('should revert', async () => {
                    ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if driip settlement challenge result is Qualified', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                describe('if operational mode is exit and trade nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if data is unavailable and trade nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if operational mode is normal and data is available', () => {
                    beforeEach(async () => {
                        trade = await mocks.mockTrade(glob.owner, {
                            blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                        });
                        await ethersDriipSettlementChallenge.updateDriipSettlementChallenge(
                            trade.buyer.wallet,
                            trade.nonce,
                            mocks.challengeStatuses.indexOf('Qualified'),
                            trade.buyer.balances.intended.current,
                            trade.currencies.intended.ct,
                            trade.currencies.intended.id,
                            trade.buyer.balances.conjugate.current,
                            trade.currencies.conjugate.ct,
                            trade.currencies.conjugate.id,
                            challenger,
                            overrideOptions
                        );
                    });

                    it('should settle trade successfully', async () => {
                        await ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions);

                        const clientFundUpdateSettledBalanceEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics[0]
                        ));
                        clientFundUpdateSettledBalanceEvents.should.have.lengthOf(2);
                        const clientFundStageEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics[0]
                        ));
                        clientFundStageEvents.should.have.lengthOf(2);
                        const settleDriipEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersExchange.interface.events.SettleDriipAsTradeEvent.topics[0]
                        ));
                        settleDriipEvents.should.have.lengthOf(1);

                        const updateIntendedSettledBalance = await ethersClientFund.getUpdateSettledBalance(0);
                        updateIntendedSettledBalance[0].should.equal(trade.buyer.wallet);
                        updateIntendedSettledBalance[1].should.deep.equal(trade.buyer.balances.intended.current);
                        updateIntendedSettledBalance[2].should.equal(trade.currencies.intended.ct);
                        updateIntendedSettledBalance[3].should.deep.equal(trade.currencies.intended.id);

                        const updateConjugateSettledBalance = await ethersClientFund.getUpdateSettledBalance(1);
                        updateConjugateSettledBalance[0].should.equal(trade.buyer.wallet);
                        updateConjugateSettledBalance[1].should.deep.equal(trade.buyer.balances.conjugate.current);
                        updateConjugateSettledBalance[2].should.equal(trade.currencies.conjugate.ct);
                        updateConjugateSettledBalance[3].should.deep.equal(trade.currencies.conjugate.id);

                        const nBuyerSettlements = await ethersExchange.settlementsCountByWallet(trade.buyer.wallet);
                        const buyerSettlementByIndex = await ethersExchange.settlementByWalletAndIndex(trade.buyer.wallet, nBuyerSettlements.sub(1));
                        buyerSettlementByIndex.nonce.should.deep.equal(trade.nonce);
                        buyerSettlementByIndex.driipType.should.equal(mocks.driipTypes.indexOf('Trade'));
                        buyerSettlementByIndex.origin.wallet.should.equal(trade.seller.wallet);
                        buyerSettlementByIndex.origin.done.should.be.false;
                        buyerSettlementByIndex.target.wallet.should.equal(trade.buyer.wallet);
                        buyerSettlementByIndex.target.done.should.be.true;

                        const buyerSettlementByNonce = await ethersExchange.settlementByWalletAndNonce(trade.buyer.wallet, trade.buyer.nonce);
                        buyerSettlementByNonce.should.deep.equal(buyerSettlementByIndex);

                        const nSellerSettlements = await ethersExchange.settlementsCountByWallet(trade.seller.wallet);
                        const sellerSettlementByIndex = await ethersExchange.settlementByWalletAndIndex(trade.seller.wallet, nSellerSettlements.sub(1));
                        sellerSettlementByIndex.should.deep.equal(buyerSettlementByIndex);

                        const sellerSettlementByNonce = await ethersExchange.settlementByWalletAndNonce(trade.seller.wallet, trade.seller.nonce);
                        sellerSettlementByNonce.should.deep.equal(sellerSettlementByIndex);

                        const buyerIntendedMaxDriipNonce = await ethersExchange.walletCurrencyMaxDriipNonce(
                            trade.buyer.wallet, trade.currencies.intended.ct, trade.currencies.intended.id
                        );
                        buyerIntendedMaxDriipNonce.should.deep.equal(trade.nonce);

                        const buyerConjugateMaxDriipNonce = await ethersExchange.walletCurrencyMaxDriipNonce(
                            trade.buyer.wallet, trade.currencies.conjugate.ct, trade.currencies.conjugate.id
                        );
                        buyerConjugateMaxDriipNonce.should.deep.equal(trade.nonce);

                        const sellerIntendedMaxDriipNonce = await ethersExchange.walletCurrencyMaxDriipNonce(
                            trade.seller.wallet, trade.currencies.intended.ct, trade.currencies.intended.id
                        );
                        sellerIntendedMaxDriipNonce.should.not.deep.equal(trade.nonce);

                        const sellerConjugateMaxDriipNonce = await ethersExchange.walletCurrencyMaxDriipNonce(
                            trade.seller.wallet, trade.currencies.conjugate.ct, trade.currencies.conjugate.id
                        );
                        sellerConjugateMaxDriipNonce.should.not.deep.equal(trade.nonce);
                    });
                });

                describe('if wallet has already settled this trade', () => {
                    beforeEach(async () => {
                        trade = await mocks.mockTrade(glob.owner, {
                            blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                        });
                        await ethersDriipSettlementChallenge.updateDriipSettlementChallenge(
                            trade.buyer.wallet,
                            trade.nonce,
                            mocks.challengeStatuses.indexOf('Qualified'),
                            trade.buyer.balances.intended.current,
                            trade.currencies.intended.ct,
                            trade.currencies.intended.id,
                            trade.buyer.balances.conjugate.current,
                            trade.currencies.conjugate.ct,
                            trade.currencies.conjugate.id,
                            challenger,
                            overrideOptions
                        );
                        await ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });
            });

            describe('if driip settlement challenge result is Disqualified', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                    });
                    await ethersDriipSettlementChallenge.updateDriipSettlementChallenge(
                        trade.buyer.wallet,
                        trade.nonce,
                        mocks.challengeStatuses.indexOf('Disqualified'),
                        trade.buyer.balances.intended.current,
                        trade.currencies.intended.ct,
                        trade.currencies.intended.id,
                        trade.buyer.balances.conjugate.current,
                        trade.currencies.conjugate.ct,
                        trade.currencies.conjugate.id,
                        challenger,
                        overrideOptions
                    );
                });

                it('should seize the wallet', async () => {
                    await ethersExchange.settleDriipAsTrade(trade, trade.buyer.wallet, overrideOptions);
                    const seized = await ethersExchange.isSeizedWallet(trade.buyer.wallet);
                    seized.should.be.true;
                    const seizure = await ethersClientFund.seizures(0);
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(challenger));
                });
            });
        });

        describe('settleDriipAsPayment()', () => {
            let payment, overrideOptions;

            before(async () => {
                overrideOptions = {gasLimit: 5e6};
            });

            beforeEach(async () => {
                await ethersClientFund.reset(overrideOptions);
                await ethersCommunityVote.reset(overrideOptions);
                await ethersConfiguration.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);

                await ethersConfiguration.setPaymentFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [], [], overrideOptions);
                await ethersConfiguration.setPaymentMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false, overrideOptions);
                    payment = await mocks.mockPayment(glob.user_a);
                });

                it('should revert', async () => {
                    await ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.setFraudulentPaymentExchangeHash(true);
                    payment = await mocks.mockPayment(glob.user_a);
                });

                afterEach(async () => {
                    await ethersFraudChallenge.reset(overrideOptions);
                });

                it('should revert', async () => {
                    await ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is not payment party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersExchange.settleDriipAsPayment(payment, address, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is flagged as double spender', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    await ethersCommunityVote.setDoubleSpenderWallet(payment.sender.wallet, true);
                });

                it('should revert', async () => {
                    ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if driip settlement challenge result is Qualified', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                describe('if operational mode is exit and payment nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if data is unavailable and payment nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if operational mode is normal and data is available', () => {
                    beforeEach(async () => {
                        payment = await mocks.mockPayment(glob.owner, {
                            blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                        });
                        await ethersDriipSettlementChallenge.updateDriipSettlementChallenge(
                            payment.sender.wallet,
                            payment.nonce,
                            mocks.challengeStatuses.indexOf('Qualified'),
                            payment.sender.balances.current,
                            payment.currency.ct,
                            payment.currency.id,
                            utils.bigNumberify(0),
                            mocks.address0,
                            utils.bigNumberify(0),
                            challenger,
                            overrideOptions
                        );
                    });

                    it('should settle payment successfully', async () => {
                        await ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions);

                        const clientFundUpdateSettledBalanceEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics[0]
                        ));
                        clientFundUpdateSettledBalanceEvents.should.have.lengthOf(1);
                        const clientFundStageEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics[0]
                        ));
                        clientFundStageEvents.should.have.lengthOf(1);
                        const settleDriipEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersExchange.interface.events.SettleDriipAsPaymentEvent.topics[0]
                        ));
                        settleDriipEvents.should.have.lengthOf(1);

                        const updateSettledBalance = await ethersClientFund.getUpdateSettledBalance(0);
                        updateSettledBalance[0].should.equal(payment.sender.wallet);
                        updateSettledBalance[1].should.deep.equal(payment.sender.balances.current);
                        updateSettledBalance[2].should.equal(payment.currency.ct);
                        updateSettledBalance[3].should.deep.equal(payment.currency.id);

                        const nSenderSettlements = await ethersExchange.settlementsCountByWallet(payment.sender.wallet);
                        const senderSettlementByIndex = await ethersExchange.settlementByWalletAndIndex(payment.sender.wallet, nSenderSettlements.sub(1));
                        senderSettlementByIndex.nonce.should.deep.equal(payment.nonce);
                        senderSettlementByIndex.driipType.should.equal(mocks.driipTypes.indexOf('Payment'));
                        senderSettlementByIndex.origin.wallet.should.equal(payment.sender.wallet);
                        senderSettlementByIndex.origin.done.should.be.true;
                        senderSettlementByIndex.target.wallet.should.equal(payment.recipient.wallet);
                        senderSettlementByIndex.target.done.should.be.false;

                        const senderSettlementByNonce = await ethersExchange.settlementByWalletAndNonce(payment.sender.wallet, payment.sender.nonce);
                        senderSettlementByNonce.should.deep.equal(senderSettlementByIndex);

                        const nRecipientSettlements = await ethersExchange.settlementsCountByWallet(payment.recipient.wallet);
                        const recipientSettlementByIndex = await ethersExchange.settlementByWalletAndIndex(payment.recipient.wallet, nRecipientSettlements.sub(1));
                        recipientSettlementByIndex.should.deep.equal(senderSettlementByIndex);

                        const recipientSettlementByNonce = await ethersExchange.settlementByWalletAndNonce(payment.recipient.wallet, payment.recipient.nonce);
                        recipientSettlementByNonce.should.deep.equal(recipientSettlementByIndex);

                        const senderIntendedMaxDriipNonce = await ethersExchange.walletCurrencyMaxDriipNonce(
                            payment.sender.wallet, payment.currency.ct, payment.currency.id
                        );
                        senderIntendedMaxDriipNonce.should.deep.equal(payment.nonce);

                        const recipientIntendedMaxDriipNonce = await ethersExchange.walletCurrencyMaxDriipNonce(
                            payment.recipient.wallet, payment.currency.ct, payment.currency.id
                        );
                        recipientIntendedMaxDriipNonce.should.not.deep.equal(payment.nonce);
                    });
                });

                describe('if wallet has already settled this payment', () => {
                    beforeEach(async () => {
                        payment = await mocks.mockPayment(glob.owner, {
                            blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                        });
                        await ethersDriipSettlementChallenge.updateDriipSettlementChallenge(
                            payment.sender.wallet,
                            payment.nonce,
                            mocks.challengeStatuses.indexOf('Qualified'),
                            payment.sender.balances.current,
                            payment.currency.ct,
                            payment.currency.id,
                            utils.bigNumberify(0),
                            mocks.address0,
                            utils.bigNumberify(0),
                            challenger,
                            overrideOptions
                        );
                        await ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                    });
                });
            });

            describe('if driip settlement challenge result is Disqualified', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        blockNumber: utils.bigNumberify(await provider.getBlockNumber())
                    });
                    await ethersDriipSettlementChallenge.updateDriipSettlementChallenge(
                        payment.sender.wallet,
                        payment.nonce,
                        mocks.challengeStatuses.indexOf('Disqualified'),
                        payment.sender.balances.current,
                        payment.currency.ct,
                        payment.currency.id,
                        utils.bigNumberify(0),
                        mocks.address0,
                        utils.bigNumberify(0),
                        challenger,
                        overrideOptions
                    );
                });

                it('should seize the wallet', async () => {
                    await ethersExchange.settleDriipAsPayment(payment, payment.sender.wallet, overrideOptions);
                    const seized = await ethersExchange.isSeizedWallet(payment.sender.wallet);
                    seized.should.be.true;
                    const seizure = await ethersClientFund.seizures(0);
                    seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
                    seizure.destination.should.equal(utils.getAddress(challenger));
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
