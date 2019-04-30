const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementByTrade = artifacts.require('DriipSettlementByTrade');
const SignerManager = artifacts.require('SignerManager');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedClientFund = artifacts.require('MockedClientFund');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedDriipSettlementState = artifacts.require('MockedDriipSettlementState');
const MockedCommunityVote = artifacts.require('MockedCommunityVote');
const MockedValidator = artifacts.require('MockedValidator');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('DriipSettlementByTrade', () => {
        let web3DriipSettlementByTrade, ethersDriipSettlementByTrade;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3RevenueFund, ethersRevenueFund;
        let web3CommunityVote, ethersCommunityVote;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3WalletLocker, ethersWalletLocker;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let web3DriipSettlementState, ethersDriipSettlementState;
        let web3Validator, ethersValidator;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

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
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, glob.signer_owner);
            web3DriipSettlementState = await MockedDriipSettlementState.new();
            ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, MockedDriipSettlementState.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);

            await web3Configuration.registerService(glob.owner);
            await web3Configuration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});
        });

        beforeEach(async () => {
            web3DriipSettlementByTrade = await DriipSettlementByTrade.new(glob.owner);
            ethersDriipSettlementByTrade = new Contract(web3DriipSettlementByTrade.address, DriipSettlementByTrade.abi, glob.signer_owner);

            await ethersDriipSettlementByTrade.setConfiguration(web3Configuration.address);
            await ethersDriipSettlementByTrade.setValidator(web3Validator.address);
            await ethersDriipSettlementByTrade.setClientFund(web3ClientFund.address);
            await ethersDriipSettlementByTrade.setCommunityVote(web3CommunityVote.address);
            await ethersDriipSettlementByTrade.setFraudChallenge(web3FraudChallenge.address);
            await ethersDriipSettlementByTrade.setWalletLocker(web3WalletLocker.address);
            await ethersDriipSettlementByTrade.setDriipSettlementChallengeState(web3DriipSettlementChallengeState.address);
            await ethersDriipSettlementByTrade.setDriipSettlementState(web3DriipSettlementState.address);
            await ethersDriipSettlementByTrade.setRevenueFund(web3RevenueFund.address);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementByTrade.address).should.have.lengthOf(42);
            });
        });

        describe('deployer()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementByTrade.deployer.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with deployer as buyer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByTrade.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3DriipSettlementByTrade.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with buyer that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setDeployer(glob.user_a, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementByTrade.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setOperator()', () => {
            describe('if called with operator as buyer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByTrade.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3DriipSettlementByTrade.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with buyer that is not operator', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setOperator(glob.user_a, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.configuration())
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
                    const result = await web3DriipSettlementByTrade.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementByTrade.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.validator())
                    .should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByTrade.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementByTrade.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.driipSettlementChallengeState())
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
                    const result = await web3DriipSettlementByTrade.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersDriipSettlementByTrade.driipSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setDriipSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.driipSettlementState())
                    .should.equal(utils.getAddress(ethersDriipSettlementState.address));
            });
        });

        describe('setDriipSettlementState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByTrade.setDriipSettlementState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementStateEvent');

                    (await ethersDriipSettlementByTrade.driipSettlementState()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setDriipSettlementState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.clientFund())
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
                    const result = await web3DriipSettlementByTrade.setClientFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetClientFundEvent');

                    (await ethersDriipSettlementByTrade.clientFund()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setClientFund(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('revenueFund()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.revenueFund())
                    .should.equal(utils.getAddress(ethersRevenueFund.address));
            });
        });

        describe('setRevenueFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByTrade.setRevenueFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetRevenueFundEvent');

                    (await ethersDriipSettlementByTrade.revenueFund()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setRevenueFund(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('partnerFund()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.partnerFund())
                    .should.equal(mocks.address0);
            });
        });

        describe('setPartnerFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByTrade.setPartnerFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPartnerFundEvent');

                    (await ethersDriipSettlementByTrade.partnerFund()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setPartnerFund(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('communityVote()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.communityVote())
                    .should.equal(utils.getAddress(ethersCommunityVote.address));
            });
        });

        describe('setCommunityVote()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByTrade.setCommunityVote(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCommunityVoteEvent');

                    (await ethersDriipSettlementByTrade.communityVote()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.setCommunityVote(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('communityVoteFrozen()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByTrade.communityVoteFrozen())
                    .should.be.false;
            });
        });

        describe('freezeCommunityVote()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByTrade.freezeCommunityVote({from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                let address;

                before(async () => {
                    address = Wallet.createRandom().address;
                });

                it('should disable changing community vote', async () => {
                    await web3DriipSettlementByTrade.freezeCommunityVote();
                    web3DriipSettlementByTrade.setCommunityVote(address).should.be.rejected;
                });
            });
        });

        describe('settleTrade()', () => {
            let trade;

            beforeEach(async () => {
                await ethersClientFund._reset({gasLimit: 1e6});
                await ethersCommunityVote._reset({gasLimit: 1e6});
                await ethersConfiguration._reset({gasLimit: 1e6});
                await ethersValidator._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});
                await ethersFraudChallenge._reset({gasLimit: 1e6});
                await ethersWalletLocker._reset({gasLimit: 1e6});
                await ethersRevenueFund._reset({gasLimit: 1e6});

                trade = await mocks.mockTrade(glob.owner, {buyer: {wallet: glob.owner}});

                await ethersDriipSettlementChallengeState._setProposal(true);
                await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                await ethersDriipSettlementChallengeState._setProposalExpired(true);
                await ethersDriipSettlementChallengeState._setProposalChallengedHash(trade.seal.hash);

                await ethersValidator.setTradeSeller(false);
                await ethersValidator.setTradeBuyer(true);
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false, {gasLimit: 5e6});
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is not trade party', () => {
                beforeEach(async () => {
                    await ethersValidator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if trade is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.addFraudulentTradeHash(trade.seal.hash);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is flagged as double spender', () => {
                beforeEach(async () => {
                    await ethersCommunityVote.addDoubleSpenderWallet(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is locked', () => {
                beforeEach(async () => {
                    await ethersWalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal is defined wrt other trade', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalChallengedHash(mocks.hash1);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has not been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has been terminated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has not expired', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalExpired(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if driip settlement challenge proposal is disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if driip settlement challenge proposal is qualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(1000);
                });

                describe('if operational mode is exit and trade nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                    });
                });

                describe('if data is unavailable and trade nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                    });
                });

                describe('if operational mode is normal and data is available', () => {
                    it('should settle trade successfully', async () => {
                        await ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6});

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlementByTrade.interface.events.StageFeesEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlementByTrade.interface.events.SettleTradeEvent.topics
                        ))).should.have.lengthOf(1);

                        const intendedSettledBalanceUpdate = await ethersClientFund._settledBalanceUpdates(0);
                        intendedSettledBalanceUpdate[0].should.equal(utils.getAddress(trade.buyer.wallet));
                        intendedSettledBalanceUpdate[1]._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                        intendedSettledBalanceUpdate[2].should.equal(trade.currencies.intended.ct);
                        intendedSettledBalanceUpdate[3]._bn.should.eq.BN(trade.currencies.intended.id._bn);

                        // const conjugateSettledBalanceUpdate = await ethersClientFund._settledBalanceUpdates(1);
                        // conjugateSettledBalanceUpdate[0].should.equal(utils.getAddress(trade.buyer.wallet));
                        // conjugateSettledBalanceUpdate[1]._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                        // conjugateSettledBalanceUpdate[2].should.equal(trade.currencies.conjugate.ct);
                        // conjugateSettledBalanceUpdate[3]._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                        (await ethersClientFund._stagesCount())._bn.should.eq.BN(1);

                        const intendedHoldingStage = await ethersClientFund._stages(0);
                        intendedHoldingStage[0].should.equal(utils.getAddress(trade.buyer.wallet));
                        intendedHoldingStage[1].should.equal(mocks.address0);
                        intendedHoldingStage[2]._bn.should.eq.BN(1000);
                        intendedHoldingStage[3].should.equal(trade.currencies.intended.ct);
                        intendedHoldingStage[4]._bn.should.eq.BN(trade.currencies.intended.id._bn);

                        // const conjugateHoldingStage = await ethersClientFund._stages(1);
                        // conjugateHoldingStage[0].should.equal(utils.getAddress(trade.buyer.wallet));
                        // conjugateHoldingStage[1].should.equal(mocks.address0);
                        // conjugateHoldingStage[2]._bn.should.eq.BN(1000);
                        // conjugateHoldingStage[3].should.equal(trade.currencies.conjugate.ct);
                        // conjugateHoldingStage[4]._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                        (await ethersClientFund._beneficiaryTransfersCount())._bn.should.eq.BN(1);

                        const totalFeeTransfer = await ethersClientFund._beneficiaryTransfers(0);
                        totalFeeTransfer[0].should.equal(mocks.address0);
                        totalFeeTransfer[1].should.equal(utils.getAddress(ethersRevenueFund.address));
                        totalFeeTransfer[2]._bn.should.eq.BN(trade.buyer.fees.total[0].figure.amount._bn);
                        totalFeeTransfer[3].should.equal(trade.buyer.fees.total[0].figure.currency.ct);
                        totalFeeTransfer[4]._bn.should.eq.BN(trade.buyer.fees.total[0].figure.currency.id._bn);

                        (await ethersDriipSettlementState.settlementsCount())._bn.should.eq.BN(1);

                        const settlement = await ethersDriipSettlementState.settlements(0);
                        settlement.settledKind.should.equal('trade');
                        settlement.settledHash.should.equal(trade.seal.hash);
                        settlement.origin.nonce._bn.should.eq.BN(trade.seller.nonce._bn);
                        settlement.origin.wallet.should.equal(utils.getAddress(trade.seller.wallet));
                        settlement.origin.done.should.be.false;
                        settlement.target.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                        settlement.target.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                        settlement.target.done.should.be.true;

                        (await ethersDriipSettlementState.maxNonceByWalletAndCurrency(
                                trade.buyer.wallet, trade.currencies.intended)
                        )._bn.should.eq.BN(trade.buyer.nonce._bn);

                        (await ethersDriipSettlementState.maxDriipNonce())
                            ._bn.should.eq.BN(trade.nonce._bn);
                    });
                });

                describe('if wallet has already settled this trade', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            trade.buyer.wallet, trade.buyer.nonce, mocks.settlementRoles.indexOf('Target'), true
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByTrade.settleTrade(trade, {gasLimit: 5e6}).should.be.rejected;
                    });
                });
            });
        });

        describe('settleTradeByProxy()', () => {
            let trade;

            beforeEach(async () => {
                await ethersClientFund._reset({gasLimit: 1e6});
                await ethersCommunityVote._reset({gasLimit: 1e6});
                await ethersConfiguration._reset({gasLimit: 1e6});
                await ethersValidator._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});
                await ethersFraudChallenge._reset({gasLimit: 1e6});
                await ethersWalletLocker._reset({gasLimit: 1e6});
                await ethersRevenueFund._reset({gasLimit: 1e6});

                trade = await mocks.mockTrade(glob.owner);

                await ethersDriipSettlementChallengeState._setProposal(true);
                await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                await ethersDriipSettlementChallengeState._setProposalExpired(true);
                await ethersDriipSettlementChallengeState._setProposalChallengedHash(trade.seal.hash);

                await ethersValidator.setTradeSeller(false);
                await ethersValidator.setTradeBuyer(true);
            });

            describe('if called by non-operator', () => {
                beforeEach(async () => {
                    ethersDriipSettlementByTrade = ethersDriipSettlementByTrade.connect(glob.signer_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is not trade party', () => {
                beforeEach(async () => {
                    await ethersValidator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false, {gasLimit: 5e6});
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if trade is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.addFraudulentTradeHash(trade.seal.hash);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is flagged as double spender', () => {
                beforeEach(async () => {
                    await ethersCommunityVote.addDoubleSpenderWallet(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is locked', () => {
                beforeEach(async () => {
                    await ethersWalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal is defined wrt other trade', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalChallengedHash(mocks.hash1);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has not been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has been terminated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has not expired', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalExpired(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if driip settlement challenge proposal is disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if driip settlement challenge proposal is qualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(1000);
                });

                describe('if operational mode is exit and trade nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                    });
                });

                describe('if data is unavailable and trade nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
                    });
                });

                describe('if operational mode is normal and data is available', () => {
                    it('should settle trade successfully', async () => {
                        await ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6});

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlementByTrade.interface.events.StageFeesEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlementByTrade.interface.events.SettleTradeByProxyEvent.topics
                        ))).should.have.lengthOf(1);

                        const intendedSettledBalanceUpdate = await ethersClientFund._settledBalanceUpdates(0);
                        intendedSettledBalanceUpdate[0].should.equal(utils.getAddress(trade.buyer.wallet));
                        intendedSettledBalanceUpdate[1]._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                        intendedSettledBalanceUpdate[2].should.equal(trade.currencies.intended.ct);
                        intendedSettledBalanceUpdate[3]._bn.should.eq.BN(trade.currencies.intended.id._bn);

                        // const conjugateSettledBalanceUpdate = await ethersClientFund._settledBalanceUpdates(1);
                        // conjugateSettledBalanceUpdate[0].should.equal(utils.getAddress(trade.buyer.wallet));
                        // conjugateSettledBalanceUpdate[1]._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                        // conjugateSettledBalanceUpdate[2].should.equal(trade.currencies.conjugate.ct);
                        // conjugateSettledBalanceUpdate[3]._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                        (await ethersClientFund._stagesCount())._bn.should.eq.BN(1);

                        const intendedHoldingStage = await ethersClientFund._stages(0);
                        intendedHoldingStage[0].should.equal(utils.getAddress(trade.buyer.wallet));
                        intendedHoldingStage[1].should.equal(mocks.address0);
                        intendedHoldingStage[2]._bn.should.eq.BN(1000);
                        intendedHoldingStage[3].should.equal(trade.currencies.intended.ct);
                        intendedHoldingStage[4]._bn.should.eq.BN(trade.currencies.intended.id._bn);

                        // const conjugateHoldingStage = await ethersClientFund._stages(1);
                        // conjugateHoldingStage[0].should.equal(utils.getAddress(trade.buyer.wallet));
                        // conjugateHoldingStage[1].should.equal(mocks.address0);
                        // conjugateHoldingStage[2]._bn.should.eq.BN(1000);
                        // conjugateHoldingStage[3].should.equal(trade.currencies.conjugate.ct);
                        // conjugateHoldingStage[4]._bn.should.eq.BN(trade.currencies.conjugate.id._bn);

                        (await ethersClientFund._beneficiaryTransfersCount())._bn.should.eq.BN(1);

                        const totalFeeTransfer = await ethersClientFund._beneficiaryTransfers(0);
                        totalFeeTransfer[0].should.equal(mocks.address0);
                        totalFeeTransfer[1].should.equal(utils.getAddress(ethersRevenueFund.address));
                        totalFeeTransfer[2]._bn.should.eq.BN(trade.buyer.fees.total[0].figure.amount._bn);
                        totalFeeTransfer[3].should.equal(trade.buyer.fees.total[0].figure.currency.ct);
                        totalFeeTransfer[4]._bn.should.eq.BN(trade.buyer.fees.total[0].figure.currency.id._bn);

                        (await ethersDriipSettlementState.settlementsCount())._bn.should.eq.BN(1);

                        const settlement = await ethersDriipSettlementState.settlements(0);
                        settlement.settledKind.should.equal('trade');
                        settlement.settledHash.should.equal(trade.seal.hash);
                        settlement.origin.nonce._bn.should.eq.BN(trade.seller.nonce._bn);
                        settlement.origin.wallet.should.equal(utils.getAddress(trade.seller.wallet));
                        settlement.origin.done.should.be.false;
                        settlement.target.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                        settlement.target.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                        settlement.target.done.should.be.true;

                        (await ethersDriipSettlementState.maxNonceByWalletAndCurrency(
                                trade.buyer.wallet, trade.currencies.intended)
                        )._bn.should.eq.BN(trade.buyer.nonce._bn);

                        (await ethersDriipSettlementState.maxDriipNonce())
                            ._bn.should.eq.BN(trade.nonce._bn);
                    });
                });

                describe('if wallet has already settled this trade', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            trade.buyer.wallet, trade.buyer.nonce, mocks.settlementRoles.indexOf('Target'), true
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByTrade.settleTradeByProxy(trade.buyer.wallet, trade, {gasLimit: 5e6}).should.be.rejected;
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
