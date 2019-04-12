const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, utils, Contract} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementDisputeByPayment = artifacts.require('DriipSettlementDisputeByPayment');
const SignerManager = artifacts.require('SignerManager');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('DriipSettlementDisputeByPayment', () => {
        let web3DriipSettlementDisputeByPayment, ethersDriipSettlementDisputeByPayment;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3FraudChallenge, ethersFraudChallenge;
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

            await web3Configuration.setOperatorSettlementStakeFraction(web3.eth.blockNumber + 1, 5e17);
            await web3Configuration.setOperatorSettlementStake(web3.eth.blockNumber + 1, 1e16, mocks.address0, 0);
            await web3Configuration.setSettlementChallengeTimeout(web3.eth.blockNumber + 1, 1000);
        });

        beforeEach(async () => {
            web3DriipSettlementDisputeByPayment = await DriipSettlementDisputeByPayment.new(glob.owner);
            ethersDriipSettlementDisputeByPayment = new Contract(web3DriipSettlementDisputeByPayment.address, DriipSettlementDisputeByPayment.abi, glob.signer_owner);

            await ethersDriipSettlementDisputeByPayment.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementDisputeByPayment.setValidator(ethersValidator.address);
            await ethersDriipSettlementDisputeByPayment.setSecurityBond(ethersSecurityBond.address);
            await ethersDriipSettlementDisputeByPayment.setWalletLocker(ethersWalletLocker.address);
            await ethersDriipSettlementDisputeByPayment.setBalanceTracker(ethersBalanceTracker.address);
            await ethersDriipSettlementDisputeByPayment.setFraudChallenge(ethersFraudChallenge.address);
            await ethersDriipSettlementDisputeByPayment.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);
            await ethersDriipSettlementDisputeByPayment.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementDisputeByPayment.deployer.call()).should.equal(glob.owner);
                (await web3DriipSettlementDisputeByPayment.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByPayment.configuration.call())
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
                    const result = await web3DriipSettlementDisputeByPayment.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementDisputeByPayment.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByPayment.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByPayment.validator.call())
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
                    const result = await web3DriipSettlementDisputeByPayment.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementDisputeByPayment.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByPayment.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByPayment.securityBond.call())
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
                    const result = await web3DriipSettlementDisputeByPayment.setSecurityBond(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSecurityBondEvent');

                    (await ethersDriipSettlementDisputeByPayment.securityBond())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByPayment.setSecurityBond(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('walletLocker()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByPayment.walletLocker.call())
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
                    const result = await web3DriipSettlementDisputeByPayment.setWalletLocker(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletLockerEvent');

                    (await ethersDriipSettlementDisputeByPayment.walletLocker())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByPayment.setWalletLocker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('balanceTracker()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByPayment.balanceTracker.call())
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
                    const result = await web3DriipSettlementDisputeByPayment.setBalanceTracker(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetBalanceTrackerEvent');

                    (await ethersDriipSettlementDisputeByPayment.balanceTracker())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByPayment.setBalanceTracker(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByPayment.fraudChallenge.call())
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
                    const result = await web3DriipSettlementDisputeByPayment.setFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudChallengeEvent');

                    (await ethersDriipSettlementDisputeByPayment.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByPayment.setFraudChallenge(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });
        
        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByPayment.driipSettlementChallengeState.call())
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
                    const result = await web3DriipSettlementDisputeByPayment.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersDriipSettlementDisputeByPayment.driipSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByPayment.setDriipSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementDisputeByPayment.nullSettlementChallengeState.call())
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
                    const result = await web3DriipSettlementDisputeByPayment.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersDriipSettlementDisputeByPayment.nullSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementDisputeByPayment.setNullSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('challengeByPayment()', () => {
            let payment, filter;

            beforeEach(async () => {
                await web3Validator._reset({gasLimit: 4e6});
                await web3FraudChallenge._reset();
                await web3DriipSettlementChallengeState._reset({gasLimit: 1e6});
                await web3NullSettlementChallengeState._reset({gasLimit: 1e6});
                await web3SecurityBond._reset();
                await web3WalletLocker._reset();
                await web3BalanceTracker._reset();

                await ethersDriipSettlementChallengeState._addProposalIfNone();

                payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(1)});

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementDisputeByPayment.interface.events['ChallengeByPaymentEvent'].topics
                };
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, Wallet.createRandom().address, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersValidator.isGenuinePaymentSeals(payment);
                    await ethersValidator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with wallet that is not payment sender', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3Validator.setPaymentSender(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.recipient.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with fraudulent payment', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await web3FraudChallenge.addFraudulentPaymentHash(payment.seals.operator.hash);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on undefined proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called on expired proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalExpired(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with payment whose nonce is less than the proposal nonce', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(
                        payment.sender.nonce.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with payment whose nonce is less than the proposal disqualification nonce', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalDisqualificationNonce(
                        payment.sender.nonce.add(10)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if not causing overrun', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(
                        payment.transfers.single.mul(2)
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if causing overrun with balance reward and proposal initially qualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), payment.sender.balances.current.mul(2),
                        1, {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalWalletInitiated(true);
                });

                it('should disqualify proposal and reward new challenger by locking challenged wallet', async () => {
                    await ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    dscProposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    dscProposal.currency.ct.should.equal(payment.currency.ct);
                    dscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    dscProposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    dscProposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                    dscProposal.disqualification.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    dscProposal.disqualification.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    dscProposal.disqualification.candidate.hash.should.equal(payment.seals.operator.hash);
                    dscProposal.disqualification.candidate.kind.should.equal('payment');

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(payment.sender.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.user_a));
                    lock.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(payment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(payment.currency.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(1000);

                    (await ethersSecurityBond._absoluteDeprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersNullSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                    nscProposal.wallet.should.equal(payment.sender.wallet);
                    nscProposal.currency.ct.should.equal(payment.currency.ct);
                    nscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    nscProposal.terminated.should.be.true;
                });
            });

            describe('if causing overrun with balance reward and proposal initially disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), payment.sender.balances.current.mul(2),
                        1, {gasLimit: 1e6}
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
                    await ethersDriipSettlementDisputeByPayment.challengeByPayment(
                        payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    dscProposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    dscProposal.currency.ct.should.equal(payment.currency.ct);
                    dscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    dscProposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    dscProposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                    dscProposal.disqualification.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    dscProposal.disqualification.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    dscProposal.disqualification.candidate.hash.should.equal(payment.seals.operator.hash);
                    dscProposal.disqualification.candidate.kind.should.equal('payment');

                    (await ethersWalletLocker._unlockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const unlock = await ethersWalletLocker.fungibleUnlocks(0);
                    unlock.lockedWallet.should.equal(utils.getAddress(payment.sender.wallet));
                    unlock.lockerWallet.should.equal(utils.getAddress(glob.user_b));

                    (await ethersWalletLocker._lockedWalletsCount())
                        ._bn.should.eq.BN(1);

                    const lock = await ethersWalletLocker.fungibleLocks(0);
                    lock.lockedWallet.should.equal(utils.getAddress(payment.sender.wallet));
                    lock.lockerWallet.should.equal(utils.getAddress(glob.user_a));
                    lock.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    lock.currencyCt.should.equal(payment.currency.ct);
                    lock.currencyId._bn.should.eq.BN(payment.currency.id._bn);
                    lock.visibleTimeout._bn.should.eq.BN(1000);

                    (await ethersSecurityBond._absoluteDeprivalsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersSecurityBond._fractionalRewardsCount())
                        ._bn.should.eq.BN(0);

                    (await ethersNullSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                    nscProposal.wallet.should.equal(payment.sender.wallet);
                    nscProposal.currency.ct.should.equal(payment.currency.ct);
                    nscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    nscProposal.terminated.should.be.true;
                });
            });

            describe('if causing overrun with security bond reward and proposal initially qualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), payment.sender.balances.current.mul(2),
                        1, {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                });

                describe('if wallet balance amount is greater than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(payment.sender.balances.current.div(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersDriipSettlementDisputeByPayment.challengeByPayment(
                            payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6});

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                        dscProposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                        dscProposal.currency.ct.should.equal(payment.currency.ct);
                        dscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        dscProposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        dscProposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        dscProposal.disqualification.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                        dscProposal.disqualification.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                        dscProposal.disqualification.candidate.hash.should.equal(payment.seals.operator.hash);
                        dscProposal.disqualification.candidate.kind.should.equal('payment');

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
                        progressiveReward.amount._bn.should.eq.BN(payment.sender.balances.current.div(2)._bn);
                        progressiveReward.currency.ct.should.equal(payment.currency.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                        nscProposal.wallet.should.equal(payment.sender.wallet);
                        nscProposal.currency.ct.should.equal(payment.currency.ct);
                        nscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        nscProposal.terminated.should.be.true;
                    });
                });

                describe('if wallet balance amount is less than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(payment.sender.balances.current.mul(2));
                    });

                    it('should disqualify proposal and reward new challenger from security bond', async () => {
                        await ethersDriipSettlementDisputeByPayment.challengeByPayment(
                            payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6});

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                        dscProposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                        dscProposal.currency.ct.should.equal(payment.currency.ct);
                        dscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        dscProposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        dscProposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        dscProposal.disqualification.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                        dscProposal.disqualification.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                        dscProposal.disqualification.candidate.hash.should.equal(payment.seals.operator.hash);
                        dscProposal.disqualification.candidate.kind.should.equal('payment');

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
                        progressiveReward.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                        progressiveReward.currency.ct.should.equal(payment.currency.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                        nscProposal.wallet.should.equal(payment.sender.wallet);
                        nscProposal.currency.ct.should.equal(payment.currency.ct);
                        nscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        nscProposal.terminated.should.be.true;
                    });
                });
            });

            describe('if causing overrun with security bond reward and proposal initially disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementDisputeByPayment.registerService(glob.owner);
                    await ethersDriipSettlementDisputeByPayment.enableServiceAction(
                        glob.owner, await ethersDriipSettlementDisputeByPayment.CHALLENGE_BY_PAYMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), payment.sender.balances.current.mul(2),
                        1, {gasLimit: 1e6}
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
                        await ethersSecurityBond._setDepositedFractionalBalance(payment.sender.balances.current.div(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersDriipSettlementDisputeByPayment.challengeByPayment(
                            payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6});

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                        dscProposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                        dscProposal.currency.ct.should.equal(payment.currency.ct);
                        dscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        dscProposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        dscProposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        dscProposal.disqualification.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                        dscProposal.disqualification.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                        dscProposal.disqualification.candidate.hash.should.equal(payment.seals.operator.hash);
                        dscProposal.disqualification.candidate.kind.should.equal('payment');

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
                        progressiveReward.amount._bn.should.eq.BN(payment.sender.balances.current.div(2)._bn);
                        progressiveReward.currency.ct.should.equal(payment.currency.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                        nscProposal.wallet.should.equal(payment.sender.wallet);
                        nscProposal.currency.ct.should.equal(payment.currency.ct);
                        nscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        nscProposal.terminated.should.be.true;
                    });
                });

                describe('if wallet balance amount is less than fractional amount', () => {
                    beforeEach(async () => {
                        await ethersSecurityBond._setDepositedFractionalBalance(payment.sender.balances.current.mul(2));
                    });

                    it('should disqualify proposal anew, deprive previous challenger\'s reward and reward new challenger from security bond', async () => {
                        await ethersDriipSettlementDisputeByPayment.challengeByPayment(
                            payment.sender.wallet, payment, glob.user_a, {gasLimit: 1e6});

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                        dscProposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                        dscProposal.currency.ct.should.equal(payment.currency.ct);
                        dscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        dscProposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                        dscProposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                        dscProposal.disqualification.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                        dscProposal.disqualification.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                        dscProposal.disqualification.candidate.hash.should.equal(payment.seals.operator.hash);
                        dscProposal.disqualification.candidate.kind.should.equal('payment');

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
                        progressiveReward.amount._bn.should.eq.BN(payment.sender.balances.current._bn);
                        progressiveReward.currency.ct.should.equal(payment.currency.ct);
                        progressiveReward.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        progressiveReward.unlockTime._bn.should.eq.BN(0);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                        nscProposal.wallet.should.equal(payment.sender.wallet);
                        nscProposal.currency.ct.should.equal(payment.currency.ct);
                        nscProposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        nscProposal.terminated.should.be.true;
                    });
                });
            });
        });
    });
};
