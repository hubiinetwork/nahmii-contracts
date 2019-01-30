const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, utils, Contract} = require('ethers');
const mocks = require('../mocks');
const NullSettlementDispute = artifacts.require('NullSettlementDispute');
const SignerManager = artifacts.require('SignerManager');
const MockedNullSettlementChallenge = artifacts.require('MockedNullSettlementChallenge');
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
    describe.only('NullSettlementDispute', () => {
        let web3NullSettlementDispute, ethersNullSettlementDispute;
        let web3SignerManager;
        let web3NullSettlementChallenge, ethersNullSettlementChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3WalletLocker, ethersWalletLocker;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let blockNumber0;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3NullSettlementChallenge = await MockedNullSettlementChallenge.new(glob.owner);
            ethersNullSettlementChallenge = new Contract(web3NullSettlementChallenge.address, MockedNullSettlementChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
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
            await web3Configuration.setOperatorSettlementStake(web3.eth.blockNumber + 1, 1e16, mocks.address0, 0);
        });

        beforeEach(async () => {
            web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
            ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

            await ethersNullSettlementDispute.setConfiguration(ethersConfiguration.address);
            await ethersNullSettlementDispute.setValidator(ethersValidator.address);
            await ethersNullSettlementDispute.setSecurityBond(ethersSecurityBond.address);
            await ethersNullSettlementDispute.setWalletLocker(ethersWalletLocker.address);
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

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersNullSettlementDispute.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
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

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.setFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');

                    (await ethersNullSettlementDispute.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
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

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.setCancelOrdersChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrdersChallengeEvent');

                    (await ethersNullSettlementDispute.cancelOrdersChallenge())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
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

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.setNullSettlementChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeEvent');

                    (await ethersNullSettlementDispute.nullSettlementChallenge())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.setNullSettlementChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challengeByOrder()', () => {
            let order, topic, filter;

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3NullSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

                order = await mocks.mockOrder(glob.owner);

                await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(
                    order.placement.amount.div(order.placement.rate).div(2)
                );

                topic = ethersNullSettlementDispute.interface.events['ChallengeByOrderEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if called from other than null settlement challenge', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(
                        order, challenger, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineOrderSeals(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(
                        order, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.addFraudulentOrderHash(order.seals.operator.hash);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(
                        order, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([order.seals.operator.hash]);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(
                        order, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(
                        order, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on order whose block number is smaller than the one of the proposal', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBlockNumber(
                        order.blockNumber.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(
                        order, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on order whose amount is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(
                        order.placement.amount.div(order.placement.rate).mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(
                        order, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with balance reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBalanceReward(true);
                });

                it('should disqualify proposal and reward new challenger by locking challenged wallet', async () => {
                    await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                        .should.equal(utils.getAddress(glob.owner));
                    (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                        ._bn.should.not.equal(order.blockNumber._bn);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                        .should.equal(order.seals.operator.hash);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Order'));

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(order.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                    lock.currencyCt.should.equal(order.placement.currencies.conjugate.ct);
                    lock.currencyId._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);

                    (await ethersSecurityBond._deprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called with balance reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBalanceReward(true);

                    await ethersNullSettlementChallenge.setProposalStatus(
                        order.wallet, order.placement.currencies.conjugate.ct, order.placement.currencies.conjugate.id,
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );

                    await ethersNullSettlementChallenge._setProposalDisqualificationChallenger(glob.user_a);
                });

                it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger by locking challenged wallet', async () => {
                    await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                        .should.equal(utils.getAddress(glob.owner));
                    (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                        ._bn.should.not.equal(order.blockNumber._bn);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                        .should.equal(order.seals.operator.hash);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Order'));

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const unlock = await ethersWalletLocker.fungibleUnlocks(0);
                    unlock.lockedWallet.should.equal(utils.getAddress(order.wallet));
                    unlock.lockerWallet.should.equal(utils.getAddress(glob.user_a));

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(order.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                    lock.currencyCt.should.equal(order.placement.currencies.conjugate.ct);
                    lock.currencyId._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);

                    (await ethersSecurityBond._deprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called with security bond reward and proposal initially is qualified', () => {
                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).div(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(order.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(order.seals.operator.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Order'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate).div(2)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if wallet balance amount is smaller than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).mul(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(order.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(order.seals.operator.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Order'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });

            describe('if called with security bond reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge.setProposalStatus(
                        order.wallet, order.placement.currencies.conjugate.ct, order.placement.currencies.conjugate.id,
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );

                    await ethersNullSettlementChallenge._setProposalDisqualificationChallenger(glob.user_a);
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).div(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(order.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(order.seals.operator.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Order'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(1);

                        const deprival = await ethersSecurityBond.deprivals(0);
                        deprival.wallet.should.equal(utils.getAddress(glob.user_a));

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate).div(2)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).mul(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(order.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(order.seals.operator.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Order'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(1);

                        const deprival = await ethersSecurityBond.deprivals(0);
                        deprival.wallet.should.equal(utils.getAddress(glob.user_a));

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });

        describe('challengeByTrade()', () => {
            let trade, topic, filter;

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3NullSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

                trade = await mocks.mockTrade(glob.owner);

                await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(
                    trade.transfers.conjugate.single.div(2)
                );

                topic = ethersNullSettlementDispute.interface.events['ChallengeByTradeEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if called from other than null settlement challenge', () => {
                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByTrade(
                        trade.buyer.wallet, trade, Wallet.createRandom().address, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with wallet that is not trade party', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(
                        Wallet.createRandom().address, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent trade', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.addFraudulentTradeHash(trade.seal.hash);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with trade with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.addFraudulentOrderHash(trade.buyer.order.hashes.operator);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([trade.buyer.order.hashes.operator]);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on trade whose block number is smaller than the one of the proposal', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBlockNumber(
                        trade.blockNumber.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on trade whose single transfer is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(
                        trade.transfers.conjugate.single.mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with balance reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBalanceReward(true);
                });

                it('should disqualify proposal and reward new challenger by locking challenged wallet', async () => {
                    await ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    );

                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                        .should.equal(utils.getAddress(glob.owner));
                    (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                        ._bn.should.not.equal(trade.blockNumber._bn);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                        .should.equal(trade.seal.hash);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Trade'));

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    lock.currencyCt.should.equal(trade.currencies.conjugate.ct);
                    lock.currencyId._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                    (await ethersSecurityBond._deprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called with balance reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBalanceReward(true);

                    await ethersNullSettlementChallenge.setProposalStatus(
                        trade.buyer.wallet, trade.currencies.conjugate.ct, trade.currencies.conjugate.id,
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );

                    await ethersNullSettlementChallenge._setProposalDisqualificationChallenger(glob.user_a);
                });

                it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger by locking challenged wallet', async () => {
                    await ethersNullSettlementChallenge.challengeByTrade(
                        trade.buyer.wallet, trade, {gasLimit: 1e6}
                    );

                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                        .should.equal(utils.getAddress(glob.owner));
                    (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                        ._bn.should.not.equal(trade.blockNumber._bn);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                        .should.equal(trade.seal.hash);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Trade'));

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const unlock = await ethersWalletLocker.fungibleUnlocks(0);
                    unlock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    unlock.lockerWallet.should.equal(utils.getAddress(glob.user_a));

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    lock.currencyCt.should.equal(trade.currencies.conjugate.ct);
                    lock.currencyId._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                    (await ethersSecurityBond._deprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called with security bond reward and proposal initially is qualified', () => {
                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(trade.buyer.balances.conjugate.current.div(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(trade.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(trade.seal.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Trade'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current.div(2)._bn);
                        progressiveReward.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if wallet balance amount is smaller than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(trade.buyer.balances.conjugate.current.mul(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(trade.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(trade.seal.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Trade'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                        progressiveReward.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });

            describe('if called with security bond reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge.setProposalStatus(
                        trade.buyer.wallet, trade.currencies.conjugate.ct, trade.currencies.conjugate.id,
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );

                    await ethersNullSettlementChallenge._setProposalDisqualificationChallenger(glob.user_a);
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(trade.buyer.balances.conjugate.current.div(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(trade.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(trade.seal.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Trade'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(1);

                        const deprival = await ethersSecurityBond.deprivals(0);
                        deprival.wallet.should.equal(utils.getAddress(glob.user_a));

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current.div(2)._bn);
                        progressiveReward.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(trade.buyer.balances.conjugate.current.mul(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 1e6});

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(trade.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(trade.seal.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Trade'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(1);

                        const deprival = await ethersSecurityBond.deprivals(0);
                        deprival.wallet.should.equal(utils.getAddress(glob.user_a));

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                        progressiveReward.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });

        describe('challengeByPayment()', () => {
            let payment, topic, filter;

            beforeEach(async () => {
                await web3Validator._reset();
                await web3FraudChallenge._reset();
                await web3NullSettlementChallenge._reset();
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

                payment = await mocks.mockPayment(glob.owner);

                await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(
                    payment.transfers.single.div(2)
                );

                topic = ethersNullSettlementDispute.interface.events['ChallengeByPaymentEvent'].topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if called from other than null settlement challenge', () => {
                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByPayment(
                        payment.sender.wallet, payment, Wallet.createRandom().address, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with wallet that is not payment party', () => {
                beforeEach(async () => {
                    await web3Validator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(
                        Wallet.createRandom().address, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent payment', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.addFraudulentPaymentHash(payment.seals.operator.hash);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on payment whose block number is smaller than the proposal block number', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBlockNumber(
                        payment.blockNumber.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on payment whose block number is smaller than the proposal disqualification block number', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalDisqualificationBlockNumber(
                        payment.blockNumber.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on payment whose single transfer is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(
                        payment.transfers.single.mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with balance reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBalanceReward(true);
                });

                it('should successfully challenge', async () => {
                    await ethersNullSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    );

                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                        .should.equal(utils.getAddress(glob.owner));
                    (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                        ._bn.should.not.equal(payment.blockNumber._bn);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                        .should.equal(payment.seals.operator.hash);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Payment'));

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(payment.sender.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(payment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(payment.currency.id._bn);

                    (await ethersSecurityBond._deprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called with balance reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalBalanceReward(true);

                    await ethersNullSettlementChallenge.setProposalStatus(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id,
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );

                    await ethersNullSettlementChallenge._setProposalDisqualificationChallenger(glob.user_a);
                });

                it('should successfully challenge', async () => {
                    await ethersNullSettlementChallenge.challengeByPayment(
                        payment.sender.wallet, payment, {gasLimit: 1e6}
                    );

                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                        .should.equal(utils.getAddress(glob.owner));
                    (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                        ._bn.should.not.equal(payment.blockNumber._bn);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                        .should.equal(payment.seals.operator.hash);
                    (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                        .should.equal(mocks.candidateTypes.indexOf('Payment'));

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const unlock = await ethersWalletLocker.fungibleUnlocks(0);
                    unlock.lockedWallet.should.equal(utils.getAddress(payment.sender.wallet));
                    unlock.lockerWallet.should.equal(utils.getAddress(glob.user_a));

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);
                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(payment.sender.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
                    lock.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(payment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(payment.currency.id._bn);

                    (await ethersSecurityBond._deprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called with security bond reward and proposal initially is qualified', () => {
                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(payment.sender.balances.current.div(2));
                    });

                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByPayment(
                            payment.sender.wallet, payment, {gasLimit: 1e6}
                        );

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(payment.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(payment.seals.operator.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Payment'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(payment.sender.balances.current.div(2)._bn);
                        progressiveReward.currency.ct.should.equal(payment.currency.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                // TODO Replace "is smaller than" by "is less than"
                describe('if wallet balance amount is smaller than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(payment.sender.balances.current.mul(2));
                    });

                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByPayment(
                            payment.sender.wallet, payment, {gasLimit: 1e6}
                        );

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(payment.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(payment.seals.operator.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Payment'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                        progressiveReward.currency.ct.should.equal(payment.currency.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });

            describe('if called with security bond reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge.setProposalStatus(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id,
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );

                    await ethersNullSettlementChallenge._setProposalDisqualificationChallenger(glob.user_a);
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(payment.sender.balances.current.div(2));
                    });

                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByPayment(
                            payment.sender.wallet, payment, {gasLimit: 1e6}
                        );

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(payment.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(payment.seals.operator.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Payment'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(1);

                        const deprival = await ethersSecurityBond.deprivals(0);
                        deprival.wallet.should.equal(utils.getAddress(glob.user_a));

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(payment.sender.balances.current.div(2)._bn);
                        progressiveReward.currency.ct.should.equal(payment.currency.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });

                describe('if wallet balance amount is smaller than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(payment.sender.balances.current.mul(2));
                    });

                    it('should successfully challenge', async () => {
                        await ethersNullSettlementChallenge.challengeByPayment(
                            payment.sender.wallet, payment, {gasLimit: 1e6}
                        );

                        (await ethersNullSettlementChallenge._proposalStatus())
                            .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        (await ethersNullSettlementChallenge._proposalDisqualificationChallenger())
                            .should.equal(utils.getAddress(glob.owner));
                        (await ethersNullSettlementChallenge._proposalDisqualificationBlockNumber())
                            ._bn.should.not.equal(payment.blockNumber._bn);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateHash())
                            .should.equal(payment.seals.operator.hash);
                        (await ethersNullSettlementChallenge._proposalDisqualificationCandidateType())
                            .should.equal(mocks.candidateTypes.indexOf('Payment'));

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._deprivalsCount())
                            ._bn.should.eq.BN(1);

                        const deprival = await ethersSecurityBond.deprivals(0);
                        deprival.wallet.should.equal(utils.getAddress(glob.user_a));

                        (await ethersSecurityBond._amountedRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.amountedRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.owner));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.amountedRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.owner));
                        progressiveReward.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                        progressiveReward.currency.ct.should.equal(payment.currency.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(topic);
                    });
                });
            });
        });
    });
};
