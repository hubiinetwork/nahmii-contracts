const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementDispute = artifacts.require('NullSettlementDispute');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe.only('NullSettlementDispute', () => {
        let web3NullSettlementDispute, ethersNullSettlementDispute;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let nullSettlementChallenge;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let blockNumber0, blockNumber10, blockNumber20, blockNumber30;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3AccessorManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);

            nullSettlementChallenge = Wallet.createRandom().address;
        });

        beforeEach(async () => {
            web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
            ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

            await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
            await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersNullSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersNullSettlementDispute.changeNullSettlementChallenge(glob.owner);

            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
            blockNumber30 = blockNumber0 + 30;
        });

        describe.only('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementDispute.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementDispute.operator.call()).should.equal(glob.owner);
            });
        });

        describe.only('validator()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.validator.call())
                    .should.equal(web3Validator.address);
            })
        });

        describe.only('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.changeValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');

                    (await ethersNullSettlementDispute.validator())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe.only('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.fraudChallenge.call())
                    .should.equal(web3FraudChallenge.address);
            });
        });

        describe.only('changeFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.changeFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');

                    (await ethersNullSettlementDispute.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe.only('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.cancelOrdersChallenge.call())
                    .should.equal(web3CancelOrdersChallenge.address);
            });
        });

        describe.only('changeCancelOrdersChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.changeCancelOrdersChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCancelOrdersChallengeEvent');

                    (await ethersNullSettlementDispute.cancelOrdersChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.changeCancelOrdersChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe.only('nullSettlementChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.nullSettlementChallenge.call())
                    .should.equal(glob.owner);
            });
        });

        describe.only('changeNullSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.changeNullSettlementChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeNullSettlementChallengeEvent');

                    (await ethersNullSettlementDispute.nullSettlementChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.changeNullSettlementChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe.only('challengeByOrder()', () => {
            let order, challenger;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
                challenger = Wallet.createRandom().address;
            });

            describe.only('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe.only('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe.only('if cancel order challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe.only('if null settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                    await ethersNullSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe.only('if called from other than null settlement challenge', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                    await ethersNullSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
                    await ethersNullSettlementDispute.changeNullSettlementChallenge(Wallet.createRandom().address);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe.only('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineOrderWalletSeal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe.only('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderExchangeHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe.only('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([order.seals.exchange.hash]);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([order.seals.exchange.hash]);
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

        });

        describe('challengeByTrade()', () => {

        });

        describe('challengeByPayment()', () => {

        });
    });
};
