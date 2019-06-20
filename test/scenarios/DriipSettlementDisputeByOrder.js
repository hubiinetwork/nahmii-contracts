const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, utils, Contract} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementDisputeByOrder = artifacts.require('DriipSettlementDisputeByOrder');
const SignerManager = artifacts.require('SignerManager');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('DriipSettlementDisputeByOrder', () => {
        let web3DriipSettlementDisputeByOrder, ethersDriipSettlementDisputeByOrder;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new(glob.owner);
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, glob.signer_owner);
            web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new(glob.owner);
            ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3BalanceTracker = await MockedBalanceTracker.new();
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);

            await web3Configuration.setSettlementChallengeTimeout(web3.eth.blockNumber + 1, 1e3);
            await web3Configuration.setWalletSettlementStakeFraction(web3.eth.blockNumber + 1, 1e17);
            await web3Configuration.setOperatorSettlementStakeFraction(web3.eth.blockNumber + 1, 5e17);
            await web3Configuration.setOperatorSettlementStake(web3.eth.blockNumber + 1, 1e16, mocks.address0, 0);
        });

        beforeEach(async () => {
            web3DriipSettlementDisputeByOrder = await DriipSettlementDisputeByOrder.new(glob.owner);
            ethersDriipSettlementDisputeByOrder = new Contract(web3DriipSettlementDisputeByOrder.address, DriipSettlementDisputeByOrder.abi, glob.signer_owner);

            await ethersDriipSettlementDisputeByOrder.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementDisputeByOrder.setValidator(ethersValidator.address);
            await ethersDriipSettlementDisputeByOrder.setSecurityBond(ethersSecurityBond.address);
            await ethersDriipSettlementDisputeByOrder.setWalletLocker(ethersWalletLocker.address);
            await ethersDriipSettlementDisputeByOrder.setBalanceTracker(ethersBalanceTracker.address);
            await ethersDriipSettlementDisputeByOrder.setFraudChallenge(ethersFraudChallenge.address);
            await ethersDriipSettlementDisputeByOrder.setCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersDriipSettlementDisputeByOrder.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);
            await ethersDriipSettlementDisputeByOrder.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementDisputeByOrder.deployer.call()).should.equal(glob.owner);
                (await web3DriipSettlementDisputeByOrder.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByOrder.configuration.call())
                    .should.equal(web3Configuration.address);
            });
        });

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDisputeByOrder.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementDisputeByOrder.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByOrder.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByOrder.validator.call())
                    .should.equal(web3Validator.address);
            });
        });

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDisputeByOrder.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementDisputeByOrder.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByOrder.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByOrder.securityBond.call())
                    .should.equal(web3SecurityBond.address);
            });
        });

        describe('setSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDisputeByOrder.setSecurityBond(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSecurityBondEvent');

                    (await ethersDriipSettlementDisputeByOrder.securityBond())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByOrder.setSecurityBond(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByOrder.walletLocker.call())
                    .should.equal(web3WalletLocker.address);
            });
        });

        describe('setWalletLocker()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDisputeByOrder.setWalletLocker(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');

                    (await ethersDriipSettlementDisputeByOrder.walletLocker())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByOrder.setWalletLocker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('balanceTracker()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByOrder.balanceTracker.call())
                    .should.equal(web3BalanceTracker.address);
            });
        });

        describe('setBalanceTracker()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDisputeByOrder.setBalanceTracker(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetBalanceTrackerEvent');

                    (await ethersDriipSettlementDisputeByOrder.balanceTracker())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByOrder.setBalanceTracker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByOrder.fraudChallenge.call())
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
                    const result = await web3DriipSettlementDisputeByOrder.setFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');

                    (await ethersDriipSettlementDisputeByOrder.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByOrder.setFraudChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByOrder.cancelOrdersChallenge.call())
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
                    const result = await web3DriipSettlementDisputeByOrder.setCancelOrdersChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrdersChallengeEvent');

                    (await ethersDriipSettlementDisputeByOrder.cancelOrdersChallenge())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByOrder.setCancelOrdersChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByOrder.driipSettlementChallengeState.call())
                    .should.equal(web3DriipSettlementChallengeState.address);
            });
        });

        describe('setDriipSettlementChallengeState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDisputeByOrder.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersDriipSettlementDisputeByOrder.driipSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByOrder.setDriipSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('challengeByOrder()', () => {
            let order, filter;

            beforeEach(async () => {
                await web3Validator._reset({gasLimit: 4e6});
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3DriipSettlementChallengeState._reset({gasLimit: 1e6});
                await web3NullSettlementChallengeState._reset({gasLimit: 1e6});
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();
                await web3BalanceTracker._reset({gasLimit: 1e6});

                order = await mocks.mockOrder(glob.owner);

                await ethersDriipSettlementChallengeState._addProposalIfNone();

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementDisputeByOrder.interface.events['ChallengeByOrderEvent'].topics
                };
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, Wallet.createRandom().address, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3Validator.setGenuineOrderSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3FraudChallenge.addFraudulentOrderHash(order.seals.operator.hash);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3CancelOrdersChallenge.cancelOrdersByHash([order.seals.operator.hash]);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on undefined proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with order whose nonce is less than the proposal nonce', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(
                        order.nonce.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with order whose nonce is less than the proposal disqualification nonce', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalDisqualificationNonce(
                        order.nonce.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if not causing overrun', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(
                        order.placement.amount.div(order.placement.rate).mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with balance reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalWalletInitiated(true);
                });

                it('should disqualify proposal and reward new challenger by locking challenged wallet', async () => {
                    await ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(order.wallet));
                    proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                    proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                    proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                    proposal.disqualification.candidate.hash.should.equal(order.seals.operator.hash);
                    proposal.disqualification.candidate.kind.should.equal('order');

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(order.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.user_a));
                    lock.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                    lock.currencyCt.should.equal(order.placement.currencies.conjugate.ct);
                    lock.currencyId._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);

                    (await ethersSecurityBond._absoluteDeprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersNullSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                    nscProposal.wallet.should.equal(order.wallet);
                    nscProposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                    nscProposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                    nscProposal.terminated.should.be.true;
                });
            });

            describe('if called with balance reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalWalletInitiated(true);
                    await ethersDriipSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                    await ethersDriipSettlementChallengeState._setProposalDisqualificationChallenger(
                        glob.user_b
                    );
                });

                it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger by locking challenged wallet', async () => {
                    await ethersDriipSettlementDisputeByOrder.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(order.wallet));
                    proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                    proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                    proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                    proposal.disqualification.candidate.hash.should.equal(order.seals.operator.hash);
                    proposal.disqualification.candidate.kind.should.equal('order');

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const unlock = await ethersWalletLocker.fungibleUnlocks(0);
                    unlock.lockedWallet.should.equal(utils.getAddress(order.wallet));
                    unlock.lockerWallet.should.equal(utils.getAddress(glob.user_b));

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(order.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.user_a));
                    lock.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                    lock.currencyCt.should.equal(order.placement.currencies.conjugate.ct);
                    lock.currencyId._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);

                    (await ethersSecurityBond._absoluteDeprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersNullSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                    nscProposal.wallet.should.equal(order.wallet);
                    nscProposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                    nscProposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                    nscProposal.terminated.should.be.true;
                });
            });

            describe('if called with security bond reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).div(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersDriipSettlementDisputeByOrder.challengeByOrder(
                            order, glob.user_a, {gasLimit: 1e6}
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(order.wallet));
                        proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                        proposal.disqualification.candidate.hash.should.equal(order.seals.operator.hash);
                        proposal.disqualification.candidate.kind.should.equal('order');

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._absoluteDeprivalsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._absoluteRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.absoluteRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(1000);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate).div(2)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(1000);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                        nscProposal.wallet.should.equal(order.wallet);
                        nscProposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        nscProposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        nscProposal.terminated.should.be.true;
                    });
                });

                describe('if wallet balance amount is less than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).mul(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersDriipSettlementDisputeByOrder.challengeByOrder(
                            order, glob.user_a, {gasLimit: 1e6}
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(order.wallet));
                        proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                        proposal.disqualification.candidate.hash.should.equal(order.seals.operator.hash);
                        proposal.disqualification.candidate.kind.should.equal('order');

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._absoluteDeprivalsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._absoluteRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.absoluteRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(1000);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(1000);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                        nscProposal.wallet.should.equal(order.wallet);
                        nscProposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        nscProposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        nscProposal.terminated.should.be.true;
                    });
                });
            });

            describe('if called with security bond reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByOrder.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByOrder.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByOrder.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                    await ethersDriipSettlementChallengeState._setProposalDisqualificationChallenger(
                        glob.user_b
                    );
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).div(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersDriipSettlementDisputeByOrder.challengeByOrder(
                            order, glob.user_a, {gasLimit: 1e6}
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(order.wallet));
                        proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                        proposal.disqualification.candidate.hash.should.equal(order.seals.operator.hash);
                        proposal.disqualification.candidate.kind.should.equal('order');

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._absoluteDeprivalsCount())
                            ._bn.should.eq.BN(1);

                        const deprival = await ethersSecurityBond.absoluteDeprivals(0);
                        deprival.wallet.should.equal(utils.getAddress(glob.user_b));

                        (await ethersSecurityBond._absoluteRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.absoluteRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(1000);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate).div(2)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(1000);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                        nscProposal.wallet.should.equal(order.wallet);
                        nscProposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        nscProposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        nscProposal.terminated.should.be.true;
                    });
                });

                describe('if wallet balance amount is less than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).mul(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersDriipSettlementDisputeByOrder.challengeByOrder(
                            order, glob.user_a, {gasLimit: 1e6}
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(order.wallet));
                        proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                        proposal.disqualification.candidate.hash.should.equal(order.seals.operator.hash);
                        proposal.disqualification.candidate.kind.should.equal('order');

                        (await ethersWalletLocker._unlockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersWalletLocker._lockedWalletsCount())
                            ._bn.should.eq.BN(0);

                        (await ethersSecurityBond._absoluteDeprivalsCount())
                            ._bn.should.eq.BN(1);

                        const deprival = await ethersSecurityBond.absoluteDeprivals(0);
                        deprival.wallet.should.equal(utils.getAddress(glob.user_b));

                        (await ethersSecurityBond._absoluteRewardsCount())
                            ._bn.should.eq.BN(2);

                        const flatReward = await ethersSecurityBond.absoluteRewards(0);
                        flatReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        flatReward.amount._bn.should.eq.BN(1e16.toString());
                        flatReward.currency.ct.should.equal(mocks.address0);
                        flatReward.currency.id._bn.should.eq.BN(0);
                        flatReward.unlockTime._bn.should.eq.BN(1000);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(1000);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                        nscProposal.wallet.should.equal(order.wallet);
                        nscProposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        nscProposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        nscProposal.terminated.should.be.true;
                    });
                });
            });
        });
    });
};
