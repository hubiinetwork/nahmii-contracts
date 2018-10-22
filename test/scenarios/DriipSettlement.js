const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedClientFund = artifacts.require('MockedClientFund');
const MockedRevenueFund = artifacts.require('MockedRevenueFund');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedDriipSettlementChallenge = artifacts.require('MockedDriipSettlementChallenge');
const MockedCommunityVote = artifacts.require('MockedCommunityVote');
const MockedValidator = artifacts.require('MockedValidator');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('DriipSettlement', () => {
        let web3DriipSettlement, ethersDriipSettlement;
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

            web3DriipSettlement = glob.web3DriipSettlement;
            ethersDriipSettlement = glob.ethersIoDriipSettlement;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);
            web3RevenueFund = await MockedRevenueFund.new(/*glob.owner*/);
            ethersRevenueFund = new Contract(web3RevenueFund.address, MockedRevenueFund.abi, glob.signer_owner);
            web3CommunityVote = await MockedCommunityVote.new(/*glob.owner*/);
            ethersCommunityVote = new Contract(web3CommunityVote.address, MockedCommunityVote.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3DriipSettlementChallenge = await MockedDriipSettlementChallenge.new(/*glob.owner*/);
            ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, MockedDriipSettlementChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);

            await ethersConfiguration.setConfirmations(utils.bigNumberify(0));

            await ethersDriipSettlement.changeConfiguration(web3Configuration.address);
            await ethersDriipSettlement.changeClientFund(web3ClientFund.address);
            await ethersDriipSettlement.changeTradesRevenueFund(web3RevenueFund.address);
            await ethersDriipSettlement.changePaymentsRevenueFund(web3RevenueFund.address);
            await ethersDriipSettlement.changeCommunityVote(web3CommunityVote.address);
            await ethersDriipSettlement.changeFraudChallenge(web3FraudChallenge.address);
            await ethersDriipSettlement.changeDriipSettlementChallenge(web3DriipSettlementChallenge.address);
            await ethersDriipSettlement.changeValidator(web3Validator.address);
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlement.address).should.have.lengthOf(42);
            });
        });

        describe('deployer()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlement.deployer.call()).should.equal(glob.owner);
            });
        });

        describe('changeDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3DriipSettlement.changeDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changeDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDeployerEvent');

                    (await web3DriipSettlement.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changeDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlement.operator.call()).should.equal(glob.owner);
            });
        });

        describe('changeOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3DriipSettlement.changeOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changeOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOperatorEvent');

                    (await web3DriipSettlement.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changeOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlement.configuration.call()).should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3DriipSettlement.configuration.call();
                });

                afterEach(async () => {
                    await web3DriipSettlement.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changeConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');

                    utils.getAddress(await web3DriipSettlement.configuration.call()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlement.validator()).should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3DriipSettlement.validator.call();
                });

                afterEach(async () => {
                    await web3DriipSettlement.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changeValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');

                    utils.getAddress(await web3DriipSettlement.validator.call()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallenge()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlement.driipSettlementChallenge()).should.equal(utils.getAddress(ethersDriipSettlementChallenge.address));
            });
        });

        describe('changeDriipSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let driipSettlementChallenge;

                beforeEach(async () => {
                    driipSettlementChallenge = await web3DriipSettlement.driipSettlementChallenge.call();
                });

                afterEach(async () => {
                    await web3DriipSettlement.changeDriipSettlementChallenge(driipSettlementChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changeDriipSettlementChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDriipSettlementChallengeEvent');

                    utils.getAddress(await web3DriipSettlement.driipSettlementChallenge.call()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changeDriipSettlementChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeClientFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let clientFund;

                beforeEach(async () => {
                    clientFund = await web3DriipSettlement.clientFund.call();
                });

                afterEach(async () => {
                    await web3DriipSettlement.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changeClientFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    utils.getAddress(await web3DriipSettlement.clientFund.call()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeTradesRevenueFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let tradesRevenueFund;

                beforeEach(async () => {
                    tradesRevenueFund = await web3DriipSettlement.tradesRevenueFund.call();
                });

                afterEach(async () => {
                    await web3DriipSettlement.changeTradesRevenueFund(tradesRevenueFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changeTradesRevenueFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeTradesRevenueFundEvent');

                    utils.getAddress(await web3DriipSettlement.tradesRevenueFund.call()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changeTradesRevenueFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changePaymentsRevenueFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let paymentsRevenueFund;

                beforeEach(async () => {
                    paymentsRevenueFund = await web3DriipSettlement.paymentsRevenueFund.call();
                });

                afterEach(async () => {
                    await web3DriipSettlement.changePaymentsRevenueFund(paymentsRevenueFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changePaymentsRevenueFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangePaymentsRevenueFundEvent');

                    utils.getAddress(await web3DriipSettlement.paymentsRevenueFund.call()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changePaymentsRevenueFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('communityVoteUpdateDisabled()', () => {
            it('should return value initialized', async () => {
                const result = await ethersDriipSettlement.communityVoteUpdateDisabled();
                result.should.be.false;
            });
        });

        describe('changeCommunityVote()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let communityVote;

                beforeEach(async () => {
                    communityVote = await web3DriipSettlement.communityVote.call();
                });

                afterEach(async () => {
                    await web3DriipSettlement.changeCommunityVote(communityVote);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlement.changeCommunityVote(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCommunityVoteEvent');

                    utils.getAddress(await web3DriipSettlement.communityVote.call()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.changeCommunityVote(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('disableUpdateOfCommunityVote()', () => {
            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlement.disableUpdateOfCommunityVote({from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with deployer as sender', () => {
                let address;

                before(async () => {
                    address = Wallet.createRandom().address;
                });

                it('should disable changing community vote', async () => {
                    await web3DriipSettlement.disableUpdateOfCommunityVote();
                    web3DriipSettlement.changeCommunityVote(address).should.be.rejected;
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlement.isSeizedWallet(glob.user_a)).should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlement.seizedWalletsCount()).toNumber().should.equal(0);
            })
        });

        describe('seizedWallets()', () => {
            it('should equal value initialized', async () => {
                ethersDriipSettlement.seizedWallets(0).should.be.rejected;
            })
        });

        describe('settlementsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlement.settlementsCount()).toNumber().should.equal(0);
            })
        });

        describe('hasSettlementByNonce()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlement.hasSettlementByNonce(1)).should.equal(false);
            })
        });

        describe('settlementByNonce()', () => {
            it('should revert', async () => {
                ethersDriipSettlement.settlementByNonce(1).should.be.rejected;
            })
        });

        describe('settlementsCountByWallet()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                (await ethersDriipSettlement.settlementsCountByWallet(address)).toNumber().should.equal(0);
            })
        });

        describe('settlementByWalletAndIndex', () => {
            describe('if no matching settlement exists', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDriipSettlement.settlementByWalletAndIndex(address, 1).should.be.rejected;
                })
            });
        });

        describe('settlementByWalletAndNonce', () => {
            describe('if no matching settlement exists', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDriipSettlement.settlementByWalletAndNonce(address, 1).should.be.rejected;
                })
            });
        });

        describe('maxDriipNonce()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlement.maxDriipNonce()).should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('updateMaxDriipNonce()', () => {
            describe('if community vote returns 0', () => {
                let maxDriipNonce;

                before(async () => {
                    maxDriipNonce = await ethersDriipSettlement.maxDriipNonce();
                    await ethersCommunityVote.setMaxDriipNonce(utils.bigNumberify(0));
                });

                it('should not update maxDriipNonce property', async () => {
                    await ethersDriipSettlement.updateMaxDriipNonce();
                    (await ethersDriipSettlement.maxDriipNonce()).should.deep.equal(maxDriipNonce);
                });
            });

            describe('if community vote returns non-zero value', () => {
                let maxDriipNonce;

                before(async () => {
                    maxDriipNonce = utils.bigNumberify(10);
                    await ethersCommunityVote.setMaxDriipNonce(maxDriipNonce);
                });

                it('should update maxDriipNonce property', async () => {
                    await ethersDriipSettlement.updateMaxDriipNonce();
                    (await ethersDriipSettlement.maxDriipNonce()).should.deep.equal(maxDriipNonce);
                });
            });
        });

        describe('walletCurrencyMaxDriipNonce()', () => {
            it('should equal value initialized', async () => {
                const maxDriipNonce = await ethersDriipSettlement.walletCurrencyMaxDriipNonce(
                    Wallet.createRandom().address, Wallet.createRandom().address, 0
                );
                maxDriipNonce.should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('settleTrade()', () => {
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
                    ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
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
                    ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is not trade party', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDriipSettlement.settleTrade(trade, address, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is flagged as double spender', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                    await ethersCommunityVote.setDoubleSpenderWallet(trade.buyer.wallet, true);
                });

                it('should revert', async () => {
                    ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
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
                        ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if data is unavailable and trade nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
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
                        await ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions);

                        const clientFundUpdateSettledBalanceEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics[0]
                        ));
                        clientFundUpdateSettledBalanceEvents.should.have.lengthOf(2);
                        const clientFundStageEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics[0]
                        ));
                        clientFundStageEvents.should.have.lengthOf(2);
                        const stageTotalFeeEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlement.interface.events.StageTotalFeeEvent.topics[0]
                        ));
                        stageTotalFeeEvents.should.have.lengthOf(1);
                        const settleDriipEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlement.interface.events.SettleDriipAsTradeEvent.topics[0]
                        ));
                        settleDriipEvents.should.have.lengthOf(1);

                        const updateIntendedSettledBalance = await ethersClientFund._settledBalanceUpdates(0);
                        updateIntendedSettledBalance[0].should.equal(trade.buyer.wallet);
                        updateIntendedSettledBalance[1]._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                        updateIntendedSettledBalance[2].should.equal(trade.currencies.intended.ct);
                        updateIntendedSettledBalance[3]._bn.should.eq.BN(trade.currencies.intended.id._bn);

                        const updateConjugateSettledBalance = await ethersClientFund._settledBalanceUpdates(1);
                        updateConjugateSettledBalance[0].should.equal(trade.buyer.wallet);
                        updateConjugateSettledBalance[1]._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                        updateConjugateSettledBalance[2].should.equal(trade.currencies.conjugate.ct);
                        updateConjugateSettledBalance[3]._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                        const stagesCount = await ethersClientFund._stagesCount();
                        stagesCount._bn.should.eq.BN(3);

                        const intendedHoldingStage = await ethersClientFund._stages(0);
                        intendedHoldingStage[0].should.equal(trade.buyer.wallet);
                        intendedHoldingStage[1].should.equal(mocks.address0);
                        intendedHoldingStage[2]._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                        intendedHoldingStage[3].should.equal(trade.currencies.intended.ct);
                        intendedHoldingStage[4]._bn.should.eq.BN(trade.currencies.intended.id._bn);

                        const conjugateHoldingStage = await ethersClientFund._stages(1);
                        conjugateHoldingStage[0].should.equal(trade.buyer.wallet);
                        conjugateHoldingStage[1].should.equal(mocks.address0);
                        conjugateHoldingStage[2]._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                        conjugateHoldingStage[3].should.equal(trade.currencies.conjugate.ct);
                        conjugateHoldingStage[4]._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                        const totalFeeStage = await ethersClientFund._stages(2);
                        totalFeeStage[0].should.equal(trade.buyer.wallet);
                        totalFeeStage[1].should.equal(utils.getAddress(ethersRevenueFund.address));
                        totalFeeStage[2]._bn.should.eq.BN(trade.buyer.fees.total[0].amount._bn);
                        totalFeeStage[3].should.equal(trade.buyer.fees.total[0].currency.ct);
                        totalFeeStage[4]._bn.should.eq.BN(trade.buyer.fees.total[0].currency.id._bn);

                        const nBuyerSettlements = await ethersDriipSettlement.settlementsCountByWallet(trade.buyer.wallet);
                        const buyerSettlementByIndex = await ethersDriipSettlement.settlementByWalletAndIndex(trade.buyer.wallet, nBuyerSettlements.sub(1));
                        buyerSettlementByIndex.nonce._bn.should.eq.BN(trade.nonce._bn);
                        buyerSettlementByIndex.driipType.should.equal(mocks.driipTypes.indexOf('Trade'));
                        buyerSettlementByIndex.origin.wallet.should.equal(trade.seller.wallet);
                        buyerSettlementByIndex.origin.done.should.be.false;
                        buyerSettlementByIndex.target.wallet.should.equal(trade.buyer.wallet);
                        buyerSettlementByIndex.target.done.should.be.true;

                        const buyerSettlementByNonce = await ethersDriipSettlement.settlementByWalletAndNonce(trade.buyer.wallet, trade.buyer.nonce);
                        buyerSettlementByNonce.should.deep.equal(buyerSettlementByIndex);

                        const nSellerSettlements = await ethersDriipSettlement.settlementsCountByWallet(trade.seller.wallet);
                        const sellerSettlementByIndex = await ethersDriipSettlement.settlementByWalletAndIndex(trade.seller.wallet, nSellerSettlements.sub(1));
                        sellerSettlementByIndex.should.deep.equal(buyerSettlementByIndex);

                        const sellerSettlementByNonce = await ethersDriipSettlement.settlementByWalletAndNonce(trade.seller.wallet, trade.seller.nonce);
                        sellerSettlementByNonce.should.deep.equal(sellerSettlementByIndex);

                        const buyerIntendedMaxDriipNonce = await ethersDriipSettlement.walletCurrencyMaxDriipNonce(
                            trade.buyer.wallet, trade.currencies.intended.ct, trade.currencies.intended.id
                        );
                        buyerIntendedMaxDriipNonce._bn.should.eq.BN(trade.nonce._bn);

                        const buyerConjugateMaxDriipNonce = await ethersDriipSettlement.walletCurrencyMaxDriipNonce(
                            trade.buyer.wallet, trade.currencies.conjugate.ct, trade.currencies.conjugate.id
                        );
                        buyerConjugateMaxDriipNonce._bn.should.eq.BN(trade.nonce._bn);

                        const sellerIntendedMaxDriipNonce = await ethersDriipSettlement.walletCurrencyMaxDriipNonce(
                            trade.seller.wallet, trade.currencies.intended.ct, trade.currencies.intended.id
                        );
                        sellerIntendedMaxDriipNonce._bn.should.not.eq.BN(trade.nonce._bn);

                        const sellerConjugateMaxDriipNonce = await ethersDriipSettlement.walletCurrencyMaxDriipNonce(
                            trade.seller.wallet, trade.currencies.conjugate.ct, trade.currencies.conjugate.id
                        );
                        sellerConjugateMaxDriipNonce._bn.should.not.eq.BN(trade.nonce._bn);
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
                        await ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions).should.be.rejected;
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
                    await ethersDriipSettlement.settleTrade(trade, trade.buyer.wallet, overrideOptions);
                    const seized = await ethersDriipSettlement.isSeizedWallet(trade.buyer.wallet);
                    seized.should.be.true;
                    const seizure = await ethersClientFund.seizures(0);
                    seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
                    seizure.target.should.equal(utils.getAddress(challenger));
                });
            });
        });

        describe('settlePayment()', () => {
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
                    ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.setFraudulentPaymentOperatorHash(true);
                    payment = await mocks.mockPayment(glob.user_a);
                });

                afterEach(async () => {
                    await ethersFraudChallenge.reset(overrideOptions);
                });

                it('should revert', async () => {
                    ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is not payment party', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                });

                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersDriipSettlement.settlePayment(payment, address, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is flagged as double spender', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner);
                    await ethersCommunityVote.setDoubleSpenderWallet(payment.sender.wallet, true);
                });

                it('should revert', async () => {
                    ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
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
                        ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
                    });
                });

                describe('if data is unavailable and payment nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
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
                        await ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions);

                        const clientFundUpdateSettledBalanceEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics[0]
                        ));
                        clientFundUpdateSettledBalanceEvents.should.have.lengthOf(1);
                        const clientFundStageEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics[0]
                        ));
                        clientFundStageEvents.should.have.lengthOf(1);
                        const stageTotalFeeEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlement.interface.events.StageTotalFeeEvent.topics[0]
                        ));
                        stageTotalFeeEvents.should.have.lengthOf(1);
                        const settleDriipEvents = await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlement.interface.events.SettleDriipAsPaymentEvent.topics[0]
                        ));
                        settleDriipEvents.should.have.lengthOf(1);

                        const settledBalanceUpdate = await ethersClientFund._settledBalanceUpdates(0);
                        settledBalanceUpdate[0].should.equal(payment.sender.wallet);
                        settledBalanceUpdate[1]._bn.should.eq.BN(payment.sender.balances.current._bn);
                        settledBalanceUpdate[2].should.equal(payment.currency.ct);
                        settledBalanceUpdate[3]._bn.should.eq.BN(payment.currency.id._bn);

                        const stagesCount = await ethersClientFund._stagesCount();
                        stagesCount._bn.should.eq.BN(2);

                        const holdingStage = await ethersClientFund._stages(0);
                        holdingStage[0].should.equal(payment.sender.wallet);
                        holdingStage[1].should.equal(mocks.address0);
                        holdingStage[2]._bn.should.eq.BN(payment.sender.balances.current._bn);
                        holdingStage[3].should.equal(payment.currency.ct);
                        holdingStage[4]._bn.should.eq.BN(payment.currency.id._bn);

                        const totalFeeStage = await ethersClientFund._stages(1);
                        totalFeeStage[0].should.equal(payment.sender.wallet);
                        totalFeeStage[1].should.equal(utils.getAddress(ethersRevenueFund.address));
                        totalFeeStage[2]._bn.should.eq.BN(payment.sender.fees.total[0].amount._bn);
                        totalFeeStage[3].should.equal(payment.sender.fees.total[0].currency.ct);
                        totalFeeStage[4]._bn.should.eq.BN(payment.sender.fees.total[0].currency.id._bn);

                        const nSenderSettlements = await ethersDriipSettlement.settlementsCountByWallet(payment.sender.wallet);
                        const senderSettlementByIndex = await ethersDriipSettlement.settlementByWalletAndIndex(payment.sender.wallet, nSenderSettlements.sub(1));
                        senderSettlementByIndex.nonce._bn.should.eq.BN(payment.nonce._bn);
                        senderSettlementByIndex.driipType.should.equal(mocks.driipTypes.indexOf('Payment'));
                        senderSettlementByIndex.origin.wallet.should.equal(payment.sender.wallet);
                        senderSettlementByIndex.origin.done.should.be.true;
                        senderSettlementByIndex.target.wallet.should.equal(payment.recipient.wallet);
                        senderSettlementByIndex.target.done.should.be.false;

                        const senderSettlementByNonce = await ethersDriipSettlement.settlementByWalletAndNonce(payment.sender.wallet, payment.sender.nonce);
                        senderSettlementByNonce.should.deep.equal(senderSettlementByIndex);

                        const nRecipientSettlements = await ethersDriipSettlement.settlementsCountByWallet(payment.recipient.wallet);
                        const recipientSettlementByIndex = await ethersDriipSettlement.settlementByWalletAndIndex(payment.recipient.wallet, nRecipientSettlements.sub(1));
                        recipientSettlementByIndex.should.deep.equal(senderSettlementByIndex);

                        const recipientSettlementByNonce = await ethersDriipSettlement.settlementByWalletAndNonce(payment.recipient.wallet, payment.recipient.nonce);
                        recipientSettlementByNonce.should.deep.equal(recipientSettlementByIndex);

                        const senderIntendedMaxDriipNonce = await ethersDriipSettlement.walletCurrencyMaxDriipNonce(
                            payment.sender.wallet, payment.currency.ct, payment.currency.id
                        );
                        senderIntendedMaxDriipNonce._bn.should.eq.BN(payment.nonce._bn);

                        const recipientIntendedMaxDriipNonce = await ethersDriipSettlement.walletCurrencyMaxDriipNonce(
                            payment.recipient.wallet, payment.currency.ct, payment.currency.id
                        );
                        recipientIntendedMaxDriipNonce._bn.should.not.eq.BN(payment.nonce._bn);
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
                        await ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions);
                    });

                    it('should revert', async () => {
                        ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions).should.be.rejected;
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
                    await ethersDriipSettlement.settlePayment(payment, payment.sender.wallet, overrideOptions);
                    const seized = await ethersDriipSettlement.isSeizedWallet(payment.sender.wallet);
                    seized.should.be.true;
                    const seizure = await ethersClientFund.seizures(0);
                    seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
                    seizure.target.should.equal(utils.getAddress(challenger));
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
