const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedFraudChallenge = artifacts.require("MockedFraudChallenge");
const MockedConfiguration = artifacts.require("MockedConfiguration");
const MockedValidator = artifacts.require("MockedValidator");
const MockedClientFund = artifacts.require("MockedClientFund");
const MockedSecurityBond = artifacts.require("MockedSecurityBond");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByPayment', () => {
        let web3FraudChallengeByPayment, ethersFraudChallengeByPayment;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByPayment = glob.web3FraudChallengeByPayment;
            ethersFraudChallengeByPayment = glob.ethersIoFraudChallengeByPayment;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);

            await ethersFraudChallengeByPayment.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByPayment.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByPayment.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByPayment.changeSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByPayment.changeClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByPayment.address);
            await ethersConfiguration.enableServiceAction(ethersFraudChallengeByPayment.address, 'operational_mode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeByPayment.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByPayment.operator.call()).should.equal(glob.owner);
            });
        });

        describe('changeDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDeployerEvent');

                    (await web3FraudChallengeByPayment.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOperatorEvent');

                    (await web3FraudChallengeByPayment.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByPayment.fraudChallenge();
                fraudChallenge.should.equal(utils.getAddress(ethersFraudChallenge.address));
            });
        });

        describe('changeFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let fraudChallenge;

                beforeEach(async () => {
                    fraudChallenge = await web3FraudChallengeByPayment.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByPayment.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByPayment.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3FraudChallengeByPayment.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByPayment.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByPayment.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3FraudChallengeByPayment.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByPayment.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallengeByPayment.securityBond();
                securityBond.should.equal(utils.getAddress(ethersSecurityBond.address));
            });
        });

        describe('changeSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let securityBond;

                beforeEach(async () => {
                    securityBond = await web3FraudChallengeByPayment.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3FraudChallengeByPayment.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallengeByPayment.clientFund();
                clientFund.should.equal(utils.getAddress(ethersClientFund.address));
            });
        });

        describe('changeClientFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                let clientFund;

                beforeEach(async () => {
                    clientFund = await web3FraudChallengeByPayment.clientFund.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await web3FraudChallengeByPayment.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let payment, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                await ethersConfiguration.setFalseWalletSignatureStake(utils.bigNumberify(1000), mocks.address0, utils.bigNumberify(0));
            });

            beforeEach(async () => {
                await ethersConfiguration.reset(overrideOptions);
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersClientFund.reset(overrideOptions);
                await ethersSecurityBond.reset(overrideOptions);

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByPayment.interface.events.ChallengeByPaymentEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is genuine', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not sealed by operator', () => {
                beforeEach(async () => {
                    ethersValidator.setGenuinePaymentOperatorSeal(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not properly hashed by wallet', () => {
                beforeEach(async () => {
                    ethersValidator.setGenuinePaymentWalletHash(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challenge(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment wallet signature is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineWalletSignature(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and stage in security bond', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentsCount, stagesCount, stage, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersSecurityBond.stagesCount(),
                        ethersSecurityBond.stages(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    stagesCount.eq(1).should.be.true;
                    stage.wallet.should.equal(utils.getAddress(glob.owner));
                    stage.figure.currency.ct.should.equal(mocks.address0);
                    stage.figure.currency.id.should.deep.equal(utils.bigNumberify(0));
                    stage.figure.amount.eq(utils.bigNumberify(1000)).should.be.true;
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentFee(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentsCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(payment.sender.wallet);
                    seizure.source.should.equal(payment.sender.wallet);
                    seizure.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment sender is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSender(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentsCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(payment.sender.wallet);
                    seizure.source.should.equal(payment.sender.wallet);
                    seizure.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment recipient is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentRecipient(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challenge(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentsCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(payment.recipient.wallet);
                    seizure.source.should.equal(payment.recipient.wallet);
                    seizure.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
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

