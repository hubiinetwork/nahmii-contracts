const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementChallenge = artifacts.require('NullSettlementChallenge');
const MockedNullSettlementDispute = artifacts.require('MockedNullSettlementDispute');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedClientFund = artifacts.require('MockedClientFund');
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
        let web3ClientFund, ethersClientFund;
        let web3SecurityBond, ethersSecurityBond;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let blockNumber0;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new();
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);

            web3NullSettlementDispute = await MockedNullSettlementDispute.new();
            ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, MockedNullSettlementDispute.abi, glob.signer_owner);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});
        });

        beforeEach(async () => {
            // Default configuration timeouts for all tests. Particular tests override these defaults.
            await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
            await ethersConfiguration.setSettlementChallengeTimeout(1e4);

            web3NullSettlementChallenge = await NullSettlementChallenge.new(glob.owner);
            ethersNullSettlementChallenge = new Contract(web3NullSettlementChallenge.address, NullSettlementChallenge.abi, glob.signer_owner);

            await ethersNullSettlementChallenge.changeConfiguration(ethersConfiguration.address);
            await ethersNullSettlementChallenge.changeClientFund(ethersClientFund.address);
            await ethersNullSettlementChallenge.changeNullSettlementDispute(ethersNullSettlementDispute.address);

            blockNumber0 = await provider.getBlockNumber();
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

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallenge.changeConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');

                    utils.getAddress(await web3NullSettlementChallenge.configuration()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementDispute()', () => {
            it('should return default value', async () => {
                (await web3NullSettlementChallenge.nullSettlementDispute.call())
                    .should.equal(web3NullSettlementDispute.address);
            });
        });

        describe('changeNullSettlementDispute()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementChallenge.changeNullSettlementDispute(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeNullSettlementDisputeEvent');

                    utils.getAddress(await web3NullSettlementChallenge.nullSettlementDispute.call())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.changeNullSettlementDispute(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nonce', () => {
            it('should return default value', async () => {
                (await ethersNullSettlementChallenge.nonce())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('walletProposalMap()', () => {
            it('should return default values', async () => {
                const address = Wallet.createRandom().address;
                const result = await ethersNullSettlementChallenge.walletProposalMap(address);
                result.status.should.equal(mocks.proposalStatuses.indexOf('Unknown'));
                result.nonce._bn.should.eq.BN(0);
            });
        });

        describe('challengedWalletsCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersNullSettlementChallenge.challengedWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('walletChallengeCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                (await ethersNullSettlementChallenge.walletChallengeCount(address))._bn.should.eq.BN(0);
            });
        });

        describe('startChallenge()', () => {
            beforeEach(async () => {
                await web3ClientFund.reset();
            });

            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementChallenge = await NullSettlementChallenge.new(glob.owner);
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if amount to be staged is negative', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(-1, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if wallet has never deposited into client fund', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if amount to be staged is greater than active balance in client fund', () => {
                beforeEach(async () => {
                    await web3ClientFund._addActiveBalanceLogEntry(1, 1)
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(10, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    topic = ethersNullSettlementChallenge.interface.events['StartChallengeEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should start challenge successfully', async () => {
                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 1e6});

                    const proposal = await ethersNullSettlementChallenge.walletProposalMap(glob.owner);
                    proposal.nonce._bn.should.eq.BN(1);
                    proposal.blockNumber._bn.should.eq.BN(1);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.driipIndex._bn.should.eq.BN(0);
                    proposal.candidateType.should.equal(mocks.candidateTypes.indexOf('None'));
                    proposal.candidateIndex._bn.should.eq.BN(0);

                    (await ethersNullSettlementChallenge.nonce())
                        ._bn.should.eq.BN(1);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called before an ongoing settlement challenge has expired', () => {
                beforeEach(async () => {
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 1e6});
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {gas: 1e6})
                        .should.be.rejected;
                });
            });
        });

        describe('startChallengeByProxy()', () => {
            let wallet;

            beforeEach(async () => {
                wallet = Wallet.createRandom().address;

                await web3ClientFund.reset();
            });

            describe('if called from non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementChallenge = await NullSettlementChallenge.new(glob.owner);
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if amount to be staged is negative', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, -1, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if wallet has never deposited into client fund', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if amount to be staged is greater than active balance in client fund', () => {
                beforeEach(async () => {
                    await web3ClientFund._addActiveBalanceLogEntry(1, 1)
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 10, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    topic = ethersNullSettlementChallenge.interface.events['StartChallengeByProxyEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should start challenge successfully', async () => {
                    await web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {gas: 1e6});

                    const proposal = await ethersNullSettlementChallenge.walletProposalMap(wallet);
                    proposal.nonce._bn.should.eq.BN(1);
                    proposal.blockNumber._bn.should.eq.BN(1);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.driipIndex._bn.should.eq.BN(0);
                    proposal.candidateType.should.equal(mocks.candidateTypes.indexOf('None'));
                    proposal.candidateIndex._bn.should.eq.BN(0);

                    (await ethersNullSettlementChallenge.nonce())
                        ._bn.should.eq.BN(1);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called before an ongoing settlement challenge has expired', () => {
                beforeEach(async () => {
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {gas: 1e6});
                });

                it('should revert', async () => {
                    web3NullSettlementChallenge.startChallengeByProxy(wallet, 1, mocks.address0, 0, {gas: 1e6})
                        .should.be.rejected;
                });
            });
        });

        describe('challengePhase()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return Closed', async () => {
                    const address = Wallet.createRandom().address;
                    (await ethersNullSettlementChallenge.challengePhase(address))
                        .should.equal(mocks.challengePhases.indexOf('Closed'));
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);
                });

                describe('if settlement challenge has completed for given wallet', () => {
                    beforeEach(async () => {
                        await web3Configuration.setSettlementChallengeTimeout(0);
                        await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                            from: glob.user_d,
                            gas: 1e6
                        });
                    });

                    it('should return Closed', async () => {
                        (await ethersNullSettlementChallenge.challengePhase(glob.user_d))
                            .should.equal(mocks.challengePhases.indexOf('Closed'));
                    });
                });

                describe('if settlement challenge is ongoing for given wallet', () => {
                    beforeEach(async () => {
                        await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                            from: glob.user_d,
                            gas: 1e6
                        });
                    });

                    it('should return Dispute', async () => {
                        (await ethersNullSettlementChallenge.challengePhase(glob.user_d))
                            .should.equal(mocks.challengePhases.indexOf('Dispute'));
                    });
                });
            });
        });

        describe('proposalNonce()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    const address = Wallet.createRandom().address;
                    (await ethersNullSettlementChallenge.proposalNonce(address))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                        from: glob.user_e,
                        gas: 1e6
                    });
                });

                it('should return nonce of ongoing challenge', async () => {
                    (await ethersNullSettlementChallenge.proposalNonce(glob.user_e))._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalBlockNumber()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    const address = Wallet.createRandom().address;
                    (await ethersNullSettlementChallenge.proposalBlockNumber(address))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                        from: glob.user_e,
                        gas: 1e6
                    });

                });

                it('should return block number of ongoing challenge', async () => {
                    (await ethersNullSettlementChallenge.proposalBlockNumber(glob.user_e))._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalTimeout()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    const address = Wallet.createRandom().address;
                    (await ethersNullSettlementChallenge.proposalTimeout(address))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                let timestampBefore;

                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                        from: glob.user_e,
                        gas: 1e6
                    });

                    const blockNumber = await provider.getBlockNumber();
                    const block = (await provider.getBlock(blockNumber));
                    timestampBefore = block.timestamp;
                });

                it('should return timeout of ongoing challenge', async () => {
                    (await ethersNullSettlementChallenge.proposalTimeout(glob.user_e))
                        ._bn.should.be.gt.BN(timestampBefore);
                });
            });
        });

        describe('proposalStatus()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    const address = Wallet.createRandom().address;
                    (await ethersNullSettlementChallenge.proposalStatus(address))
                        .should.equal(mocks.proposalStatuses.indexOf('Unknown'));
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                        from: glob.user_f,
                        gas: 1e6
                    });
                });

                it('should return status of ongoing challenge', async () => {
                    (await ethersNullSettlementChallenge.proposalStatus(glob.user_f))
                        .should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                });
            });
        });

        describe('proposalCurrencyCount()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    const address = Wallet.createRandom().address;
                    (await ethersNullSettlementChallenge.proposalCurrencyCount(address))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                        from: glob.user_g,
                        gas: 1e6
                    });
                });

                it('should return currency count of ongoing challenge', async () => {
                    (await ethersNullSettlementChallenge.proposalCurrencyCount(glob.user_g))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalCurrency()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersNullSettlementChallenge.proposalCurrency(address, 0).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                let currencyCt, currencyId;

                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    currencyCt = Wallet.createRandom().address;
                    currencyId = 10;

                    await web3NullSettlementChallenge.startChallenge(1, currencyCt, currencyId, {
                        from: glob.user_h,
                        gas: 1e6
                    });
                });

                it('should return currency at given index of ongoing challenge', async () => {
                    const result = await ethersNullSettlementChallenge.proposalCurrency(glob.user_h, 0);
                    result.ct.should.equal(currencyCt);
                    result.id._bn.should.eq.BN(currencyId);
                });
            });
        });

        describe('proposalStageAmount()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersNullSettlementChallenge.proposalStageAmount(address, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                        from: glob.user_i,
                        gas: 1e6
                    });
                });

                it('should return stage amount at given index of ongoing challenge', async () => {
                    (await ethersNullSettlementChallenge.proposalStageAmount(glob.user_i, {ct: mocks.address0, id: 0}))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should revert', async () => {
                    const address = Wallet.createRandom().address;
                    ethersNullSettlementChallenge.proposalTargetBalanceAmount(address, {
                        ct: mocks.address0,
                        id: 0
                    }).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await web3ClientFund.reset.call();
                    await web3ClientFund._addActiveBalanceLogEntry(10, 1);

                    await web3NullSettlementChallenge.startChallenge(1, mocks.address0, 0, {
                        from: glob.user_a,
                        gas: 1e6
                    });
                });

                it('should return target balance amount at given index of ongoing challenge', async () => {
                    const result = await ethersNullSettlementChallenge.proposalTargetBalanceAmount(glob.user_a, {
                        ct: mocks.address0,
                        id: 0
                    });
                    result._bn.should.eq.BN(9);
                });
            });
        });

        describe('proposalCandidateType()', () => {
            it('should return default value', async () => {
                const address = Wallet.createRandom().address;
                (await ethersNullSettlementChallenge.proposalCandidateType(address))
                    .should.equal(mocks.candidateTypes.indexOf('None'));
            });
        });

        describe('proposalCandidateIndex()', () => {
            it('should return default value', async () => {
                const address = Wallet.createRandom().address;
                (await ethersNullSettlementChallenge.proposalCandidateIndex(address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('proposalChallenger()', () => {
            it('should return default value', async () => {
                const address = Wallet.createRandom().address;
                (await ethersNullSettlementChallenge.proposalChallenger(address))
                    .should.equal(mocks.address0);
            });
        });

        describe('setProposalStatus()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.setProposalStatus(address, mocks.proposalStatuses.indexOf('Disqualified'))
                        .should.be.rejected
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge.changeNullSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    const address = Wallet.createRandom().address;

                    await web3NullSettlementChallenge.setProposalStatus(address, mocks.proposalStatuses.indexOf('Disqualified'));

                    (await ethersNullSettlementChallenge.proposalStatus(address))
                        .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                });
            });
        });

        describe('setProposalCandidateType()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.setProposalCandidateType(address, mocks.candidateTypes.indexOf('Payment'))
                        .should.be.rejected
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge.changeNullSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    await web3NullSettlementChallenge.setProposalCandidateType(address, mocks.candidateTypes.indexOf('Payment'));

                    (await ethersNullSettlementChallenge.proposalCandidateType(address))
                        .should.equal(mocks.candidateTypes.indexOf('Payment'));
                });
            });
        });

        describe('setProposalCandidateIndex()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.setProposalCandidateIndex(address, 10)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge.changeNullSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    await web3NullSettlementChallenge.setProposalCandidateIndex(address, 10);

                    (await ethersNullSettlementChallenge.proposalCandidateIndex(address))
                        ._bn.should.eq.BN(10);
                });
            });
        });

        describe('setProposalChallenger()', () => {
            let address1, address2;

            before(() => {
                address1 = Wallet.createRandom().address;
                address2 = Wallet.createRandom().address;
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.setProposalChallenger(address1, address2)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge.changeNullSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    await web3NullSettlementChallenge.setProposalChallenger(address1, address2);

                    (await ethersNullSettlementChallenge.proposalChallenger(address1))
                        .should.eq.BN(address2);
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
            let trade, wallet;

            before(async () => {
                await ethersNullSettlementDispute._reset();
                trade = await mocks.mockTrade(glob.owner);
                wallet = Wallet.createRandom().address;
            });

            it('should call challengeByTrade() of its settlement challenge dispute instance', async () => {
                await ethersNullSettlementChallenge.challengeByTrade(wallet, trade, {gasLimit: 2e6});

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
                await ethersNullSettlementChallenge.challengeByPayment(payment, {gasLimit: 2e6});

                (await ethersNullSettlementDispute._challengeByPaymentCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('challengeCandidateOrderHashesCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersNullSettlementChallenge.challengeCandidateOrderHashesCount())._bn.should.eq.BN(0);
            });
        });

        describe('addChallengeCandidateOrderHash()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.addChallengeCandidateOrderHash(order.seals.operator.hash)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                let challengeCandidateOrderHashesCountBefore;

                beforeEach(async () => {
                    await web3NullSettlementChallenge.changeNullSettlementDispute(glob.owner);
                    challengeCandidateOrderHashesCountBefore = await ethersNullSettlementChallenge.challengeCandidateOrderHashesCount();
                });

                it('should successfully push the array element', async () => {
                    await ethersNullSettlementChallenge.addChallengeCandidateOrderHash(order.seals.operator.hash, {gasLimit: 2e6});

                    (await ethersNullSettlementChallenge.challengeCandidateOrderHashesCount())
                        ._bn.should.eq.BN(challengeCandidateOrderHashesCountBefore.add(1)._bn);
                });
            });
        });

        describe('challengeCandidateTradeHashesCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersNullSettlementChallenge.challengeCandidateTradeHashesCount())._bn.should.eq.BN(0);
            });
        });

        describe('addChallengeCandidateTradeHash()', () => {
            let trade;

            before(async () => {
                trade = await mocks.mockTrade(glob.owner);
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.addChallengeCandidateTradeHash(trade.seal.hash)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                let challengeCandidateTradeHashesCountBefore;

                beforeEach(async () => {
                    await web3NullSettlementChallenge.changeNullSettlementDispute(glob.owner);
                    challengeCandidateTradeHashesCountBefore = await ethersNullSettlementChallenge.challengeCandidateTradeHashesCount();
                });

                it('should successfully push the array element', async () => {
                    await ethersNullSettlementChallenge.addChallengeCandidateTradeHash(trade.seal.hash, {gasLimit: 2e6});

                    (await ethersNullSettlementChallenge.challengeCandidateTradeHashesCount())
                        ._bn.should.eq.BN(challengeCandidateTradeHashesCountBefore.add(1)._bn);
                });
            });
        });

        describe('challengeCandidatePaymentHashesCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersNullSettlementChallenge.challengeCandidatePaymentHashesCount())._bn.should.eq.BN(0);
            });
        });

        describe('addChallengeCandidatePaymentHash()', () => {
            let payment;

            before(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3NullSettlementChallenge.addChallengeCandidatePaymentHash(payment.seals.operator.hash)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                let challengeCandidatePaymentHashesCountBefore;

                beforeEach(async () => {
                    await web3NullSettlementChallenge.changeNullSettlementDispute(glob.owner);
                    challengeCandidatePaymentHashesCountBefore = await ethersNullSettlementChallenge.challengeCandidatePaymentHashesCount();
                });

                it('should successfully push the array element', async () => {
                    await ethersNullSettlementChallenge.addChallengeCandidatePaymentHash(payment.seals.operator.hash, {gasLimit: 2e6});

                    (await ethersNullSettlementChallenge.challengeCandidatePaymentHashesCount())
                        ._bn.should.eq.BN(challengeCandidatePaymentHashesCountBefore.add(1)._bn);
                });
            });
        });
    });
};
