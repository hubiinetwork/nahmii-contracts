const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementChallengeByPayment = artifacts.require('DriipSettlementChallengeByPayment');
const SignerManager = artifacts.require('SignerManager');
const MockedDriipSettlementDisputeByPayment = artifacts.require('MockedDriipSettlementDisputeByPayment');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedDriipSettlementState = artifacts.require('MockedDriipSettlementState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('DriipSettlementChallengeByPayment', () => {
        let web3DriipSettlementChallengeByPayment, ethersDriipSettlementChallengeByPayment;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3DriipSettlementDisputeByPayment, ethersDriipSettlementDisputeByPayment;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3DriipSettlementState, ethersDriipSettlementState;
        let provider;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3DriipSettlementDisputeByPayment = await MockedDriipSettlementDisputeByPayment.new();
            ethersDriipSettlementDisputeByPayment = new Contract(web3DriipSettlementDisputeByPayment.address, MockedDriipSettlementDisputeByPayment.abi, glob.signer_owner);
            web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, glob.signer_owner);
            web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new();
            ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, glob.signer_owner);
            web3DriipSettlementState = await MockedDriipSettlementState.new();
            ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, MockedDriipSettlementState.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3BalanceTracker = await MockedBalanceTracker.new();
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3DriipSettlementChallengeByPayment = await DriipSettlementChallengeByPayment.new(glob.owner);
            ethersDriipSettlementChallengeByPayment = new Contract(web3DriipSettlementChallengeByPayment.address, DriipSettlementChallengeByPayment.abi, glob.signer_owner);

            await ethersDriipSettlementChallengeByPayment.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementChallengeByPayment.setValidator(ethersValidator.address);
            await ethersDriipSettlementChallengeByPayment.setWalletLocker(ethersWalletLocker.address);
            await ethersDriipSettlementChallengeByPayment.setBalanceTracker(ethersBalanceTracker.address);
            await ethersDriipSettlementChallengeByPayment.setDriipSettlementDisputeByPayment(ethersDriipSettlementDisputeByPayment.address);
            await ethersDriipSettlementChallengeByPayment.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);
            await ethersDriipSettlementChallengeByPayment.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
            await ethersDriipSettlementChallengeByPayment.setDriipSettlementState(ethersDriipSettlementState.address);

            await ethersConfiguration.setEarliestSettlementBlockNumber(0);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementChallengeByPayment.deployer.call()).should.equal(glob.owner);
                (await web3DriipSettlementChallengeByPayment.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByPayment.configuration())
                    .should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByPayment.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementChallengeByPayment.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByPayment.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByPayment.validator())
                    .should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByPayment.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementChallengeByPayment.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByPayment.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementDisputeByPayment()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByPayment.driipSettlementDisputeByPayment())
                    .should.equal(utils.getAddress(ethersDriipSettlementDisputeByPayment.address));
            });
        });

        describe('setDriipSettlementDisputeByPayment()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByPayment.setDriipSettlementDisputeByPayment(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementDisputeByPaymentEvent');

                    (await ethersDriipSettlementChallengeByPayment.driipSettlementDisputeByPayment())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByPayment.setDriipSettlementDisputeByPayment(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByPayment.driipSettlementChallengeState())
                    .should.equal(utils.getAddress(ethersDriipSettlementChallengeState.address));
            });
        });

        describe('setDriipSettlementChallengeState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByPayment.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersDriipSettlementChallengeByPayment.driipSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByPayment.setDriipSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByPayment.nullSettlementChallengeState())
                    .should.equal(utils.getAddress(ethersNullSettlementChallengeState.address));
            });
        });

        describe('setNullSettlementChallengeState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByPayment.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersDriipSettlementChallengeByPayment.nullSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByPayment.setNullSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('startChallengeFromPayment()', () => {
            let payment;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersBalanceTracker._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});

                payment = await mocks.mockPayment(glob.owner, {
                    sender: {wallet: glob.owner},
                    blockNumber: utils.bigNumberify(0)
                });
            });

            describe('if wallet is locked', () => {
                beforeEach(async () => {
                    await web3WalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement block number', () => {
                beforeEach(async () => {
                    await web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called from sender that is not payment party', () => {
                beforeEach(async () => {
                    await web3Validator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallengeState._setProposal(true);
                    await web3DriipSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallengeState._setProposal(true);
                    await web3NullSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if there is no existent driip settlement challenge proposal to suggest unsynchronized payment balance', () => {
                let filter;

                beforeEach(async () => {
                    await web3DriipSettlementChallengeState._setProposal(false);
                    await web3DriipSettlementChallengeState._setProposalTerminated(true);

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        payment.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByPayment.interface.events['StartChallengeFromPaymentEvent'].topics
                    };
                });

                it('should start challenge successfully without correcting cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).sub(payment.sender.balances.current)._bn
                    );
                    proposal.amounts.stage._bn.should.eq.BN(payment.sender.balances.current._bn);
                    proposal.amounts.targetBalance._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(payment.currency.ct);
                    proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    proposal.referenceBlockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    proposal.walletInitiated.should.be.true;
                    proposal.challenged.hash.should.equal(payment.seals.operator.hash);
                    proposal.challenged.kind.should.equal('payment');
                });
            });

            describe('if there exist a driip settlement challenge proposal but the payment includes its causal rebalance', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(0);

                    await ethersDriipSettlementState.initSettlement(
                        'payment', payment.seals.operator.hash,
                        payment.sender.wallet, payment.sender.nonce,
                        payment.recipient.wallet, payment.recipient.nonce,
                        {gasLimit: 1e6}
                    );
                    await ethersDriipSettlementState._setSettlementPartyDoneBlockNumber(
                        mocks.settlementRoles.indexOf('Origin'), payment.blockNumber
                    );

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        payment.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByPayment.interface.events['StartChallengeFromPaymentEvent'].topics
                    };
                });

                it('should start challenge successfully without correcting cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(1);

                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).sub(payment.sender.balances.current)._bn
                    );
                    proposal.amounts.stage._bn.should.eq.BN(payment.sender.balances.current._bn);
                    proposal.amounts.targetBalance._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(payment.currency.ct);
                    proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    proposal.referenceBlockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    proposal.walletInitiated.should.be.true;
                    proposal.challenged.hash.should.equal(payment.seals.operator.hash);
                    proposal.challenged.kind.should.equal('payment');
                });
            });

            describe('if there exist a driip settlement challenge proposal and the payment does not include its causal rebalance', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(0);
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('100', 18));

                    await ethersDriipSettlementState.initSettlement(
                        'payment', payment.seals.operator.hash,
                        payment.sender.wallet, payment.sender.nonce,
                        payment.recipient.wallet, payment.recipient.nonce,
                        {gasLimit: 1e6}
                    );
                    await ethersDriipSettlementState._setSettlementPartyDoneBlockNumber(
                        mocks.settlementRoles.indexOf('Origin'), payment.blockNumber.add(1)
                    );

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        payment.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByPayment.interface.events['StartChallengeFromPaymentEvent'].topics
                    };
                });

                it('should start challenge successfully with corrected cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current.sub(utils.parseUnits('100', 18)), {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(1);

                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        utils.parseUnits('10000', 18)
                            .sub(payment.sender.balances.current)
                            .add(utils.parseUnits('100', 18))
                            ._bn
                    );
                    proposal.amounts.stage._bn.should.eq.BN(
                        payment.sender.balances.current.sub(utils.parseUnits('100', 18))._bn
                    );
                    proposal.amounts.targetBalance._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(payment.currency.ct);
                    proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    proposal.referenceBlockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    proposal.walletInitiated.should.be.true;
                    proposal.challenged.hash.should.equal(payment.seals.operator.hash);
                    proposal.challenged.kind.should.equal('payment');
                });
            });
        });

        describe('startChallengeFromPaymentByProxy()', () => {
            let payment;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersBalanceTracker._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});

                payment = await mocks.mockPayment(glob.owner, {
                    sender: {wallet: glob.owner},
                    blockNumber: utils.bigNumberify(0)
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement block number', () => {
                beforeEach(async () => {
                    await web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called from sender that is not payment party', () => {
                beforeEach(async () => {
                    await web3Validator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallengeState._setProposal(true);
                    await web3DriipSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallengeState._setProposal(true);
                    await web3NullSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if there is no existent driip settlement challenge proposal to suggest unsynchronized payment balance', () => {
                let filter;

                beforeEach(async () => {
                    await web3DriipSettlementChallengeState._setProposal(false);
                    await web3DriipSettlementChallengeState._setProposalTerminated(true);

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        payment.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByPayment.interface.events['StartChallengeFromPaymentByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully without correcting cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByPayment.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).sub(payment.sender.balances.current)._bn
                    );
                    proposal.amounts.stage._bn.should.eq.BN(payment.sender.balances.current._bn);
                    proposal.amounts.targetBalance._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(payment.currency.ct);
                    proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    proposal.referenceBlockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    proposal.walletInitiated.should.be.false;
                    proposal.challenged.hash.should.equal(payment.seals.operator.hash);
                    proposal.challenged.kind.should.equal('payment');
                });
            });

            describe('if there exist a driip settlement challenge proposal but the payment includes its causal rebalance', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(0);

                    await ethersDriipSettlementState.initSettlement(
                        'payment', payment.seals.operator.hash,
                        payment.sender.wallet, payment.sender.nonce,
                        payment.recipient.wallet, payment.recipient.nonce,
                        {gasLimit: 1e6}
                    );
                    await ethersDriipSettlementState._setSettlementPartyDoneBlockNumber(
                        mocks.settlementRoles.indexOf('Origin'), payment.blockNumber
                    );

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        payment.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByPayment.interface.events['StartChallengeFromPaymentByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully without correcting cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByPayment.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(1);

                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).sub(payment.sender.balances.current)._bn
                    );
                    proposal.amounts.stage._bn.should.eq.BN(payment.sender.balances.current._bn);
                    proposal.amounts.targetBalance._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(payment.currency.ct);
                    proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    proposal.referenceBlockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    proposal.walletInitiated.should.be.false;
                    proposal.challenged.hash.should.equal(payment.seals.operator.hash);
                    proposal.challenged.kind.should.equal('payment');
                });
            });

            describe('if there exist a driip settlement challenge proposal and the payment does not include its causal rebalance', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(0);
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('100', 18));

                    await ethersDriipSettlementState.initSettlement(
                        'payment', payment.seals.operator.hash,
                        payment.sender.wallet, payment.sender.nonce,
                        payment.recipient.wallet, payment.recipient.nonce,
                        {gasLimit: 1e6}
                    );
                    await ethersDriipSettlementState._setSettlementPartyDoneBlockNumber(
                        mocks.settlementRoles.indexOf('Origin'), payment.blockNumber.add(1)
                    );

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        payment.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByPayment.interface.events['StartChallengeFromPaymentByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully with corrected cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByPayment.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment,
                        payment.sender.balances.current.sub(utils.parseUnits('100', 18)),
                        {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(1);

                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        utils.parseUnits('10000', 18)
                            .sub(payment.sender.balances.current)
                            .add(utils.parseUnits('100', 18))
                            ._bn
                    );
                    proposal.amounts.stage._bn.should.eq.BN(
                        payment.sender.balances.current.sub(utils.parseUnits('100', 18))._bn
                    );
                    proposal.amounts.targetBalance._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(payment.currency.ct);
                    proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    proposal.referenceBlockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    proposal.walletInitiated.should.be.false;
                    proposal.challenged.hash.should.equal(payment.seals.operator.hash);
                    proposal.challenged.kind.should.equal('payment');
                });
            });

        });

        describe('stopChallenge()', () => {
            let filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

                await ethersDriipSettlementChallengeState._setProposal(true);
                await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                await ethersDriipSettlementChallengeState._setProposalNonce(1);
                await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(10);
                await ethersDriipSettlementChallengeState._setProposalStageAmount(20);
                await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(30);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByPayment.interface.events['StopChallengeEvent'].topics
                };
            });

            describe('if called with undefined proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.stopChallenge(
                        mocks.address1, 10, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with terminated proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.stopChallenge(
                        mocks.address1, 10, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should stop challenge successfully', async () => {
                    await ethersDriipSettlementChallengeByPayment.stopChallenge(
                        mocks.address1, 10, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    dscProposal.wallet.should.equal(utils.getAddress(glob.owner));
                    dscProposal.currency.ct.should.equal(mocks.address1);
                    dscProposal.currency.id._bn.should.eq.BN(10);
                    dscProposal.walletInitiated.should.be.true;
                    dscProposal.terminated.should.be.true;

                    (await ethersNullSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                    nscProposal.wallet.should.equal(utils.getAddress(glob.owner));
                    nscProposal.currency.ct.should.equal(mocks.address1);
                    nscProposal.currency.id._bn.should.eq.BN(10);
                    nscProposal.terminated.should.be.true;
                });
            });
        });

        describe('stopChallengeByProxy()', () => {
            let filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

                await ethersDriipSettlementChallengeState._setProposal(true);
                await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                await ethersDriipSettlementChallengeState._setProposalNonce(1);
                await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(10);
                await ethersDriipSettlementChallengeState._setProposalStageAmount(20);
                await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(30);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByPayment.interface.events['StopChallengeByProxyEvent'].topics
                };
            });

            describe('if called with undefined proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.stopChallengeByProxy(
                        glob.user_a, mocks.address1, 10, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with terminated proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByPayment.stopChallengeByProxy(
                        glob.user_a, mocks.address1, 10, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should stop challenge successfully', async () => {
                    await ethersDriipSettlementChallengeByPayment.stopChallengeByProxy(
                        glob.user_a, mocks.address1, 10, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    dscProposal.wallet.should.equal(utils.getAddress(glob.user_a));
                    dscProposal.currency.ct.should.equal(mocks.address1);
                    dscProposal.currency.id._bn.should.eq.BN(10);
                    dscProposal.walletInitiated.should.be.false;
                    dscProposal.terminated.should.be.true;

                    (await ethersNullSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                    nscProposal.wallet.should.equal(utils.getAddress(glob.user_a));
                    nscProposal.currency.ct.should.equal(mocks.address1);
                    nscProposal.currency.id._bn.should.eq.BN(10);
                    nscProposal.terminated.should.be.true;
                });
            });
        });

        describe('hasProposal()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposal(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.hasProposal(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('hasProposalTerminated()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalTerminated(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.hasProposalTerminated(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalExpired(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.hasProposalExpired(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalNonce()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalNonce(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalNonce(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalReferenceBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalReferenceBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalReferenceBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalExpirationTime(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalExpirationTime(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalStatus()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalStatus(mocks.settlementStatuses.indexOf('Disqualified'));
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalStatus(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
            });
        });

        describe('proposalStageAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalStageAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalStageAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalTargetBalanceAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalChallengedHash()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalChallengedHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalChallengedHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1)
            });
        });

        describe('proposalChallengedKind()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalChallengedKind('payment');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalChallengedKind(glob.owner, mocks.address0, 0))
                    .should.equal('payment');
            });
        });

        describe('proposalWalletInitiated()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalWalletInitiated(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalWalletInitiated(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationChallenger(glob.user_a);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalDisqualificationChallenger(glob.owner, mocks.address0, 0))
                    .should.equal(utils.getAddress(glob.user_a));
            });
        });

        describe('proposalDisqualificationBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalDisqualificationBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationCandidateHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalDisqualificationCandidateHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1);
            });
        });

        describe('proposalDisqualificationCandidateKind()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationCandidateKind('payment');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalDisqualificationCandidateKind(glob.owner, mocks.address0, 0))
                    .should.equal('payment');
            });
        });

        describe('challengeByPayment()', () => {
            let payment, filter;

            beforeEach(async () => {
                await ethersDriipSettlementDisputeByPayment._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});

                payment = await mocks.mockPayment(glob.owner);

                await ethersDriipSettlementChallengeState._setProposalNonce(1);
                await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(10);
                await ethersDriipSettlementChallengeState._setProposalStageAmount(20);
                await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(30);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByPayment.interface.events['ChallengeByPaymentEvent'].topics
                };
            });

            it('should call corresponding function in challenge dispute instance', async () => {
                await ethersDriipSettlementChallengeByPayment.challengeByPayment(payment.sender.wallet, payment, {gasLimit: 2e6});

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                (await ethersDriipSettlementDisputeByPayment._challengeByPaymentCount())
                    ._bn.should.eq.BN(1);
            });
        });
    });
};
