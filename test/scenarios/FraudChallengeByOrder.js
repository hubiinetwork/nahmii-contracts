const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedFraudChallenge = artifacts.require("MockedFraudChallenge");
const MockedConfiguration = artifacts.require("MockedConfiguration");
const MockedValidator = artifacts.require("MockedValidator");
const MockedSecurityBond = artifacts.require("MockedSecurityBond");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByOrder', () => {
        let web3FraudChallengeByOrder, ethersFraudChallengeByOrder;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByOrder = glob.web3FraudChallengeByOrder;
            ethersFraudChallengeByOrder = glob.ethersIoFraudChallengeByOrder;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner, glob.web3AccessorManager.address);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3AccessorManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            await ethersFraudChallengeByOrder.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByOrder.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByOrder.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByOrder.changeSecurityBond(ethersSecurityBond.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByOrder.address);
            await ethersConfiguration.enableServiceAction(ethersFraudChallengeByOrder.address, 'operational_mode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallengeByOrder.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized', async () => {
                const owner = await ethersFraudChallengeByOrder.owner();
                owner.should.equal(utils.getAddress(glob.owner));
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByOrder.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByOrder.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
                    const owner = await web3FraudChallengeByOrder.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByOrder.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByOrder.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByOrder.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByOrder.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByOrder.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByOrder.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByOrder.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByOrder.configuration();
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
                    configuration = await web3FraudChallengeByOrder.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByOrder.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByOrder.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByOrder.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByOrder.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByOrder.validator();
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
                    validator = await web3FraudChallengeByOrder.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByOrder.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByOrder.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByOrder.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByOrder.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallengeByOrder.securityBond();
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
                    securityBond = await web3FraudChallengeByOrder.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByOrder.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByOrder.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3FraudChallengeByOrder.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByOrder.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let order, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                await ethersConfiguration.setFalseWalletSignatureStake(utils.bigNumberify(1000), mocks.address0, utils.bigNumberify(0));
            });

            beforeEach(async () => {
                await ethersConfiguration.reset(overrideOptions);
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersSecurityBond.reset(overrideOptions);

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByOrder.interface.events.ChallengeByOrderEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByOrder.challenge(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is genuine', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByOrder.challenge(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not sealed by exchange', () => {
                beforeEach(async () => {
                    ethersValidator.setGenuineOrderExchangeSeal(false);
                    order = await mocks.mockOrder(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByOrder.challenge(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order is not properly hashed by wallet', () => {
                beforeEach(async () => {
                    ethersValidator.setGenuineOrderWalletHash(false);
                    order = await mocks.mockOrder(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByOrder.challenge(order, overrideOptions).should.be.rejected;
                });
            });

            describe('if order wallet signature is fraudulent', () => {
                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    order.seals.wallet.signature = await mocks.createWeb3Signer(glob.user_a)(order.seals.wallet.hash);
                    order.seals.exchange.hash = mocks.hashOrderAsExchange(order);
                    order.seals.exchange.signature = await mocks.createWeb3Signer(glob.owner)(order.seals.exchange.hash);
                });

                it('should set operational mode exit, store fraudulent order and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByOrder.challenge(order, overrideOptions);
                    const [operationalModeExit, fraudulentOrdersCount, stagesCount, stage, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentOrdersCount(),
                        ethersSecurityBond.stagesCount(),
                        ethersSecurityBond.stages(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentOrdersCount.eq(1).should.be.true;
                    stagesCount.eq(1).should.be.true;
                    stage.wallet.should.equal(utils.getAddress(glob.owner));
                    stage.figure.currency.ct.should.equal(mocks.address0);
                    stage.figure.currency.id.should.deep.equal(utils.bigNumberify(0));
                    stage.figure.amount.eq(utils.bigNumberify(1000)).should.be.true;
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

