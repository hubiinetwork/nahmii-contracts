const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, utils, Contract} = require('ethers');
const mocks = require('../mocks');
const NullSettlementDisputeByTrade = artifacts.require('NullSettlementDisputeByTrade');
const SignerManager = artifacts.require('SignerManager');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
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
    describe('NullSettlementDisputeByTrade', () => {
        let web3NullSettlementDisputeByTrade, ethersNullSettlementDisputeByTrade;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3WalletLocker, ethersWalletLocker;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

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
            web3NullSettlementDisputeByTrade = await NullSettlementDisputeByTrade.new(glob.owner);
            ethersNullSettlementDisputeByTrade = new Contract(web3NullSettlementDisputeByTrade.address, NullSettlementDisputeByTrade.abi, glob.signer_owner);

            await ethersNullSettlementDisputeByTrade.setConfiguration(ethersConfiguration.address);
            await ethersNullSettlementDisputeByTrade.setValidator(ethersValidator.address);
            await ethersNullSettlementDisputeByTrade.setSecurityBond(ethersSecurityBond.address);
            await ethersNullSettlementDisputeByTrade.setWalletLocker(ethersWalletLocker.address);
            await ethersNullSettlementDisputeByTrade.setFraudChallenge(ethersFraudChallenge.address);
            await ethersNullSettlementDisputeByTrade.setCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersNullSettlementDisputeByTrade.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementDisputeByTrade.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementDisputeByTrade.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDisputeByTrade.configuration.call())
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
                    const result = await web3NullSettlementDisputeByTrade.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersNullSettlementDisputeByTrade.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDisputeByTrade.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDisputeByTrade.validator.call())
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
                    const result = await web3NullSettlementDisputeByTrade.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersNullSettlementDisputeByTrade.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDisputeByTrade.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDisputeByTrade.securityBond.call())
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
                    const result = await web3NullSettlementDisputeByTrade.setSecurityBond(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSecurityBondEvent');

                    (await ethersNullSettlementDisputeByTrade.securityBond())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDisputeByTrade.setSecurityBond(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDisputeByTrade.walletLocker.call())
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
                    const result = await web3NullSettlementDisputeByTrade.setWalletLocker(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');

                    (await ethersNullSettlementDisputeByTrade.walletLocker())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDisputeByTrade.setWalletLocker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDisputeByTrade.fraudChallenge.call())
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
                    const result = await web3NullSettlementDisputeByTrade.setFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');

                    (await ethersNullSettlementDisputeByTrade.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDisputeByTrade.setFraudChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDisputeByTrade.cancelOrdersChallenge.call())
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
                    const result = await web3NullSettlementDisputeByTrade.setCancelOrdersChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrdersChallengeEvent');

                    (await ethersNullSettlementDisputeByTrade.cancelOrdersChallenge())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDisputeByTrade.setCancelOrdersChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDisputeByTrade.nullSettlementChallengeState.call())
                    .should.equal(web3NullSettlementChallengeState.address);
            });
        });

        describe('setNullSettlementChallengeState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDisputeByTrade.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersNullSettlementDisputeByTrade.nullSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDisputeByTrade.setNullSettlementChallengeState(address, {from: glob.user_a})
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
                await web3NullSettlementChallengeState._reset({gasLimit: 1e6});
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

                order = await mocks.mockOrder(glob.owner);

                await ethersNullSettlementChallengeState._addProposalIfNone();

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersNullSettlementDisputeByTrade.interface.events['ChallengeByOrderEvent'].topics
                };
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, Wallet.createRandom().address, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3Validator.setGenuineOrderSeals(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3FraudChallenge.addFraudulentOrderHash(order.seals.operator.hash);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3CancelOrdersChallenge.cancelOrdersByHash([order.seals.operator.hash]);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3NullSettlementChallengeState._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on order whose nonce is less than the proposal nonce', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalNonce(
                        order.nonce.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on order whose nonce is less than the proposal disqualification nonce', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalDisqualificationNonce(
                        order.nonce.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on order whose amount is less than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(
                        order.placement.amount.div(order.placement.rate).mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with balance reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalWalletInitiated(true);
                });

                it('should disqualify proposal and reward new challenger by locking challenged wallet', async () => {
                    await ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(order.wallet));
                    proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                    proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                    proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                    proposal.disqualification.candidateHash.should.equal(order.seals.operator.hash);
                    proposal.disqualification.candidateType.should.equal('order');

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
                });
            });

            describe('if called with balance reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalWalletInitiated(true);
                    await ethersNullSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                    await ethersNullSettlementChallengeState._setProposalDisqualificationChallenger(
                        glob.user_b
                    );
                });

                it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger by locking challenged wallet', async () => {
                    await ethersNullSettlementDisputeByTrade.challengeByOrder(
                        order, glob.user_a, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(order.wallet));
                    proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                    proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                    proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                    proposal.disqualification.candidateHash.should.equal(order.seals.operator.hash);
                    proposal.disqualification.candidateType.should.equal('order');

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
                });
            });

            describe('if called with security bond reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).div(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersNullSettlementDisputeByTrade.challengeByOrder(
                            order, glob.user_a, {gasLimit: 1e6}
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(order.wallet));
                        proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                        proposal.disqualification.candidateHash.should.equal(order.seals.operator.hash);
                        proposal.disqualification.candidateType.should.equal('order');

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
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate).div(2)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);
                    });
                });

                describe('if wallet balance amount is less than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).mul(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersNullSettlementDisputeByTrade.challengeByOrder(
                            order, glob.user_a, {gasLimit: 1e6}
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(order.wallet));
                        proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                        proposal.disqualification.candidateHash.should.equal(order.seals.operator.hash);
                        proposal.disqualification.candidateType.should.equal('order');

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
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);
                    });
                });
            });

            describe('if called with security bond reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_ORDER_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                    await ethersNullSettlementChallengeState._setProposalDisqualificationChallenger(
                        glob.user_b
                    );
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).div(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersNullSettlementDisputeByTrade.challengeByOrder(
                            order, glob.user_a, {gasLimit: 1e6}
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(order.wallet));
                        proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                        proposal.disqualification.candidateHash.should.equal(order.seals.operator.hash);
                        proposal.disqualification.candidateType.should.equal('order');

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
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate).div(2)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);
                    });
                });

                describe('if wallet balance amount is less than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(order.placement.amount.div(order.placement.rate).mul(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersNullSettlementDisputeByTrade.challengeByOrder(
                            order, glob.user_a, {gasLimit: 1e6}
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(order.wallet));
                        proposal.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(order.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(order.nonce._bn);
                        proposal.disqualification.candidateHash.should.equal(order.seals.operator.hash);
                        proposal.disqualification.candidateType.should.equal('order');

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
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(order.placement.amount.div(order.placement.rate)._bn);
                        progressiveReward.currency.ct.should.equal(order.placement.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(order.placement.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);
                    });
                });
            });
        });

        describe('challengeByTrade()', () => {
            let trade, filter;

            beforeEach(async () => {
                await web3Validator._reset({gasLimit: 4e6});
                await web3FraudChallenge._reset();
                await web3CancelOrdersChallenge._reset();
                await web3NullSettlementChallengeState._reset({gasLimit: 1e6});
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();

                await ethersNullSettlementChallengeState._addProposalIfNone();

                trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(1)});

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersNullSettlementDisputeByTrade.interface.events['ChallengeByTradeEvent'].topics
                };
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, Wallet.createRandom().address, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersValidator.isGenuineTradeSeal(trade);
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with wallet that is not trade party', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.seller.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent trade', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3FraudChallenge.addFraudulentTradeHash(trade.seal.hash);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3FraudChallenge.addFraudulentOrderHash(trade.buyer.order.hashes.operator);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3CancelOrdersChallenge.cancelOrdersByHash([trade.buyer.order.hashes.operator]);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3NullSettlementChallengeState._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on trade whose nonce is less than the proposal nonce', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalNonce(
                        trade.buyer.nonce.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on trade whose nonce is less than the proposal disqualification nonce', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalDisqualificationNonce(
                        trade.buyer.nonce.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on trade whose single transfer amount is less than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(
                        trade.transfers.conjugate.single.mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with balance reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalWalletInitiated(true);
                });


                it('should disqualify proposal and reward new challenger by locking challenged wallet', async () => {
                    await ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    proposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                    proposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    proposal.disqualification.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    proposal.disqualification.candidateHash.should.equal(trade.seal.hash);
                    proposal.disqualification.candidateType.should.equal('trade');

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.user_a));
                    lock.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    lock.currencyCt.should.equal(trade.currencies.conjugate.ct);
                    lock.currencyId._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                    (await ethersSecurityBond._absoluteDeprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('if called with balance reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalWalletInitiated(true);
                    await ethersNullSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                    await ethersNullSettlementChallengeState._setProposalDisqualificationChallenger(
                        glob.user_b
                    );
                });

                it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger by locking challenged wallet', async () => {
                    await ethersNullSettlementDisputeByTrade.challengeByTrade(
                        trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    proposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                    proposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    proposal.disqualification.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    proposal.disqualification.candidateHash.should.equal(trade.seal.hash);
                    proposal.disqualification.candidateType.should.equal('trade');

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const unlock = await ethersWalletLocker.fungibleUnlocks(0);
                    unlock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    unlock.lockerWallet.should.equal(utils.getAddress(glob.user_b));

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.user_a));
                    lock.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    lock.currencyCt.should.equal(trade.currencies.conjugate.ct);
                    lock.currencyId._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                    (await ethersSecurityBond._absoluteDeprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('if called with security bond reward and proposal initially is qualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(trade.buyer.balances.conjugate.current.div(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersNullSettlementDisputeByTrade.challengeByTrade(
                            trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6});

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                        proposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                        proposal.disqualification.candidateHash.should.equal(trade.seal.hash);
                        proposal.disqualification.candidateType.should.equal('trade');

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
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current.div(2)._bn);
                        progressiveReward.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);
                    });
                });

                describe('if wallet balance amount is less than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(trade.buyer.balances.conjugate.current.mul(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersNullSettlementDisputeByTrade.challengeByTrade(
                            trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6});

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                        proposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                        proposal.disqualification.candidateHash.should.equal(trade.seal.hash);
                        proposal.disqualification.candidateType.should.equal('trade');

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
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                        progressiveReward.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);
                    });
                });
            });

            describe('if called with security bond reward and proposal initially is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementDisputeByTrade.registerService(glob.owner);
                    await ethersNullSettlementDisputeByTrade.enableServiceAction(
                        glob.owner, await ethersNullSettlementDisputeByTrade.CHALLENGE_BY_TRADE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                    await ethersNullSettlementChallengeState._setProposalDisqualificationChallenger(
                        glob.user_b
                    );
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(trade.buyer.balances.conjugate.current.div(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersNullSettlementDisputeByTrade.challengeByTrade(
                            trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6});

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                        proposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                        proposal.disqualification.candidateHash.should.equal(trade.seal.hash);
                        proposal.disqualification.candidateType.should.equal('trade');

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
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current.div(2)._bn);
                        progressiveReward.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);
                    });
                });

                describe('if wallet balance amount is less than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(trade.buyer.balances.conjugate.current.mul(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersNullSettlementDisputeByTrade.challengeByTrade(
                            trade.buyer.wallet, trade, glob.user_a, {gasLimit: 1e6});

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                        proposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        proposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        proposal.disqualification.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                        proposal.disqualification.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                        proposal.disqualification.candidateHash.should.equal(trade.seal.hash);
                        proposal.disqualification.candidateType.should.equal('trade');

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
                        flatReward.unlockTime._bn.should.eq.BN(0);

                        const progressiveReward = await ethersSecurityBond.absoluteRewards(1);
                        progressiveReward.wallet.should.equal(utils.getAddress(glob.user_a));
                        progressiveReward.amount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                        progressiveReward.currency.ct.should.equal(trade.currencies.conjugate.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);
                    });
                });
            });
        });
    });
};
