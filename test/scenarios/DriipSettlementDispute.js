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
const MockedWalletLocker = artifacts.require('MockedWalletLocker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('DriipSettlementDispute', () => {
        let web3DriipSettlementDispute, ethersDriipSettlementDispute;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3WalletLocker, ethersWalletLocker;
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
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);

            await web3Configuration.setSettlementChallengeTimeout(web3.eth.blockNumber + 1, 1000);
            await web3Configuration.setWalletSettlementStakeFraction(web3.eth.blockNumber + 1, 1e17);
            await web3Configuration.setOperatorSettlementStakeFraction(web3.eth.blockNumber + 1, 5e17);
        });

        beforeEach(async () => {
            web3DriipSettlementDispute = await DriipSettlementDispute.new(glob.owner);
            ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);

            await ethersDriipSettlementDispute.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementDispute.setValidator(ethersValidator.address);
            await ethersDriipSettlementDispute.setSecurityBond(ethersSecurityBond.address);
            await ethersDriipSettlementDispute.setWalletLocker(ethersWalletLocker.address, false);
            await ethersDriipSettlementDispute.setFraudChallenge(ethersFraudChallenge.address);
            await ethersDriipSettlementDispute.setCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersDriipSettlementDispute.setDriipSettlementChallenge(ethersDriipSettlementChallenge.address);

            await ethersDriipSettlementChallenge.setDriipSettlementDispute(ethersDriipSettlementDispute.address);

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

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementDispute.configuration())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.setConfiguration(address, {from: glob.user_a})
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

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementDispute.validator())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.setValidator(address, {from: glob.user_a})
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

        describe('setSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.setSecurityBond(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSecurityBondEvent');

                    (await ethersDriipSettlementDispute.securityBond())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.setSecurityBond(address, {from: glob.user_a})
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

        describe('setFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.setFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');

                    (await ethersDriipSettlementDispute.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.setFraudChallenge(address, {from: glob.user_a})
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

        describe('setCancelOrdersChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.setCancelOrdersChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrdersChallengeEvent');

                    (await ethersDriipSettlementDispute.cancelOrdersChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.setCancelOrdersChallenge(address, {from: glob.user_a})
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

        describe('setDriipSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.setDriipSettlementChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeEvent');

                    (await ethersDriipSettlementDispute.driipSettlementChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.setDriipSettlementChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('challengeByOrder()', () => {
            let order;

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3DriipSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

                order = await mocks.mockOrder(glob.owner);

                await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                    order.placement.amount.div(order.placement.rate).div(2)
                );
            });

            describe('if called from other than driip settlement challenge', () => {
                it('should revert', async () => {
                    ethersDriipSettlementDispute.challengeByOrder(order, glob.user_a).should.be.rejected;
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

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on settlement that has already been challenged', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setProposalStatus(
                        order.wallet, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on order whose block number is smaller than the proposal block number', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalBlockNumber(
                        order.blockNumber.add(10)
                    );
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
                    topic = ethersDriipSettlementDispute.interface.events['ChallengeByOrderEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                describe('if balance reward is true', () => {
                    beforeEach(async () => {
                        await web3DriipSettlementChallenge._setProposalBalanceReward(true);
                    });

                    it('should successfully challenge and lock client fund balances', async () => {
                        await ethersDriipSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                        (await ethersDriipSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersDriipSettlementChallenge.disqualificationsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersWalletLocker.lockedWalletsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if balance reward is false', () => {
                    it('should successfully challenge and reward security bond', async () => {
                        await ethersDriipSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                        (await ethersDriipSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersDriipSettlementChallenge.disqualificationsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersWalletLocker.lockedWalletsCount())
                            ._bn.should.eq.BN(0);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(1);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });

        describe('unchallengeOrderCandidateByTrade()', () => {
            let order, trade;

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3DriipSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

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

                await web3DriipSettlementChallenge.setProposalStatus(
                    glob.user_a, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                );
                await web3DriipSettlementChallenge._setDisqualificationCandidateType(
                    mocks.candidateTypes.indexOf('Order')
                );
                await web3DriipSettlementChallenge._setDisqualificationCandidateHash(
                    order.seals.operator.hash, {gasLimit: 1e6}
                );
            });

            describe('if called from other than driip settlement challenge', () => {
                it('should revert', async () => {
                    ethersDriipSettlementDispute.unchallengeOrderCandidateByTrade(
                        order, trade, glob.user_a, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineOrderSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await ethersValidator.isGenuineTradeSeal(trade, {gasLimit: 1e6});
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with order wallet that is not trade party', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with order that is not trade order', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeOrder(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on settlement that has not been challenged', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setProposalStatus(
                        glob.user_a, mocks.address0, 0, mocks.settlementStatuses.indexOf('Qualified')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on driip settlement challenge whose disqualification candidate type is not order', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setDisqualificationCandidateType(
                        mocks.candidateTypes.indexOf('Trade')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent trade', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentTradeHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with order that is not the challenge candidate order', () => {
                let candidateOrder;

                beforeEach(async () => {
                    candidateOrder = await mocks.mockOrder(glob.owner);
                    await ethersDriipSettlementChallenge._setDisqualificationCandidateHash(
                        candidateOrder.seals.operator.hash, {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with trade that does not include the challenge candidate order', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                        order, trade, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setDisqualificationsCount(1);

                    topic = ethersDriipSettlementDispute.interface.events['UnchallengeOrderCandidateByTradeEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                describe('if balance reward is false', () => {
                    it('should successfully unchallenge and deprive security bond', async () => {
                        await ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                            order, trade, {gasLimit: 3e6}
                        );

                        (await ethersDriipSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                        (await ethersWalletLocker._unlocksCount())
                            ._bn.should.eq.BN(0);
                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(1);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if balance reward is true', () => {
                    beforeEach(async () => {
                        await web3DriipSettlementChallenge._setProposalBalanceReward(true);
                    });

                    it('should successfully unchallenge and unlock client fund balances', async () => {
                        await ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(
                            order, trade, {gasLimit: 3e6}
                        );

                        (await ethersDriipSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                        (await ethersWalletLocker._unlocksCount())
                            ._bn.should.eq.BN(1);
                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });

        describe('challengeByTrade()', () => {
            let trade;

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3DriipSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

                trade = await mocks.mockTrade(glob.owner);

                await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                    trade.transfers.conjugate.single.div(2)
                );
            });

            describe('if called from other than driip settlement challenge', () => {
                it('should revert', async () => {
                    ethersDriipSettlementDispute.challengeByTrade(
                        trade.buyer.wallet, trade, Wallet.createRandom().address, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await ethersValidator.isGenuineTradeSeal(trade, {gasLimit: 1e6});
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with wallet that is not trade party', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent trade', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentTradeHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([trade.buyer.order.hashes.operator]);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on settlement that has already been challenged', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setProposalStatus(
                        trade.buyer.wallet, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on trade whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalBlockNumber(
                        trade.blockNumber.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on trade whose single transfer amount is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                        trade.transfers.conjugate.single.mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
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

                describe('if balance reward is true', () => {
                    beforeEach(async () => {
                        await web3DriipSettlementChallenge._setProposalBalanceReward(true);
                    });

                    it('should successfully challenge', async () => {
                        await ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                        (await ethersDriipSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersDriipSettlementChallenge.disqualificationsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersWalletLocker.lockedWalletsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if balance reward is false', () => {
                    it('should successfully challenge', async () => {
                        await ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                        (await ethersDriipSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersDriipSettlementChallenge.disqualificationsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersWalletLocker.lockedWalletsCount())
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

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3DriipSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

                payment = await mocks.mockPayment(glob.owner);

                await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                    payment.transfers.single.div(2)
                );
            });

            describe('if called from other than driip settlement challenge', () => {
                it('should revert', async () => {
                    ethersDriipSettlementDispute.challengeByPayment(
                        payment.sender.wallet, payment, Wallet.createRandom().address, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await ethersValidator.isGenuinePaymentSeals(payment, {gasLimit: 1e6});
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with wallet that is not payment party', () => {
                beforeEach(async () => {
                    await web3Validator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent payment', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentPaymentOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on settlement that has already been challenged', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setProposalStatus(
                        payment.sender.wallet, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on payment whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalBlockNumber(
                        payment.blockNumber.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on payment whose single transfer amount is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge._setProposalTargetBalanceAmount(
                        payment.transfers.single.mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
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

                describe('if called with balance reward true', () => {
                    beforeEach(async () => {
                        await web3DriipSettlementChallenge._setProposalBalanceReward(true);
                    });

                    it('should successfully challenge', async () => {
                        await ethersDriipSettlementChallenge.challengeByPayment(
                            payment.sender.wallet, payment, {gasLimit: 1e6}
                        );

                        (await ethersDriipSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersDriipSettlementChallenge.disqualificationsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersWalletLocker.lockedWalletsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersSecurityBond._rewardsCount())
                            ._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if called with balance reward false', () => {
                    it('should successfully challenge', async () => {
                        await ethersDriipSettlementChallenge.challengeByPayment(
                            payment.sender.wallet, payment, {gasLimit: 1e6});

                        (await ethersDriipSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersDriipSettlementChallenge.disqualificationsCount())
                            ._bn.should.eq.BN(1);
                        (await ethersWalletLocker.lockedWalletsCount())
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
