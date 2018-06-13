const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedFraudChallenge = artifacts.require("MockedFraudChallenge");
const MockedConfiguration = artifacts.require("MockedConfiguration");
const MockedValidator = artifacts.require("MockedValidator");
const MockedClientFund = artifacts.require("MockedClientFund");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeBySuccessiveTrades', () => {
        let web3FraudChallengeBySuccessiveTrades, ethersFraudChallengeBySuccessiveTrades;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3ClientFund, ethersClientFund;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeBySuccessiveTrades = glob.web3FraudChallengeBySuccessiveTrades;
            ethersFraudChallengeBySuccessiveTrades = glob.ethersIoFraudChallengeBySuccessiveTrades;

            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);

            await ethersFraudChallengeBySuccessiveTrades.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeBySuccessiveTrades.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeBySuccessiveTrades.changeValidator(ethersValidator.address);
            await ethersFraudChallengeBySuccessiveTrades.changeClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(ethersFraudChallengeBySuccessiveTrades.address, 'OperationalMode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallengeBySuccessiveTrades.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized', async () => {
                const owner = await ethersFraudChallengeBySuccessiveTrades.owner();
                owner.should.equal(utils.getAddress(glob.owner));
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
                    const owner = await web3FraudChallengeBySuccessiveTrades.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeBySuccessiveTrades.fraudChallenge();
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
                    fraudChallenge = await web3FraudChallengeBySuccessiveTrades.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeBySuccessiveTrades.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeBySuccessiveTrades.configuration();
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
                    configuration = await web3FraudChallengeBySuccessiveTrades.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeBySuccessiveTrades.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeBySuccessiveTrades.validator();
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
                    validator = await web3FraudChallengeBySuccessiveTrades.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeBySuccessiveTrades.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallengeBySuccessiveTrades.clientFund();
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
                    clientFund = await web3FraudChallengeBySuccessiveTrades.clientFund.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeBySuccessiveTrades.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeBySuccessiveTrades.changeClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await web3FraudChallengeBySuccessiveTrades.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeBySuccessiveTrades.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe.only('challengeBySuccessiveTrades()', () => {
            let firstTrade, lastTrade, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersConfiguration.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersClientFund.reset(overrideOptions);

                firstTrade = await mocks.mockTrade(glob.owner, {
                    buyer: {wallet: glob.user_a},
                    seller: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify(blockNumber10)
                });
                lastTrade = await mocks.mockTrade(glob.owner, {
                    buyer: {wallet: glob.user_a},
                    seller: {wallet: glob.user_b},
                    blockNumber: utils.bigNumberify(blockNumber20)
                });

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeBySuccessiveTrades.interface.events.ChallengeBySuccessiveTradesEvent.topics
                );
            });

            describe('if trades are genuine', () => {
                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if first trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if last trade is not sealed', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineTradeSeal(true);
                    await ethersValidator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not trade party in first trade', () => {
                beforeEach(async () => {
                    firstTrade = await mocks.mockTrade(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, lastTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if wallet is not trade party in last trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in first trade', () => {
                beforeEach(async () => {
                    firstTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_a},
                        seller: {wallet: glob.user_b},
                        currencies: {
                            intended: Wallet.createRandom().address,
                            conjugate: Wallet.createRandom().address,
                        },
                        blockNumber: utils.bigNumberify(blockNumber10)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, lastTrade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if currency is not in last trade', () => {
                beforeEach(async () => {
                    lastTrade = await mocks.mockTrade(glob.owner, {
                        buyer: {wallet: glob.user_a},
                        seller: {wallet: glob.user_b},
                        currencies: {
                            intended: Wallet.createRandom().address,
                            conjugate: Wallet.createRandom().address,
                        },
                        blockNumber: utils.bigNumberify(blockNumber20)
                    });
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not successive trade party nonces', () => {
                beforeEach(async () => {
                    await ethersValidator.setSuccessiveTradesPartyNonces(false);
                });

                it('should revert', async () => {
                    return ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    ).should.be.rejected;
                });
            });

            describe('if not genuine successive trades\' balances', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradesBalances(false);
                });

                it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    );
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
                    seizedWallet.should.equal(utils.getAddress(lastTrade.buyer.wallet));
                    seizure.source.should.equal(utils.getAddress(lastTrade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if not genuine successive trades\' net fees', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuineSuccessiveTradesNetFees(false);
                });

                it('should set operational mode exit, store fraudulent trade and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeBySuccessiveTrades.challengeBySuccessiveTrades(
                        firstTrade, lastTrade, firstTrade.buyer.wallet, firstTrade.currencies.intended, overrideOptions
                    );
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
                    seizedWallet.should.equal(utils.getAddress(lastTrade.buyer.wallet));
                    seizure.source.should.equal(utils.getAddress(lastTrade.buyer.wallet));
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });
        });

        // describe('challengeBySuccessiveTrades()', () => {
        //     let overrideOptions, firstTrade, lastTrade, currency, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //         currency = '0x0000000000000000000000000000000000000001';
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund.reset(overrideOptions);
        //
        //         firstTrade = await mocks.mockTrade(glob.owner, {
        //             nonce: utils.bigNumberify(10),
        //             buyer: {
        //                 wallet: glob.user_a
        //             },
        //             seller: {
        //                 wallet: glob.user_b
        //             },
        //             blockNumber: utils.bigNumberify(blockNumber10)
        //         });
        //
        //         topic = ethersFraudChallenge.interface.events.ChallengeBySuccessiveTradesEvent.topics[0];
        //         filter = {
        //             fromBlock: await provider.getBlockNumber(),
        //             topics: [topic]
        //         };
        //     });
        //
        //     describe('if trades are genuine', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('50', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('0', 18),
        //                             previous: utils.parseUnits('50', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19549.1', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.6496', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     netFees: {
        //                         intended: utils.parseUnits('0.1', 18),
        //                         conjugate: utils.parseUnits('0.0004', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('50', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('0', 18),
        //                             previous: utils.parseUnits('50', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9549.8', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.44995', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     netFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         net: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         net: utils.parseUnits('-0.05', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.00005', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if trade party\'s nonce in last trade is not incremented by 1 relative to first trade', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('50', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('0', 18),
        //                             previous: utils.parseUnits('50', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19549.1', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.6496', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     netFees: {
        //                         intended: utils.parseUnits('0.1', 18),
        //                         conjugate: utils.parseUnits('0.0004', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('50', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('0', 18),
        //                             previous: utils.parseUnits('50', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9549.8', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.44995', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     netFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         net: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         net: utils.parseUnits('-0.05', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.00005', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if trade party\'s previous balance in last trade is not equal to current balance in first trade', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('50', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('0', 18),
        //                             previous: utils.parseUnits('50', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19549.1', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.6496', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     netFees: {
        //                         intended: utils.parseUnits('0.1', 18),
        //                         conjugate: utils.parseUnits('0.0004', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('50', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('0', 18),
        //                             previous: utils.parseUnits('50', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9549.8', 18),
        //                             previous: utils.parseUnits('1000', 18) // <---- modified ----
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.44995', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     netFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         net: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         net: utils.parseUnits('-0.05', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.00005', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedWallet, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(lastTrade.seller.wallet),
        //                 ethersClientFund.seizures(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
        //             seizedWallet.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(lastTrade.seller.wallet));
        //             seizure.destination.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if trade party\'s net fee in last trade is not incremented by single fee in last trade relative to net fee in first trade', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(2)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('50', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('0', 18),
        //                             previous: utils.parseUnits('50', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19549.1', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.6496', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     netFees: {
        //                         intended: utils.parseUnits('0.1', 18),
        //                         conjugate: utils.parseUnits('0.0004', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('50', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('0', 18),
        //                             previous: utils.parseUnits('50', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9549.8', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.44995', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     netFees: {
        //                         intended: utils.parseUnits('0.4', 18), // <---- modified ----
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         net: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         net: utils.parseUnits('-0.05', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.00005', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeBySuccessiveTrades(firstTrade, lastTrade, glob.user_a, currency, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedWallet, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(lastTrade.seller.wallet),
        //                 ethersClientFund.seizures(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
        //             seizedWallet.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(lastTrade.seller.wallet));
        //             seizure.destination.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
    });
};

const fromBlockTopicsFilter = async (...topics) => {
    return {
        fromBlock: await provider.getBlockNumber(),
        topics
    };
};

