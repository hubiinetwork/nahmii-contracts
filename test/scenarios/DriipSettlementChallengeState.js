const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementChallengeState = artifacts.require('DriipSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('DriipSettlementChallengeState', () => {
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let web3Configuration, ethersConfiguration;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3DriipSettlementChallengeState = await DriipSettlementChallengeState.new(glob.owner);
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, DriipSettlementChallengeState.abi, glob.signer_owner);

            await ethersDriipSettlementChallengeState.setConfiguration(ethersConfiguration.address);

            await ethersConfiguration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 1e4);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementChallengeState.deployer.call()).should.equal(glob.owner);
                (await web3DriipSettlementChallengeState.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeState.configuration())
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
                    const result = await web3DriipSettlementChallengeState.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementChallengeState.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeState.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('upgradeAgent()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeState.upgradeAgent())
                    .should.equal(mocks.address0);
            });
        });

        describe('setUpgradeAgent()', () => {
            describe('if called once', () => {
                let address, filter;

                before(async () => {
                    address = Wallet.createRandom().address;

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.SetUpgradeAgentEvent.topics
                    );
                });

                it('should successfully set agent', async () => {
                    await ethersDriipSettlementChallengeState.setUpgradeAgent(address);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState.upgradeAgent())
                        .should.equal(address);
                });
            });
        });

        describe('upgradesFrozen()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeState.upgradesFrozen())
                    .should.be.false;
            });
        });

        describe('freezeUpgrades()', () => {
            describe('if called by non-agent', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.freezeUpgrades()
                        .should.be.rejected;
                });
            });

            describe('if called by agent', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.setUpgradeAgent(glob.owner);

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.FreezeUpgradesEvent.topics
                    );
                });

                it('should successfully set the upgrades frozen flag', async () => {
                    await ethersDriipSettlementChallengeState.freezeUpgrades();

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState.upgradesFrozen())
                        .should.be.true;
                });
            });

            describe('if upgrades are frozen', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.setUpgradeAgent(glob.owner);

                    await ethersDriipSettlementChallengeState.freezeUpgrades();
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.freezeUpgrades()
                        .should.be.rejected;
                });
            });
        });

        describe('proposals()', () => {
            it('should return default values', async () => {
                ethersDriipSettlementChallengeState.proposals(0)
                    .should.be.rejected;
            });
        });

        describe('proposalIndexByWalletCurrency()', () => {
            it('should return default values', async () => {
                (await ethersDriipSettlementChallengeState.proposalIndexByWalletCurrency(
                    Wallet.createRandom().address, mocks.address0, 0
                ))._bn.should.eq.BN(0);
            });
        });

        describe('proposalsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeState.proposalsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('initiateProposal()', () => {
            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.registerService(glob.owner);
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.InitiateProposalEvent.topics
                    );
                });

                it('successfully initiate proposal', async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const block = (await provider.getBlock(await provider.getBlockNumber()));

                    const proposal = await ethersDriipSettlementChallengeState.proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(glob.user_a));
                    proposal.nonce._bn.should.eq.BN(1);
                    proposal.referenceBlockNumber._bn.should.eq.BN(30);
                    proposal.expirationTime._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    proposal.currency.ct.should.equal(mocks.address0);
                    proposal.currency.id._bn.should.eq.BN(0);
                    proposal.amounts.cumulativeTransfer._bn.should.eq.BN(10);
                    proposal.amounts.stage._bn.should.eq.BN(20);
                    proposal.amounts.targetBalance._bn.should.eq.BN(30);
                    proposal.walletInitiated.should.be.true;
                    proposal.terminated.should.be.false;
                    proposal.challenged.hash.should.equal(mocks.hash1);
                    proposal.challenged.kind.should.equal('some_challenged_kind');

                    (await ethersDriipSettlementChallengeState.proposalIndexByWalletCurrency(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(1);

                    (await ethersDriipSettlementChallengeState.proposalIndexByWalletNonceCurrency(glob.user_a, 1, mocks.address0, 0))
                        ._bn.should.eq.BN(1);

                    (await ethersDriipSettlementChallengeState.proposalsCount())
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('terminateProposal(address,(address,uint256),bool)', () => {
            let filter;

            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState['terminateProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    await ethersDriipSettlementChallengeState['terminateProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('successfully terminate proposal', async () => {
                    await ethersDriipSettlementChallengeState['terminateProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState.proposals(0);
                    proposal.terminated.should.be.true;
                });
            });
        });

        describe('terminateProposal(address,(address,uint256),bool,bool)', () => {
            let filter;

            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState['terminateProposal(address,(address,uint256),bool,bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, true, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    await ethersDriipSettlementChallengeState['terminateProposal(address,(address,uint256),bool,bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, true, {gasLimit: 1e6}
                    );

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if proposal was initiated by the conjugate role', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    ethersDriipSettlementChallengeState['terminateProposal(address,(address,uint256),bool,bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, false, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.TerminateProposalEvent.topics
                    );
                });

                it('successfully terminate proposal', async () => {
                    await ethersDriipSettlementChallengeState['terminateProposal(address,(address,uint256),bool,bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, true, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const proposal = await ethersDriipSettlementChallengeState.proposals(0);
                    proposal.terminated.should.be.true;
                });
            });
        });

        describe('removeProposal(address,(address,uint256))', () => {
            let filter;

            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.RemoveProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    await ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.RemoveProposalEvent.topics
                    );
                });

                it('successfully terminate proposal', async () => {
                    await ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState.proposalsCount())
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('removeProposal(address,(address,uint256),bool)', () => {
            let filter;

            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.RemoveProposalEvent.topics
                    );
                });

                it('should return gracefully', async () => {
                    await ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if cancelling proposal initiated by the conjugate role', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, false, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.RemoveProposalEvent.topics
                    );
                });

                it('successfully terminate proposal', async () => {
                    await ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState.proposalsCount())
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('disqualifyProposal()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.DisqualifyProposalEvent.topics
                    );
                });

                it('successfully disqualify proposal', async () => {
                    await ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const block = (await provider.getBlock(await provider.getBlockNumber()));

                    const proposal = await ethersDriipSettlementChallengeState.proposals(0);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.expirationTime._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_b));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(30);
                    proposal.disqualification.nonce._bn.should.eq.BN(2);
                    proposal.disqualification.candidate.hash.should.equal(mocks.hash2);
                    proposal.disqualification.candidate.kind.should.equal('some_candidate_kind');
                });
            });
        });

        describe('qualifyProposal()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.qualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.QUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.qualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.QUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.QualifyProposalEvent.topics
                    );
                });

                it('successfully (re-)qualify proposal', async () => {
                    await ethersDriipSettlementChallengeState.qualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const block = (await provider.getBlock(await provider.getBlockNumber()));

                    const proposal = await ethersDriipSettlementChallengeState.proposals(0);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    proposal.expirationTime._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                    proposal.disqualification.challenger.should.equal(mocks.address0);
                    proposal.disqualification.blockNumber._bn.should.eq.BN(0);
                    proposal.disqualification.candidate.hash.should.equal(mocks.hash0);
                    proposal.disqualification.candidate.kind.should.be.a('string').that.is.empty;
                });
            });
        });

        describe('hasProposal(address,uint256,(address,uint256))', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated', () => {
                it('should return false', async () => {
                    (await ethersDriipSettlementChallengeState['hasProposal(address,uint256,(address,uint256))'](glob.user_a, 1, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });

            describe('if settlement challenge proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should return true', async () => {
                    (await ethersDriipSettlementChallengeState['hasProposal(address,uint256,(address,uint256))'](glob.user_a, 1, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true;
                });
            });

            describe('if settlement challenge proposal has been removed', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersDriipSettlementChallengeState['hasProposal(address,uint256,(address,uint256))'](glob.user_a, 1, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });
        });

        describe('hasProposal(address,(address,uint256))', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.REMOVE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated', () => {
                it('should return false', async () => {
                    (await ethersDriipSettlementChallengeState['hasProposal(address,(address,uint256))'](glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });

            describe('if settlement challenge proposal has been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should return true', async () => {
                    (await ethersDriipSettlementChallengeState['hasProposal(address,(address,uint256))'](glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true;
                });
            });

            describe('if settlement challenge proposal has been removed', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState['removeProposal(address,(address,uint256))'](
                        glob.user_a, {ct: mocks.address0, id: 0}, {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersDriipSettlementChallengeState['hasProposal(address,(address,uint256))'](glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });
        });

        describe('hasProposalTerminated()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should return true', async () => {
                    ethersDriipSettlementChallengeState.hasProposalTerminated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated but not terminated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersDriipSettlementChallengeState.hasProposalTerminated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });

            describe('if settlement challenge proposal has been initiated and terminated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementChallengeState.TERMINATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState['terminateProposal(address,(address,uint256),bool)'](
                        glob.user_a, {ct: mocks.address0, id: 0}, true, {gasLimit: 1e6}
                    );
                });

                it('should return true', async () => {
                    (await ethersDriipSettlementChallengeState.hasProposalTerminated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true;
                });
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should return true', async () => {
                    ethersDriipSettlementChallengeState.hasProposalExpired(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge has completed for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3Configuration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 0);

                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should return true', async () => {
                    (await ethersDriipSettlementChallengeState.hasProposalExpired(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true;
                });
            });

            describe('if settlement challenge is ongoing for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersDriipSettlementChallengeState.hasProposalExpired(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.false;
                });
            });
        });

        describe('proposalNonce()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalNonce(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal nonce', async () => {
                    (await ethersDriipSettlementChallengeState.proposalNonce(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalReferenceBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalReferenceBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal block number', async () => {
                    (await ethersDriipSettlementChallengeState.proposalReferenceBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(30);
                });
            });
        });

        describe('proposalDefinitionBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalDefinitionBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                let blockNumber;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    blockNumber = await provider.getBlockNumber();
                });

                it('should successfully return proposal block number', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDefinitionBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(blockNumber);
                });
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalExpirationTime(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                let block;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    block = (await provider.getBlock(await provider.getBlockNumber()));
                });

                it('should successfully return proposal expiration time', async () => {
                    (await ethersDriipSettlementChallengeState.proposalExpirationTime(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                });
            });
        });

        describe('proposalStatus()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalStatus(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal status', async () => {
                    (await ethersDriipSettlementChallengeState.proposalStatus(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                });
            });
        });

        describe('proposalCumulativeTransferAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalCumulativeTransferAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal stage balance amount', async () => {
                    (await ethersDriipSettlementChallengeState.proposalCumulativeTransferAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(10);
                });
            });
        });

        describe('proposalStageAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalStageAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal stage balance amount', async () => {
                    (await ethersDriipSettlementChallengeState.proposalStageAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(20);
                });
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalTargetBalanceAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal target balance amount', async () => {
                    (await ethersDriipSettlementChallengeState.proposalTargetBalanceAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(30);
                });
            });
        });

        describe('proposalChallengedHash()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalChallengedHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal challenged hash', async () => {
                    (await ethersDriipSettlementChallengeState.proposalChallengedHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.hash1)
                });
            });
        });

        describe('proposalChallengedKind()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalChallengedKind(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal challenged kind', async () => {
                    (await ethersDriipSettlementChallengeState.proposalChallengedKind(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal('some_challenged_kind')
                });
            });
        });

        describe('proposalWalletInitiated()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalWalletInitiated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been initiated for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal true', async () => {
                    (await ethersDriipSettlementChallengeState.proposalWalletInitiated(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true
                });
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalDisqualificationChallenger(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification challenger', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationChallenger(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.address0)
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification challenger', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationChallenger(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(utils.getAddress(glob.user_b));
                });
            });
        });

        describe('proposalDisqualificationNonce()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalDisqualificationNonce(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return default proposal disqualification block number', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationNonce(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return set proposal disqualification nonce', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationNonce(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(2);
                });
            });
        });

        describe('proposalDisqualificationBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalDisqualificationBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return default proposal disqualification block number', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return set proposal disqualification block number', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(30);
                });
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalDisqualificationCandidateHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return default proposal disqualification candidate hash', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationCandidateHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.hash0);
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return set proposal disqualification candidate hash', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationCandidateHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal(mocks.hash2);
                });
            });
        });

        describe('proposalDisqualificationCandidateKind()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState.registerService(glob.owner);
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.INITIATE_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersDriipSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been initiated for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.proposalDisqualificationCandidateKind(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return default proposal disqualification candidate kind', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationCandidateKind(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.a('string').that.is.empty;
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.initiateProposal(
                        glob.user_a, 1, 10, 20, 30, {ct: mocks.address0, id: 0},
                        30, true, mocks.hash1, 'some_challenged_kind', {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_kind', {gasLimit: 1e6}
                    );
                });

                it('should successfully return set proposal disqualification candidate kind', async () => {
                    (await ethersDriipSettlementChallengeState.proposalDisqualificationCandidateKind(glob.user_a, {
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
                    ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if called after upgrades have been frozen', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.setUpgradeAgent(glob.owner);
                    await ethersDriipSettlementChallengeState.freezeUpgrades();
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState.setUpgradeAgent(glob.owner);
                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementChallengeState.interface.events.UpgradeProposalEvent.topics
                    );
                });

                it('should successfully upgrade proposal', async () => {
                    await ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6});

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const _proposal = await ethersDriipSettlementChallengeState.proposals(0);
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
                    await ethersDriipSettlementChallengeState.setUpgradeAgent(glob.owner);
                    await ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6});
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6})
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
