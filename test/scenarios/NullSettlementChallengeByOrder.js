const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementChallengeByOrder = artifacts.require('NullSettlementChallengeByOrder');
const SignerManager = artifacts.require('SignerManager');
const MockedNullSettlementDisputeByOrder = artifacts.require('MockedNullSettlementDisputeByOrder');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('NullSettlementChallengeByOrder', () => {
        let web3NullSettlementChallengeByOrder, ethersNullSettlementChallengeByOrder;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3NullSettlementDisputeByOrder, ethersNullSettlementDisputeByOrder;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let provider;
        let depositedBalanceType;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3NullSettlementDisputeByOrder = await MockedNullSettlementDisputeByOrder.new();
            ethersNullSettlementDisputeByOrder = new Contract(web3NullSettlementDisputeByOrder.address, MockedNullSettlementDisputeByOrder.abi, glob.signer_owner);
            web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new();
            ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3BalanceTracker = await MockedBalanceTracker.new();
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, glob.signer_owner);

            depositedBalanceType = await web3BalanceTracker.depositedBalanceType();
        });

        beforeEach(async () => {
            web3NullSettlementChallengeByOrder = await NullSettlementChallengeByOrder.new(glob.owner);
            ethersNullSettlementChallengeByOrder = new Contract(web3NullSettlementChallengeByOrder.address, NullSettlementChallengeByOrder.abi, glob.signer_owner);

            await ethersNullSettlementChallengeByOrder.setConfiguration(ethersConfiguration.address);
            await ethersNullSettlementChallengeByOrder.setWalletLocker(ethersWalletLocker.address);
            await ethersNullSettlementChallengeByOrder.setBalanceTracker(ethersBalanceTracker.address);
            await ethersNullSettlementChallengeByOrder.setNullSettlementDisputeByOrder(ethersNullSettlementDisputeByOrder.address);
            await ethersNullSettlementChallengeByOrder.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);

            await ethersConfiguration.setEarliestSettlementBlockNumber(0);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementChallengeByOrder.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementChallengeByOrder.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByOrder.configuration())
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
                    const result = await web3NullSettlementChallengeByOrder.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersNullSettlementChallengeByOrder.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByOrder.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('nullSettlementDisputeByOrder()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByOrder.nullSettlementDisputeByOrder())
                    .should.equal(utils.getAddress(ethersNullSettlementDisputeByOrder.address));
            });
        });

        describe('setNullSettlementDisputeByOrder()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallengeByOrder.setNullSettlementDisputeByOrder(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementDisputeByOrderEvent');

                    (await ethersNullSettlementChallengeByOrder.nullSettlementDisputeByOrder())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByOrder.setNullSettlementDisputeByOrder(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByOrder.nullSettlementChallengeState())
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
                    const result = await web3NullSettlementChallengeByOrder.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersNullSettlementChallengeByOrder.nullSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByOrder.setNullSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalExpired(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.hasProposalExpired(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalNonce()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalNonce(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalNonce(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalReferenceBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalReferenceBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalReferenceBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalExpirationTime(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalExpirationTime(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalStatus()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalStatus(mocks.settlementStatuses.indexOf('Disqualified'));
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalStatus(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
            });
        });

        describe('proposalStageAmount()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalStageAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalStageAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalTargetBalanceAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalWalletInitiated()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalWalletInitiated(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalWalletInitiated(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationChallenger(glob.user_a);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalDisqualificationChallenger(glob.owner, mocks.address0, 0))
                    .should.equal(utils.getAddress(glob.user_a));
            });
        });

        describe('proposalDisqualificationBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalDisqualificationBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationCandidateHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalDisqualificationCandidateHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1);
            });
        });

        describe('proposalDisqualificationCandidateKind()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationCandidateKind('trade');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByOrder.proposalDisqualificationCandidateKind(glob.owner, mocks.address0, 0))
                    .should.equal('trade');
            });
        });

        describe('challengeByOrder()', () => {
            let order, filter;

            before(async () => {
                await ethersNullSettlementDisputeByOrder._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

                order = await mocks.mockOrder(glob.owner);

                await ethersNullSettlementChallengeState._setProposalNonce(1);
                await ethersNullSettlementChallengeState._setProposalStageAmount(10);
                await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(20);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersNullSettlementChallengeByOrder.interface.events['ChallengeByOrderEvent'].topics
                };
            });

            it('should call corresponding function in challenge dispute instance', async () => {
                await ethersNullSettlementChallengeByOrder.challengeByOrder(order, {gasLimit: 2e6});

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                (await ethersNullSettlementDisputeByOrder._challengeByOrderCount())
                    ._bn.should.eq.BN(1);
            });
        });
    });
};
