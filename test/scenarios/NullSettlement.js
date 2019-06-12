const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlement = artifacts.require('NullSettlement');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedClientFund = artifacts.require('MockedClientFund');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedNullSettlementState = artifacts.require('MockedNullSettlementState');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedCommunityVote = artifacts.require('MockedCommunityVote');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('NullSettlement', () => {
        let web3NullSettlement, ethersNullSettlement;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3RevenueFund, ethersRevenueFund;
        let web3CommunityVote, ethersCommunityVote;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3NullSettlementState, ethersNullSettlementState;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new();
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);
            web3RevenueFund = await MockedBeneficiary.new();
            ethersRevenueFund = new Contract(web3RevenueFund.address, MockedBeneficiary.abi, glob.signer_owner);
            web3CommunityVote = await MockedCommunityVote.new();
            ethersCommunityVote = new Contract(web3CommunityVote.address, MockedCommunityVote.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new();
            ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, glob.signer_owner);
            web3NullSettlementState = await MockedNullSettlementState.new();
            ethersNullSettlementState = new Contract(web3NullSettlementState.address, MockedNullSettlementState.abi, glob.signer_owner);
            web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, glob.signer_owner);

            await web3Configuration.registerService(glob.owner);
            await web3Configuration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});
        });

        beforeEach(async () => {
            web3NullSettlement = await NullSettlement.new(glob.owner);
            ethersNullSettlement = new Contract(web3NullSettlement.address, NullSettlement.abi, glob.signer_owner);

            await ethersNullSettlement.setConfiguration(web3Configuration.address);
            await ethersNullSettlement.setClientFund(web3ClientFund.address);
            await ethersNullSettlement.setCommunityVote(web3CommunityVote.address);
            await ethersNullSettlement.setNullSettlementChallengeState(web3NullSettlementChallengeState.address);
            await ethersNullSettlement.setNullSettlementState(web3NullSettlementState.address);
            await ethersNullSettlement.setDriipSettlementChallengeState(web3DriipSettlementChallengeState.address);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlement.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlement.operator.call()).should.equal(glob.owner);
            });
        });

        describe('deployer()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlement.deployer.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3NullSettlement.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlement.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3NullSettlement.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3NullSettlement.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.configuration())
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
                    const result = await web3NullSettlement.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersNullSettlement.configuration()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.nullSettlementChallengeState())
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
                    const result = await web3NullSettlement.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersNullSettlement.nullSettlementChallengeState()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.setNullSettlementChallengeState(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementState()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.nullSettlementState())
                    .should.equal(utils.getAddress(ethersNullSettlementState.address));
            });
        });

        describe('setNullSettlementState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.setNullSettlementState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementStateEvent');

                    (await ethersNullSettlement.nullSettlementState()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.setNullSettlementState(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.driipSettlementChallengeState())
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
                    const result = await web3NullSettlement.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersNullSettlement.driipSettlementChallengeState()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.setDriipSettlementChallengeState(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.clientFund())
                    .should.equal(utils.getAddress(ethersClientFund.address));
            });
        });

        describe('setClientFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.setClientFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetClientFundEvent');

                    (await ethersNullSettlement.clientFund()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.setClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('communityVoteFrozen()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.communityVoteFrozen())
                    .should.be.false;
            });
        });

        describe('setCommunityVote()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.setCommunityVote(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCommunityVoteEvent');

                    (await ethersNullSettlement.communityVote()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.setCommunityVote(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('freezeCommunityVote()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.freezeCommunityVote({from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                let address;

                before(() => {
                    address = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    await web3NullSettlement.freezeCommunityVote();
                });

                it('should disable changing community vote', async () => {
                    web3NullSettlement.setCommunityVote(address).should.be.rejected;
                });
            });
        });

        describe('settleNull()', () => {
            beforeEach(async () => {
                await ethersClientFund._reset({gasLimit: 1e6});
                await ethersCommunityVote._reset({gasLimit: 1e6});
                await ethersConfiguration._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});

                await ethersNullSettlementChallengeState._setProposalNonce(1);
                await ethersNullSettlementChallengeState._setProposalExpired(true);
                await ethersNullSettlementChallengeState._setProposalStageAmount(10);
                await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(0);
            });

            describe('if there exists a non-terminated driip settlement challenge', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if proposal has not been initiated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if proposal has been terminated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                    await ethersNullSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if proposal has not expired', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                    await ethersNullSettlementChallengeState._setProposalExpired(false);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if null settlement challenge result is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                    await ethersNullSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if null settlement challenge result is qualified', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                });

                describe('if operational mode is exit and nonce is higher than the highest known nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                            .should.be.rejected;
                    });
                });

                describe('if data is unavailable and nonce is higher than the highest known nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                            .should.be.rejected;
                    });
                });

                describe('if nonce is greater than previously settled nonce for wallet and currency', () => {
                    it('should settle successfully', async () => {
                        await ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6});

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersNullSettlement.interface.events.SettleNullEvent.topics
                        ))).should.have.lengthOf(1);

                        (await ethersClientFund._stagesCount())._bn.should.eq.BN(1);

                        const stage = await ethersClientFund._stages(0);
                        stage[0].should.equal(utils.getAddress(glob.owner));
                        stage[1].should.equal(mocks.address0);
                        stage[2]._bn.should.eq.BN(10);
                        stage[3].should.equal(mocks.address0);
                        stage[4]._bn.should.eq.BN(0);
                        stage[5].should.equal('ERCXYZ');

                        (await ethersNullSettlementState.maxNonceByWalletAndCurrency(
                            glob.owner, {ct: mocks.address0, id: 0}
                        ))._bn.should.eq.BN(1);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(glob.owner));
                        proposal.currency.ct.should.equal(mocks.address0);
                        proposal.currency.id._bn.should.eq.BN(0);
                        proposal.terminated.should.be.true;
                    });
                });

                describe('if nonce is less than or equal to previously settled nonce for wallet and currency', () => {
                    beforeEach(async () => {
                        await ethersNullSettlementState.setMaxNonceByWalletAndCurrency(
                            glob.owner, {ct: mocks.address0, id: 0}, 10
                        );
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNull(mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                            .should.be.rejected;
                    });
                });
            });
        });

        describe('settleNullByProxy()', () => {
            let wallet;

            beforeEach(async () => {
                await ethersClientFund._reset({gasLimit: 1e6});
                await ethersCommunityVote._reset({gasLimit: 1e6});
                await ethersConfiguration._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});

                await ethersNullSettlementChallengeState._setProposalNonce(1);
                await ethersNullSettlementChallengeState._setProposalExpired(true);
                await ethersNullSettlementChallengeState._setProposalStageAmount(10);
                await ethersNullSettlementChallengeState._setProposalTargetBalanceAmount(0);

                wallet = Wallet.createRandom().address;
            });

            describe('if called by non-operator', () => {
                beforeEach(async () => {
                    ethersNullSettlement = ethersNullSettlement.connect(glob.signer_a);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if there exists an overlapping driip settlement challenge', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if proposal has not been initiated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if proposal has been terminated', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                    await ethersNullSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if proposal has not expired', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                    await ethersNullSettlementChallengeState._setProposalExpired(false);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if null settlement challenge result is disqualified', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                    await ethersNullSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if null settlement challenge result is qualified', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    await ethersNullSettlementChallengeState._setProposal(true);
                });

                describe('if operational mode is exit and nonce is higher than the highest known nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                            .should.be.rejected;
                    });
                });

                describe('if data is unavailable and nonce is higher than the highest known nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                            .should.be.rejected;
                    });
                });

                describe('if nonce is greater than previously settled nonce for wallet and currency', () => {
                    it('should settle successfully', async () => {
                        await ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6});

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersNullSettlement.interface.events.SettleNullByProxyEvent.topics
                        ))).should.have.lengthOf(1);

                        (await ethersClientFund._stagesCount())._bn.should.eq.BN(1);

                        const stage = await ethersClientFund._stages(0);
                        stage[0].should.equal(wallet);
                        stage[1].should.equal(mocks.address0);
                        stage[2]._bn.should.eq.BN(10);
                        stage[3].should.equal(mocks.address0);
                        stage[4]._bn.should.eq.BN(0);
                        stage[5].should.equal('ERCXYZ');

                        (await ethersNullSettlementState.maxNonceByWalletAndCurrency(
                            wallet, {ct: mocks.address0, id: 0}
                        ))._bn.should.eq.BN(1);

                        (await ethersNullSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const proposal = await ethersNullSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(wallet);
                        proposal.currency.ct.should.equal(mocks.address0);
                        proposal.currency.id._bn.should.eq.BN(0);
                        proposal.terminated.should.be.true;
                    });
                });

                describe('if nonce is less than or equal to previously settled nonce for wallet and currency', () => {
                    beforeEach(async () => {
                        await ethersNullSettlementState.setMaxNonceByWalletAndCurrency(
                            wallet, {ct: mocks.address0, id: 0}, 10
                        );
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNullByProxy(wallet, mocks.address0, 0, 'ERCXYZ', {gasLimit: 1e6})
                            .should.be.rejected;
                    });
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
