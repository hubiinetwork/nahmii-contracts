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
    describe('DealSettlementChallenger', () => {
        let web3DealSettlementChallenger, ethersDealSettlementChallenger;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let blockNumber0, blockNumber10, blockNumber20, blockNumber30;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3DealSettlementChallenger = glob.web3DealSettlementChallenger;
            ethersDealSettlementChallenger = glob.ethersIoDealSettlementChallenger;
            web3Configuration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;
            web3CancelOrdersChallenge = glob.web3CancelOrdersChallenge;
            ethersCancelOrdersChallenge = glob.ethersIoCancelOrdersChallenge;

            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersConfiguration.setUnchallengeOrderCandidateByTradeStake(mocks.address0, 1000);

            await ethersDealSettlementChallenger.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersDealSettlementChallenger.changeConfiguration(ethersConfiguration.address);
            await ethersDealSettlementChallenger.changeValidator(ethersValidator.address);
            await ethersDealSettlementChallenger.changeSecurityBond(ethersSecurityBond.address);
        });

        beforeEach(async () => {
            // Default configuration timeouts for all tests. Particular tests override these defaults.
            await ethersConfiguration.setCancelOrderChallengeTimeout(1e3);
            await ethersConfiguration.setDealSettlementChallengeTimeout(1e4);

            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
            blockNumber30 = blockNumber0 + 30;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3DealSettlementChallenger.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersDealSettlementChallenger.configuration();
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
                    configuration = await web3DealSettlementChallenger.configuration.call();
                });

                afterEach(async () => {
                    await web3DealSettlementChallenger.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DealSettlementChallenger.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3DealSettlementChallenger.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DealSettlementChallenger.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersDealSettlementChallenger.validator();
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
                    validator = await web3DealSettlementChallenger.validator.call();
                });

                afterEach(async () => {
                    await web3DealSettlementChallenger.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DealSettlementChallenger.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3DealSettlementChallenger.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DealSettlementChallenger.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersDealSettlementChallenger.securityBond();
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
                    securityBond = await web3DealSettlementChallenger.securityBond.call();
                });

                afterEach(async () => {
                    await web3DealSettlementChallenger.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DealSettlementChallenger.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3DealSettlementChallenger.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DealSettlementChallenger.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                const cancelOrdersChallenge = await ethersDealSettlementChallenger.cancelOrdersChallenge();
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
                    cancelOrdersChallenge = await web3DealSettlementChallenger.cancelOrdersChallenge.call();
                });

                afterEach(async () => {
                    await web3DealSettlementChallenger.changeCancelOrdersChallenge(cancelOrdersChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3DealSettlementChallenger.changeCancelOrdersChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCancelOrdersChallengeEvent');
                    const cancelOrdersChallenge = await web3DealSettlementChallenger.cancelOrdersChallenge();
                    utils.getAddress(cancelOrdersChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3DealSettlementChallenger.changeCancelOrdersChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};
