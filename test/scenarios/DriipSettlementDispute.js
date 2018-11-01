const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementDispute = artifacts.require('DriipSettlementDispute');
const MockedDriipSettlementChallenge = artifacts.require('MockedDriipSettlementChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('DriipSettlementDispute', () => {
        let web3DriipSettlementDispute, ethersDriipSettlementDispute;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3DriipSettlementChallenge, ethersDriipSettlementChallenge;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let blockNumber0;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3DriipSettlementChallenge = await MockedDriipSettlementChallenge.new(glob.owner);
            ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, MockedDriipSettlementChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
            ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

            await ethersDriipSettlementDispute.changeConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
            await ethersDriipSettlementDispute.changeSecurityBond(ethersSecurityBond.address);
            await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersDriipSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersDriipSettlementDispute.changeDriipSettlementChallenge(ethersDriipSettlementChallenge.address);

            await ethersDriipSettlementChallenge.changeDriipSettlementDispute(ethersDriipSettlementDispute.address);

            blockNumber0 = await provider.getBlockNumber();
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementDispute.deployer.call()).should.equal(glob.owner);
                (await web3DriipSettlementDispute.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDispute.configuration.call())
                    .should.equal(web3Configuration.address);
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');

                    (await ethersDriipSettlementDispute.configuration())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDispute.validator.call())
                    .should.equal(web3Validator.address);
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');

                    (await ethersDriipSettlementDispute.validator())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDispute.securityBond.call())
                    .should.equal(web3SecurityBond.address);
            });
        });

        describe('changeSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeSecurityBond(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');

                    (await ethersDriipSettlementDispute.securityBond())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeSecurityBond(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDispute.fraudChallenge.call())
                    .should.equal(web3FraudChallenge.address);
            });
        });

        describe('changeFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');

                    (await ethersDriipSettlementDispute.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeFraudChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDispute.cancelOrdersChallenge.call())
                    .should.equal(web3CancelOrdersChallenge.address);
            });
        });

        describe('changeCancelOrdersChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeCancelOrdersChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCancelOrdersChallengeEvent');

                    (await ethersDriipSettlementDispute.cancelOrdersChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeCancelOrdersChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDispute.driipSettlementChallenge.call())
                    .should.equal(web3DriipSettlementChallenge.address);
            });
        });

        describe('changeDriipSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeDriipSettlementChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDriipSettlementChallengeEvent');

                    (await ethersDriipSettlementDispute.driipSettlementChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeDriipSettlementChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('challengeByOrder()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            beforeEach(async () => {
                await web3Validator.reset();
                await web3FraudChallenge.reset();
                await web3CancelOrdersChallenge.reset();
                await web3DriipSettlementChallenge._reset();
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if cancel orders challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if driip settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                    await ethersDriipSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called from other than driip settlement challenge', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    ethersDriipSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineOrderWalletSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on closed driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on settlement that has already been challenged', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setProposalStatus(order.wallet, mocks.proposalStatuses.indexOf('Disqualified'));
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([order.seals.operator.hash]);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on order whose amount is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                        order.placement.amount.div(order.placement.rate).mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                    await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                        order.placement.amount.div(order.placement.rate).div(2)
                    );

                    topic = ethersDriipSettlementDispute.interface.events['ChallengeByOrderEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should successfully challenge', async () => {
                    await ethersDriipSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                    (await ethersDriipSettlementChallenge._challengeCandidateOrdersCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge._proposalStatus())
                        .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                    (await ethersDriipSettlementChallenge._proposalCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Order'));
                    (await ethersDriipSettlementChallenge._proposalCandidateIndex())
                        ._bn.should.eq.BN(0);
                    (await web3DriipSettlementChallenge._proposalChallenger())
                        .should.equal(glob.owner);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('unchallengeOrderCandidateByTrade()', () => {
            let order, trade;

            before(async () => {
                await web3Configuration.setUnchallengeOrderCandidateByTradeStake(1000, mocks.address0, 0);
            });

            beforeEach(async () => {
                await web3Validator.reset();
                await web3FraudChallenge.reset();
                await web3CancelOrdersChallenge.reset();
                await web3DriipSettlementChallenge._reset();

                order = await mocks.mockOrder(glob.owner);
                trade = await mocks.mockTrade(glob.owner, {
                    buyer: {
                        wallet: order.wallet,
                        order: {
                            hashes: {
                                operator: order.seals.operator.hash
                            }
                        }
                    }
                });

                await web3DriipSettlementChallenge.setProposalCandidateType(order.wallet, mocks.candidateTypes.indexOf('Order'));
                await ethersDriipSettlementChallenge._setChallengeCandidateOrder(order, {gasLimit: 1e6});
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if security bond contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                    await ethersDriipSettlementDispute.changeConfiguration(ethersConfiguration.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if driip settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                    await ethersDriipSettlementDispute.changeConfiguration(ethersConfiguration.address);
                    await ethersDriipSettlementDispute.changeSecurityBond(ethersSecurityBond.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called from other than driip settlement challenge', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    ethersDriipSettlementDispute.unchallengeOrderCandidateByTrade(order, trade, challenger).should.be.rejected;
                });
            });

            describe('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineOrderWalletSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await ethersValidator.isGenuineTradeSeal(trade, {gasLimit: 1e6});
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called with order wallet that is not trade party', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called with order that is not trade order', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeOrder(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called on closed driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called on driip settlement challenge whose candidate type is not order', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setProposalCandidateType(order.wallet, mocks.candidateTypes.indexOf('Trade'));
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called with fraudulent trade', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentTradeHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called with order that is not the challenged one', () => {
                let candidateOrder;

                beforeEach(async () => {
                    candidateOrder = await mocks.mockOrder(glob.owner);
                    await ethersDriipSettlementChallenge._setChallengeCandidateOrder(candidateOrder, {gasLimit: 1e6});
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if called with trade that does not include the order', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    topic = ethersDriipSettlementDispute.interface.events['UnchallengeOrderCandidateByTradeEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should successfully challenge', async () => {
                    await ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade, {gasLimit: 1e6});

                    (await ethersDriipSettlementChallenge._proposalStatus())
                        .should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    (await ethersDriipSettlementChallenge._proposalCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('None'));
                    (await ethersDriipSettlementChallenge._proposalCandidateIndex())
                        ._bn.should.eq.BN(0);
                    (await web3DriipSettlementChallenge._proposalChallenger())
                        .should.equal(mocks.address0);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByTrade()', () => {
            let trade;

            beforeEach(async () => {
                await web3Validator.reset();
                await web3FraudChallenge.reset();
                await web3CancelOrdersChallenge.reset();
                await web3DriipSettlementChallenge._reset();

                trade = await mocks.mockTrade(glob.owner);

                await ethersDriipSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                    trade.transfers.conjugate.single.div(2)
                );
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if cancel orders challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if driip settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                    await ethersDriipSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called from other than driip settlement challenge', () => {
                it('should revert', async () => {
                    ethersDriipSettlementDispute.challengeByTrade(trade.buyer.wallet, trade, Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await ethersValidator.isGenuineTradeSeal(trade, {gasLimit: 1e6});
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called with wallet that is not trade party', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called on closed driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called on settlement that has already been challenged', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setProposalStatus(trade.buyer.wallet, mocks.proposalStatuses.indexOf('Disqualified'));
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called with fraudulent trade', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentTradeHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([trade.buyer.order.hashes.operator]);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called on trade whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setProposalBlockNumber(1e6);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called on trade whose single transfer amount is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                        trade.transfers.conjugate.single.mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    topic = ethersDriipSettlementDispute.interface.events['ChallengeByTradeEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should successfully challenge', async () => {
                    await ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                    (await ethersDriipSettlementChallenge._challengeCandidateTradesCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge._proposalStatus())
                        .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                    (await ethersDriipSettlementChallenge._proposalCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Trade'));
                    (await ethersDriipSettlementChallenge._proposalCandidateIndex())
                        ._bn.should.eq.BN(0);
                    (await web3DriipSettlementChallenge._proposalChallenger())
                        .should.equal(glob.owner);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByPayment()', () => {
            let payment;

            beforeEach(async () => {
                await web3Validator.reset();
                await web3FraudChallenge.reset();
                await web3DriipSettlementChallenge._reset();

                payment = await mocks.mockPayment(glob.owner);

                await ethersDriipSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                    payment.transfers.single.div(2)
                );
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if driip settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
                    ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

                    await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called from other than driip settlement challenge', () => {
                it('should revert', async () => {
                    ethersDriipSettlementDispute.challengeByPayment(payment, Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await ethersValidator.isGenuinePaymentSeals(payment, {gasLimit: 1e6});
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called on closed driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called on settlement that has already been challenged', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setProposalStatus(payment.sender.wallet, mocks.proposalStatuses.indexOf('Disqualified'));
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called with fraudulent payment', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentPaymentOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called on payment whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setProposalBlockNumber(1e6);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called on payment whose single transfer amount is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                        payment.transfers.single.mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    topic = ethersDriipSettlementDispute.interface.events['ChallengeByPaymentEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should successfully challenge', async () => {
                    await ethersDriipSettlementChallenge.challengeByPayment(payment, {gasLimit: 4e6});

                    (await ethersDriipSettlementChallenge._challengeCandidatePaymentsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge._proposalStatus())
                        .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                    (await ethersDriipSettlementChallenge._proposalCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Payment'));
                    (await ethersDriipSettlementChallenge._proposalCandidateIndex())
                        ._bn.should.eq.BN(0);
                    (await web3DriipSettlementChallenge._proposalChallenger())
                        .should.equal(glob.owner);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });
    });
};
