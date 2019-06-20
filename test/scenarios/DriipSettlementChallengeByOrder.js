const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementChallengeByOrder = artifacts.require('DriipSettlementChallengeByOrder');
const SignerManager = artifacts.require('SignerManager');
const MockedDriipSettlementDisputeByOrder = artifacts.require('MockedDriipSettlementDisputeByOrder');
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
    describe('DriipSettlementChallengeByOrder', () => {
        let web3DriipSettlementChallengeByOrder, ethersDriipSettlementChallengeByOrder;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3DriipSettlementDisputeByOrder, ethersDriipSettlementDisputeByOrder;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3DriipSettlementState, ethersDriipSettlementState;
        let provider;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3DriipSettlementDisputeByOrder = await MockedDriipSettlementDisputeByOrder.new();
            ethersDriipSettlementDisputeByOrder = new Contract(web3DriipSettlementDisputeByOrder.address, MockedDriipSettlementDisputeByOrder.abi, glob.signer_owner);
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
            web3DriipSettlementChallengeByOrder = await DriipSettlementChallengeByOrder.new(glob.owner);
            ethersDriipSettlementChallengeByOrder = new Contract(web3DriipSettlementChallengeByOrder.address, DriipSettlementChallengeByOrder.abi, glob.signer_owner);

            await ethersDriipSettlementChallengeByOrder.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementChallengeByOrder.setValidator(ethersValidator.address);
            await ethersDriipSettlementChallengeByOrder.setWalletLocker(ethersWalletLocker.address);
            await ethersDriipSettlementChallengeByOrder.setBalanceTracker(ethersBalanceTracker.address);
            await ethersDriipSettlementChallengeByOrder.setDriipSettlementDisputeByOrder(ethersDriipSettlementDisputeByOrder.address);
            await ethersDriipSettlementChallengeByOrder.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);
            await ethersDriipSettlementChallengeByOrder.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
            await ethersDriipSettlementChallengeByOrder.setDriipSettlementState(ethersDriipSettlementState.address);

            await ethersConfiguration.setEarliestSettlementBlockNumber(0);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementChallengeByOrder.deployer.call()).should.equal(glob.owner);
                (await web3DriipSettlementChallengeByOrder.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByOrder.configuration())
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
                    const result = await web3DriipSettlementChallengeByOrder.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementChallengeByOrder.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByOrder.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByOrder.validator())
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
                    const result = await web3DriipSettlementChallengeByOrder.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementChallengeByOrder.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByOrder.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementDisputeByOrder()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByOrder.driipSettlementDisputeByOrder())
                    .should.equal(utils.getAddress(ethersDriipSettlementDisputeByOrder.address));
            });
        });

        describe('setDriipSettlementDisputeByOrder()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByOrder.setDriipSettlementDisputeByOrder(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementDisputeByOrderEvent');

                    (await ethersDriipSettlementChallengeByOrder.driipSettlementDisputeByOrder())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByOrder.setDriipSettlementDisputeByOrder(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByOrder.driipSettlementChallengeState())
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
                    const result = await web3DriipSettlementChallengeByOrder.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersDriipSettlementChallengeByOrder.driipSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByOrder.setDriipSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByOrder.nullSettlementChallengeState())
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
                    const result = await web3DriipSettlementChallengeByOrder.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersDriipSettlementChallengeByOrder.nullSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByOrder.setNullSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByOrder.driipSettlementState())
                    .should.equal(utils.getAddress(ethersDriipSettlementState.address));
            });
        });

        describe('setDriipSettlementState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByOrder.setDriipSettlementState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementStateEvent');

                    (await ethersDriipSettlementChallengeByOrder.driipSettlementState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByOrder.setDriipSettlementState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalExpired(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.hasProposalExpired(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalNonce()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalNonce(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalNonce(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalReferenceBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalReferenceBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalReferenceBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalExpirationTime(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalExpirationTime(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalStatus()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalStatus(mocks.settlementStatuses.indexOf('Disqualified'));
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalStatus(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
            });
        });

        describe('proposalStageAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalStageAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalStageAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalTargetBalanceAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalChallengedHash()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalChallengedHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalChallengedHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1)
            });
        });

        describe('proposalChallengedKind()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalChallengedKind('order');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalChallengedKind(glob.owner, mocks.address0, 0))
                    .should.equal('order');
            });
        });

        describe('proposalWalletInitiated()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalWalletInitiated(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalWalletInitiated(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationChallenger(glob.user_a);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalDisqualificationChallenger(glob.owner, mocks.address0, 0))
                    .should.equal(utils.getAddress(glob.user_a));
            });
        });

        describe('proposalDisqualificationBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalDisqualificationBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationCandidateHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalDisqualificationCandidateHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1);
            });
        });

        describe('proposalDisqualificationCandidateKind()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationCandidateKind('order');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByOrder.proposalDisqualificationCandidateKind(glob.owner, mocks.address0, 0))
                    .should.equal('order');
            });
        });

        describe('challengeByOrder()', () => {
            let order, filter;

            beforeEach(async () => {
                await ethersDriipSettlementDisputeByOrder._reset();

                await ethersDriipSettlementChallengeState._setProposalNonce(0);

                order = await mocks.mockOrder(glob.owner);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByOrder.interface.events['ChallengeByOrderEvent'].topics
                };
            });

            it('should call challengeByOrder() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallengeByOrder.challengeByOrder(order, {gasLimit: 2e6});

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                (await ethersDriipSettlementDisputeByOrder._challengeByOrderCount())
                    ._bn.should.eq.BN(1);
            });
        });
    });
};
