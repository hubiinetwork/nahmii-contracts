const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedClientFund = artifacts.require('MockedClientFund');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByTrade', () => {
        let web3FraudChallengeByTrade, ethersFraudChallengeByTrade;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByTrade = glob.web3FraudChallengeByTrade;
            ethersFraudChallengeByTrade = glob.ethersIoFraudChallengeByTrade;

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

            await ethersFraudChallengeByTrade.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByTrade.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByTrade.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByTrade.changeSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByTrade.changeClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByTrade.address);
            await ethersConfiguration.enableServiceAction(ethersFraudChallengeByTrade.address, 'operational_mode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallengeByTrade.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallengeByTrade.operator.call()).should.equal(glob.owner);
            });
        });

        describe('changeDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTrade.changeDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.changeDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeDeployerEvent');

                    (await web3FraudChallengeByTrade.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.changeDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTrade.changeOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.changeOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOperatorEvent');

                    (await web3FraudChallengeByTrade.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.changeDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByTrade.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeByTrade.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTrade.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByTrade.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByTrade.configuration();
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
                    configuration = await web3FraudChallengeByTrade.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTrade.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByTrade.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByTrade.validator();
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
                    validator = await web3FraudChallengeByTrade.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTrade.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByTrade.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallengeByTrade.clientFund();
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
                    clientFund = await web3FraudChallengeByTrade.clientFund.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByTrade.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.changeClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await web3FraudChallengeByTrade.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challenge()', () => {
            let trade, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration._reset(overrideOptions);
                await ethersFraudChallenge._reset(overrideOptions);
                await ethersValidator._reset(overrideOptions);
                await ethersClientFund._reset(overrideOptions);

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByTrade.interface.events.ChallengeByTradeEvent.topics
                );
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTrade.challenge(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is genuine', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTrade.challenge(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                    trade = await mocks.mockTrade(glob.user_a, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTrade.challenge(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade buyer fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeBuyerFee(false);
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeByTrade.challenge(trade, overrideOptions);

                    const [operationalModeExit, fraudulentTradeHashesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersClientFund.seizedWalletsCount(),
                        ethersClientFund.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(trade.buyer.wallet);
                    seizure.source.should.equal(trade.buyer.wallet);
                    seizure.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if trade seller fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSellerFee(false);
                });

                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByTrade.challenge(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTradeHashesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersClientFund.seizedWalletsCount(),
                        ethersClientFund.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(trade.seller.wallet);
                    seizure.source.should.equal(trade.seller.wallet);
                    seizure.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if trade buyer is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeBuyer(false);
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and reward', async () => {
                    await ethersFraudChallengeByTrade.challenge(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTradeHashesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersClientFund.seizedWalletsCount(),
                        ethersClientFund.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(trade.buyer.wallet);
                    seizure.source.should.equal(trade.buyer.wallet);
                    seizure.target.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if trade seller is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeller(false);
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByTrade.challenge(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTradeHashesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradeHashesCount(),
                        ethersClientFund.seizedWalletsCount(),
                        ethersClientFund.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradeHashesCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(trade.seller.wallet);
                    seizure.source.should.equal(trade.seller.wallet);
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

