const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementDispute = artifacts.require('NullSettlementDispute');
const MockedNullSettlementChallenge = artifacts.require('MockedNullSettlementChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedClientFund = artifacts.require('MockedClientFund');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('NullSettlementDispute', () => {
        let web3NullSettlementDispute, ethersNullSettlementDispute;
        let web3NullSettlementChallenge, ethersNullSettlementChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3ClientFund, ethersClientFund;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let blockNumber0;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3NullSettlementChallenge = await MockedNullSettlementChallenge.new(glob.owner);
            ethersNullSettlementChallenge = new Contract(web3NullSettlementChallenge.address, MockedNullSettlementChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new();
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
            ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

            await ethersNullSettlementDispute.setConfiguration(ethersConfiguration.address);
            await ethersNullSettlementDispute.setValidator(ethersValidator.address);
            await ethersNullSettlementDispute.setSecurityBond(ethersSecurityBond.address);
            await ethersNullSettlementDispute.setClientFund(ethersClientFund.address);
            await ethersNullSettlementDispute.setFraudChallenge(ethersFraudChallenge.address);
            await ethersNullSettlementDispute.setCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersNullSettlementDispute.setNullSettlementChallenge(ethersNullSettlementChallenge.address);

            await ethersNullSettlementChallenge.setNullSettlementDispute(ethersNullSettlementDispute.address);

            blockNumber0 = await provider.getBlockNumber();
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementDispute.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementDispute.operator.call()).should.equal(glob.owner);
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.validator.call())
                    .should.equal(web3Validator.address);
            })
        });

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersNullSettlementDispute.validator())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.setValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.fraudChallenge.call())
                    .should.equal(web3FraudChallenge.address);
            });
        });

        describe('setFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.setFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');

                    (await ethersNullSettlementDispute.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.setFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.cancelOrdersChallenge.call())
                    .should.equal(web3CancelOrdersChallenge.address);
            });
        });

        describe('setCancelOrdersChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.setCancelOrdersChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrdersChallengeEvent');

                    (await ethersNullSettlementDispute.cancelOrdersChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.setCancelOrdersChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.nullSettlementChallenge.call())
                    .should.equal(web3NullSettlementChallenge.address);
            });
        });

        describe('setNullSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.setNullSettlementChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeEvent');

                    (await ethersNullSettlementDispute.nullSettlementChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.setNullSettlementChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challengeByOrder()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3NullSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3ClientFund._reset();
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.setValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if cancel order challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.setValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.setFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if null settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.setValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.setFraudChallenge(ethersFraudChallenge.address);
                    await ethersNullSettlementDispute.setCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called from other than null settlement challenge', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineOrderWalletSeal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([order.seals.operator.hash]);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on closed null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on order whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalBlockNumber(1e6);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on order whose amount is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('10000', 18));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('1000', 14));

                    topic = ethersNullSettlementDispute.interface.events['ChallengeByOrderEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                describe('if called with balance reward true', () => {
                    beforeEach(async () => {
                        await web3NullSettlementChallenge._setProposalBalanceReward(true);
                    });

                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._challengeCandidateOrderHashesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Order'));
                        (await ethersNullSettlementChallenge._proposalCandidateIndex())
                            ._bn.should.eq.BN(0);
                        (await web3NullSettlementChallenge._proposalChallenger())
                            .should.equal(glob.owner);

                        (await ethersClientFund.lockedWalletsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if called with balance reward false', () => {
                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._challengeCandidateOrderHashesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Order'));
                        (await ethersNullSettlementChallenge._proposalCandidateIndex())
                            ._bn.should.eq.BN(0);
                        (await web3NullSettlementChallenge._proposalChallenger())
                            .should.equal(glob.owner);

                        (await ethersClientFund.lockedWalletsCount())
                            ._bn.should.eq.BN(0);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(1);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });

        describe('challengeByTrade()', () => {
            let trade;

            before(async () => {
                trade = await mocks.mockTrade(glob.owner);
            });

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3NullSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3ClientFund._reset();
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.setValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if cancel orders challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.setValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.setFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if null settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.setValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.setFraudChallenge(ethersFraudChallenge.address);
                    await ethersNullSettlementDispute.setCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called from other than null settlement challenge', () => {
                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByTrade(trade.buyer.wallet, trade, Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called with wallet that is not trade party', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(Wallet.createRandom().address, trade).should.be.rejected;
                });
            });

            describe('if called with fraudulent trade', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentTradeHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called with trade with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([trade.buyer.order.hashes.operator]);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called on closed null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called on trade whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalBlockNumber(1e6);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if called on trade whose single transfer is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('2', 17));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('5', 16));

                    topic = ethersNullSettlementDispute.interface.events['ChallengeByTradeEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                describe('if called with balance reward true', () => {
                    beforeEach(async () => {
                        await web3NullSettlementChallenge._setProposalBalanceReward(true);
                    });

                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._challengeCandidateTradeHashesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Trade'));
                        (await ethersNullSettlementChallenge._proposalCandidateIndex())
                            ._bn.should.eq.BN(0);
                        (await web3NullSettlementChallenge._proposalChallenger())
                            .should.equal(glob.owner);

                        (await ethersClientFund.lockedWalletsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if called with balance reward false', () => {
                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._challengeCandidateTradeHashesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Trade'));
                        (await ethersNullSettlementChallenge._proposalCandidateIndex())
                            ._bn.should.eq.BN(0);
                        (await web3NullSettlementChallenge._proposalChallenger())
                            .should.equal(glob.owner);

                        (await ethersClientFund.lockedWalletsCount())
                            ._bn.should.eq.BN(0);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(1);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });

        describe('challengeByPayment()', () => {
            let payment;

            before(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3NullSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3ClientFund._reset();
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.setValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if null settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.setValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.setFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called from other than null settlement challenge', () => {
                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByPayment(payment, Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called with fraudulent payment', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentPaymentOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called on closed null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called on payment whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalBlockNumber(1e6);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if called on payment whose single transfer is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('2', 17));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('5', 16));

                    topic = ethersNullSettlementDispute.interface.events['ChallengeByPaymentEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                describe('if called with balance reward true', () => {
                    beforeEach(async () => {
                        await web3NullSettlementChallenge._setProposalBalanceReward(true);
                    });

                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByPayment(payment, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._challengeCandidatePaymentHashesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Payment'));
                        (await ethersNullSettlementChallenge._proposalCandidateIndex())
                            ._bn.should.eq.BN(0);
                        (await web3NullSettlementChallenge._proposalChallenger())
                            .should.equal(glob.owner);

                        (await ethersClientFund.lockedWalletsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if called with balance reward false', () => {
                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByPayment(payment, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._challengeCandidatePaymentHashesCount())
                            ._bn.should.eq.BN(1);
                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Payment'));
                        (await ethersNullSettlementChallenge._proposalCandidateIndex())
                            ._bn.should.eq.BN(0);
                        (await web3NullSettlementChallenge._proposalChallenger())
                            .should.equal(glob.owner);

                        (await ethersClientFund.lockedWalletsCount())
                            ._bn.should.eq.BN(0);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(1);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });
    });
};
