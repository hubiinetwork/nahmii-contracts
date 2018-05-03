const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const utils = require('ethers').utils;
const ethutil = require('ethereumjs-util');
const keccak256 = require("augmented-keccak256");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const hasher = keccak256.create();

const liquidityRoles = ['Maker', 'Taker'];

module.exports = (glob) => {
    describe('Exchange', () => {
        let truffleExchange, ethersExchange;
        let truffleConfiguration, ethersConfiguration;
        let provider;
        let blockNumber0, blockNumber10;

        before(async () => {
            truffleExchange = glob.web3Exchange;
            ethersExchange = glob.ethersIoExchange;
            truffleConfiguration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;
            provider = glob.signer_owner.provider;

            await ethersExchange.changeConfiguration(ethersConfiguration.address);
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await truffleExchange.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized at construction time', async () => {
                const owner = await truffleExchange.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('operationalMode()', () => {
            it('should equal value initialized', async () => {
                const operationalMode = await truffleExchange.operationalMode.call();
                operationalMode.toNumber().should.equal(0);
            });
        });

        describe('fraudulentTrade()', () => {
            it('should equal value initialized', async () => {
                const fraudulentTrade = await ethersExchange.fraudulentTrade();
                fraudulentTrade[0].toNumber().should.equal(0); // Nonce
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await truffleExchange.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleExchange.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await truffleExchange.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    truffleExchange.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersExchange.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await truffleExchange.configuration.call();
                });

                afterEach(async () => {
                    await truffleExchange.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleExchange.changeConfiguration('0x0123456789abcdef0123456789abcdef01234567');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await truffleExchange.configuration();
                    configuration.should.equal('0x0123456789abcdef0123456789abcdef01234567');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    truffleExchange.changeConfiguration('0x0123456789abcdef0123456789abcdef01234567', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                const result = await ethersExchange.isSeizedWallet('0x000000000000000000000000000000000000000a');
                result.should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersExchange.seizedWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('seizedWallets()', () => {
            it('should equal value initialized', async () => {
                ethersExchange.seizedWallets(0).should.be.rejected;
            })
        });

        describe('challengeFraudulentDealByTrade()', () => {
            let trade, overrideOptions, topic, filter;

            beforeEach(async () => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setTradeMakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.001', 18), [], [], overrideOptions);
                await ethersConfiguration.setTradeMakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0001', 18), overrideOptions);
                await ethersConfiguration.setTradeTakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [1], [utils.parseUnits('0.1', 18)], overrideOptions);
                await ethersConfiguration.setTradeTakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);

                trade = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    rate: utils.bigNumberify(1000),
                    currencies: {
                        intended: '0x0000000000000000000000000000000000000001',
                        conjugate: '0x0000000000000000000000000000000000000002'
                    },
                    buyer: {
                        _address: '0x000000000000000000000000000000000000000a',
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('1000', 18),
                            residuals: {
                                current: utils.parseUnits('400', 18),
                                previous: utils.parseUnits('500', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('9599.9', 18),
                                previous: utils.parseUnits('9500', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('9.4', 18),
                                previous: utils.parseUnits('9.5', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0', 18)
                        }
                    },
                    seller: {
                        _address: '0x000000000000000000000000000000000000000b',
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('1000', 18),
                            residuals: {
                                current: utils.parseUnits('600', 18),
                                previous: utils.parseUnits('700', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('19500', 18),
                                previous: utils.parseUnits('19600', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('19.4998', 18),
                                previous: utils.parseUnits('19.4', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.0', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        }
                    },
                    transfers: {
                        intended: {
                            single: utils.parseUnits('100', 18),
                            net: utils.parseUnits('100', 18)
                        },
                        conjugate: {
                            single: utils.parseUnits('0.1', 18),
                            net: utils.parseUnits('0.1', 18)
                        }
                    },
                    singleFees: {
                        intended: utils.parseUnits('0.1', 18),
                        conjugate: utils.parseUnits('0.0002', 18)
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                const hash = hashTrade(trade);
                trade.seal = {
                    hash: hash,
                    signature: fromRpcSig(await web3.eth.sign(glob.owner, hash))
                };

                topic = ethersExchange.interface.events.ChallengeFraudulentDealByTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            it('should revert if trade is genuine', async () => {
                return ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions).should.be.rejected;
            });

            describe    ('if hash differs from calculated', () => {
                beforeEach(() => {
                    trade.seal.hash = utils.id('some non-existent hash');
                });

                it('should record fraudulent trade, toggle operational mode and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.false;
                    seizedSeller.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer address equals seller address', () => {
                beforeEach(async () => {
                    trade.buyer._address = trade.seller._address;
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer address equals owner address', () => {
                beforeEach(async () => {
                    trade.buyer._address = glob.owner;
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s current intended balance field differs from calculated', () => {
                beforeEach(async () => {
                    trade.buyer.balances.intended.current = utils.bigNumberify(0);
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s current conjugate balance field differs from calculated', () => {
                beforeEach(async () => {
                    trade.buyer.balances.conjugate.current = utils.bigNumberify(0);
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s order\'s amount is smaller than its current residual', () => {
                beforeEach(async () => {
                    trade.buyer.order.residuals.current = trade.buyer.order.residuals.current.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s order\'s amount is smaller than its previous residual', () => {
                beforeEach(async () => {
                    trade.buyer.order.residuals.previous = trade.buyer.order.residuals.previous.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if buyer\'s order\'s previous residual is smaller than its current residual', () => {
                beforeEach(async () => {
                    trade.buyer.order.residuals.current = trade.buyer.order.residuals.previous.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (buyer\'s) maker fee is greater than the nominal maker fee', () => {
                beforeEach(async () => {
                    trade.singleFees.intended = trade.singleFees.intended.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (buyer\'s) maker fee is different than provided by Configuration contract', () => {
                beforeEach(async () => {
                    trade.singleFees.intended = trade.singleFees.intended.mul(utils.bigNumberify(90)).div(utils.bigNumberify(100));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (buyer\'s) maker fee is smaller than the minimum maker fee', () => {
                beforeEach(async () => {
                    trade.singleFees.intended = trade.singleFees.intended.div(utils.bigNumberify(100));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedBuyer.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller address equals owner address', () => {
                beforeEach(async () => {
                    trade.seller._address = glob.owner;
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s current intended balance field differs from calculated', () => {
                beforeEach(async () => {
                    trade.seller.balances.intended.current = utils.bigNumberify(0);
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s current conjugate balance field differs from calculated', () => {
                beforeEach(async () => {
                    trade.seller.balances.conjugate.current = utils.bigNumberify(0);
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s order\'s amount is smaller than its current residual', () => {
                beforeEach(async () => {
                    trade.seller.order.residuals.current = trade.seller.order.residuals.current.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s order\'s amount is smaller than its previous residual', () => {
                beforeEach(async () => {
                    trade.seller.order.residuals.previous = trade.seller.order.residuals.previous.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if seller\'s order\'s previous residual is smaller than its current residual', () => {
                beforeEach(async () => {
                    trade.seller.order.residuals.current = trade.seller.order.residuals.previous.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (seller\'s) taker fee is greater than the nominal taker fee', () => {
                beforeEach(async () => {
                    trade.singleFees.conjugate = trade.singleFees.conjugate.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (seller\'s) taker fee is different than provided by Configuration contract', () => {
                beforeEach(async () => {
                    trade.singleFees.conjugate = trade.singleFees.conjugate.mul(utils.bigNumberify(90)).div(utils.bigNumberify(100));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (seller\'s) taker fee is smaller than the minimum taker fee', () => {
                beforeEach(async () => {
                    trade.singleFees.conjugate = trade.singleFees.conjugate.div(utils.bigNumberify(100));
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedSeller.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeFraudulentDealByPayment()', () => {
            let payment, overrideOptions, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setPaymentFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [], [], overrideOptions);
                await ethersConfiguration.setPaymentMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);

                payment = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    currency: '0x0000000000000000000000000000000000000001',
                    source: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('9399.8', 18),
                            previous: utils.parseUnits('9500', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    destination: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('19700', 18),
                            previous: utils.parseUnits('19600', 18)
                        },
                        netFee: utils.parseUnits('0.0', 18)
                    },
                    transfers: {
                        single: utils.parseUnits('100', 18),
                        net: utils.parseUnits('100', 18)
                    },
                    singleFee: utils.parseUnits('0.2', 18),
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                const hash = hashPayment(payment);
                payment.seals = {
                    party: {
                        hash: hash,
                        signature: fromRpcSig(await web3.eth.sign(glob.user_a, hash))
                    },
                    exchange: {
                        hash: hash,
                        signature: fromRpcSig(await web3.eth.sign(glob.owner, hash))
                    }
                };

                topic = ethersExchange.interface.events.ChallengeFraudulentDealByPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            it('should revert if payment is genuine', async () => {
                ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions).should.be.rejected;
            });

            describe('if not signed by owner', () => {
                beforeEach(() => {
                    payment.seals.exchange.signature = payment.seals.party.signature;
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, seizedDestination, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        ethersExchange.isSeizedWallet(payment.destination._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.false;
                    seizedDestination.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if not signed by source party', () => {
                beforeEach(() => {
                    payment.seals.party.signature = payment.seals.exchange.signature;
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, seizedDestination, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        ethersExchange.isSeizedWallet(payment.destination._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.false;
                    seizedDestination.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if party hash differs from calculated', () => {
                beforeEach(() => {
                    payment.seals.party.hash = utils.id('some non-existent hash');
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, seizedDestination, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        ethersExchange.isSeizedWallet(payment.destination._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.false;
                    seizedDestination.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if exchange hash differs from calculated', () => {
                beforeEach(() => {
                    payment.seals.exchange.hash = utils.id('some non-existent hash');
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, seizedDestination, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        ethersExchange.isSeizedWallet(payment.destination._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.false;
                    seizedDestination.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if source address equals destination address', () => {
                beforeEach(async () => {
                    payment.source._address = payment.destination._address;
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if source\'s current intended balance field differs from calculated', () => {
                beforeEach(async () => {
                    payment.source.balances.current = utils.bigNumberify(0);
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (source\'s) payment fee is greater than the nominal payment fee', () => {
                beforeEach(async () => {
                    payment.singleFee = payment.singleFee.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (source\'s) payment fee is different than provided by Configuration contract', () => {
                beforeEach(async () => {
                    payment.singleFee = payment.singleFee.mul(utils.bigNumberify(90)).div(utils.bigNumberify(100));
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (source\'s) payment fee is smaller than the minimum payment fee', () => {
                beforeEach(async () => {
                    payment.singleFee = payment.singleFee.div(utils.bigNumberify(100));
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if destination\'s current intended balance field differs from calculated', () => {
                beforeEach(async () => {
                    payment.destination.balances.current = utils.bigNumberify(0);
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalMode, fraudulentPayment, seizedSource, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentPayment(),
                        ethersExchange.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedSource.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeFraudulentDealBySuccessiveTrades()', () => {
            let overrideOptions, firstTrade, lastTrade, currency, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                currency = '0x0000000000000000000000000000000000000001';
            });

            beforeEach(async () => {
                firstTrade = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    rate: utils.bigNumberify(1000),
                    currencies: {
                        intended: '0x0000000000000000000000000000000000000001',
                        conjugate: '0x0000000000000000000000000000000000000002'
                    },
                    buyer: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('100', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('9599.9', 18),
                                previous: utils.parseUnits('9500', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('9.4', 18),
                                previous: utils.parseUnits('9.5', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0', 18)
                        }
                    },
                    seller: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('100', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('19500', 18),
                                previous: utils.parseUnits('19600', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('19.4998', 18),
                                previous: utils.parseUnits('19.4', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        }
                    },
                    transfers: {
                        intended: {
                            single: utils.parseUnits('100', 18),
                            net: utils.parseUnits('100', 18)
                        },
                        conjugate: {
                            single: utils.parseUnits('0.1', 18),
                            net: utils.parseUnits('0.1', 18)
                        }
                    },
                    singleFees: {
                        intended: utils.parseUnits('0.1', 18),
                        conjugate: utils.parseUnits('0.0002', 18)
                    },
                    blockNumber: utils.bigNumberify(1234)
                };

                lastTrade = {
                    nonce: utils.bigNumberify(2),
                    immediateSettlement: true,
                    amount: utils.parseUnits('50', 18),
                    rate: utils.bigNumberify(1000),
                    currencies: {
                        intended: '0x0000000000000000000000000000000000000001',
                        conjugate: '0x0000000000000000000000000000000000000002'
                    },
                    buyer: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(3),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('50', 18),
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('50', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('19549.1', 18),
                                previous: utils.parseUnits('19500', 18),
                            },
                            conjugate: {
                                current: utils.parseUnits('19.5498', 18),
                                previous: utils.parseUnits('19.4998', 18),
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.0', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        }
                    },
                    seller: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(2),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('50', 18),
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('50', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('9549.9', 18),
                                previous: utils.parseUnits('9599.9', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('9.44995', 18),
                                previous: utils.parseUnits('9.4', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        }
                    },
                    transfers: {
                        intended: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        conjugate: {
                            single: utils.parseUnits('0.05', 18),
                            net: utils.parseUnits('-0.05', 18)
                        }
                    },
                    singleFees: {
                        intended: utils.parseUnits('0.1', 18),
                        conjugate: utils.parseUnits('0.00005', 18)
                    },
                    blockNumber: utils.bigNumberify(2345)
                };

                const firstHash = hashTrade(firstTrade);
                firstTrade.seal = {
                    hash: firstHash,
                    signature: fromRpcSig(await web3.eth.sign(glob.owner, firstHash))
                };

                const lastHash = hashTrade(lastTrade);
                lastTrade.seal = {
                    hash: lastHash,
                    signature: fromRpcSig(await web3.eth.sign(glob.owner, lastHash))
                };

                topic = ethersExchange.interface.events.ChallengeFraudulentDealBySuccessiveTradesEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    ethersExchange.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trader role\'s nonce in last trae is not incremented by 1 relative to first trade', () => {
                beforeEach(() => {
                    lastTrade.seller.nonce = firstTrade.buyer.nonce + 2;
                });

                it('should revert', async () => {
                    ethersExchange.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trader role\'s previous balance in last trade is not equal to current balance in first trade', () => {
                beforeEach(() => {
                    lastTrade.seller.balances.intended.previous = lastTrade.seller.balances.intended.current;
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSource, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(firstTrade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedSource.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if trader role\'s net fee in last trade is not incremented by single fee in last trade relative to net fee in first trade', () => {
                beforeEach(() => {
                    lastTrade.seller.netFees.intended = lastTrade.seller.netFees.intended.mul(utils.bigNumberify(2));
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersExchange.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
                    const [operationalMode, fraudulentTrade, seizedSource, logs] = await Promise.all([
                        ethersExchange.operationalMode(),
                        ethersExchange.fraudulentTrade(),
                        ethersExchange.isSeizedWallet(firstTrade.buyer._address),
                        provider.getLogs(filter)
                    ]);
                    operationalMode.should.equal(1);
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedSource.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });
    });
};

const hashTrade = (trade) => hashString(trade.nonce.toNumber());

const hashPayment = (payment) => hashString(payment.nonce.toNumber());

const hashString = (data) => {
    hasher.update(data);
    return `0x${hasher.digest()}`;
};

const fromRpcSig = (sig) => {
    sig = ethutil.fromRpcSig(sig);
    return {
        v: utils.bigNumberify(sig.v),
        r: `0x${sig.r.toString('hex')}`,
        s: `0x${sig.s.toString('hex')}`
    };
};
