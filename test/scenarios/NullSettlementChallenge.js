const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const {util: {cryptography}} = require('omphalos-commons');
const NullSettlementChallenge = artifacts.require('NullSettlementChallenge');
const MockedNullSettlementDispute = artifacts.require('MockedNullSettlementDispute');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('NullSettlementChallenge', () => {
        let web3NullSettlementChallenge, ethersNullSettlementChallenge;
        let web3NullSettlementDispute, ethersNullSettlementDispute;
        let web3Configuration, ethersConfiguration;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3WalletLocker, ethersWalletLocker;
        let web3SecurityBond, ethersSecurityBond;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let depositedBalanceType;
        let blockNumber;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3BalanceTracker = await MockedBalanceTracker.new();
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);

            web3NullSettlementDispute = await MockedNullSettlementDispute.new();
            ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, MockedNullSettlementDispute.abi, glob.signer_owner);

            await web3Configuration.registerService(glob.owner);
            await web3Configuration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});
            await web3Configuration.setSettlementChallengeTimeout(web3.eth.blockNumber + 1, 1000);
            await web3Configuration.setWalletSettlementStakeFraction(web3.eth.blockNumber + 1, 1e17);

            depositedBalanceType = await web3BalanceTracker.depositedBalanceType();
        });

        beforeEach(async () => {
            web3NullSettlementChallenge = await NullSettlementChallenge.new(glob.owner);
            ethersNullSettlementChallenge = new Contract(web3NullSettlementChallenge.address, NullSettlementChallenge.abi, glob.signer_owner);

            await ethersNullSettlementChallenge.setConfiguration(ethersConfiguration.address);
            await ethersNullSettlementChallenge.setBalanceTracker(ethersBalanceTracker.address);
            await ethersNullSettlementChallenge.setWalletLocker(ethersWalletLocker.address);
            await ethersNullSettlementChallenge.setNullSettlementDispute(ethersNullSettlementDispute.address);

            blockNumber = await provider.getBlockNumber();

            await web3Configuration._reset();
            await web3BalanceTracker._reset();
            await web3WalletLocker._reset();

            await ethersConfiguration.setCancelOrderChallengeTimeout((await provider.getBlockNumber()) + 1, 1e3);
            await ethersConfiguration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 1e4);
            await ethersConfiguration.setWalletLockTimeout((await provider.getBlockNumber()) + 1, 1e4);
            await ethersConfiguration.setEarliestSettlementBlockNumber(0);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementChallenge.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementChallenge.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should return default value', async () => {
                (await web3NullSettlementChallenge.configuration.call())
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
                    const result = await web3NullSettlementChallenge.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    utils.getAddress(await web3NullSettlementChallenge.configuration()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementDispute()', () => {
            it('should return default value', async () => {
                (await web3NullSettlementChallenge.nullSettlementDispute.call())
                    .should.equal(web3NullSettlementDispute.address);
            });
        });

        describe('setNullSettlementDispute()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallenge.setNullSettlementDispute(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementDisputeEvent');

                    utils.getAddress(await web3NullSettlementChallenge.nullSettlementDispute.call())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.setNullSettlementDispute(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nonce', () => {
            it('should return default value', async () => {
                (await ethersNullSettlementChallenge.nonce())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('proposalIndexByWalletCurrency()', () => {
            it('should return default values', async () => {
                (await ethersNullSettlementChallenge.proposalIndexByWalletCurrency(
                    Wallet.createRandom().address, mocks.address0, 0
                ))._bn.should.eq.BN(0);
            });
        });

        describe('challengeWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallenge.challengeWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('proposalsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallenge.proposalsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('disqualificationsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementChallenge.disqualificationsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('startChallenge()', () => {
            describe('if wallet has previous disqualified null settlement challenge', () => {
                beforeEach(async () => {
                    await web3WalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement challenge block', () => {
                beforeEach(async () => {
                    web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('if amount to be staged is negative', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(-1, mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('if amount to be staged is greater than active balance in client fund', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 1, 1);
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(10, mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    topic = ethersNullSettlementChallenge.interface.events['StartChallengeEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber,
                        topics: [topic]
                    };
                });

                it('should start challenge successfully', async () => {
                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});

                    // Index is 1-based
                    const index = await ethersNullSettlementChallenge.proposalIndexByWalletCurrency(
                        glob.owner, mocks.address0, 0
                    );
                    index._bn.should.eq.BN(1);

                    const proposal = await ethersNullSettlementChallenge.proposals(0);
                    proposal.wallet.should.equal(utils.getAddress(glob.owner));
                    proposal.nonce._bn.should.eq.BN(1);
                    proposal.blockNumber._bn.should.eq.BN(1);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    proposal.stageAmount._bn.should.eq.BN(1);
                    proposal.targetBalanceAmount._bn.should.eq.BN(9);
                    proposal.balanceReward.should.be.true;

                    (await ethersNullSettlementChallenge.nonce())
                        ._bn.should.eq.BN(1);
                    (await ethersNullSettlementChallenge.challengeWalletsCount())
                        ._bn.should.eq.BN(1);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called before an ongoing settlement challenge has expired', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6})
                        .should.be.rejected;
                });
            });
        });

        describe('startChallengeByProxy()', () => {
            let wallet;

            beforeEach(async () => {
                wallet = Wallet.createRandom().address;
            });

            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement challenge block', () => {
                beforeEach(async () => {
                    web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('if amount to be staged is negative', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, -1, mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('if amount to be staged is greater than active balance in client fund', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 1, 1);
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 10, mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    topic = ethersNullSettlementChallenge.interface.events['StartChallengeByProxyEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber,
                        topics: [topic]
                    };
                });

                it('should start challenge successfully', async () => {
                    await web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {gas: 3e6});

                    // Index is 1-based
                    const index = await ethersNullSettlementChallenge.proposalIndexByWalletCurrency(
                        wallet, mocks.address0, 0
                    );
                    index._bn.should.eq.BN(1);

                    const proposal = await ethersNullSettlementChallenge.proposals(0);
                    proposal.wallet.should.equal(wallet);
                    proposal.nonce._bn.should.eq.BN(1);
                    proposal.blockNumber._bn.should.eq.BN(1);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    proposal.stageAmount._bn.should.eq.BN(1);
                    proposal.targetBalanceAmount._bn.should.eq.BN(9);
                    proposal.balanceReward.should.be.false;

                    (await ethersNullSettlementChallenge.nonce())
                        ._bn.should.eq.BN(1);
                    (await ethersNullSettlementChallenge.challengeWalletsCount())
                        ._bn.should.eq.BN(1);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called before an ongoing settlement challenge has expired', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {gas: 3e6});
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {gas: 3e6})
                        .should.be.rejected;
                });
            });
        });

        describe('hasProposalExpired()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should return true', async () => {
                    (await ethersNullSettlementChallenge.hasProposalExpired(
                        glob.owner, mocks.address0, 0
                    )).should.be.true;
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                describe('if settlement challenge has completed for the wallet and currency', () => {
                    beforeEach(async () => {
                        await web3Configuration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 0);

                        await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                        await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                        await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                    });

                    it('should return true', async () => {
                        (await ethersNullSettlementChallenge.hasProposalExpired(
                            glob.owner, mocks.address0, 0
                        )).should.be.true;
                    });
                });

                describe('if settlement challenge is ongoing for the wallet and currency', () => {
                    beforeEach(async () => {
                        await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                        await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                        await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                    });

                    it('should return false', async () => {
                        (await ethersNullSettlementChallenge.hasProposalExpired(
                            glob.owner, mocks.address0, 0
                        )).should.be.false;
                    });
                });
            });
        });

        describe('proposalNonce()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalNonce(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should return nonce of proposal', async () => {
                    (await ethersNullSettlementChallenge.proposalNonce(
                        glob.owner, mocks.address0, 0
                    ))._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalBlockNumber()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalBlockNumber(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should return block number of proposal', async () => {
                    (await ethersNullSettlementChallenge.proposalBlockNumber(
                        glob.owner, mocks.address0, 0
                    ))._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalExpirationTime()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalExpirationTime(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let block;

                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});

                    const blockNumber = await provider.getBlockNumber();
                    block = (await provider.getBlock(blockNumber));
                });

                it('should return end time of proposal', async () => {
                    (await ethersNullSettlementChallenge.proposalExpirationTime(
                        glob.owner, mocks.address0, 0
                    ))._bn.should.be.gt.BN(block.timestamp);
                });
            });
        });

        describe('proposalStatus()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalStatus(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should return status of proposal', async () => {
                    (await ethersNullSettlementChallenge.proposalStatus(
                        glob.owner, mocks.address0, 0
                    )).should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                });
            });
        });

        describe('proposalStageAmount()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalStageAmount(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should return stage amount of proposal', async () => {
                    (await ethersNullSettlementChallenge.proposalStageAmount(
                        glob.owner, mocks.address0, 0
                    ))._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalTargetBalanceAmount(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should return stage amount of proposal', async () => {
                    (await ethersNullSettlementChallenge.proposalTargetBalanceAmount(
                        glob.owner, mocks.address0, 0
                    ))._bn.should.eq.BN(9);
                });
            });
        });

        describe('proposalBalanceReward()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalBalanceReward(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started by wallet', () => {
                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should return true', async () => {
                    (await ethersNullSettlementChallenge.proposalBalanceReward(
                        glob.owner, mocks.address0, 0
                    )).should.be.true;
                });
            });

            describe('if settlement challenge has been started by proxy', () => {
                let wallet;

                before(() => {
                    wallet = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {gas: 3e6});
                });

                it('should return false', async () => {
                    (await ethersNullSettlementChallenge.proposalBalanceReward(
                        wallet, mocks.address0, 0
                    )).should.be.false;
                });
            });
        });

        describe('setProposalExpirationTime()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.setProposalExpirationTime(
                        glob.owner, mocks.address0, 0, 1000
                    ).should.be.rejected
                });
            });

            describe('if no settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.setProposalExpirationTime(
                        glob.owner, mocks.address0, 0, 1000
                    ).should.be.rejected
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);

                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should successfully set end time of proposal', async () => {
                    await ethersNullSettlementChallenge.setProposalExpirationTime(
                        glob.owner, mocks.address0, 0, 1000
                    );

                    (await ethersNullSettlementChallenge.proposalExpirationTime(
                        glob.owner, mocks.address0, 0
                    ))._bn.should.eq.BN(1000);
                });
            });
        });

        describe('setProposalStatus()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.setProposalStatus(
                        glob.owner, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                    ).should.be.rejected
                });
            });

            describe('if no settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.setProposalStatus(
                        glob.owner, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                    ).should.be.rejected
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);

                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
                });

                it('should successfully set status of proposal', async () => {
                    await ethersNullSettlementChallenge.setProposalStatus(
                        glob.owner, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                    );

                    (await ethersNullSettlementChallenge.proposalStatus(
                        glob.owner, mocks.address0, 0
                    )).should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                });
            });
        });

        describe('challengeByOrder()', () => {
            let order;

            before(async () => {
                await ethersNullSettlementDispute._reset();
                order = await mocks.mockOrder(glob.owner);
            });

            it('should call challengeByOrder() of its settlement challenge dispute instance', async () => {
                await ethersNullSettlementChallenge.challengeByOrder(order);

                (await ethersNullSettlementDispute._challengeByOrderCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('challengeByTrade()', () => {
            let trade;

            before(async () => {
                await ethersNullSettlementDispute._reset();
                trade = await mocks.mockTrade(glob.owner);
            });

            it('should call challengeByTrade() of its settlement challenge dispute instance', async () => {
                await ethersNullSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 2e6});

                (await ethersNullSettlementDispute._challengeByTradeCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('challengeByPayment()', () => {
            let payment;

            before(async () => {
                await ethersNullSettlementDispute._reset();
                payment = await mocks.mockPayment(glob.owner);
            });

            it('should call challengeByPayment() of its settlement challenge dispute instance', async () => {
                await ethersNullSettlementChallenge.challengeByPayment(payment.sender.wallet, payment, {gasLimit: 2e6});

                (await ethersNullSettlementDispute._challengeByPaymentCount())
                    ._bn.should.eq.BN(1);
            });
        });

        // TODO Remove
        // describe('addDisqualification()', () => {
        //     describe('if called from other than settlement dispute', () => {
        //         it('should revert', async () => {
        //             ethersNullSettlementChallenge.addDisqualification(
        //                 glob.owner, mocks.address0, 0, cryptography.hash('some message'),
        //                 mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
        //             ).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if no proposal exists for the wallet and currency', () => {
        //         beforeEach(async () => {
        //             await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);
        //         });
        //
        //         it('should revert', async () => {
        //             ethersNullSettlementChallenge.addDisqualification(
        //                 glob.owner, mocks.address0, 0, cryptography.hash('some message'),
        //                 mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
        //             ).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if within operational constraints', () => {
        //         let hash;
        //
        //         before(() => {
        //             hash = cryptography.hash('some message');
        //         });
        //
        //         beforeEach(async () => {
        //             await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);
        //
        //             await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
        //             await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);
        //
        //             await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});
        //         });
        //
        //         it('should successfully push the array element', async () => {
        //             await ethersNullSettlementChallenge.addDisqualification(
        //                 glob.owner, mocks.address0, 0, hash,
        //                 mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
        //             );
        //
        //             // Index is 1-based
        //             const index = await ethersNullSettlementChallenge.disqualificationIndexByWalletCurrency(
        //                 glob.owner, mocks.address0, 0,
        //             );
        //             index._bn.should.eq.BN(1);
        //
        //             const disqualification = await ethersNullSettlementChallenge.disqualifications(0);
        //             disqualification.wallet.should.equal(utils.getAddress(glob.owner));
        //             disqualification.nonce._bn.should.eq.BN(1);
        //             disqualification.candidateType.should.equal(mocks.candidateTypes.indexOf('Payment'));
        //             disqualification.candidateHash.should.equal(hash);
        //             disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
        //         });
        //     });
        // });

        describe('proposalDisqualificationCandidateType()', () => {
            describe('if no settlement challenge has been disqualified for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalDisqualificationCandidateType(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been disqualified for the wallet and currency', () => {
                let hash;

                before(() => {
                    hash = cryptography.hash('some message');
                });

                beforeEach(async () => {
                    await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);

                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});

                    await ethersNullSettlementChallenge.addDisqualification(
                        glob.owner, mocks.address0, 0, hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    );
                });

                it('should return candidate type of the disqualification', async () => {
                    (await ethersNullSettlementChallenge.proposalDisqualificationCandidateType(
                        glob.owner, mocks.address0, 0
                    )).should.equal(mocks.candidateTypes.indexOf('Payment'));
                });
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            describe('if no settlement challenge has been disqualified for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalDisqualificationCandidateHash(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been disqualified for the wallet and currency', () => {
                let hash;

                before(() => {
                    hash = cryptography.hash('some message');
                });

                beforeEach(async () => {
                    await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);

                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});

                    await ethersNullSettlementChallenge.addDisqualification(
                        glob.owner, mocks.address0, 0, hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    );
                });

                it('should return candidate type of the disqualification', async () => {
                    (await ethersNullSettlementChallenge.proposalDisqualificationCandidateHash(
                        glob.owner, mocks.address0, 0
                    )).should.equal(hash);
                });
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.proposalDisqualificationChallenger(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been disqualified for the wallet and currency', () => {
                let hash;

                before(() => {
                    hash = cryptography.hash('some message');
                });

                beforeEach(async () => {
                    await web3NullSettlementChallenge.setNullSettlementDispute(glob.owner);

                    await web3BalanceTracker._setLogSize(depositedBalanceType, 1);
                    await web3BalanceTracker._setLastLog(depositedBalanceType, 10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 3e6});

                    await ethersNullSettlementChallenge.addDisqualification(
                        glob.owner, mocks.address0, 0, hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    );
                });

                it('should return default value', async () => {
                    (await ethersNullSettlementChallenge.proposalDisqualificationChallenger(
                        glob.owner, mocks.address0, 0
                    )).should.equal(utils.getAddress(glob.user_a));
                });
            });
        });
    });
};
