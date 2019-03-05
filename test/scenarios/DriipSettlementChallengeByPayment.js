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
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe.only('DriipSettlementChallengeByPayment', () => {
        let web3DriipSettlementChallengeByPayment, ethersDriipSettlementChallengeByPayment;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3WalletLocker, ethersWalletLocker;
        let web3DriipSettlementDisputeByPayment, ethersDriipSettlementDisputeByPayment;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let provider;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3DriipSettlementDisputeByPayment = await MockedDriipSettlementDisputeByPayment.new();
            ethersDriipSettlementDisputeByPayment = new Contract(web3DriipSettlementDisputeByPayment.address, MockedDriipSettlementDisputeByPayment.abi, glob.signer_owner);
            web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3DriipSettlementChallengeByPayment = await DriipSettlementChallengeByPayment.new(glob.owner);
            ethersDriipSettlementChallengeByPayment = new Contract(web3DriipSettlementChallengeByPayment.address, DriipSettlementChallengeByPayment.abi, glob.signer_owner);

            await ethersDriipSettlementChallengeByPayment.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementChallengeByPayment.setValidator(ethersValidator.address);
            await ethersDriipSettlementChallengeByPayment.setWalletLocker(ethersWalletLocker.address);
            await ethersDriipSettlementChallengeByPayment.setDriipSettlementDisputeByPayment(ethersDriipSettlementDisputeByPayment.address);
            await ethersDriipSettlementChallengeByPayment.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);

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

        describe('startChallengeFromPayment()', () => {
            let payment;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});

                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
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

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByPayment.interface.events['StartChallengeEvent'].topics
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallengeByPayment.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.stageAmount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    proposal.targetBalanceAmount._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(payment.currency.ct);
                    proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    proposal.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    proposal.walletInitiated.should.be.true;
                    proposal.challengedHash.should.equal(payment.seals.operator.hash);
                    proposal.challengedType.should.equal('payment');
                });
            });
        });

        describe('startChallengeFromPaymentByProxy()', () => {
            let payment;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});

                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
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

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByPayment.interface.events['StartChallengeByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallengeByPayment.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.stageAmount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    proposal.targetBalanceAmount._bn.should.eq.BN(0);
                    proposal.currency.ct.should.equal(payment.currency.ct);
                    proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                    proposal.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                    proposal.walletInitiated.should.be.false;
                    proposal.challengedHash.should.equal(payment.seals.operator.hash);
                    proposal.challengedType.should.equal('payment');
                });
            });
        });

        describe('stopChallenge()', () => {
            let filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByPayment.interface.events['StopChallengeEvent'].topics
                };
            });

            it('should stop challenge successfully', async () => {
                await ethersDriipSettlementChallengeByPayment.stopChallenge(
                    mocks.address1, 10, {gasLimit: 1e6}
                );

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                proposal.wallet.should.equal(utils.getAddress(glob.owner));
                proposal.currency.ct.should.equal(mocks.address1);
                proposal.currency.id._bn.should.eq.BN(10);
                proposal.walletInitiated.should.be.true;
            });
        });

        describe('stopChallengeByProxy()', () => {
            let filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByPayment.interface.events['StopChallengeByProxyEvent'].topics
                };
            });

            it('should stop challenge successfully', async () => {
                await ethersDriipSettlementChallengeByPayment.stopChallengeByProxy(
                    glob.user_a, mocks.address1, 10, {gasLimit: 1e6}
                );

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                proposal.wallet.should.equal(utils.getAddress(glob.user_a));
                proposal.currency.ct.should.equal(mocks.address1);
                proposal.currency.id._bn.should.eq.BN(10);
                proposal.walletInitiated.should.be.false;
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

        describe('proposalBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalBlockNumber(glob.owner, mocks.address0, 0))
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

        describe('proposalChallengedType()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalChallengedType('payment');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalChallengedType(glob.owner, mocks.address0, 0))
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

        describe('proposalDisqualificationCandidateType()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationCandidateType('payment');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByPayment.proposalDisqualificationCandidateType(glob.owner, mocks.address0, 0))
                    .should.equal('payment');
            });
        });

        describe('challengeByPayment()', () => {
            let payment;

            before(async () => {
                await ethersDriipSettlementDisputeByPayment._reset();
                payment = await mocks.mockPayment(glob.owner);
            });

            it('should call corresponding function in challenge dispute instance', async () => {
                await ethersDriipSettlementChallengeByPayment.challengeByPayment(payment.sender.wallet, payment, {gasLimit: 2e6});

                (await ethersDriipSettlementDisputeByPayment._challengeByPaymentCount())
                    ._bn.should.eq.BN(1);
            });
        });
    });
};
