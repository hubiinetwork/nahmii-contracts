const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementState = artifacts.require('DriipSettlementState');
const MockedCommunityVote = artifacts.require('MockedCommunityVote');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('DriipSettlementState', () => {
        let web3DriipSettlementState, ethersDriipSettlementState;
        let web3CommunityVote, ethersCommunityVote;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3CommunityVote = await MockedCommunityVote.new();
            ethersCommunityVote = new Contract(web3CommunityVote.address, MockedCommunityVote.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3DriipSettlementState = await DriipSettlementState.new(glob.owner);
            ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, glob.signer_owner);

            await ethersDriipSettlementState.setCommunityVote(web3CommunityVote.address);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementState.address).should.have.lengthOf(42);
            });
        });

        describe('deployer()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementState.deployer.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3DriipSettlementState.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementState.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3DriipSettlementState.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementState.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementState.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3DriipSettlementState.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementState.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3DriipSettlementState.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3DriipSettlementState.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('communityVote()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState.communityVote())
                    .should.equal(utils.getAddress(ethersCommunityVote.address));
            });
        });

        describe('setCommunityVote()', () => {
            describe('if called by deployer', () => {
                let address;

                before(() => {
                    address = Wallet.createRandom().address;
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementState.setCommunityVote(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCommunityVoteEvent');

                    (await ethersDriipSettlementState.communityVote())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementState.setCommunityVote(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });
        });

        describe('communityVoteFrozen()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState.communityVoteFrozen())
                    .should.be.false;
            });
        });

        describe('freezeCommunityVote()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementState.freezeCommunityVote({from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                let address;

                before(async () => {
                    address = Wallet.createRandom().address;
                });

                it('should disable changing community vote', async () => {
                    await web3DriipSettlementState.freezeCommunityVote();
                    web3DriipSettlementState.setCommunityVote(address).should.be.rejected;
                });
            });
        });

        describe('upgradesFrozen()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState.upgradesFrozen())
                    .should.be.false;
            });
        });

        describe('freezeUpgrades()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementState.freezeUpgrades({from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                let address, filter;

                beforeEach(async () => {
                    address = Wallet.createRandom().address;

                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementState.interface.events.FreezeUpgradesEvent.topics
                    );
                });

                it('should disable changing community vote', async () => {
                    await web3DriipSettlementState.freezeUpgrades();

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementState.upgradesFrozen())
                        .should.be.true;
                });
            });
        });

        describe('settlementsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState.settlementsCount())
                    ._bn.should.eq.BN(0)
            })
        });

        describe('settlementsCountByWallet()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState.settlementsCountByWallet(
                    Wallet.createRandom().address
                ))._bn.should.eq.BN(0);
            })
        });

        describe('settlementByWalletAndIndex()', () => {
            describe('if no matching settlement exists', () => {
                it('should revert', async () => {
                    ethersDriipSettlementState.settlementByWalletAndIndex(
                        Wallet.createRandom().address, 1
                    ).should.be.rejected;
                })
            });
        });

        describe('settlementByWalletAndNonce()', () => {
            describe('if no matching settlement exists', () => {
                it('should revert', async () => {
                    ethersDriipSettlementState.settlementByWalletAndNonce(
                        Wallet.createRandom().address, 1
                    ).should.be.rejected;
                })
            });
        });

        describe('initSettlement()', () => {
            let filter;

            beforeEach(async () => {
                filter = await fromBlockTopicsFilter(
                    ethersDriipSettlementState.interface.events.InitSettlementEvent.topics
                );
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementState.initSettlement(
                        'payment', mocks.hash1, glob.user_a, 1, glob.user_b, 2
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.registerService(glob.owner);
                    await ethersDriipSettlementState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementState.INIT_SETTLEMENT_ACTION(),
                        {gasLimit: 1e6}
                    );
                });

                it('should successfully create new settlement', async () => {
                    await ethersDriipSettlementState.initSettlement(
                        'payment', mocks.hash1, glob.user_a, 1, glob.user_b, 2, {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementState.settlementsCount())
                        ._bn.should.eq.BN(1);

                    const settlement = await ethersDriipSettlementState.settlements(0);
                    settlement.settledKind.should.equal('payment');
                    settlement.settledHash.should.equal(mocks.hash1);
                    settlement.origin.nonce._bn.should.eq.BN(1);
                    settlement.origin.wallet.should.equal(utils.getAddress(glob.user_a));
                    settlement.target.nonce._bn.should.eq.BN(2);
                    settlement.target.wallet.should.equal(utils.getAddress(glob.user_b));

                    (await ethersDriipSettlementState.settlementByWalletAndIndex(glob.user_a, 0))
                        .should.deep.equal(settlement);
                    (await ethersDriipSettlementState.settlementByWalletAndIndex(glob.user_b, 0))
                        .should.deep.equal(settlement);
                    (await ethersDriipSettlementState.settlementByWalletAndNonce(glob.user_a, 1))
                        .should.deep.equal(settlement);
                    (await ethersDriipSettlementState.settlementByWalletAndNonce(glob.user_b, 2))
                        .should.deep.equal(settlement);
                });
            });

            describe('if already called with origin wallet and nonce', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.registerService(glob.owner);
                    await ethersDriipSettlementState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementState.INIT_SETTLEMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementState.initSettlement(
                        'payment', mocks.hash1, glob.user_a, 1, glob.user_b, 2, {gasLimit: 1e6}
                    );
                });

                it('should not create new settlement', async () => {
                    await ethersDriipSettlementState.initSettlement(
                        'payment', mocks.hash1, glob.user_a, 1, glob.user_c, 3, {gasLimit: 1e6}
                    );

                    (await ethersDriipSettlementState.settlementsCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if already called with target wallet and nonce', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.registerService(glob.owner);
                    await ethersDriipSettlementState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementState.INIT_SETTLEMENT_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementState.initSettlement(
                        'payment', mocks.hash1, glob.user_a, 1, glob.user_b, 2, {gasLimit: 1e6}
                    );
                });

                it('should not create new settlement', async () => {
                    await ethersDriipSettlementState.initSettlement(
                        'payment', mocks.hash1, glob.user_c, 3, glob.user_b, 2, {gasLimit: 1e6}
                    );

                    (await ethersDriipSettlementState.settlementsCount())
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('isSettlementPartyDone(address,uint256)', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                    glob.user_a, 1
                )).should.be.false;
            });
        });

        describe('isSettlementPartyDone(address,uint256,uint8)', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                    glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                )).should.be.false;
            });
        });

        describe('settlementPartyDoneBlockNumber(address,uint256)', () => {
            it('should equal value initialized', async () => {
                ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                    glob.user_a, 1
                ).should.be.rejected;
            });
        });

        describe('settlementPartyDoneBlockNumber(address,uint256,uint8)', () => {
            it('should equal value initialized', async () => {
                ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                    glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                ).should.be.rejected;
            });
        });

        describe('completeSettlementParty()', () => {
            let filter;

            beforeEach(async () => {
                await ethersDriipSettlementState.registerService(glob.owner);
                await ethersDriipSettlementState.enableServiceAction(
                    glob.owner, await ethersDriipSettlementState.INIT_SETTLEMENT_ACTION(),
                    {gasLimit: 1e6}
                );

                filter = await fromBlockTopicsFilter(
                    ethersDriipSettlementState.interface.events.CompleteSettlementPartyEvent.topics
                );
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementState.completeSettlementParty(
                        glob.user_a, 1, mocks.settlementRoles.indexOf('Origin'), true
                    ).should.be.rejected
                });
            });

            describe('if called with origin role', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementState.SET_SETTLEMENT_ROLE_DONE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementState.initSettlement(
                        'payment', mocks.hash1, glob.user_a, 1, glob.user_b, 2, {gasLimit: 1e6}
                    );
                });

                describe('if called with true as done value', () => {
                    it('should successfully set done of origin role and update its done block number', async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin'), true
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                            glob.user_a, 1
                        )).should.be.true;
                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                        )).should.be.true;

                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                            glob.user_a, 1
                        ))._bn.should.eq.BN(await provider.getBlockNumber());
                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                        ))._bn.should.eq.BN(await provider.getBlockNumber());

                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                            glob.user_b, 2
                        )).should.be.false;
                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target')
                        )).should.be.false;

                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                            glob.user_b, 2
                        ))._bn.should.eq.BN(0);
                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target')
                        ))._bn.should.eq.BN(0);
                    });
                });

                describe('if called with false as done value', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin'), true
                        );
                    });

                    it('should successfully set done of origin role and update its done block number', async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin'), false
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                            glob.user_a, 1
                        )).should.be.false;
                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                        )).should.be.false;

                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                            glob.user_a, 1
                        ))._bn.should.eq.BN(0);
                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                        ))._bn.should.eq.BN(0);

                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                            glob.user_b, 2
                        )).should.be.false;
                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target')
                        )).should.be.false;

                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                            glob.user_b, 2
                        ))._bn.should.eq.BN(0);
                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target')
                        ))._bn.should.eq.BN(0);
                    });
                });
            });

            describe('if called with target role', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementState.SET_SETTLEMENT_ROLE_DONE_ACTION(),
                        {gasLimit: 1e6}
                    );

                    await ethersDriipSettlementState.initSettlement(
                        'payment', mocks.hash1, glob.user_a, 1, glob.user_b, 2, {gasLimit: 1e6}
                    );
                });

                describe('if called with true as done value', () => {
                    it('should successfully set done of target role and update its done block number', async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target'), true
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                            glob.user_a, 1
                        )).should.be.false;
                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                        )).should.be.false;

                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                            glob.user_a, 1
                        ))._bn.should.eq.BN(0);
                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                        ))._bn.should.eq.BN(0);

                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                            glob.user_b, 2
                        )).should.be.true;
                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target')
                        )).should.be.true;

                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                            glob.user_b, 2
                        ))._bn.should.eq.BN(await provider.getBlockNumber());
                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target')
                        ))._bn.should.eq.BN(await provider.getBlockNumber());
                    });
                });

                describe('if called with false as done value', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target'), true
                        );
                    });

                    it('should successfully set done of target role and update its done block number', async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target'), false
                        );

                        const logs = await provider.getLogs(filter);
                        logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                            glob.user_a, 1
                        )).should.be.false;
                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                        )).should.be.false;

                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                            glob.user_a, 1
                        ))._bn.should.eq.BN(0);
                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                            glob.user_a, 1, mocks.settlementRoles.indexOf('Origin')
                        ))._bn.should.eq.BN(0);

                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256)'](
                            glob.user_b, 2
                        )).should.be.false;
                        (await ethersDriipSettlementState['isSettlementPartyDone(address,uint256,uint8)'](
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target')
                        )).should.be.false;

                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256)'](
                            glob.user_b, 2
                        ))._bn.should.eq.BN(0);
                        (await ethersDriipSettlementState['settlementPartyDoneBlockNumber(address,uint256,uint8)'](
                            glob.user_b, 2, mocks.settlementRoles.indexOf('Target')
                        ))._bn.should.eq.BN(0);
                    });
                });
            });
        });

        describe('maxDriipNonce()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState.maxDriipNonce())
                    ._bn.should.eq.BN(0)
            });
        });

        describe('setMaxDriipNonce()', () => {
            let filter;

            beforeEach(async () => {
                await ethersDriipSettlementState.registerService(glob.owner);

                filter = await fromBlockTopicsFilter(
                    ethersDriipSettlementState.interface.events.SetMaxDriipNonceEvent.topics
                );
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementState.setMaxDriipNonce(10).should.be.rejected
                });
            });

            describe('if called by enabled service action', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION(),
                        {gasLimit: 1e6}
                    );
                });

                it('should successfully set the new max driip nonce', async () => {
                    await ethersDriipSettlementState.setMaxDriipNonce(10);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementState.maxDriipNonce())._bn.should.eq.BN(10);
                });
            });
        });

        describe('updateMaxDriipNonceFromCommunityVote()', () => {
            let filter;

            beforeEach(async () => {
                ethersCommunityVote._reset();

                filter = await fromBlockTopicsFilter(
                    ethersDriipSettlementState.interface.events.UpdateMaxDriipNonceFromCommunityVoteEvent.topics
                );
            });

            describe('if community vote returns 0', () => {
                it('should not update max driip nonce', async () => {
                    await ethersDriipSettlementState.updateMaxDriipNonceFromCommunityVote();
                });
            });

            describe('if community vote returns greater than 0', () => {
                beforeEach(async () => {
                    await ethersCommunityVote.setMaxDriipNonce(10)
                });

                it('should successfully set the new max driip nonce', async () => {
                    await ethersDriipSettlementState.updateMaxDriipNonceFromCommunityVote();

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementState.maxDriipNonce())._bn.should.eq.BN(10);
                });
            });
        });

        describe('maxNonceByWalletAndCurrency()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementState.maxNonceByWalletAndCurrency(
                    glob.user_a, {ct: mocks.address0, id: 0}
                ))._bn.should.eq.BN(0);
            });
        });

        describe('setMaxNonceByWalletAndCurrency()', () => {
            let filter;

            beforeEach(async () => {
                await ethersDriipSettlementState.registerService(glob.owner);

                filter = await fromBlockTopicsFilter(
                    ethersDriipSettlementState.interface.events.SetMaxNonceByWalletAndCurrencyEvent.topics
                );
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                        glob.user_a, {ct: mocks.address0, id: 0}, 10
                    ).should.be.rejected
                });
            });

            describe('if called by enabled service action', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION(),
                        {gasLimit: 1e6}
                    );
                });

                it('should successfully set the new max nonce', async () => {
                    await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                        glob.user_a, {ct: mocks.address0, id: 0}, 10
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementState.maxNonceByWalletAndCurrency(
                        glob.user_a, {ct: mocks.address0, id: 0}
                    ))._bn.should.eq.BN(10);
                });
            });
        });

        describe('totalFee()', () => {
            it('should equal value initialized', async () => {
                const totalFee = await ethersDriipSettlementState.totalFee(
                    glob.user_a, mocks.address1, mocks.address2, {ct: mocks.address0, id: 0}
                );
                totalFee.nonce._bn.should.eq.BN(0);
                totalFee.amount._bn.should.eq.BN(0);
            });
        });

        describe('setTotalFee()', () => {
            let filter;

            beforeEach(async () => {
                await ethersDriipSettlementState.registerService(glob.owner);

                filter = await fromBlockTopicsFilter(
                    ethersDriipSettlementState.interface.events.SetTotalFeeEvent.topics
                );
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersDriipSettlementState.setTotalFee(
                        glob.user_a, mocks.address1, mocks.address2,
                        {ct: mocks.address0, id: 0},
                        {nonce: 10, amount: 20}
                    ).should.be.rejected
                });
            });

            describe('if called by enabled service action', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.enableServiceAction(
                        glob.owner, await ethersDriipSettlementState.SET_FEE_TOTAL_ACTION(),
                        {gasLimit: 1e6}
                    );
                });

                it('should successfully set the new max driip nonce', async () => {
                    await ethersDriipSettlementState.setTotalFee(
                        glob.user_a, mocks.address1, mocks.address2,
                        {ct: mocks.address0, id: 0},
                        {nonce: 10, amount: 20}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const totalFee = await ethersDriipSettlementState.totalFee(
                        glob.user_a, mocks.address1, mocks.address2, {ct: mocks.address0, id: 0}
                    );
                    totalFee.nonce._bn.should.eq.BN(10);
                    totalFee.amount._bn.should.eq.BN(20);
                });
            });
        });

        describe('upgradeSettlement', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementState.upgradeSettlement(
                        'some_kind', mocks.hash1, glob.user_a, 1, true, 100, glob.user_b, 2, false, 200,
                        {from: glob.user_a, gas: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if called after settlement upgrades have been frozen', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.freezeUpgrades();
                });

                it('should revert', async () => {
                    ethersDriipSettlementState.upgradeSettlement(
                        'some_kind', mocks.hash1, glob.user_a, 1, true, 100, glob.user_b, 2, false, 200,
                        {gasLimit: 1e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    filter = await fromBlockTopicsFilter(
                        ethersDriipSettlementState.interface.events.UpgradeSettlementEvent.topics
                    );
                });

                it('should successfully upgrade settlement', async () => {
                    await ethersDriipSettlementState.upgradeSettlement(
                        'some_kind', mocks.hash1, glob.user_a, 1, true, 100, glob.user_b, 2, false, 200,
                        {gasLimit: 1e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const settlement = await ethersDriipSettlementState.settlements(0);
                    settlement.settledKind.should.equal('some_kind');
                    settlement.settledHash.should.equal(mocks.hash1);
                    settlement.origin.nonce._bn.should.eq.BN(1);
                    settlement.origin.wallet.should.equal(utils.getAddress(glob.user_a));
                    settlement.origin.done.should.be.true;
                    settlement.origin.doneBlockNumber._bn.should.be.eq.BN(100);
                    settlement.target.nonce._bn.should.eq.BN(2);
                    settlement.target.wallet.should.equal(utils.getAddress(glob.user_b));
                    settlement.target.done.should.be.false;
                    settlement.target.doneBlockNumber._bn.should.be.eq.BN(200);
                });
            });

            describe('if upgrading existing settlement', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.upgradeSettlement(
                        'some_kind', mocks.hash1, glob.user_a, 1, true, 100, glob.user_b, 2, false, 200,
                        {gasLimit: 1e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementState.upgradeSettlement(
                        'some_kind', mocks.hash1, glob.user_a, 1, true, 100, glob.user_b, 2, false, 200,
                        {gasLimit: 1e6}
                    ).should.be.rejected;
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
