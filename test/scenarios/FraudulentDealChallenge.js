const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');
const mocks = require('../mocks');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;
const Wallet = ethers.Wallet;

module.exports = (glob) => {
    describe('FraudulentDealChallenge', () => {
        let web3FraudulentDealChallenge, ethersFraudulentDealChallenge;
        let web3Configuration, ethersConfiguration;
        let provider;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            web3FraudulentDealChallenge = glob.web3FraudulentDealChallenge;
            ethersFraudulentDealChallenge = glob.ethersIoFraudulentDealChallenge;
            web3Configuration = glob.web3Configuration;
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
                const owner = await web3FraudulentDealChallenge.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized at construction time', async () => {
                const owner = await web3FraudulentDealChallenge.owner.call();
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
                    await web3FraudulentDealChallenge.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudulentDealChallenge.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await web3FraudulentDealChallenge.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudulentDealChallenge.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
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
            let address;

            before(()=> {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3FraudulentDealChallenge.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudulentDealChallenge.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudulentDealChallenge.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudulentDealChallenge.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudulentDealChallenge.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeCommunityVote()', () => {
            let address;

            before(()=> {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let communityVote;

                beforeEach(async () => {
                    communityVote = await web3FraudulentDealChallenge.communityVote.call();
                });

                afterEach(async () => {
                    await web3FraudulentDealChallenge.changeCommunityVote(communityVote);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudulentDealChallenge.changeCommunityVote(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCommunityVoteEvent');
                    const communityVote = await web3FraudulentDealChallenge.communityVote();
                    utils.getAddress(communityVote).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudulentDealChallenge.changeCommunityVote(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const result = await ethersFraudulentDealChallenge.isSeizedWallet(address);
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

        describe('isDoubleSpenderWallet()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const result = await ethersFraudulentDealChallenge.isDoubleSpenderWallet(address);
                result.should.be.false;
            });
        });

        describe('doubleSpenderWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudulentDealChallenge.doubleSpenderWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('doubleSpenderWallets()', () => {
            it('should equal value initialized', async () => {
                ethersFraudulentDealChallenge.doubleSpenderWallets(0).should.be.rejected;
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

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if trade is genuine', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if hash differs from calculated', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
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
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: glob.user_a},
                        seller: {_address: glob.user_a},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, seizedBuyer, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isSeizedWallet(trade.buyer._address),
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
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {_address: glob.owner},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            balances: {
                                intended: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            balances: {
                                conjugate: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            order: {
                                residuals: {
                                    current: utils.parseUnits('4000', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            order: {
                                residuals: {
                                    previous: utils.parseUnits('5000', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        buyer: {
                            order: {
                                residuals: {
                                    previous: utils.parseUnits('300', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            intended: utils.parseUnits('1.0', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100))
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            intended: utils.parseUnits('0.001', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            address: glob.owner
                        }
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            balances: {
                                intended: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            balances: {
                                conjugate: {
                                    current: utils.bigNumberify(0)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            order: {
                                residuals: {
                                    current: utils.parseUnits('6000', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            order: {
                                residuals: {
                                    previous: utils.parseUnits('7000', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        seller: {
                            order: {
                                residuals: {
                                    previous: utils.parseUnits('500', 18)
                                }
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            conjugate: utils.parseUnits('0.002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            conjugate: utils.parseUnits('0.0002', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100))
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                    trade = await mocks.mockTrade(glob.owner, {
                        singleFees: {
                            conjugate: utils.parseUnits('0.000002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if payment it genuine', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if not signed by exchange', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    payment.seals.exchange.signature = payment.seals.wallet.signature;
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizedRecipient, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_c),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_d),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.false;
                    seizedRecipient.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if not signed by wallet', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    payment.seals.wallet.signature = payment.seals.exchange.signature;
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizedRecipient, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_c),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_d),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.false;
                    seizedRecipient.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if wallet hash differs from calculated', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    payment.seals.wallet.hash = utils.id('some non-existent hash');
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizedRecipient, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_c),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_d),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.false;
                    seizedRecipient.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if exchange hash differs from calculated', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    payment.seals.exchange.hash = utils.id('some non-existent hash');
                });

                it('should record fraudulent payment, toggle operational mode and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, seizedRecipient, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_c),
                        ethersFraudulentDealChallenge.isSeizedWallet(glob.user_d),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.false;
                    seizedRecipient.should.be.false;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if sender address equals recipient address', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        sender: {_address: glob.user_a},
                        recipient: {_address: glob.user_a},
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.sender._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if sender\'s current balance field differs from calculated', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        sender: {
                            balances: {
                                current: utils.bigNumberify(0)
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.sender._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (sender\'s) payment fee is greater than the nominal payment fee', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        singleFee: utils.parseUnits('2.0', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.sender._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (sender\'s) payment fee is different than provided by Configuration contract', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        singleFee: utils.parseUnits('0.2', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100)),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.sender._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if (sender\'s) payment fee is smaller than the minimum payment fee', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        singleFee: utils.parseUnits('0.002', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.sender._address),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
                    seizedWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if recipient\'s current balance field differs from calculated', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        recipient: {
                            balances: {
                                current: utils.bigNumberify(0)
                            }
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPayment, seizedWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentPayment(),
                        ethersFraudulentDealChallenge.isSeizedWallet(payment.recipient._address),
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
                firstTrade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    buyer: {
                        _address: glob.user_a
                    },
                    seller: {
                        _address: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealBySuccessiveTradesEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
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
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9549.8', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
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
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in last trade is not incremented by 1 relative to first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
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
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9549.8', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
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
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous balance in last trade is not equal to current balance in first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
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
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9549.8', 18),
                                    previous: utils.parseUnits('1000', 18) // <---- modified ----
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
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
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
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
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
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
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9549.8', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.4', 18), // <---- modified ----
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
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
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
                firstPayment = await mocks.mockPayment(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    sender: {
                        _address: glob.user_a
                    },
                    recipient: {
                        _address: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                lastPayment = await mocks.mockPayment(glob.owner, {
                    nonce: utils.bigNumberify(20),
                    amount: utils.parseUnits('50', 18),
                    sender: {
                        _address: glob.user_b,
                        nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                        balances: {
                            current: utils.parseUnits('19649.9', 18),
                            previous: utils.parseUnits('19700', 18)
                        },
                        netFee: utils.parseUnits('0.1', 18)
                    },
                    recipient: {
                        _address: glob.user_a,
                        nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
                        balances: {
                            current: utils.parseUnits('9449.8', 18),
                            previous: utils.parseUnits('9399.8', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    singleFee: utils.parseUnits('0.1', 18),
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealBySuccessivePaymentsEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if payments are genuine', () => {
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            _address: glob.user_b,
                            nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19649.9', 18),
                                previous: utils.parseUnits('19700', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            _address: glob.user_a,
                            nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
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
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s nonce in last payment is not incremented by 1 relative to first payment', () => {
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            _address: glob.user_b,
                            nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19649.9', 18),
                                previous: utils.parseUnits('19700', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            _address: glob.user_a,
                            nonce: firstPayment.sender.nonce.add(utils.bigNumberify(2)), // <---- modified ----
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
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s previous balance in last payment is not equal to current balance in first payment', () => {
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            _address: glob.user_b,
                            nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19649.9', 18),
                                previous: utils.parseUnits('19700', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            _address: glob.user_a,
                            nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9449.8', 18),
                                previous: utils.parseUnits('1000', 18) // <---- modified ----
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                beforeEach(async () => {
                    lastPayment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            _address: glob.user_b,
                            nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19649.9', 18),
                                previous: utils.parseUnits('19700', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            _address: glob.user_a,
                            nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9449.8', 18),
                                previous: utils.parseUnits('9399.8', 18)
                            },
                            netFee: utils.parseUnits('0.4', 18) // <---- modified ----
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                trade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    buyer: {
                        _address: glob.user_a
                    },
                    seller: {
                        _address: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByPaymentSucceedingTradeEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trade and payment are genuine', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            _address: glob.user_b,
                            nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19449.9', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            _address: glob.user_a,
                            nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9649.8', 18),
                                previous: utils.parseUnits('9599.8', 18)
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s nonce in payment is not incremented by 1 relative to trade', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            _address: glob.user_b,
                            nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19449.9', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            _address: glob.user_a,
                            nonce: trade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            balances: {
                                current: utils.parseUnits('9649.8', 18),
                                previous: utils.parseUnits('9599.8', 18)
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment party\'s previous balance in payment is not equal to current balance in trade', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            _address: glob.user_b,
                            nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19449.9', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            _address: glob.user_a,
                            nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9649.8', 18),
                                previous: utils.parseUnits('1000', 18) // <---- modified ----
                            },
                            netFee: utils.parseUnits('0.2', 18)
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        amount: utils.parseUnits('50', 18),
                        sender: {
                            _address: glob.user_b,
                            nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
                            balances: {
                                current: utils.parseUnits('19449.9', 18),
                                previous: utils.parseUnits('19500', 18)
                            },
                            netFee: utils.parseUnits('0.1', 18)
                        },
                        recipient: {
                            _address: glob.user_a,
                            nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
                            balances: {
                                current: utils.parseUnits('9649.8', 18),
                                previous: utils.parseUnits('9599.8', 18)
                            },
                            netFee: utils.parseUnits('0.4', 18) // <---- modified ----
                        },
                        transfers: {
                            single: utils.parseUnits('50', 18),
                            net: utils.parseUnits('-50', 18)
                        },
                        singleFee: utils.parseUnits('0.1', 18),
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
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
                payment = await mocks.mockPayment(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    sender: {
                        _address: glob.user_a
                    },
                    recipient: {
                        _address: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByTradeSucceedingPaymentEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if payment and trade are genuine', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_b,
                            nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19749.1', 18),
                                    previous: utils.parseUnits('19700', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_a,
                            nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9349.8', 18),
                                    previous: utils.parseUnits('9399.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
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
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in trade is not incremented by 1 relative to payment', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_b,
                            nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19749.1', 18),
                                    previous: utils.parseUnits('19700', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_a,
                            nonce: payment.sender.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9349.8', 18),
                                    previous: utils.parseUnits('9399.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
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
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous balance in trade is not equal to current balance in payment', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_b,
                            nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19749.1', 18),
                                    previous: utils.parseUnits('19700', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_a,
                            nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9349.8', 18),
                                    previous: utils.parseUnits('1000', 18) // <---- modified ----
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
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
                                net: utils.parseUnits('-0.05', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.00005', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
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
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_b,
                            nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19749.1', 18),
                                    previous: utils.parseUnits('19700', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.6496', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.1', 18),
                                conjugate: utils.parseUnits('0.0004', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_a,
                            nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('50', 18),
                                residuals: {
                                    current: utils.parseUnits('0', 18),
                                    previous: utils.parseUnits('50', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9349.8', 18),
                                    previous: utils.parseUnits('9399.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.44995', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.4', 18), // <---- modified ----
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
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
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
                firstTrade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    buyer: {
                        _address: glob.user_a
                    },
                    seller: {
                        _address: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeFraudulentDealByTradeOrderResidualsEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.buyer.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.seller.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if wallet is buyer in the one trade and seller in the other trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: firstTrade.seller._address, // <---- modified ----
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.buyer.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            _address: firstTrade.buyer._address, // <---- modified ----
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.seller.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce in last trade is not incremented by 1 relative to first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.buyer.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.seller.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeFraudulentDealByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade party\'s previous residuals in last trade is not equal to current residuals in first trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.buyer.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('100', 18) // <---- modified ----
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    wallet: firstTrade.seller.order.hashes.wallet
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeFraudulentDealByTradeOrderResiduals(firstTrade, lastTrade, lastTrade.buyer._address, currency, overrideOptions);
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
                firstTrade = await mocks.mockTrade(glob.owner, {
                    nonce: utils.bigNumberify(10),
                    buyer: {
                        _address: glob.user_a
                    },
                    seller: {
                        _address: glob.user_b
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                });

                topic = ethersFraudulentDealChallenge.interface.events.ChallengeDoubleSpentOrdersEvent.topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if trades are genuine', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    ethersFraudulentDealChallenge.challengeDoubleSpentOrders(firstTrade, lastTrade, overrideOptions).should.be.rejected;
                });
            });

            describe('if first trade\'s buy order equals last trade\'s buy order', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    exchange: firstTrade.buyer.order.hashes.exchange // <---- modified ----
                                },
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeDoubleSpentOrders(firstTrade, lastTrade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, doubleSpenderWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isDoubleSpenderWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    doubleSpenderWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if first trade\'s sell order equals last trade\'s sell order', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        nonce: utils.bigNumberify(20),
                        buyer: {
                            _address: glob.user_a,
                            nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                residuals: {
                                    current: utils.parseUnits('300', 18),
                                    previous: utils.parseUnits('400', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('9699.7', 18),
                                    previous: utils.parseUnits('9599.8', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('9.3', 18),
                                    previous: utils.parseUnits('9.4', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.3', 18),
                                conjugate: utils.parseUnits('0.0', 18)
                            }
                        },
                        seller: {
                            _address: glob.user_b,
                            nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
                            liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                            order: {
                                amount: utils.parseUnits('1000', 18),
                                hashes: {
                                    exchange: firstTrade.seller.order.hashes.exchange // <---- modified ----
                                },
                                residuals: {
                                    current: utils.parseUnits('500', 18),
                                    previous: utils.parseUnits('600', 18)
                                }
                            },
                            balances: {
                                intended: {
                                    current: utils.parseUnits('19400', 18),
                                    previous: utils.parseUnits('19500', 18)
                                },
                                conjugate: {
                                    current: utils.parseUnits('19.7994', 18),
                                    previous: utils.parseUnits('19.6996', 18)
                                }
                            },
                            netFees: {
                                intended: utils.parseUnits('0.0', 18),
                                conjugate: utils.parseUnits('0.0006', 18)
                            }
                        },
                        transfers: {
                            intended: {
                                single: utils.parseUnits('100', 18),
                                net: utils.parseUnits('300', 18)
                            },
                            conjugate: {
                                single: utils.parseUnits('0.1', 18),
                                net: utils.parseUnits('0.3', 18)
                            }
                        },
                        singleFees: {
                            intended: utils.parseUnits('0.1', 18),
                            conjugate: utils.parseUnits('0.0002', 18)
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
                    await ethersFraudulentDealChallenge.challengeDoubleSpentOrders(firstTrade, lastTrade, overrideOptions);
                    const [operationalModeExit, fraudulentTrade, doubleSpenderWallet, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudulentDealChallenge.fraudulentTrade(),
                        ethersFraudulentDealChallenge.isDoubleSpenderWallet(glob.user_a),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
                    doubleSpenderWallet.should.be.true;
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });
    });
};