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
const MockedRevenueFund = artifacts.require('MockedRevenueFund');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedNullSettlementChallenge = artifacts.require('MockedNullSettlementChallenge');
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
        let web3NullSettlementChallenge, ethersNullSettlementChallenge;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new();
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);
            web3RevenueFund = await MockedRevenueFund.new();
            ethersRevenueFund = new Contract(web3RevenueFund.address, MockedRevenueFund.abi, glob.signer_owner);
            web3CommunityVote = await MockedCommunityVote.new();
            ethersCommunityVote = new Contract(web3CommunityVote.address, MockedCommunityVote.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3NullSettlementChallenge = await MockedNullSettlementChallenge.new();
            ethersNullSettlementChallenge = new Contract(web3NullSettlementChallenge.address, MockedNullSettlementChallenge.abi, glob.signer_owner);

            await ethersConfiguration.setConfirmations(utils.bigNumberify(0));
        });

        beforeEach(async () => {
            web3NullSettlement = await NullSettlement.new(glob.owner);
            ethersNullSettlement = new Contract(web3NullSettlement.address, NullSettlement.abi, glob.signer_owner);

            await ethersNullSettlement.changeConfiguration(web3Configuration.address);
            await ethersNullSettlement.changeClientFund(web3ClientFund.address);
            await ethersNullSettlement.changeCommunityVote(web3CommunityVote.address);
            await ethersNullSettlement.changeNullSettlementChallenge(web3NullSettlementChallenge.address);
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

        describe('changeDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.changeDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDeployerEvent');

                    (await web3NullSettlement.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.changeDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlement.operator.call()).should.equal(glob.owner);
            });
        });

        describe('changeOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.changeOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOperatorEvent');

                    (await web3NullSettlement.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3NullSettlement.changeOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.configuration())
                    .should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.changeConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');

                    (await ethersNullSettlement.configuration()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallenge()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.nullSettlementChallenge())
                    .should.equal(utils.getAddress(ethersNullSettlementChallenge.address));
            });
        });

        describe('changeNullSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.changeNullSettlementChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeNullSettlementChallengeEvent');

                    (await ethersNullSettlement.nullSettlementChallenge()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.changeNullSettlementChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.clientFund())
                    .should.equal(utils.getAddress(ethersClientFund.address));
            });
        });

        describe('changeClientFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.changeClientFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');

                    (await ethersNullSettlement.clientFund()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('communityVoteUpdateDisabled()', () => {
            it('should return value initialized', async () => {
                (await ethersNullSettlement.communityVoteUpdateDisabled())
                    .should.be.false;
            });
        });

        describe('changeCommunityVote()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlement.changeCommunityVote(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCommunityVoteEvent');

                    (await ethersNullSettlement.communityVote()).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.changeCommunityVote(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('disableUpdateOfCommunityVote()', () => {
            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlement.disableUpdateOfCommunityVote({from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with deployer as sender', () => {
                let address;

                before(() => {
                    address = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    await web3NullSettlement.disableUpdateOfCommunityVote();
                });

                it('should disable changing community vote', async () => {
                    web3NullSettlement.changeCommunityVote(address).should.be.rejected;
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.isSeizedWallet(glob.user_a))
                    .should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.seizedWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('seizedWallets()', () => {
            it('should equal value initialized', async () => {
                ethersNullSettlement.seizedWallets(0).should.be.rejected;
            });
        });

        describe('maxNullNonce()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.maxNullNonce())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('updateMaxNullNonce()', () => {
            describe('if community vote returns 0', () => {
                let maxNullNonce;

                before(async () => {
                    maxNullNonce = await ethersNullSettlement.maxNullNonce();
                    await ethersCommunityVote.setMaxNullNonce(0);
                });

                it('should not update maxNullNonce property', async () => {
                    await ethersNullSettlement.updateMaxNullNonce();
                    (await ethersNullSettlement.maxNullNonce())
                        ._bn.should.eq.BN(maxNullNonce._bn);
                });
            });

            describe('if community vote returns non-zero value', () => {
                let maxNullNonce;

                before(async () => {
                    maxNullNonce = 10;
                    await ethersCommunityVote.setMaxNullNonce(maxNullNonce);
                });

                it('should update maxNullNonce property', async () => {
                    await ethersNullSettlement.updateMaxNullNonce();
                    (await ethersNullSettlement.maxNullNonce())
                        ._bn.should.eq.BN(maxNullNonce);
                });
            });
        });

        describe('walletCurrencyMaxNullNonce()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlement.walletCurrencyMaxNullNonce(
                    Wallet.createRandom().address, Wallet.createRandom().address, 0
                ))._bn.should.eq.BN(0);
            });
        });

        describe('settleNull()', () => {
            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlement = await NullSettlement.new(glob.owner);
                    ethersNullSettlement = new Contract(web3NullSettlement.address, NullSettlement.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if client fund contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlement = await NullSettlement.new(glob.owner);
                    ethersNullSettlement = new Contract(web3NullSettlement.address, NullSettlement.abi, glob.signer_owner);

                    await ethersNullSettlement.changeConfiguration(ethersConfiguration.address);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if community vote contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlement = await NullSettlement.new(glob.owner);
                    ethersNullSettlement = new Contract(web3NullSettlement.address, NullSettlement.abi, glob.signer_owner);

                    await ethersNullSettlement.changeConfiguration(ethersConfiguration.address);
                    await ethersNullSettlement.changeClientFund(ethersClientFund.address);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if null settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlement = await NullSettlement.new(glob.owner);
                    ethersNullSettlement = new Contract(web3NullSettlement.address, NullSettlement.abi, glob.signer_owner);

                    await ethersNullSettlement.changeConfiguration(ethersConfiguration.address);
                    await ethersNullSettlement.changeClientFund(ethersClientFund.address);
                    await ethersNullSettlement.changeCommunityVote(ethersCommunityVote.address);
                });

                it('should revert', async () => {
                    ethersNullSettlement.settleNull(Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if null settlement challenge result is qualified', () => {
                let wallet, challenger;

                before(() => {
                    wallet = Wallet.createRandom().address;
                    challenger = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    await ethersConfiguration.reset();
                    await ethersClientFund.reset({gasLimit: 1e6});
                    await ethersCommunityVote.reset();
                    await ethersNullSettlementChallenge._reset();

                    await ethersNullSettlementChallenge.setProposalStatus(wallet, mocks.proposalStatuses.indexOf('Qualified'));
                });

                describe('if operational mode is exit and nonce is higher than the highest known nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNull(Wallet.createRandom().address).should.be.rejected;
                    });
                });

                describe('if data is unavailable and nonce is higher than the highest known nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNull(Wallet.createRandom().address).should.be.rejected;
                    });
                });

                describe('if nonce is greater than previously settled nonce for wallet and currency', () => {
                    beforeEach(async () => {
                        await ethersNullSettlementChallenge._setProposalNonce(1);
                        await ethersNullSettlementChallenge._setProposalCurrency({ct: mocks.address0, id: 0});
                        await ethersNullSettlementChallenge._setProposalStageAmount(10);
                        await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(0);
                        await ethersNullSettlementChallenge.setProposalChallenger(wallet, challenger);
                    });

                    it('should settle successfully', async () => {
                        await ethersNullSettlement.settleNull(wallet, {gasLimit: 1e6});

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics[0]
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics[0]
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersNullSettlement.interface.events.SettleNullEvent.topics[0]
                        ))).should.have.lengthOf(1);

                        const settledBalanceUpdate = await ethersClientFund._settledBalanceUpdates(0);
                        settledBalanceUpdate[0].should.equal(wallet);
                        settledBalanceUpdate[1]._bn.should.eq.BN(0);
                        settledBalanceUpdate[2].should.equal(mocks.address0);
                        settledBalanceUpdate[3]._bn.should.eq.BN(0);

                        (await ethersClientFund._stagesCount())._bn.should.eq.BN(1);

                        const stage = await ethersClientFund._stages(0);
                        stage[0].should.equal(wallet);
                        stage[1].should.equal(mocks.address0);
                        stage[2]._bn.should.eq.BN(10);
                        stage[3].should.equal(mocks.address0);
                        stage[4]._bn.should.eq.BN(0);

                        (await ethersNullSettlement.walletCurrencyMaxNullNonce(
                            wallet, mocks.address0, 0
                        ))._bn.should.eq.BN(1);
                    });
                });

                describe('if nonce is smaller than or equal to previously settled nonce for wallet and currency', () => {
                    beforeEach(async () => {
                        await ethersNullSettlementChallenge._setProposalNonce(1);
                        await ethersNullSettlementChallenge._setProposalCurrency({ct: mocks.address0, id: 0});
                        await ethersNullSettlementChallenge._setProposalStageAmount(10);
                        await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(0);
                        await ethersNullSettlementChallenge.setProposalChallenger(wallet, challenger);

                        await ethersNullSettlement.settleNull(wallet, {gasLimit: 1e6});
                    });

                    it('should revert', async () => {
                        ethersNullSettlement.settleNull(wallet, {gasLimit: 1e6}).should.be.rejected;
                    });
                });
            });

            describe('if null settlement challenge result is disqualified', () => {
                let wallet, challenger;

                before(() => {
                    wallet = Wallet.createRandom().address;
                    challenger = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    await ethersClientFund.reset({gasLimit: 1e6});
                    await ethersNullSettlementChallenge._reset();

                    await ethersNullSettlementChallenge.setProposalChallenger(wallet, challenger);
                    await ethersNullSettlementChallenge.setProposalStatus(wallet, mocks.proposalStatuses.indexOf('Disqualified'));
                });

                it('should seize the wallet', async () => {
                    await ethersNullSettlement.settleNull(wallet, {gasLimit: 1e6});

                    (await provider.getLogs(await fromBlockTopicsFilter(
                        ethersNullSettlement.interface.events.SettleNullEvent.topics[0]
                    ))).should.have.lengthOf(1);

                    (await ethersNullSettlement.isSeizedWallet(wallet))
                        .should.be.true;

                    const seizure = await ethersClientFund.seizures(0);
                    seizure.source.should.equal(utils.getAddress(wallet));
                    seizure.target.should.equal(utils.getAddress(challenger));
                });
            });
        });
    });
};

const fromBlockTopicsFilter = async (...topics) => {
    return {
        fromBlock: await provider.getBlockNumber(),
        topics
    };
};
