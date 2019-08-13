const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('NullSettlementChallengeState', () => {
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3Configuration, ethersConfiguration;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3NullSettlementChallengeState = await NullSettlementChallengeState.new(glob.owner);
            ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, NullSettlementChallengeState.abi, glob.signer_owner);

            await ethersNullSettlementChallengeState.setConfiguration(ethersConfiguration.address);

            await ethersConfiguration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 1e4);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementChallengeState.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementChallengeState.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeState.configuration())
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
                    const result = await web3NullSettlementChallengeState.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersNullSettlementChallengeState.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallengeState.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('upgradeAgent()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeState.upgradeAgent())
                    .should.equal(mocks.address0);
            });
        });

        describe('setUpgradeAgent()', () => {
            describe('if called once', () => {
                let address, filter;

                before(async () => {
                    address = Wallet.createRandom().address;

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.SetUpgradeAgentEvent.topics
                    );
                });

                it('should successfully set agent', async () => {
                    await ethersNullSettlementChallengeState.setUpgradeAgent(address);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersNullSettlementChallengeState.upgradeAgent())
                        .should.equal(address);
                });
            });
        });

        describe('upgradesFrozen()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeState.upgradesFrozen())
                    .should.be.false;
            });
        });

        describe('freezeUpgrades()', () => {
            describe('if called by non-agent', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.freezeUpgrades()
                        .should.be.rejected;
                });
            });

            describe('if called by agent', () => {
                let filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.setUpgradeAgent(glob.owner);

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.FreezeUpgradesEvent.topics
                    );
                });

                it('should successfully set the upgrades frozen flag', async () => {
                    await ethersNullSettlementChallengeState.freezeUpgrades();

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersNullSettlementChallengeState.upgradesFrozen())
                        .should.be.true;
                });
            });

            describe('if upgrades are frozen', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.setUpgradeAgent(glob.owner);

                    await ethersNullSettlementChallengeState.freezeUpgrades();
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeState.freezeUpgrades()
                        .should.be.rejected;
                });
            });
        });

        describe('proposals()', () => {
            it('should return default values', async () => {
                ethersNullSettlementChallengeState.proposals(0)
                    .should.be.rejected;
            });
        });

        describe('proposalIndexByWalletCurrency()', () => {
            it('should return default values', async () => {
                (await ethersNullSettlementChallengeState.proposalIndexByWalletCurrency(
                    Wallet.createRandom().address, mocks.address0, 0
                ))._bn.should.eq.BN(0);
            });
        });

        describe('proposalsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallengeState.proposalsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('initiateProposal()', () => {
            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.registerService(glob.owner);
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.InitiateProposalEvent.topics
                    );
                });

                it('successfully initiate proposal', async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const block = (await provider.getBlock(await provider.getBlockNumber()));

                    const proposal = await ethersNullSettlementChallengeState.proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(glob.user_a));
                    proposal.nonce._bn.should.eq.BN(1);
                    proposal.referenceBlockNumber._bn.should.eq.BN(30);
                    proposal.expirationTime._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    proposal.currency.ct.should.equal(mocks.address0);
                    proposal.currency.id._bn.should.eq.BN(0);
                    proposal.amounts.stage._bn.should.eq.BN(10);
                    proposal.amounts.targetBalance._bn.should.eq.BN(20);
                    proposal.walletInitiated.should.be.true;
                    proposal.terminated.should.be.false;
                    proposal.challenged.hash.should.equal(mocks.hash0);
                    proposal.challenged.kind.should.be.a('string').that.is.empty;
                });
            });
        });

        describe('terminateProposal(address,(address,uint256))', () => {
            let filter;

            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState['terminateProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    await ethersNullSettlementChallengeState['terminateProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('successfully terminate proposal', async () => {
                    await ethersNullSettlementChallengeState['terminateProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState.proposals(0);
                    proposal.terminated.should.be.true;
                });
            });
        });

        describe('terminateProposal(address,(address,uint256),bool)', () => {
            let filter;

            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState['terminateProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    await ethersNullSettlementChallengeState['terminateProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if proposal was initiated by the conjugate role', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeState['terminateProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, false, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('successfully terminate proposal', async () => {
                    await ethersNullSettlementChallengeState['terminateProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersNullSettlementChallengeState.proposals(0);
                    proposal.terminated.should.be.true;
                });
            });
        });

        describe('removeProposal(address,(address,uint256))', () => {
            let filter;

            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState['removeProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.RemoveProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    await ethersNullSettlementChallengeState['removeProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.RemoveProposalEvent.topics
                    );
                });

                it('successfully terminate proposal', async () => {
                    await ethersNullSettlementChallengeState['removeProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersNullSettlementChallengeState.proposalsCount())
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('removeProposal(address,(address,uint256),bool)', () => {
            let filter;

            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState['removeProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.RemoveProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    await ethersNullSettlementChallengeState['removeProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if cancelling proposal initiated by the conjugate role', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeState['removeProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, false, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.RemoveProposalEvent.topics
                    );
                });

                it('successfully terminate proposal', async () => {
                    await ethersNullSettlementChallengeState['removeProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersNullSettlementChallengeState.proposalsCount())
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('disqualifyProposal()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.DisqualifyProposalEvent.topics
                    );
                });

                it('successfully disqualify proposal', async () => {
                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const block = (await provider.getBlock(await provider.getBlockNumber()));

                    const proposal = await ethersNullSettlementChallengeState.proposals(0);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.expirationTime._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_b));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(30);
                    proposal.disqualification.candidate.hash.should.equal(mocks.hash2);
                    proposal.disqualification.candidate.kind.should.equal('some_candidate_kind');
                });
            });
        });

        describe('hasProposal()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    (await ethersNullSettlementChallengeState.hasProposal(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    (await ethersNullSettlementChallengeState.hasProposal(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true;
                });
            });
        });

        describe('hasProposalTerminated()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.hasProposalTerminated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated but not terminated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersNullSettlementChallengeState.hasProposalTerminated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });

            describe('if settlement challenge proposal has been initiated and terminated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState['terminateProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );
                });

                it('should return true', async () => {
                    (await ethersNullSettlementChallengeState.hasProposalTerminated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true;
                });
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.hasProposalExpired(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge has completed for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3Configuration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 0);

                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should return true', async () => {
                    (await ethersNullSettlementChallengeState.hasProposalExpired(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true;
                });
            });

            describe('if settlement challenge is ongoing for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersNullSettlementChallengeState.hasProposalExpired(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });
        });

        describe('proposalNonce()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalNonce(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal nonce', async () => {
                    (await ethersNullSettlementChallengeState.proposalNonce(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalReferenceBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalReferenceBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal block number', async () => {
                    (await ethersNullSettlementChallengeState.proposalReferenceBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(30);
                });
            });
        });

        describe('proposalDefinitionBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDefinitionBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully return proposal block number', async () => {
                    (await ethersNullSettlementChallengeState.proposalDefinitionBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(blockNumber);
                });
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalExpirationTime(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                let block;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    block = (await provider.getBlock(await provider.getBlockNumber()));
                });

                it('should successfully return proposal expiration time', async () => {
                    (await ethersNullSettlementChallengeState.proposalExpirationTime(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                });
            });
        });

        describe('proposalStatus()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalStatus(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal status', async () => {
                    (await ethersNullSettlementChallengeState.proposalStatus(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                });
            });
        });

        describe('proposalStageAmount()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalStageAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal stage balance amount', async () => {
                    (await ethersNullSettlementChallengeState.proposalStageAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(10);
                });
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalTargetBalanceAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal target balance amount', async () => {
                    (await ethersNullSettlementChallengeState.proposalTargetBalanceAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(20);
                });
            });
        });

        describe('proposalWalletInitiated()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalWalletInitiated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return true', async () => {
                    (await ethersNullSettlementChallengeState.proposalWalletInitiated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true
                });
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDisqualificationChallenger(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification challenger', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationChallenger(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.address0)
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification challenger', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationChallenger(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(utils.getAddress(glob.user_b));
                });
            });
        });

        describe('proposalDisqualificationBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDisqualificationBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification challenger', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification block number', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(30);
                });
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDisqualificationCandidateHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification challenger', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationCandidateHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.hash0);
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification candidate hash', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationCandidateHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.hash2);
                });
            });
        });

        describe('proposalDisqualificationCandidateKind()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDisqualificationCandidateKind(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification challenger', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationCandidateKind(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.a('string').that.is.empty;
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification candidate kind', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationCandidateKind(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal('some_candidate_kind');
                });
            });
        });

        describe('upgradeProposal', () => {
            let proposal;

            before(() => {
                proposal = {
                    wallet: mocks.address1,
                    nonce: 1,
                    referenceBlockNumber: 123,
                    definitionBlockNumber: 456,
                    expirationTime: 12345678,
                    status: mocks.settlementStatuses.indexOf('Qualified'),
                    amounts: {
                        cumulativeTransfer: utils.bigNumberify(10),
                        stage: utils.bigNumberify(20),
                        targetBalance: utils.bigNumberify(30)
                    },
                    currency: {
                        ct: mocks.address0,
                        id: 0
                    },
                    challenged: {
                        kind: 'payment',
                        hash: mocks.hash1
                    },
                    walletInitiated: true,
                    terminated: false,
                    disqualification: {
                        challenger: mocks.address2,
                        nonce: 2,
                        blockNumber: 789,
                        candidate: {
                            kind: 'trade',
                            hash: mocks.hash2
                        }
                    }
                }
            });

            describe('if called by non-agent', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if called after upgrades have been frozen', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.setUpgradeAgent(glob.owner);
                    await ethersNullSettlementChallengeState.freezeUpgrades();
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.setUpgradeAgent(glob.owner);
                    filter = await fromBlockTopicsFilter(
                        ethersNullSettlementChallengeState.interface.events.UpgradeProposalEvent.topics
                    );
                });

                it('should successfully upgrade proposal', async () => {
                    await ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6});

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const _proposal = await ethersNullSettlementChallengeState.proposals(0);
                    _proposal.wallet.should.equal(mocks.address1);
                    _proposal.nonce._bn.should.eq.BN(1);
                    _proposal.referenceBlockNumber._bn.should.eq.BN(123);
                    _proposal.definitionBlockNumber._bn.should.eq.BN(456);
                    _proposal.expirationTime._bn.should.eq.BN(12345678);
                    _proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    _proposal.amounts.cumulativeTransfer._bn.should.eq.BN(10);
                    _proposal.amounts.stage._bn.should.eq.BN(20);
                    _proposal.amounts.targetBalance._bn.should.eq.BN(30);
                    _proposal.currency.ct.should.equal(mocks.address0);
                    _proposal.currency.id._bn.should.eq.BN(0);
                    _proposal.challenged.kind.should.equal('payment');
                    _proposal.challenged.hash.should.equal(mocks.hash1);
                    _proposal.walletInitiated.should.be.true;
                    _proposal.terminated.should.be.false;
                    _proposal.disqualification.challenger.should.equal(mocks.address2);
                    _proposal.disqualification.nonce._bn.should.eq.BN(2);
                    _proposal.disqualification.blockNumber._bn.should.eq.BN(789);
                    _proposal.disqualification.candidate.kind.should.equal('trade');
                    _proposal.disqualification.candidate.hash.should.equal(mocks.hash2);
                });
            });

            describe('if upgrading existing proposal', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.setUpgradeAgent(glob.owner);
                    await ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6});
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });
        });
    });
};

const fromBlockTopicsFilter = async (topics) => {
    return {
        fromBlock: await provider.getBlockNumber(),
        topics
    };
};
