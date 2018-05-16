const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const utils = require('ethers').utils;
const ethutil = require('ethereumjs-util');
const keccak256 = require("augmented-keccak256");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const liquidityRoles = ['Maker', 'Taker'];

module.exports = (glob) => {
    describe('FraudulentDealChallenge', () => {
        let truffleFraudulentDealChallenge, ethersFraudulentDealChallenge;
        let truffleConfiguration, ethersConfiguration;
        let provider;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            truffleFraudulentDealChallenge = glob.web3FraudulentDealChallenge;
            ethersFraudulentDealChallenge = glob.ethersIoFraudulentDealChallenge;
            truffleConfiguration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;

            provider = glob.signer_owner.provider;

            await ethersFraudulentDealChallenge.changeConfiguration(ethersConfiguration.address);
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await truffleFraudulentDealChallenge.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized at construction time', async () => {
                const owner = await truffleFraudulentDealChallenge.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('fraudulentTrade()', () => {
            it('should equal value initialized', async () => {
                const fraudulentTrade = await ethersFraudulentDealChallenge.fraudulentTrade();
                fraudulentTrade[0].toNumber().should.equal(0); // Nonce
            });
        });

        describe('fraudulentPayment()', () => {
            it('should equal value initialized', async () => {
                const fraudulentPayment = await ethersFraudulentDealChallenge.fraudulentPayment();
                fraudulentPayment[0].toNumber().should.equal(0); // Nonce
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await truffleFraudulentDealChallenge.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleFraudulentDealChallenge.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await truffleFraudulentDealChallenge.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    truffleFraudulentDealChallenge.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudulentDealChallenge.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await truffleFraudulentDealChallenge.configuration.call();
                });

                afterEach(async () => {
                    await truffleFraudulentDealChallenge.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleFraudulentDealChallenge.changeConfiguration('0x0123456789abcdef0123456789abcdef01234567');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await truffleFraudulentDealChallenge.configuration();
                    configuration.should.equal('0x0123456789abcdef0123456789abcdef01234567');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    truffleFraudulentDealChallenge.changeConfiguration('0x0123456789abcdef0123456789abcdef01234567', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeCommunityVote()', () => {
            describe('if called with owner as sender', () => {
                let communityVote;

                beforeEach(async () => {
                    communityVote = await truffleFraudulentDealChallenge.communityVote.call();
                });

                afterEach(async () => {
                    await truffleFraudulentDealChallenge.changeCommunityVote(communityVote);
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleFraudulentDealChallenge.changeCommunityVote('0x0123456789abcdef0123456789abcdef01234567');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCommunityVoteEvent');
                    const communityVote = await truffleFraudulentDealChallenge.communityVote();
                    communityVote.should.equal('0x0123456789abcdef0123456789abcdef01234567');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    truffleFraudulentDealChallenge.changeCommunityVote('0x0123456789abcdef0123456789abcdef01234567', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                const result = await ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a);
                result.should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudulentDealChallenge.seizedWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('seizedWallets()', () => {
            it('should equal value initialized', async () => {
                ethersFraudulentDealChallenge.seizedWallets(0).should.be.rejected;
            })
        });

        describe('challengeFraudulentDealByTrade()', () => {
            let trade, overrideOptions, topic, filter;

            beforeEach(async () => {
                overrideOptions = {gasLimit: 2e6};
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
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
                            },
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
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
                            },
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

                trade = await augmentTradeSeal(trade, glob.owner);

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if trade is genuine', () => {
                it('should revert', async () => {
                    return ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if hash differs from calculated', () => {
                beforeEach(() => {
                    trade.seal.hash = utils.id('some non-existent hash');
                });

                it('should record fraudulent trade, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_b),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_b),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.owner),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedSeller, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.seller._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
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
                        _address: glob.user_c,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('9399.8', 18),
                            previous: utils.parseUnits('9500', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    destination: {
                        _address: glob.user_d,
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

                payment = await augmentPaymentSeals(payment, glob.user_c, glob.owner);

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if payment it genuine', () => {
                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by owner', () => {
                beforeEach(() => {
                    payment.seals.exchange.signature = payment.seals.party.signature;
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizedDestination, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_c),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_d),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.false;
                    seizedDestination.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if not signed by source party', () => {
                beforeEach(() => {
                    payment.seals.party.signature = payment.seals.exchange.signature;
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizedDestination, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_c),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_d),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.false;
                    seizedDestination.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if party hash differs from calculated', () => {
                beforeEach(() => {
                    payment.seals.party.hash = utils.id('some non-existent hash');
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizedDestination, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_c),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_d),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.false;
                    seizedDestination.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if exchange hash differs from calculated', () => {
                beforeEach(() => {
                    payment.seals.exchange.hash = utils.id('some non-existent hash');
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizedDestination, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_c),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_d),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.false;
                    seizedDestination.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if source address equals destination address', () => {
                beforeEach(async () => {
                    payment.source._address = payment.destination._address;
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if source\'s current intended balance field differs from calculated', () => {
                beforeEach(async () => {
                    payment.source.balances.current = utils.bigNumberify(0);
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (source\'s) payment fee is greater than the nominal payment fee', () => {
                beforeEach(async () => {
                    payment.singleFee = payment.singleFee.mul(utils.bigNumberify(10));
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (source\'s) payment fee is different than provided by Configuration contract', () => {
                beforeEach(async () => {
                    payment.singleFee = payment.singleFee.mul(utils.bigNumberify(90)).div(utils.bigNumberify(100));
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (source\'s) payment fee is smaller than the minimum payment fee', () => {
                beforeEach(async () => {
                    payment.singleFee = payment.singleFee.div(utils.bigNumberify(100));
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if destination\'s current intended balance field differs from calculated', () => {
                beforeEach(async () => {
                    payment.destination.balances.current = utils.bigNumberify(0);
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.source._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
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
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
                            },
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
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
                            },
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
                    blockNumber: utils.bigNumberify(blockNumber10)
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
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
                            },
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
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
                            },
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                firstTrade = await augmentTradeSeal(firstTrade, glob.owner);
                lastTrade = await augmentTradeSeal(lastTrade, glob.owner);

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealBySuccessiveTradesEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in last trade is not incremented by 1 relative to first trade', () => {
                beforeEach(() => {
                    lastTrade.seller.nonce = firstTrade.buyer.nonce + 2;
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous balance in last trade is not equal to current balance in first trade', () => {
                beforeEach(() => {
                    lastTrade.seller.balances.intended.previous = lastTrade.seller.balances.intended.current;
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if trade party\'s net fee in last trade is not incremented by single fee in last trade relative to net fee in first trade', () => {
                beforeEach(() => {
                    lastTrade.seller.netFees.intended = lastTrade.seller.netFees.intended.mul(utils.bigNumberify(2));
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeFraudulentDealBySuccessivePayments()', () => {
            let overrideOptions, firstPayment, lastPayment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                firstPayment = {
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

                lastPayment = {
                    nonce: utils.bigNumberify(2),
                    immediateSettlement: true,
                    amount: utils.parseUnits('50', 18),
                    currency: '0x0000000000000000000000000000000000000001',
                    source: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(3),
                        balances: {
                            current: utils.parseUnits('19649.9', 18),
                            previous: utils.parseUnits('19700', 18)
                        },
                        netFee: utils.parseUnits('0.1', 18)
                    },
                    destination: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(2),
                        balances: {
                            current: utils.parseUnits('9449.8', 18),
                            previous: utils.parseUnits('9399.8', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    transfers: {
                        single: utils.parseUnits('50', 18),
                        net: utils.parseUnits('-50', 18)
                    },
                    singleFee: utils.parseUnits('0.1', 18),
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                firstPayment = await augmentPaymentSeals(firstPayment, glob.user_a, glob.owner);
                lastPayment = await augmentPaymentSeals(lastPayment, glob.user_b, glob.owner);

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealBySuccessivePaymentsEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if payments are genuine', () => {
                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s nonce in last payment is not incremented by 1 relative to first payment', () => {
                beforeEach(() => {
                    lastPayment.destination.nonce = firstPayment.source.nonce + 2;
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s previous balance in last payment is not equal to current balance in first payment', () => {
                beforeEach(() => {
                    lastPayment.destination.balances.previous = lastPayment.destination.balances.current;
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(lastPayment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if payment party\'s net fee in last payment is not incremented by single fee in last payment relative to net fee in first payment', () => {
                beforeEach(() => {
                    lastPayment.destination.netFee = lastPayment.destination.netFee.mul(utils.bigNumberify(2));
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(lastPayment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeFraudulentDealByPaymentSucceedingTrade()', () => {
            let overrideOptions, currency, trade, payment, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                currency = '0x0000000000000000000000000000000000000001';
            });

            beforeEach(async () => {
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
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
                            },
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
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
                            },
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                payment = {
                    nonce: utils.bigNumberify(2),
                    immediateSettlement: true,
                    amount: utils.parseUnits('50', 18),
                    currency: '0x0000000000000000000000000000000000000001',
                    source: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(3),
                        balances: {
                            current: utils.parseUnits('19500', 18),
                            previous: utils.parseUnits('19500', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    destination: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(2),
                        balances: {
                            current: utils.parseUnits('9649.9', 18),
                            previous: utils.parseUnits('9599.9', 18)
                        },
                        netFee: utils.parseUnits('0.1', 18)
                    },
                    transfers: {
                        single: utils.parseUnits('50', 18),
                        net: utils.parseUnits('-50', 18)
                    },
                    singleFee: utils.parseUnits('0.1', 18),
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                trade = await augmentTradeSeal(trade, glob.owner);
                payment = await augmentPaymentSeals(payment, glob.user_b, glob.owner);

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByPaymentSucceedingTradeEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trade and payment are genuine', () => {
                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s nonce in payment is not incremented by 1 relative to trade', () => {
                beforeEach(() => {
                    payment.destination.nonce = trade.buyer.nonce + 2;
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s previous balance in payment is not equal to current balance in trade', () => {
                beforeEach(() => {
                    payment.destination.balances.previous = payment.destination.balances.current;
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if payment party\'s net fee in payment is not incremented by single fee in payment relative to net fee in trade', () => {
                beforeEach(() => {
                    payment.destination.netFee = payment.destination.netFee.mul(utils.bigNumberify(2));
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeFraudulentDealByTradeSucceedingPayment()', () => {
            let overrideOptions, currency, payment, trade, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                currency = '0x0000000000000000000000000000000000000001';
            });

            beforeEach(async () => {
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

                trade = {
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
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
                            },
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('50', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('19749.9', 18),
                                previous: utils.parseUnits('19700', 18),
                            },
                            conjugate: {
                                current: utils.parseUnits('19.4998', 18),
                                previous: utils.parseUnits('19.5498', 18),
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0', 18)
                        }
                    },
                    seller: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(2),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('50', 18),
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
                            },
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('50', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('9349.8', 18),
                                previous: utils.parseUnits('9399.8', 18),
                            },
                            conjugate: {
                                current: utils.parseUnits('9.49990', 18),
                                previous: utils.parseUnits('9.44995', 18),
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.2', 18),
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
                            net: utils.parseUnits('0.05', 18)
                        }
                    },
                    singleFees: {
                        intended: utils.parseUnits('0.1', 18),
                        conjugate: utils.parseUnits('0.00005', 18)
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                payment = await augmentPaymentSeals(payment, glob.user_a, glob.owner);
                trade = await augmentTradeSeal(trade, glob.owner);

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByTradeSucceedingPaymentEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if payment and trade are genuine', () => {
                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in trade is not incremented by 1 relative to payment', () => {
                beforeEach(() => {
                    trade.seller.nonce = payment.source.nonce + 2;
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous balance in trade is not equal to current balance in payment', () => {
                beforeEach(() => {
                    trade.seller.balances.intended.previous = trade.seller.balances.intended.current;
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if trade party\'s net fee in trade is not incremented by single fee in trade relative to net fee in payment', () => {
                beforeEach(() => {
                    trade.seller.netFees.intended = trade.seller.netFees.intended.mul(utils.bigNumberify(2));
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeFraudulentDealByTradeOrderResiduals()', () => {
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
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
                            },
                            residuals: {
                                current: utils.parseUnits('500', 18),
                                previous: utils.parseUnits('600', 18)
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
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
                            },
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
                        intended: utils.parseUnits('0.0', 18),
                        conjugate: utils.parseUnits('0.0002', 18)
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                lastTrade = {
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
                        nonce: utils.bigNumberify(2),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
                            },
                            residuals: {
                                current: utils.parseUnits('400', 18),
                                previous: utils.parseUnits('500', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('9699.8', 18),
                                previous: utils.parseUnits('9599.9', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('9.3', 18),
                                previous: utils.parseUnits('9.4', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.2', 18),
                            conjugate: utils.parseUnits('0.0', 18)
                        }
                    },
                    seller: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(2),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
                            },
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('100', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('19400', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('19.5996', 18),
                                previous: utils.parseUnits('19.4998', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.0', 18),
                            conjugate: utils.parseUnits('0.0004', 18)
                        }
                    },
                    transfers: {
                        intended: {
                            single: utils.parseUnits('100', 18),
                            net: utils.parseUnits('200', 18)
                        },
                        conjugate: {
                            single: utils.parseUnits('0.1', 18),
                            net: utils.parseUnits('0.2', 18)
                        }
                    },
                    singleFees: {
                        intended: utils.parseUnits('0.1', 18),
                        conjugate: utils.parseUnits('0.0002', 18)
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                firstTrade = await augmentTradeSeal(firstTrade, glob.owner);
                lastTrade = await augmentTradeSeal(lastTrade, glob.owner);

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByTradeOrderResidualsEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is buyer in the one trade and seller in the other trade', () => {
                beforeEach(() => {
                    lastTrade.buyer._address = firstTrade.seller._address;
                    lastTrade.seller._address = firstTrade.buyer._address;
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in last trade is not incremented by 1 relative to first trade', () => {
                beforeEach(() => {
                    lastTrade.buyer.nonce = firstTrade.buyer.nonce + 2;
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous residuals in last trade is not equal to current residuals in first trade', () => {
                beforeEach(() => {
                    lastTrade.buyer.order.residuals.previous = firstTrade.buyer.order.residuals.current.mul(utils.bigNumberify(2));
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeDoubleSpentOrders()', () => {
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
                            hashes: {
                                party: hashString('some party buy order hash at nonce 1'),
                                exchange: hashString('some exchange buy order hash at nonce 1')
                            },
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
                            hashes: {
                                party: hashString('some party sell order hash at nonce 1'),
                                exchange: hashString('some exchange sell order hash at nonce 1')
                            },
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
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                lastTrade = {
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
                        nonce: utils.bigNumberify(2),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party buy order hash at nonce 2'),
                                exchange: hashString('some exchange buy order hash at nonce 2')
                            },
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('100', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('9699.8', 18),
                                previous: utils.parseUnits('9599.9', 18),
                            },
                            conjugate: {
                                current: utils.parseUnits('9.3', 18),
                                previous: utils.parseUnits('9.4', 18),
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.2', 18),
                            conjugate: utils.parseUnits('0.0', 18)
                        }
                    },
                    seller: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(2),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party sell order hash at nonce 2'),
                                exchange: hashString('some exchange sell order hash at nonce 2')
                            },
                            residuals: {
                                current: utils.parseUnits('0', 18),
                                previous: utils.parseUnits('100', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('19400', 18),
                                previous: utils.parseUnits('19500', 18),
                            },
                            conjugate: {
                                current: utils.parseUnits('19.5996', 18),
                                previous: utils.parseUnits('19.4998', 18),
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.0', 18),
                            conjugate: utils.parseUnits('0.0004', 18)
                        }
                    },
                    transfers: {
                        intended: {
                            single: utils.parseUnits('100', 18),
                            net: utils.parseUnits('200', 18)
                        },
                        conjugate: {
                            single: utils.parseUnits('0.1', 18),
                            net: utils.parseUnits('0.2', 18)
                        }
                    },
                    singleFees: {
                        intended: utils.parseUnits('0.1', 18),
                        conjugate: utils.parseUnits('0.0002', 18)
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                firstTrade = await augmentTradeSeal(firstTrade, glob.owner);
                lastTrade = await augmentTradeSeal(lastTrade, glob.owner);

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeDoubleSpentOrdersEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeDoubleSpentOrders(firstTrade, lastTrade, overrideOptions).should.be.rejected;
                });
            });

            describe('if first trade\'s buy order equals last trade\'s buy order', () => {
                beforeEach(() => {
                    lastTrade.buyer.order.hashes.exchange = firstTrade.buyer.order.hashes.exchange;
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeDoubleSpentOrders(firstTrade, lastTrade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if first trade\'s sell order equals last trade\'s sell order', () => {
                beforeEach(() => {
                    lastTrade.seller.order.hashes.exchange = firstTrade.seller.order.hashes.exchange;
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeDoubleSpentOrders(firstTrade, lastTrade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });
    });
};

const augmentTradeSeal = async (trade, address) => {
    const hash = hashTrade(trade);
    trade.seal = {
        hash: hash,
        signature: await sign(address, hash)
    };
    return trade;
};

const augmentPaymentSeals = async (payment, partyAddress, exchangeAddress) => {
    const partyHash = hashPaymentAsParty(payment);
    payment.seals = {
        party: {
            hash: partyHash,
            signature: await sign(partyAddress, partyHash)
        }
    };
    const exchangeHash = hashPaymentAsExchange(payment);
    payment.seals.exchange = {
        hash: exchangeHash,
        signature: await sign(exchangeAddress, exchangeHash)
    };
    return payment;
};

// const augmentOrderSeals = async (order, partyAddress, exchangeAddress) => {
//     const partyHash = hashOrderAsParty(order);
//     order.seals = {
//         party: {
//             hash: partyHash,
//             signature: await sign(partyAddress, partyHash)
//         },
//     };
//     const exchangeHash = hashOrderAsExchange(order);
//     order.seals.exchange = {
//         hash: exchangeHash,
//         signature: await sign(exchangeAddress, exchangeHash)
//     };
//     return order;
// };

const hashTrade = (trade) => {
    return hashString(
        trade.nonce.toNumber()
    );
};

const hashPaymentAsParty = (payment) => {
    return hashString(
        payment.nonce.toNumber()
    );
};

const hashPaymentAsExchange = (payment) => {
    return hashTypedItems(
        {value: toRpcSig(payment.seals.party.signature), type: 'string'}
    );
};

const hashOrderAsParty = (order) => {
    return hashString(
        order.nonce.toNumber()
    );
};

const hashOrderAsExchange = (order) => {
    return hashTypedItems(
        {value: order.placement.residuals.current.toHexString(), type: 'hex'},
        {value: order.placement.residuals.previous.toHexString(), type: 'hex'},
        {value: toRpcSig(order.seals.party.signature), type: 'string'}
    );
};

const hashString = (...data) => {
    const hasher = keccak256.create();
    data.forEach((d) => hasher.update(d));
    return `0x${hasher.digest()}`;
};

const hashTypedItems = (...data) => {
    const hasher = keccak256.create();
    data.forEach((d) => hasher.update(d.value, d.type));
    return `0x${hasher.digest()}`;
};

const sign = async (address, hash) => {
    const sig = await web3.eth.sign(address, hash);
    return fromRpcSig(sig);
};

const fromRpcSig = (sig) => {
    sig = ethutil.fromRpcSig(sig);
    return {
        v: utils.bigNumberify(sig.v),
        r: `0x${sig.r.toString('hex')}`,
        s: `0x${sig.s.toString('hex')}`
    };
};

const toRpcSig = (sig) => {
    return ethutil.toRpcSig(
        sig.v.toNumber(),
        Buffer.from(sig.r.slice(2), 'hex'),
        Buffer.from(sig.s.slice(2), 'hex')
    );
};
