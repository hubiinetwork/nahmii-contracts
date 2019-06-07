const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementByPayment = artifacts.require('DriipSettlementByPayment');
const SignerManager = artifacts.require('SignerManager');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedClientFund = artifacts.require('MockedClientFund');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBenefactor = artifacts.require('MockedBenefactor');
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
    describe('DriipSettlementByPayment', () => {
        let web3DriipSettlementByPayment, ethersDriipSettlementByPayment;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3RevenueFund, ethersRevenueFund;
        let web3CommunityVote, ethersCommunityVote;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3WalletLocker, ethersWalletLocker;
        let web3PartnerBenefactor, ethersPartnerBenefactor;
        let web3PartnerBeneficiary, ethersPartnerBeneficiary;
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
            web3PartnerBenefactor = await MockedBenefactor.new();
            ethersPartnerBenefactor = new Contract(web3PartnerBenefactor.address, MockedBenefactor.abi, glob.signer_owner);
            web3PartnerBeneficiary = await MockedBeneficiary.new();
            ethersPartnerBeneficiary = new Contract(web3PartnerBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);
            web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, glob.signer_owner);
            web3DriipSettlementState = await MockedDriipSettlementState.new();
            ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, MockedDriipSettlementState.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);

            await web3Configuration.registerService(glob.owner);
            await web3Configuration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});

            await web3PartnerBenefactor.registerBeneficiary(web3PartnerBeneficiary.address);
        });

        beforeEach(async () => {
            web3DriipSettlementByPayment = await DriipSettlementByPayment.new(glob.owner);
            ethersDriipSettlementByPayment = new Contract(web3DriipSettlementByPayment.address, DriipSettlementByPayment.abi, glob.signer_owner);

            await ethersDriipSettlementByPayment.setConfiguration(web3Configuration.address);
            await ethersDriipSettlementByPayment.setValidator(web3Validator.address);
            await ethersDriipSettlementByPayment.setClientFund(web3ClientFund.address);
            await ethersDriipSettlementByPayment.setCommunityVote(web3CommunityVote.address);
            await ethersDriipSettlementByPayment.setFraudChallenge(web3FraudChallenge.address);
            await ethersDriipSettlementByPayment.setWalletLocker(web3WalletLocker.address);
            await ethersDriipSettlementByPayment.setPartnerBenefactor(web3PartnerBenefactor.address);
            await ethersDriipSettlementByPayment.setDriipSettlementChallengeState(web3DriipSettlementChallengeState.address);
            await ethersDriipSettlementByPayment.setDriipSettlementState(web3DriipSettlementState.address);
            await ethersDriipSettlementByPayment.setRevenueFund(web3RevenueFund.address);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementByPayment.address).should.have.lengthOf(42);
            });
        });

        describe('deployer()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementByPayment.deployer.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByPayment.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3DriipSettlementByPayment.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setDeployer(glob.user_a, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3DriipSettlementByPayment.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setOperator()', () => {
            describe('if called with operator as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByPayment.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3DriipSettlementByPayment.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not operator', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setOperator(glob.user_a, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.configuration())
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
                    const result = await web3DriipSettlementByPayment.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementByPayment.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.validator())
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
                    const result = await web3DriipSettlementByPayment.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementByPayment.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.driipSettlementChallengeState())
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
                    const result = await web3DriipSettlementByPayment.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersDriipSettlementByPayment.driipSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setDriipSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.driipSettlementState())
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
                    const result = await web3DriipSettlementByPayment.setDriipSettlementState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementStateEvent');

                    (await ethersDriipSettlementByPayment.driipSettlementState()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setDriipSettlementState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.clientFund())
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
                    const result = await web3DriipSettlementByPayment.setClientFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetClientFundEvent');

                    (await ethersDriipSettlementByPayment.clientFund()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setClientFund(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('revenueFund()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.revenueFund())
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
                    const result = await web3DriipSettlementByPayment.setRevenueFund(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetRevenueFundEvent');

                    (await ethersDriipSettlementByPayment.revenueFund()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setRevenueFund(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('communityVote()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.communityVote())
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
                    const result = await web3DriipSettlementByPayment.setCommunityVote(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCommunityVoteEvent');

                    (await ethersDriipSettlementByPayment.communityVote()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setCommunityVote(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('communityVoteFrozen()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.communityVoteFrozen())
                    .should.be.false;
            });
        });

        describe('freezeCommunityVote()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.freezeCommunityVote({from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                let address;

                before(async () => {
                    address = Wallet.createRandom().address;
                });

                it('should disable changing community vote', async () => {
                    await web3DriipSettlementByPayment.freezeCommunityVote();
                    web3DriipSettlementByPayment.setCommunityVote(address).should.be.rejected;
                });
            });
        });

        describe('partnerBenefactor()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementByPayment.partnerBenefactor())
                    .should.equal(utils.getAddress(ethersPartnerBenefactor.address));
            });
        });

        describe('setPartnerBenefactor()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementByPayment.setPartnerBenefactor(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPartnerBenefactorEvent');

                    (await ethersDriipSettlementByPayment.partnerBenefactor()).should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementByPayment.setPartnerBenefactor(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('settlePayment()', () => {
            let payment;

            beforeEach(async () => {
                await ethersClientFund._reset({gasLimit: 1e6});
                await ethersCommunityVote._reset({gasLimit: 1e6});
                await ethersConfiguration._reset({gasLimit: 1e6});
                await ethersValidator._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});
                await ethersFraudChallenge._reset({gasLimit: 1e6});
                await ethersWalletLocker._reset({gasLimit: 1e6});
                await ethersPartnerBeneficiary._reset({gasLimit: 1e6});
                await ethersRevenueFund._reset({gasLimit: 1e6});

                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                await ethersDriipSettlementChallengeState._setProposal(true);
                await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                await ethersDriipSettlementChallengeState._setProposalExpired(true);
                await ethersDriipSettlementChallengeState._setProposalChallengedHash(payment.seals.operator.hash);
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false, {gasLimit: 5e6});
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is not payment party', () => {
                beforeEach(async () => {
                    await ethersValidator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if payment is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.addFraudulentPaymentHash(payment.seals.operator.hash);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is flagged as double spender', () => {
                beforeEach(async () => {
                    await ethersCommunityVote.addDoubleSpenderWallet(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is locked', () => {
                beforeEach(async () => {
                    await ethersWalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal is defined wrt other payment', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalChallengedHash(mocks.hash1);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has not been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has been terminated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has not expired', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalExpired(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if driip settlement challenge proposal is disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if driip settlement challenge proposal is qualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(payment.sender.balances.current);
                });

                describe('if operational mode is exit and payment nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                    });
                });

                describe('if data is unavailable and payment nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                    });
                });

                describe('if operational mode is normal and data is available', () => {
                    it('should settle payment successfully', async () => {
                        await ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6});

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlementByPayment.interface.events.StageFeesEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlementByPayment.interface.events.SettlePaymentEvent.topics
                        ))).should.have.lengthOf(1);

                        const settledBalanceUpdate = await ethersClientFund._settledBalanceUpdates(0);
                        settledBalanceUpdate[0].should.equal(utils.getAddress(payment.sender.wallet));
                        settledBalanceUpdate[1]._bn.should.eq.BN(payment.sender.balances.current._bn);
                        settledBalanceUpdate[2].should.equal(payment.currency.ct);
                        settledBalanceUpdate[3]._bn.should.eq.BN(payment.currency.id._bn);
                        settledBalanceUpdate[4].should.equal('ERCXYZ');

                        (await ethersClientFund._stagesCount())._bn.should.eq.BN(1);

                        const holdingStage = await ethersClientFund._stages(0);
                        holdingStage[0].should.equal(utils.getAddress(payment.sender.wallet));
                        holdingStage[1].should.equal(mocks.address0);
                        holdingStage[2]._bn.should.eq.BN(payment.sender.balances.current._bn);
                        holdingStage[3].should.equal(payment.currency.ct);
                        holdingStage[4]._bn.should.eq.BN(payment.currency.id._bn);
                        holdingStage[5].should.equal('ERCXYZ');

                        (await ethersClientFund._beneficiaryTransfersCount())._bn.should.eq.BN(1);

                        const totalFeeTransfer = await ethersClientFund._beneficiaryTransfers(0);
                        totalFeeTransfer[0].should.equal(utils.getAddress(payment.sender.wallet));
                        totalFeeTransfer[1].should.equal(utils.getAddress(ethersRevenueFund.address));
                        totalFeeTransfer[2]._bn.should.eq.BN(payment.sender.fees.total[0].figure.amount._bn);
                        totalFeeTransfer[3].should.equal(payment.sender.fees.total[0].figure.currency.ct);
                        totalFeeTransfer[4]._bn.should.eq.BN(payment.sender.fees.total[0].figure.currency.id._bn);
                        totalFeeTransfer[5].should.equal('ERCXYZ');

                        (await ethersDriipSettlementState.settlementsCount())._bn.should.eq.BN(1);

                        const settlement = await ethersDriipSettlementState.settlements(0);
                        settlement.settledKind.should.equal('payment');
                        settlement.settledHash.should.equal(payment.seals.operator.hash);
                        settlement.origin.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                        settlement.origin.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                        settlement.origin.done.should.be.true;
                        settlement.target.nonce._bn.should.eq.BN(payment.recipient.nonce._bn);
                        settlement.target.wallet.should.equal(utils.getAddress(payment.recipient.wallet));
                        settlement.target.done.should.be.false;

                        (await ethersDriipSettlementState.maxNonceByWalletAndCurrency(
                                payment.sender.wallet, payment.currency)
                        )._bn.should.eq.BN(payment.sender.nonce._bn);

                        (await ethersDriipSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                        proposal.currency.ct.should.equal(payment.currency.ct);
                        proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        proposal.terminated.should.be.true;
                    });
                });

                describe('if wallet has already settled this payment', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            payment.sender.wallet, payment.sender.nonce, mocks.settlementRoles.indexOf('Origin'), true
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByPayment.settlePayment(payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                    });
                });
            });
        });

        describe('settlePaymentByProxy()', () => {
            let payment;

            beforeEach(async () => {
                await ethersClientFund._reset({gasLimit: 1e6});
                await ethersCommunityVote._reset({gasLimit: 1e6});
                await ethersConfiguration._reset({gasLimit: 1e6});
                await ethersValidator._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});
                await ethersFraudChallenge._reset({gasLimit: 1e6});
                await ethersWalletLocker._reset({gasLimit: 1e6});
                await ethersPartnerBeneficiary._reset({gasLimit: 1e6});
                await ethersRevenueFund._reset({gasLimit: 1e6});

                payment = await mocks.mockPayment(glob.owner);

                await ethersDriipSettlementChallengeState._setProposal(true);
                await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                await ethersDriipSettlementChallengeState._setProposalExpired(true);
                await ethersDriipSettlementChallengeState._setProposalChallengedHash(payment.seals.operator.hash);
            });

            describe('if called by non-operator', () => {
                beforeEach(async () => {
                    ethersDriipSettlementByPayment = ethersDriipSettlementByPayment.connect(glob.signer_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if payment is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSeals(false, {gasLimit: 5e6});
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is not payment party', () => {
                beforeEach(async () => {
                    await ethersValidator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if payment is flagged as fraudulent', () => {
                beforeEach(async () => {
                    await ethersFraudChallenge.addFraudulentPaymentHash(payment.seals.operator.hash);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is flagged as double spender', () => {
                beforeEach(async () => {
                    await ethersCommunityVote.addDoubleSpenderWallet(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if wallet is locked', () => {
                beforeEach(async () => {
                    await ethersWalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal is defined wrt other payment', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalChallengedHash(mocks.hash1);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has not been initiated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has been terminated', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if proposal has not expired', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalExpired(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if driip settlement challenge proposal is disqualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalStatus(
                        mocks.settlementStatuses.indexOf('Disqualified')
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                });
            });

            describe('if driip settlement challenge proposal is qualified', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(payment.sender.balances.current);
                });

                describe('if operational mode is exit and payment nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setOperationalModeExit();
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                    });
                });

                describe('if data is unavailable and payment nonce is higher than absolute driip nonce', () => {
                    beforeEach(async () => {
                        await ethersCommunityVote.setDataAvailable(false);
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
                    });
                });

                describe('if operational mode is normal and data is available', () => {
                    it('should settle payment successfully', async () => {
                        await ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6});

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.UpdateSettledBalanceEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersClientFund.interface.events.StageEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlementByPayment.interface.events.StageFeesEvent.topics
                        ))).should.have.lengthOf(1);

                        (await provider.getLogs(await fromBlockTopicsFilter(
                            ethersDriipSettlementByPayment.interface.events.SettlePaymentByProxyEvent.topics
                        ))).should.have.lengthOf(1);

                        const settledBalanceUpdate = await ethersClientFund._settledBalanceUpdates(0);
                        settledBalanceUpdate[0].should.equal(utils.getAddress(payment.sender.wallet));
                        settledBalanceUpdate[1]._bn.should.eq.BN(payment.sender.balances.current._bn);
                        settledBalanceUpdate[2].should.equal(payment.currency.ct);
                        settledBalanceUpdate[3]._bn.should.eq.BN(payment.currency.id._bn);
                        settledBalanceUpdate[4].should.equal('ERCXYZ');

                        (await ethersClientFund._stagesCount())._bn.should.eq.BN(1);

                        const holdingStage = await ethersClientFund._stages(0);
                        holdingStage[0].should.equal(utils.getAddress(payment.sender.wallet));
                        holdingStage[1].should.equal(mocks.address0);
                        holdingStage[2]._bn.should.eq.BN(payment.sender.balances.current._bn);
                        holdingStage[3].should.equal(payment.currency.ct);
                        holdingStage[4]._bn.should.eq.BN(payment.currency.id._bn);
                        holdingStage[5].should.equal('ERCXYZ');

                        (await ethersClientFund._beneficiaryTransfersCount())._bn.should.eq.BN(1);

                        const totalFeeTransfer = await ethersClientFund._beneficiaryTransfers(0);
                        totalFeeTransfer[0].should.equal(utils.getAddress(payment.sender.wallet));
                        totalFeeTransfer[1].should.equal(utils.getAddress(ethersRevenueFund.address));
                        totalFeeTransfer[2]._bn.should.eq.BN(payment.sender.fees.total[0].figure.amount._bn);
                        totalFeeTransfer[3].should.equal(payment.sender.fees.total[0].figure.currency.ct);
                        totalFeeTransfer[4]._bn.should.eq.BN(payment.sender.fees.total[0].figure.currency.id._bn);
                        totalFeeTransfer[5].should.equal('ERCXYZ');

                        (await ethersDriipSettlementState.settlementsCount())._bn.should.eq.BN(1);

                        const settlement = await ethersDriipSettlementState.settlements(0);
                        settlement.settledKind.should.equal('payment');
                        settlement.settledHash.should.equal(payment.seals.operator.hash);
                        settlement.origin.nonce._bn.should.eq.BN(payment.sender.nonce._bn);
                        settlement.origin.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                        settlement.origin.done.should.be.true;
                        settlement.target.nonce._bn.should.eq.BN(payment.recipient.nonce._bn);
                        settlement.target.wallet.should.equal(utils.getAddress(payment.recipient.wallet));
                        settlement.target.done.should.be.false;

                        (await ethersDriipSettlementState.maxNonceByWalletAndCurrency(
                                payment.sender.wallet, payment.currency)
                        )._bn.should.eq.BN(payment.sender.nonce._bn);

                        (await ethersDriipSettlementChallengeState._terminateProposalsCount())
                            ._bn.should.eq.BN(1);

                        const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                        proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                        proposal.currency.ct.should.equal(payment.currency.ct);
                        proposal.currency.id._bn.should.eq.BN(payment.currency.id._bn);
                        proposal.terminated.should.be.true;
                    });
                });

                describe('if wallet has already settled this payment', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementState.completeSettlementParty(
                            payment.sender.wallet, payment.sender.nonce, mocks.settlementRoles.indexOf('Origin'), true
                        );
                    });

                    it('should revert', async () => {
                        ethersDriipSettlementByPayment.settlePaymentByProxy(payment.sender.wallet, payment, 'ERCXYZ', {gasLimit: 5e6}).should.be.rejected;
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
