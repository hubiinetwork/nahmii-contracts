const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('CancelOrdersChallenge', () => {
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let provider;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);

            await ethersConfiguration.registerService(glob.owner);
            await ethersConfiguration.enableServiceAction(glob.owner, 'operational_mode', {gasLimit: 1e6});
        });

        beforeEach(async () => {
            web3CancelOrdersChallenge = await CancelOrdersChallenge.new(glob.owner);
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, CancelOrdersChallenge.abi, glob.signer_owner);

            await ethersCancelOrdersChallenge.setValidator(ethersValidator.address);
            await ethersCancelOrdersChallenge.setConfiguration(ethersConfiguration.address);

            await ethersConfiguration.setCancelOrderChallengeTimeout((await provider.getBlockNumber()) + 1, 1e3);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3CancelOrdersChallenge.deployer.call()).should.equal(glob.owner);
                (await web3CancelOrdersChallenge.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await web3CancelOrdersChallenge.configuration.call())
                    .should.equal(web3Configuration.address);
            });
        });

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3CancelOrdersChallenge.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersCancelOrdersChallenge.configuration())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3CancelOrdersChallenge.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await web3CancelOrdersChallenge.validator.call())
                    .should.equal(web3Validator.address);
            });
        });

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3CancelOrdersChallenge.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersCancelOrdersChallenge.validator())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3CancelOrdersChallenge.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('cancellingWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersCancelOrdersChallenge.cancellingWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('cancelledOrdersCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersCancelOrdersChallenge.cancelledOrdersCount(
                    Wallet.createRandom().address
                ))._bn.should.eq.BN(0);
            });
        });

        describe('isOrderCancelled()', () => {
            it('should equal value initialized', async () => {
                (await ethersCancelOrdersChallenge.isOrderCancelled(
                        Wallet.createRandom().address, Wallet.createRandom().address)
                ).should.be.false;
            });
        });

        describe('cancelledOrderHashesByIndices()', () => {
            describe('before first cancellation', () => {
                it('should revert', async () => {
                    await ethersCancelOrdersChallenge.cancelledOrderHashesByIndices(
                        Wallet.createRandom().address, 0, 0
                    ).should.be.rejected;
                });
            });
        });

        describe('cancelOrders()', () => {
            let order0, order1, topic, filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 3e6});
                await ethersConfiguration._reset();

                order0 = await mocks.mockOrder(glob.owner, {
                    wallet: glob.owner
                });
                order1 = await mocks.mockOrder(glob.owner, {
                    nonce: utils.bigNumberify(2),
                    wallet: glob.owner,
                    residuals: {
                        current: utils.parseUnits('600', 18),
                        previous: utils.parseUnits('700', 18)
                    }
                });

                topic = ethersCancelOrdersChallenge.interface.events.CancelOrdersEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await web3Configuration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    web3CancelOrdersChallenge.cancelOrders([order0, order1], {gasLimit: 3e6}).should.be.rejected;
                });
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3CancelOrdersChallenge = await CancelOrdersChallenge.new(glob.owner);
                });

                it('should revert', async () => {
                    web3CancelOrdersChallenge.cancelOrders([order0, order1], {gasLimit: 3e6}).should.be.rejected;
                });
            });

            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3CancelOrdersChallenge = await CancelOrdersChallenge.new(glob.owner);
                    await web3CancelOrdersChallenge.setValidator(web3Validator.address);
                });

                it('should revert', async () => {
                    web3CancelOrdersChallenge.cancelOrders([order0, order1], {gasLimit: 3e6}).should.be.rejected;
                });
            });

            describe('if order wallet differs from msg.sender', () => {
                beforeEach(async () => {
                    order0 = await mocks.mockOrder(glob.owner, {wallet: glob.user_a});
                });

                it('should revert', async () => {
                    web3CancelOrdersChallenge.cancelOrders([order0, order1], {gasLimit: 3e6}).should.be.rejected;
                });
            });

            describe('if order is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineOrderSeals(false);
                });

                it('should revert', async () => {
                    web3CancelOrdersChallenge.cancelOrders([order0, order1], {gasLimit: 3e6}).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully cancel orders', async () => {
                    await ethersCancelOrdersChallenge.cancelOrders([order0, order1], {gasLimit: 3e6});

                    (await ethersCancelOrdersChallenge.cancelledOrdersCount(glob.owner))
                        ._bn.should.eq.BN(2);

                    const hashes = await ethersCancelOrdersChallenge.cancelledOrderHashesByIndices(glob.owner, 0, 1);
                    hashes[0].should.equal(order0.seals.operator.hash);
                    hashes[1].should.equal(order1.seals.operator.hash);
                });
            });
        });

        describe('challenge()', () => {
            let trade, topic, filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 1e6});
                await ethersConfiguration._reset();

                trade = await mocks.mockTrade(glob.owner);

                topic = ethersCancelOrdersChallenge.interface.events.ChallengeEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if operational mode is not normal', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setOperationalModeExit();
                });

                it('should revert', async () => {
                    ethersCancelOrdersChallenge.challenge(trade, trade.buyer.wallet, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersCancelOrdersChallenge.challenge(trade, trade.buyer.wallet, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if cancel order challenge timeout has expired', () => {
                it('should revert', async () => {
                    ethersCancelOrdersChallenge.challenge(trade, trade.buyer.wallet, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if order has not been cancelled', () => {
                it('should revert', async () => {
                    ethersCancelOrdersChallenge.challenge(trade, trade.buyer.wallet, {gasLimit: 1e6})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    const order = await mocks.mockOrder(glob.owner, {wallet: glob.owner});

                    await ethersCancelOrdersChallenge.cancelOrders([order], {gasLimit: 1e6});

                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            wallet: order.wallet,
                            order: {hashes: {operator: order.seals.operator.hash}}
                        }
                    });
                });

                it('should successfully accept the challenge candidate trade', async () => {
                    await ethersCancelOrdersChallenge.challenge(trade, trade.buyer.wallet, {gasLimit: 5e6});

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengePhase()', () => {
            describe('if no order has been cancelled for wallet', () => {
                it('should return value corresponding to Closed', async () => {
                    (await ethersCancelOrdersChallenge.challengePhase(Wallet.createRandom().address))
                        .should.equal(mocks.challengePhases.indexOf('Closed'));
                });
            });

            describe('if order has been cancelled for wallet', () => {
                let order;

                beforeEach(async () => {
                    order = await mocks.mockOrder(glob.owner, {wallet: glob.owner});
                });

                describe('if cancelled order challenge timeout has expired', () => {
                    beforeEach(async () => {
                        await ethersConfiguration.setCancelOrderChallengeTimeout((await provider.getBlockNumber()) + 1, 0);
                        await ethersCancelOrdersChallenge.cancelOrders([order], {gasLimit: 1e6});
                    });

                    it('should return value corresponding to Closed', async () => {
                        (await ethersCancelOrdersChallenge.challengePhase(order.wallet))
                            .should.equal(mocks.challengePhases.indexOf('Closed'));
                    });
                });

                describe('if cancelled order challenge timeout has not expired', () => {
                    beforeEach(async () => {
                        await ethersCancelOrdersChallenge.cancelOrders([order], {gasLimit: 1e6});
                    });

                    it('should return value corresponding to Dispute', async () => {
                        (await ethersCancelOrdersChallenge.challengePhase(order.wallet))
                            .should.equal(mocks.challengePhases.indexOf('Dispute'));
                    });
                });
            });
        });
    });
};
