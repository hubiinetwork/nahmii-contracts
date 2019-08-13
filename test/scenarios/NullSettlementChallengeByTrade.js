const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementChallengeByTrade = artifacts.require('NullSettlementChallengeByTrade');
const SignerManager = artifacts.require('SignerManager');
const MockedNullSettlementDisputeByTrade = artifacts.require('MockedNullSettlementDisputeByTrade');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('NullSettlementChallengeByTrade', () => {
        let web3NullSettlementChallengeByTrade, ethersNullSettlementChallengeByTrade;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3NullSettlementDisputeByTrade, ethersNullSettlementDisputeByTrade;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let provider;
        let depositedBalanceType;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3NullSettlementDisputeByTrade = await MockedNullSettlementDisputeByTrade.new();
            ethersNullSettlementDisputeByTrade = new Contract(web3NullSettlementDisputeByTrade.address, MockedNullSettlementDisputeByTrade.abi, glob.signer_owner);
            web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new();
            ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, glob.signer_owner);
            web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3BalanceTracker = await MockedBalanceTracker.new();
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, glob.signer_owner);

            depositedBalanceType = await web3BalanceTracker.depositedBalanceType();
        });

        beforeEach(async () => {
            web3NullSettlementChallengeByTrade = await NullSettlementChallengeByTrade.new(glob.owner);
            ethersNullSettlementChallengeByTrade = new Contract(web3NullSettlementChallengeByTrade.address, NullSettlementChallengeByTrade.abi, glob.signer_owner);

            await ethersNullSettlementChallengeByTrade.setConfiguration(ethersConfiguration.address);
            await ethersNullSettlementChallengeByTrade.setValidator(ethersValidator.address);
            await ethersNullSettlementChallengeByTrade.setWalletLocker(ethersWalletLocker.address);
            await ethersNullSettlementChallengeByTrade.setBalanceTracker(ethersBalanceTracker.address);
            await ethersNullSettlementChallengeByTrade.setNullSettlementDisputeByTrade(ethersNullSettlementDisputeByTrade.address);
            await ethersNullSettlementChallengeByTrade.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
            await ethersNullSettlementChallengeByTrade.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);

            await ethersConfiguration.setEarliestSettlementBlockNumber(0);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementChallengeByTrade.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementChallengeByTrade.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByTrade.configuration())
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
                    const result = await web3NullSettlementChallengeByTrade.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersNullSettlementChallengeByTrade.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByTrade.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('nullSettlementDisputeByTrade()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByTrade.nullSettlementDisputeByTrade())
                    .should.equal(utils.getAddress(ethersNullSettlementDisputeByTrade.address));
            });
        });

        describe('setNullSettlementDisputeByTrade()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallengeByTrade.setNullSettlementDisputeByTrade(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementDisputeByTradeEvent');

                    (await ethersNullSettlementChallengeByTrade.nullSettlementDisputeByTrade())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByTrade.setNullSettlementDisputeByTrade(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByTrade.nullSettlementChallengeState())
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
                    const result = await web3NullSettlementChallengeByTrade.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersNullSettlementChallengeByTrade.nullSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByTrade.setNullSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeByTrade.driipSettlementChallengeState())
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
                    const result = await web3NullSettlementChallengeByTrade.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersNullSettlementChallengeByTrade.driipSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeByTrade.setDriipSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('startChallenge()', () => {
            beforeEach(async () => {
                await ethersWalletLocker._reset();
                await ethersBalanceTracker._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
            });

            describe('if wallet is locked', () => {
                beforeEach(async () => {
                    await web3WalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeByTrade.startChallenge(
                        10, mocks.address0, 0, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement block number', () => {
                beforeEach(async () => {
                    await web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeByTrade.startChallenge(
                        10, mocks.address0, 0, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallengeState._setProposal(true);
                    await web3NullSettlementChallengeState._setProposalExpired(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeByTrade.startChallenge(
                        10, mocks.address0, 0, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                    await ethersNullSettlementChallengeState._setProposalExpired(true);
                    await ethersNullSettlementChallengeState._setProposalNonce(10);

                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), 100,
                        1, {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(30);
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(20);
                    await ethersDriipSettlementChallengeState._setProposalNonce(20);

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersNullSettlementChallengeByTrade.interface.events['StartChallengeEvent'].topics
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersNullSettlementChallengeByTrade.startChallenge(
                        10, mocks.address0, 0, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState._proposals(1);
                    proposal.wallet.should.equal(utils.getAddress(glob.owner));
                    proposal.amounts.stage._bn.should.eq.BN(10);
                    proposal.amounts.targetBalance._bn.should.eq.BN(40);
                    proposal.currency.ct.should.equal(mocks.address0);
                    proposal.currency.id._bn.should.eq.BN(0);
                    proposal.referenceBlockNumber._bn.should.eq.BN(1);
                    proposal.nonce._bn.should.eq.BN(20);
                    proposal.walletInitiated.should.be.true;
                    proposal.challenged.hash.should.equal(mocks.hash0);
                    proposal.challenged.kind.should.be.a('string').that.is.empty;
                });
            });
        });

        describe('startChallengeByProxy()', () => {
            beforeEach(async () => {
                await ethersWalletLocker._reset();
                await ethersBalanceTracker._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
            });

            describe('if current block number is below earliest settlement block number', () => {
                beforeEach(async () => {
                    await web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeByTrade.startChallengeByProxy(
                        glob.owner, 10, mocks.address0, 0, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallengeState._setProposal(true);
                    await web3NullSettlementChallengeState._setProposalExpired(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeByTrade.startChallengeByProxy(
                        glob.owner, 10, mocks.address0, 0, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                    await ethersNullSettlementChallengeState._setProposalExpired(true);
                    await ethersNullSettlementChallengeState._setProposalNonce(10);

                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), 100,
                        1, {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(30);
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(20);
                    await ethersDriipSettlementChallengeState._setProposalNonce(20);

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersNullSettlementChallengeByTrade.interface.events['StartChallengeByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersNullSettlementChallengeByTrade.startChallengeByProxy(
                        glob.owner, 10, mocks.address0, 0, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState._proposals(1);
                    proposal.wallet.should.equal(utils.getAddress(glob.owner));
                    proposal.amounts.stage._bn.should.eq.BN(10);
                    proposal.amounts.targetBalance._bn.should.eq.BN(40);
                    proposal.currency.ct.should.equal(mocks.address0);
                    proposal.currency.id._bn.should.eq.BN(0);
                    proposal.referenceBlockNumber._bn.should.eq.BN(1);
                    proposal.nonce._bn.should.eq.BN(20);
                    proposal.walletInitiated.should.be.false;
                    proposal.challenged.hash.should.equal(mocks.hash0);
                    proposal.challenged.kind.should.be.a('string').that.is.empty;
                });
            });
        });

        describe('stopChallenge()', () => {
            let filter;

            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersNullSettlementChallengeByTrade.interface.events['StopChallengeEvent'].topics
                };
            });

            it('should stop challenge successfully', async () => {
                await ethersNullSettlementChallengeByTrade.stopChallenge(
                    mocks.address1, 10, {gasLimit: 1e6}
                );

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                const proposal = await ethersNullSettlementChallengeState._proposals(0);
                proposal.wallet.should.equal(utils.getAddress(glob.owner));
                proposal.currency.ct.should.equal(mocks.address1);
                proposal.currency.id._bn.should.eq.BN(10);
                proposal.walletInitiated.should.be.true;
                proposal.terminated.should.be.true;
            });
        });

        describe('stopChallengeByProxy()', () => {
            let filter;

            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersNullSettlementChallengeByTrade.interface.events['StopChallengeByProxyEvent'].topics
                };
            });

            it('should stop challenge successfully', async () => {
                await ethersNullSettlementChallengeByTrade.stopChallengeByProxy(
                    glob.user_a, mocks.address1, 10, {gasLimit: 1e6}
                );

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                const proposal = await ethersNullSettlementChallengeState._proposals(0);
                proposal.wallet.should.equal(utils.getAddress(glob.user_a));
                proposal.currency.ct.should.equal(mocks.address1);
                proposal.currency.id._bn.should.eq.BN(10);
                proposal.walletInitiated.should.be.false;
                proposal.terminated.should.be.true;
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalExpired(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.hasProposalExpired(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalNonce()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalNonce(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalNonce(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalReferenceBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalReferenceBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalReferenceBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalExpirationTime(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalExpirationTime(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalStatus()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalStatus(mocks.settlementStatuses.indexOf('Disqualified'));
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalStatus(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
            });
        });

        describe('proposalStageAmount()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalStageAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalStageAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalTargetBalanceAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalWalletInitiated()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalWalletInitiated(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalWalletInitiated(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationChallenger(glob.user_a);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalDisqualificationChallenger(glob.owner, mocks.address0, 0))
                    .should.equal(utils.getAddress(glob.user_a));
            });
        });

        describe('proposalDisqualificationBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalDisqualificationBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationCandidateHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalDisqualificationCandidateHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1);
            });
        });

        describe('proposalDisqualificationCandidateKind()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._setProposalDisqualificationCandidateKind('trade');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersNullSettlementChallengeByTrade.proposalDisqualificationCandidateKind(glob.owner, mocks.address0, 0))
                    .should.equal('trade');
            });
        });

        describe('challengeByTrade()', () => {
            let trade, filter;

            before(async () => {
                await ethersNullSettlementDisputeByTrade._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersValidator._reset({gasLimit: 1e6});

                trade = await mocks.mockTrade(glob.owner);

                await ethersNullSettlementChallengeState._setProposalNonce(1);
                await ethersNullSettlementChallengeState._setProposalStageAmount(10);
                await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(20);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersNullSettlementChallengeByTrade.interface.events['ChallengeByTradeEvent'].topics
                };
            });

            it('should call corresponding function in challenge dispute instance', async () => {
                await ethersNullSettlementChallengeByTrade.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 3e6});

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                (await ethersNullSettlementDisputeByTrade._challengeByTradeCount())
                    ._bn.should.eq.BN(1);
            });
        });
    });
};
