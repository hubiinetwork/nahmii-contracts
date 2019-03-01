const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const {sleep} = require('../../scripts/common/helpers');
const mocks = require('../mocks');
const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');
const MockedConfiguration = artifacts.require('MockedConfiguration');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('NullSettlementChallengeState', () => {
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3Configuration, ethersConfiguration;
        let provider;

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

        describe('addProposal()', () => {
            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.addProposal(
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
                        glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersNullSettlementChallengeState.interface.events['AddProposalEvent'].topics
                    };
                });

                it('successfully add proposal', async () => {
                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const block = (await provider.getBlock(await provider.getBlockNumber()));

                    const proposal = await ethersNullSettlementChallengeState.proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(glob.user_a));
                    proposal.nonce._bn.should.eq.BN(1);
                    proposal.blockNumber._bn.should.eq.BN(30);
                    proposal.expirationTime._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    proposal.currency.ct.should.equal(mocks.address0);
                    proposal.currency.id._bn.should.eq.BN(0);
                    proposal.stageAmount._bn.should.eq.BN(10);
                    proposal.targetBalanceAmount._bn.should.eq.BN(20);
                    proposal.balanceReward.should.be.true;
                    proposal.challengedHash.should.equal(mocks.hash0);
                    proposal.challengedType.should.be.a('string').that.is.empty;
                });
            });

            describe('proposal has not expired', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.registerService(glob.owner);
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });
        });

        describe('disqualifyProposal()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if not enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_type', {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal has been added', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_type', {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.enableServiceAction(
                        glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await sleep(1500);

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersNullSettlementChallengeState.interface.events['DisqualifyProposalEvent'].topics
                    };
                });

                it('successfully disqualify proposal', async () => {
                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_type', {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const block = (await provider.getBlock(await provider.getBlockNumber()));

                    const proposal = await ethersNullSettlementChallengeState.proposals(0);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                    proposal.expirationTime._bn.should.eq.BN(utils.bigNumberify(1e4).add(block.timestamp)._bn);
                    proposal.disqualification.challenger.should.equal(utils.getAddress(glob.user_b));
                    proposal.disqualification.blockNumber._bn.should.eq.BN(30);
                    proposal.disqualification.candidateHash.should.equal(mocks.hash2);
                    proposal.disqualification.candidateType.should.equal('some_candidate_type');
                });
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should return true', async () => {
                    (await ethersNullSettlementChallengeState.hasProposalExpired(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.true;
                });
            });

            describe('if settlement challenge has completed for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3Configuration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 0);

                    await ethersNullSettlementChallengeState.addProposal(
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
                    await ethersNullSettlementChallengeState.addProposal(
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
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalNonce(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been added for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
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

        describe('proposalBlockNumber()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been added for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal block number', async () => {
                    (await ethersNullSettlementChallengeState.proposalBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }))._bn.should.eq.BN(30);
                });
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalExpirationTime(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been added for the wallet and currency', () => {
                let block;

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
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
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalStatus(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been added for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
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
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalStageAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been added for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
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
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalTargetBalanceAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been added for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
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

        describe('proposalBalanceReward()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalBalanceReward(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has been added for the wallet and currency', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal challenged type', async () => {
                    (await ethersNullSettlementChallengeState.proposalBalanceReward(glob.user_a, {
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
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDisqualificationChallenger(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
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
                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_type', {gasLimit: 1e6}
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
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDisqualificationBlockNumber(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
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
                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_type', {gasLimit: 1e6}
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
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDisqualificationCandidateHash(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
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
                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_type', {gasLimit: 1e6}
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

        describe('proposalDisqualificationCandidateType()', () => {
            beforeEach(async () => {
                await ethersNullSettlementChallengeState.registerService(glob.owner);
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.ADD_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
                await ethersNullSettlementChallengeState.enableServiceAction(
                    glob.owner, await ethersNullSettlementChallengeState.DISQUALIFY_PROPOSAL_ACTION(), {gasLimit: 1e6}
                );
            });

            describe('if no settlement challenge proposal has been added for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallengeState.proposalDisqualificationCandidateType(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge proposal has not been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification challenger', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationCandidateType(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.be.a('string').that.is.empty;
                });
            });

            describe('if settlement challenge proposal has been disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState.addProposal(
                        glob.user_a, 1, 10, 20, {ct: mocks.address0, id: 0},
                        30, true, {gasLimit: 1e6}
                    );

                    await ethersNullSettlementChallengeState.disqualifyProposal(
                        glob.user_a, {ct: mocks.address0, id: 0}, glob.user_b,
                        30, 2, mocks.hash2, 'some_candidate_type', {gasLimit: 1e6}
                    );
                });

                it('should successfully return proposal disqualification candidate type', async () => {
                    (await ethersNullSettlementChallengeState.proposalDisqualificationCandidateType(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    })).should.equal('some_candidate_type');
                });
            });
        });
    });
};