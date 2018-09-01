const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedValidator = artifacts.require("MockedValidator");
const MockedSecurityBond = artifacts.require("MockedSecurityBond");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('DriipSettlementDispute', () => {
        let web3DriipSettlementDispute, ethersDriipSettlementDispute;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3DriipSettlementChallenge, ethersDriipSettlementChallenge;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let blockNumber0, blockNumber10, blockNumber20, blockNumber30;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3DriipSettlementDispute = glob.web3DriipSettlementDispute;
            ethersDriipSettlementDispute = glob.ethersIoDriipSettlementDispute;
            web3Configuration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;
            web3DriipSettlementChallenge = glob.web3DriipSettlementChallenge;
            ethersDriipSettlementChallenge = glob.ethersIoDriipSettlementChallenge;
            web3FraudChallenge = glob.web3FraudChallenge;
            ethersFraudChallenge = glob.ethersIoFraudChallenge;
            web3CancelOrdersChallenge = glob.web3CancelOrdersChallenge;
            ethersCancelOrdersChallenge = glob.ethersIoCancelOrdersChallenge;

            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersConfiguration.setUnchallengeOrderCandidateByTradeStake(1000, mocks.address0, utils.bigNumberify(0));

            await ethersDriipSettlementDispute.changeDriipSettlementChallenge(ethersDriipSettlementChallenge.address);
            await ethersDriipSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersDriipSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersDriipSettlementDispute.changeConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementDispute.changeValidator(ethersValidator.address);
            await ethersDriipSettlementDispute.changeSecurityBond(ethersSecurityBond.address);
        });

        beforeEach(async () => {
            // Default configuration timeouts for all tests. Particular tests override these defaults.
            await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
            await ethersConfiguration.setDriipSettlementChallengeTimeout(1e4);

            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
            blockNumber30 = blockNumber0 + 30;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3DriipSettlementDispute.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersDriipSettlementDispute.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3DriipSettlementDispute.configuration.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementDispute.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3DriipSettlementDispute.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersDriipSettlementDispute.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3DriipSettlementDispute.validator.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementDispute.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3DriipSettlementDispute.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersDriipSettlementDispute.securityBond();
                securityBond.should.equal(utils.getAddress(ethersSecurityBond.address));
            });
        });

        describe('changeSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let securityBond;

                beforeEach(async () => {
                    securityBond = await web3DriipSettlementDispute.securityBond.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementDispute.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3DriipSettlementDispute.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallenge()', () => {
            it('should equal value initialized', async () => {
                const driipSettlementChallenge = await ethersDriipSettlementDispute.driipSettlementChallenge();
                driipSettlementChallenge.should.equal(utils.getAddress(ethersDriipSettlementChallenge.address));
            });
        });

        describe('changeDriipSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let driipSettlementChallenge;

                beforeEach(async () => {
                    driipSettlementChallenge = await web3DriipSettlementDispute.driipSettlementChallenge.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementDispute.changeDriipSettlementChallenge(driipSettlementChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeDriipSettlementChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDriipSettlementChallengeEvent');
                    const driipSettlementChallenge = await web3DriipSettlementDispute.driipSettlementChallenge();
                    utils.getAddress(driipSettlementChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeDriipSettlementChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersDriipSettlementDispute.fraudChallenge();
                fraudChallenge.should.equal(utils.getAddress(ethersFraudChallenge.address));
            });
        });

        describe('changeFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let fraudChallenge;

                beforeEach(async () => {
                    fraudChallenge = await web3DriipSettlementDispute.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementDispute.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3DriipSettlementDispute.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                const cancelOrdersChallenge = await ethersDriipSettlementDispute.cancelOrdersChallenge();
                cancelOrdersChallenge.should.equal(utils.getAddress(ethersCancelOrdersChallenge.address));
            });
        });

        describe('changeCancelOrdersChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let cancelOrdersChallenge;

                beforeEach(async () => {
                    cancelOrdersChallenge = await web3DriipSettlementDispute.cancelOrdersChallenge.call();
                });

                afterEach(async () => {
                    await web3DriipSettlementDispute.changeCancelOrdersChallenge(cancelOrdersChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementDispute.changeCancelOrdersChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCancelOrdersChallengeEvent');
                    const cancelOrdersChallenge = await web3DriipSettlementDispute.cancelOrdersChallenge();
                    utils.getAddress(cancelOrdersChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DriipSettlementDispute.changeCancelOrdersChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};
