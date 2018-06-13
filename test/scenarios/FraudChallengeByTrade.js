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

            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);

            await ethersFraudChallengeByTrade.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByTrade.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByTrade.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByTrade.changeClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByTrade.address, 'OperationalMode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallengeByTrade.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized', async () => {
                const owner = await ethersFraudChallengeByTrade.owner();
                owner.should.equal(utils.getAddress(glob.owner));
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByTrade.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByTrade.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
                    const owner = await web3FraudChallengeByTrade.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
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

            describe('if called with owner as sender', () => {
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

            describe('if called with sender that is not owner', () => {
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

            describe('if called with owner as sender', () => {
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

            describe('if called with sender that is not owner', () => {
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

            describe('if called with owner as sender', () => {
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

            describe('if called with sender that is not owner', () => {
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

            describe('if called with owner as sender', () => {
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

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByTrade.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challengeByTrade()', () => {
            let trade, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersConfiguration.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersClientFund.reset(overrideOptions);

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByTrade.interface.events.ChallengeByTradeEvent.topics
                );
            });

            describe('if trade is genuine', () => {
                beforeEach(async () => {
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                    trade = await mocks.mockTrade(glob.user_a, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions).should.be.rejected;
                });
            });

            describe('if trade maker fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeMakerFee(false);
                });

                describe('if buyer is maker', () => {
                    beforeEach(async () => {
                        trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    });

                    it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                        await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
                        const [operationalModeExit, fraudulentTradesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                            ethersConfiguration.isOperationalModeExit(),
                            ethersFraudChallenge.fraudulentTradesCount(),
                            ethersFraudChallenge.seizedWalletsCount(),
                            ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                            ethersClientFund.seizures(utils.bigNumberify(0)),
                            provider.getLogs(filter)
                        ]);
                        operationalModeExit.should.be.true;
                        fraudulentTradesCount.eq(1).should.be.true;
                        seizedWalletsCount.eq(1).should.be.true;
                        seizedWallet.should.equal(trade.buyer.wallet);
                        seizure.source.should.equal(trade.buyer.wallet);
                        seizure.destination.should.equal(utils.getAddress(glob.owner));
                        logs.should.have.lengthOf(1);
                    });
                });

                describe('if seller is maker', () => {
                    beforeEach(async () => {
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                liquidityRole: mocks.liquidityRoles.indexOf('Taker')
                            },
                            seller: {
                                liquidityRole: mocks.liquidityRoles.indexOf('Maker')
                            },
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                    });

                    it('should set operational mode exit, store fraudulent trade and seize seller\'s funds', async () => {
                        await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
                        const [operationalModeExit, fraudulentTradesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                            ethersConfiguration.isOperationalModeExit(),
                            ethersFraudChallenge.fraudulentTradesCount(),
                            ethersFraudChallenge.seizedWalletsCount(),
                            ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                            ethersClientFund.seizures(utils.bigNumberify(0)),
                            provider.getLogs(filter)
                        ]);
                        operationalModeExit.should.be.true;
                        fraudulentTradesCount.eq(1).should.be.true;
                        seizedWalletsCount.eq(1).should.be.true;
                        seizedWallet.should.equal(trade.seller.wallet);
                        seizure.source.should.equal(trade.seller.wallet);
                        seizure.destination.should.equal(utils.getAddress(glob.owner));
                        logs.should.have.lengthOf(1);
                    });
                });
            });

            describe('if trade taker fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeTakerFee(false);
                });

                describe('if seller is taker', () => {
                    beforeEach(async () => {
                        trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    });

                    it('should set operational mode exit, store fraudulent trade and seize seller\'s funds', async () => {
                        await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
                        const [operationalModeExit, fraudulentTradesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                            ethersConfiguration.isOperationalModeExit(),
                            ethersFraudChallenge.fraudulentTradesCount(),
                            ethersFraudChallenge.seizedWalletsCount(),
                            ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                            ethersClientFund.seizures(utils.bigNumberify(0)),
                            provider.getLogs(filter)
                        ]);
                        operationalModeExit.should.be.true;
                        fraudulentTradesCount.eq(1).should.be.true;
                        seizedWalletsCount.eq(1).should.be.true;
                        seizedWallet.should.equal(trade.seller.wallet);
                        seizure.source.should.equal(trade.seller.wallet);
                        seizure.destination.should.equal(utils.getAddress(glob.owner));
                        logs.should.have.lengthOf(1);
                    });
                });

                describe('if buyer is taker', () => {
                    beforeEach(async () => {
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                liquidityRole: mocks.liquidityRoles.indexOf('Taker')
                            },
                            seller: {
                                liquidityRole: mocks.liquidityRoles.indexOf('Maker')
                            },
                            blockNumber: utils.bigNumberify(blockNumber10)
                        });
                    });

                    it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                        await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
                        const [operationalModeExit, fraudulentTradesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                            ethersConfiguration.isOperationalModeExit(),
                            ethersFraudChallenge.fraudulentTradesCount(),
                            ethersFraudChallenge.seizedWalletsCount(),
                            ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                            ethersClientFund.seizures(utils.bigNumberify(0)),
                            provider.getLogs(filter)
                        ]);
                        operationalModeExit.should.be.true;
                        fraudulentTradesCount.eq(1).should.be.true;
                        seizedWalletsCount.eq(1).should.be.true;
                        seizedWallet.should.equal(trade.buyer.wallet);
                        seizure.source.should.equal(trade.buyer.wallet);
                        seizure.destination.should.equal(utils.getAddress(glob.owner));
                        logs.should.have.lengthOf(1);
                    });
                });
            });

            describe('if trade buyer is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeBuyer(false);
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTradesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradesCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradesCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(trade.buyer.wallet);
                    seizure.source.should.equal(trade.buyer.wallet);
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if trade seller is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeller(false);
                    trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent trade and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
                    const [operationalModeExit, fraudulentTradesCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentTradesCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentTradesCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(trade.seller.wallet);
                    seizure.source.should.equal(trade.seller.wallet);
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });


            // describe('challengeByTrade()', () => {
            //     let trade, overrideOptions, topic, filter;
            //
            //     before(async () => {
            //         overrideOptions = {gasLimit: 2e6};
            //     });
            //
            //     beforeEach(async () => {
            //         await ethersClientFund.reset(overrideOptions);
            //
            //         await ethersConfiguration.setTradeMakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.001', 18), [], [], overrideOptions);
            //         await ethersConfiguration.setTradeMakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0001', 18), overrideOptions);
            //         await ethersConfiguration.setTradeTakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [1], [utils.parseUnits('0.1', 18)], overrideOptions);
            //         await ethersConfiguration.setTradeTakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
            //         await ethersConfiguration.setFalseWalletSignatureStake(mocks.address0, utils.parseUnits('100', 18));
            //
            //         topic = ethersFraudChallengeByTrade.interface.events.ChallengeByTradeEvent.topics[0];
            //         filter = {
            //             fromBlock: blockNumber0,
            //             topics: [topic]
            //         };
            //     });
            //
            //     describe('if trade is genuine', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
            //         });
            //
            //         it('should revert', async () => {
            //             return ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions).should.be.rejected;
            //         });
            //     });
            //
            //     describe('if (exchange) hash differs from calculated', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
            //             trade.seal.hash = utils.id('some non-existent hash');
            //         });
            //
            //         it('should revert', async () => {
            //             ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions).should.be.rejected;
            //         });
            //     });
            //
            //     describe('if not signed (by exchange)', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
            //             const sign = mocks.createWeb3Signer(glob.user_a);
            //             trade.seal.signature = await sign(trade.seal.hash);
            //         });
            //
            //         it('should revert', async () => {
            //             ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions).should.be.rejected;
            //         });
            //     });
            //
            //     describe('if buyer address equals seller address', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 buyer: {wallet: glob.user_a},
            //                 seller: {wallet: glob.user_a},
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if buyer address equals owner address', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 buyer: {wallet: glob.owner},
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if buyer\'s current intended balance field differs from calculated', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 buyer: {
            //                     balances: {
            //                         intended: {
            //                             current: utils.bigNumberify(0)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if buyer\'s current conjugate balance field differs from calculated', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 buyer: {
            //                     balances: {
            //                         conjugate: {
            //                             current: utils.bigNumberify(0)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if buyer\'s order\'s amount is smaller than its current residual', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 buyer: {
            //                     order: {
            //                         residuals: {
            //                             current: utils.parseUnits('4000', 18)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if buyer\'s order\'s amount is smaller than its previous residual', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 buyer: {
            //                     order: {
            //                         residuals: {
            //                             previous: utils.parseUnits('5000', 18)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if buyer\'s order\'s previous residual is smaller than its current residual', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 buyer: {
            //                     order: {
            //                         residuals: {
            //                             previous: utils.parseUnits('300', 18)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if (buyer\'s) maker fee is greater than the nominal maker fee', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 singleFees: {
            //                     intended: utils.parseUnits('1.0', 18)
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if (buyer\'s) maker fee is different than provided by Configuration contract', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 singleFees: {
            //                     intended: utils.parseUnits('0.1', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100))
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if (buyer\'s) maker fee is smaller than the minimum maker fee', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 singleFees: {
            //                     intended: utils.parseUnits('0.001', 18)
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.buyer.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedBuyer.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if seller address equals owner address', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 seller: {
            //                     address: glob.owner
            //                 }
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if seller\'s current intended balance field differs from calculated', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 seller: {
            //                     balances: {
            //                         intended: {
            //                             current: utils.bigNumberify(0)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if seller\'s current conjugate balance field differs from calculated', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 seller: {
            //                     balances: {
            //                         conjugate: {
            //                             current: utils.bigNumberify(0)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if seller\'s order\'s amount is smaller than its current residual', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 seller: {
            //                     order: {
            //                         residuals: {
            //                             current: utils.parseUnits('6000', 18)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if seller\'s order\'s amount is smaller than its previous residual', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 seller: {
            //                     order: {
            //                         residuals: {
            //                             previous: utils.parseUnits('7000', 18)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if seller\'s order\'s previous residual is smaller than its current residual', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 seller: {
            //                     order: {
            //                         residuals: {
            //                             previous: utils.parseUnits('500', 18)
            //                         }
            //                     }
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if (seller\'s) taker fee is greater than the nominal taker fee', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 singleFees: {
            //                     conjugate: utils.parseUnits('0.002', 18)
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if (seller\'s) taker fee is different than provided by Configuration contract', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 singleFees: {
            //                     conjugate: utils.parseUnits('0.0002', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100))
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            //
            //     describe('if (seller\'s) taker fee is smaller than the minimum taker fee', () => {
            //         beforeEach(async () => {
            //             trade = await mocks.mockTrade(glob.owner, {
            //                 singleFees: {
            //                     conjugate: utils.parseUnits('0.000002', 18)
            //                 },
            //                 blockNumber: utils.bigNumberify(blockNumber10)
            //             });
            //         });
            //
            //         it('should toggle operational mode, record fraudulent trade, seize wallet and emit event', async () => {
            //             await ethersFraudChallengeByTrade.challengeByTrade(trade, overrideOptions);
            //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
            //                 ethersConfiguration.isOperationalModeExit(),
            //                 ethersFraudChallengeByTrade.fraudulentTrade(),
            //                 ethersFraudChallengeByTrade.isSeizedWallet(trade.seller.wallet),
            //                 ethersClientFund.seizures(0),
            //                 provider.getLogs(filter)
            //             ]);
            //             operationalModeExit.should.be.true;
            //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
            //             seizedSeller.should.be.true;
            //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
            //             seizure.destination.should.equal(utils.getAddress(glob.owner));
            //             logs[logs.length - 1].topics[0].should.equal(topic);
            //         });
            //     });
            // });
        });
    });
};

const fromBlockTopicsFilter = async (...topics) => {
    return {
        fromBlock: await provider.getBlockNumber(),
        topics
    };
};

