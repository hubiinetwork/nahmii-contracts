const chai = require('chai');
const {Wallet, utils, Contract} = require('ethers');
const {util: {cryptography}} = require('omphalos-commons');
const mocks = require('../mocks');
const PaymentHasher = artifacts.require('PaymentHasher');
const TradeHasher = artifacts.require('TradeHasher');
const Configuration = artifacts.require('Configuration');
const SignerManager = artifacts.require('SignerManager');
const Validator = artifacts.require('ValidatorV2');

chai.should();

module.exports = function (glob) {
    describe('Validator', () => {
        let provider;
        let blockNumberAhead;
        let web3PaymentHasher, ethersPaymentHasher;
        let web3TradeHasher, ethersTradeHasher;
        let web3Configuration, ethersConfiguration;
        let web3SignerManager, ethersSignerManager;
        let web3Validator, ethersValidator;
        let partsPer;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3PaymentHasher = await PaymentHasher.new(glob.owner);
            ethersPaymentHasher = new Contract(web3PaymentHasher.address, PaymentHasher.abi, glob.signer_owner);
            web3TradeHasher = await TradeHasher.new(glob.owner);
            ethersTradeHasher = new Contract(web3TradeHasher.address, TradeHasher.abi, glob.signer_owner);
            web3Configuration = await Configuration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, Configuration.abi, glob.signer_owner);
            web3SignerManager = await SignerManager.new(glob.owner);
            ethersSignerManager = new Contract(web3SignerManager.address, SignerManager.abi, glob.signer_owner);

            partsPer = utils.bigNumberify(1e18.toString());
        });

        beforeEach(async () => {
            web3Validator = await Validator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, Validator.abi, glob.signer_owner);

            await ethersValidator.setConfiguration(ethersConfiguration.address);
            await ethersValidator.setPaymentHasher(ethersPaymentHasher.address);
            await ethersValidator.setTradeHasher(ethersTradeHasher.address);

            blockNumberAhead = await provider.getBlockNumber() + 15;
        });

        describe('deployer()', () => {
            it('should equal value initialized', async () => {
                (await web3Validator.deployer.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3Validator.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Validator.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3Validator.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3Validator.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3Validator.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3Validator.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Validator.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3Validator.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3Validator.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('ethrecover()', () => {
            let hash, signature;

            beforeEach(async () => {
                hash = cryptography.hash('some message');
                signature = await mocks.web3Sign(glob.user_a, hash);
            });

            describe('if called with proper hash and signature', () => {
                it('should return proper address', async () => {
                    (await ethersValidator.ethrecover(hash, signature.v, signature.r, signature.s))
                        .should.equal(utils.getAddress(glob.user_a));
                });
            });

            describe('if called with improper hash and signature', () => {
                it('should return improper address', async () => {
                    (await ethersValidator.ethrecover(hash, signature.v, signature.s, signature.r))
                        .should.not.equal(glob.user_a);
                });
            });
        });

        describe('isSignedByRegisteredSigner()', () => {
            let hash, signature;

            beforeEach(async () => {
                hash = cryptography.hash('some message');
            });

            describe('if called with signature from registered signer', () => {
                beforeEach(async () => {
                    signature = await mocks.web3Sign(glob.owner, hash);
                });

                it('should return true', async () => {
                    (await ethersValidator.isSignedByRegisteredSigner(hash, signature.v, signature.r, signature.s))
                        .should.be.true;
                });
            });

            describe('if called with signature from registered signer', () => {
                beforeEach(async () => {
                    signature = await mocks.web3Sign(glob.user_a, hash);
                });

                it('should return true', async () => {
                    (await ethersValidator.isSignedByRegisteredSigner(hash, signature.v, signature.r, signature.s))
                        .should.be.false;
                });
            });
        });

        describe('isSignedBy()', () => {
            let hash, signature;

            beforeEach(async () => {
                hash = cryptography.hash('some message');
                signature = await mocks.web3Sign(glob.owner, hash);
            });

            describe('if called with signer wallet', () => {
                it('should return true', async () => {
                    (await ethersValidator.isSignedBy(hash, signature.v, signature.r, signature.s, glob.owner))
                        .should.be.true;
                });
            });

            describe('if called with non-signer wallet', () => {
                it('should return true', async () => {
                    (await ethersValidator.isSignedBy(hash, signature.v, signature.r, signature.s, glob.user_a))
                        .should.be.false;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersValidator.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            })
        });

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3Validator.configuration.call();
                });

                afterEach(async () => {
                    await web3Validator.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Validator.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3Validator.configuration();
                    utils.getAddress(configuration).should.equal(utils.getAddress(address));
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Validator.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('paymentHasher()', () => {
            it('should equal value initialized', async () => {
                const paymentHasher = await ethersValidator.paymentHasher();
                paymentHasher.should.equal(utils.getAddress(ethersPaymentHasher.address));
            })
        });

        describe('setPaymentHasher()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3Validator.setPaymentHasher(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentHasherEvent');

                    (await ethersValidator.paymentHasher())
                        .should.equal(utils.getAddress(address));
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Validator.setPaymentHasher(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('tradeHasher()', () => {
            it('should equal value initialized', async () => {
                const tradeHasher = await ethersValidator.tradeHasher();
                tradeHasher.should.equal(utils.getAddress(ethersTradeHasher.address));
            })
        });

        describe('setTradeHasher()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3Validator.setTradeHasher(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeHasherEvent');

                    (await ethersValidator.tradeHasher())
                        .should.equal(utils.getAddress(address));
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Validator.setTradeHasher(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('isGenuineTradeBuyerFeeOfFungible()', () => {
            let trade;

            describe('if trade buyer fee is genuine', () => {
                describe('if buyer is maker', () => {
                    describe('if fee is realistic', () => {
                        beforeEach(async () => {
                            await web3Configuration.setTradeMakerFee(blockNumberAhead, 1e15, [0, 10], [1e17, 2e17]);
                            await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14);

                            const amountIntended = utils.parseUnits('100', 18);
                            const fee = await ethersConfiguration.tradeMakerFee(utils.bigNumberify(blockNumberAhead), utils.bigNumberify(0));
                            trade = await mocks.mockTrade(glob.owner, {
                                buyer: {
                                    fees: {
                                        single: {
                                            amount: amountIntended.mul(fee).div(partsPer),
                                            currency: {
                                                ct: '0x0000000000000000000000000000000000000001',
                                                id: utils.bigNumberify(0)
                                            }
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumberAhead)
                            });
                        });

                        it('should successfully validate', async () => {
                            const result = await ethersValidator.isGenuineTradeBuyerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });

                    describe('if fee is infinitesimal', () => {
                        beforeEach(async () => {
                            await web3Configuration.setTradeMakerFee(blockNumberAhead, 1, [0, 10], [1e17, 2e17]);
                            await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14);

                            trade = await mocks.mockTrade(glob.owner, {
                                amount: utils.parseUnits('1', 16),
                                buyer: {
                                    fees: {
                                        single: {
                                            amount: 1,
                                            currency: {
                                                ct: '0x0000000000000000000000000000000000000001',
                                                id: utils.bigNumberify(0)
                                            }
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumberAhead)
                            });
                        });

                        it('should successfully validate', async () => {
                            const result = await ethersValidator.isGenuineTradeBuyerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });
                });

                describe('if buyer is taker', () => {
                    describe('if fee is realistic', () => {
                        beforeEach(async () => {
                            await web3Configuration.setTradeTakerFee(blockNumberAhead, 1e15, [0, 10], [1e17, 2e17]);
                            await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14);

                            const amountIntended = utils.parseUnits('100', 18);
                            const fee = await ethersConfiguration.tradeTakerFee(utils.bigNumberify(blockNumberAhead), utils.bigNumberify(0));
                            trade = await mocks.mockTrade(glob.owner, {
                                buyer: {
                                    liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                                    fees: {
                                        single: {
                                            amount: amountIntended.mul(fee).div(partsPer),
                                            currency: {
                                                ct: '0x0000000000000000000000000000000000000001',
                                                id: utils.bigNumberify(0)
                                            }
                                        }
                                    }
                                },
                                seller: {
                                    liquidityRole: mocks.liquidityRoles.indexOf('Maker')
                                },
                                blockNumber: utils.bigNumberify(blockNumberAhead)
                            });
                        });

                        it('should successfully validate', async () => {
                            const result = await ethersValidator.isGenuineTradeBuyerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });

                    describe('if fee is infinitesimal', () => {
                        beforeEach(async () => {
                            await web3Configuration.setTradeTakerFee(blockNumberAhead, 1, [0, 10], [1e17, 2e17]);
                            await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14);

                            trade = await mocks.mockTrade(glob.owner, {
                                amount: utils.parseUnits('1', 16),
                                buyer: {
                                    liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
                                    fees: {
                                        single: {
                                            amount: 1,
                                            currency: {
                                                ct: '0x0000000000000000000000000000000000000001',
                                                id: utils.bigNumberify(0)
                                            }
                                        }
                                    }
                                },
                                seller: {
                                    liquidityRole: mocks.liquidityRoles.indexOf('Maker')
                                },
                                blockNumber: utils.bigNumberify(blockNumberAhead)
                            });
                        });

                        it('should successfully validate', async () => {
                            const result = await ethersValidator.isGenuineTradeBuyerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });
                });
            });
        });

        describe('isGenuineTradeSellerFeeOfFungible()', () => {
            let trade;

            describe('if trade seller fee is genuine', () => {
                describe('if seller is maker', () => {
                    describe('if fee is realistic', () => {
                        beforeEach(async () => {
                            await web3Configuration.setTradeMakerFee(blockNumberAhead, 1e15, [0, 10], [1e17, 2e17]);
                            await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14);

                            const amountIntended = utils.parseUnits('100', 18);
                            const fee = await ethersConfiguration.tradeMakerFee(utils.bigNumberify(blockNumberAhead), utils.bigNumberify(0));
                            trade = await mocks.mockTrade(glob.owner, {
                                buyer: {
                                    liquidityRole: mocks.liquidityRoles.indexOf('Taker')
                                },
                                seller: {
                                    liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                                    fees: {
                                        single: {
                                            amount: amountIntended.mul(fee).div(partsPer.mul(utils.bigNumberify(1000))),
                                            currency: {
                                                ct: '0x0000000000000000000000000000000000000002',
                                                id: utils.bigNumberify(0)
                                            }
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumberAhead)
                            });
                        });

                        it('should successfully validate', async () => {
                            const result = await ethersValidator.isGenuineTradeSellerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });

                    describe('if fee is infinitesimal', () => {
                        beforeEach(async () => {
                            await web3Configuration.setTradeMakerFee(blockNumberAhead, 1, [0, 10], [1e17, 2e17]);
                            await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14);

                            trade = await mocks.mockTrade(glob.owner, {
                                buyer: {
                                    liquidityRole: mocks.liquidityRoles.indexOf('Taker')
                                },
                                seller: {
                                    liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
                                    fees: {
                                        single: {
                                            amount: 1,
                                            currency: {
                                                ct: '0x0000000000000000000000000000000000000002',
                                                id: utils.bigNumberify(0)
                                            }
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumberAhead)
                            });
                        });

                        it('should successfully validate', async () => {
                            const result = await ethersValidator.isGenuineTradeSellerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });
                });

                describe('if seller is taker', () => {
                    describe('if fee is realistic', () => {
                        beforeEach(async () => {
                            await web3Configuration.setTradeTakerFee(blockNumberAhead, 1e15, [0, 10], [1e17, 2e17]);
                            await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14);

                            const amountIntended = utils.parseUnits('100', 18);
                            const fee = await ethersConfiguration.tradeTakerFee(utils.bigNumberify(blockNumberAhead), utils.bigNumberify(0));
                            trade = await mocks.mockTrade(glob.owner, {
                                seller: {
                                    fees: {
                                        single: {
                                            amount: amountIntended.mul(fee).div(partsPer.mul(utils.bigNumberify(1000))),
                                            currency: {
                                                ct: '0x0000000000000000000000000000000000000002',
                                                id: utils.bigNumberify(0)
                                            }
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumberAhead)
                            });
                        });

                        it('should successfully validate', async () => {
                            const result = await ethersValidator.isGenuineTradeSellerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });

                    describe('if fee is infinitesimal', () => {
                        beforeEach(async () => {
                            await web3Configuration.setTradeTakerFee(blockNumberAhead, 1, [0, 10], [1e17, 2e17]);
                            await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14);

                            trade = await mocks.mockTrade(glob.owner, {
                                seller: {
                                    fees: {
                                        single: {
                                            amount: 1,
                                            currency: {
                                                ct: '0x0000000000000000000000000000000000000002',
                                                id: utils.bigNumberify(0)
                                            }
                                        }
                                    }
                                },
                                blockNumber: utils.bigNumberify(blockNumberAhead)
                            });
                        });

                        it('should successfully validate', async () => {
                            const result = await ethersValidator.isGenuineTradeSellerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });
                });
            });
        });

        // TODO Implement corresponding tests in Validator.js
        // describe.skip('challengeByOrder()', () => {
        //     let trade, overrideOptions, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund._reset(overrideOptions);
        //
        //         await ethersConfiguration.setTradeMakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.001', 18), [], [], overrideOptions);
        //         await ethersConfiguration.setTradeMakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0001', 18), overrideOptions);
        //         await ethersConfiguration.setTradeTakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [1], [utils.parseUnits('0.1', 18)], overrideOptions);
        //         await ethersConfiguration.setTradeTakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
        //         await ethersConfiguration.setFalseWalletSignatureStake(utils.parseUnits('100', 18), mocks.address0, utils.bigNumberify(0));
        //
        //         topic = ethersFraudChallenge.interface.events.ChallengeByTradeEvent.topics[0];
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
        //             return ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if (operator) hash differs from calculated', () => {
        //         beforeEach(async () => {
        //             trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             trade.seal.hash = utils.id('some non-existent hash');
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if not signed (by operator)', () => {
        //         beforeEach(async () => {
        //             trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             const sign = mocks.createWeb3Signer(glob.user_a);
        //             trade.seal.signature = await sign(trade.seal.hash);
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if buyer\'s order\'s amount is less than its current residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if buyer\'s order\'s amount is less than its previous residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if buyer\'s order\'s previous residual is less than its current residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (buyer\'s) maker fee is less than the minimum maker fee', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.buyer.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if seller\'s order\'s amount is less than its current residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if seller\'s order\'s amount is less than its previous residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if seller\'s order\'s previous residual is less than its current residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             lock.lockerWallet.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (seller\'s) taker fee is less than the minimum taker fee', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, lock, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             lock.lockedWallet.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
        //
        // describe('challengeByTrade()', () => {
        //     let trade, overrideOptions, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund._reset(overrideOptions);
        //
        //         await ethersConfiguration.setTradeMakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.001', 18), [], [], overrideOptions);
        //         await ethersConfiguration.setTradeMakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0001', 18), overrideOptions);
        //         await ethersConfiguration.setTradeTakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [1], [utils.parseUnits('0.1', 18)], overrideOptions);
        //         await ethersConfiguration.setTradeTakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
        //         await ethersConfiguration.setFalseWalletSignatureStake(utils.parseUnits('100', 18), mocks.address0, utils.bigNumberify(0));
        //
        //         topic = ethersFraudChallenge.interface.events.ChallengeByTradeEvent.topics[0];
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
        //             return ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if (operator) hash differs from calculated', () => {
        //         beforeEach(async () => {
        //             trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             trade.seal.hash = utils.id('some non-existent hash');
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if not signed (by operator)', () => {
        //         beforeEach(async () => {
        //             trade = await mocks.mockTrade(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             const sign = mocks.createWeb3Signer(glob.user_a);
        //             trade.seal.signature = await sign(trade.seal.hash);
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByTrade(trade, overrideOptions).should.be.rejected;
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if buyer\'s order\'s amount is less than its current residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if buyer\'s order\'s amount is less than its previous residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if buyer\'s order\'s previous residual is less than its current residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (buyer\'s) maker fee is less than the minimum maker fee', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedBuyer, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedBuyer.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if seller\'s order\'s amount is less than its current residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if seller\'s order\'s amount is less than its previous residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if seller\'s order\'s previous residual is less than its current residual', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (seller\'s) taker fee is less than the minimum taker fee', () => {
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
        //             await ethersFraudChallenge.challengeByTrade(trade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizedSeller, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizedSeller.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
        //
        // describe('challengeByPayment()', () => {
        //     let payment, overrideOptions, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 1e6};
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund._reset(overrideOptions);
        //
        //         await ethersConfiguration.setPaymentFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [], [], overrideOptions);
        //         await ethersConfiguration.setPaymentMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
        //         await ethersConfiguration.setFalseWalletSignatureStake(utils.parseUnits('100', 18), mocks.address0, utils.bigNumberify(0));
        //
        //         topic = ethersFraudChallenge.interface.events.ChallengeByPaymentEvent.topics[0];
        //         filter = {
        //             fromBlock: blockNumber0,
        //             topics: [topic]
        //         };
        //     });
        //
        //     describe('if payment it genuine', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if wallet hash differs from calculated', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             payment.seals.wallet.hash = utils.id('some non-existent hash');
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if operator hash differs from calculated', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             payment.seals.operator.hash = utils.id('some non-existent hash');
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if not signed by operator', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             payment.seals.operator.signature = payment.seals.wallet.signature;
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if not signed by wallet', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             const signAsWallet = mocks.createWeb3Signer(glob.user_a);
        //             payment.seals.wallet.signature = await signAsWallet(payment.seals.wallet.hash);
        //             payment.seals.operator.hash = mocks.hashPaymentAsOperator(payment);
        //             const signAsDriipSettlement = mocks.createWeb3Signer(glob.owner);
        //             payment.seals.operator.signature = await signAsDriipSettlement(payment.seals.operator.hash);
        //         });
        //
        //         it('should record fraudulent payment, toggle operational mode and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if sender address equals recipient address', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 sender: {wallet: glob.user_a},
        //                 recipient: {wallet: glob.user_a},
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if sender\'s current balance field differs from calculated', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 sender: {
        //                     balances: {
        //                         current: utils.bigNumberify(0)
        //                     }
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (sender\'s) payment fee is greater than the nominal payment fee', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 singleFee: utils.parseUnits('2.0', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (sender\'s) payment fee is different than provided by Configuration contract', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 singleFee: utils.parseUnits('0.2', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100)),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (sender\'s) payment fee is less than the minimum payment fee', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 singleFee: utils.parseUnits('0.002', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if recipient\'s current balance field differs from calculated', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 recipient: {
        //                     balances: {
        //                         current: utils.bigNumberify(0)
        //                     }
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.recipient.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.recipient.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
        //
        // describe('challengeBySuccessiveTrades()', () => {
        //     let overrideOptions, firstTrade, lastTrade, currency, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //         currency = '0x0000000000000000000000000000000000000001';
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund._reset(overrideOptions);
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
        //                     totalFees: {
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
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         total: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         total: utils.parseUnits('-0.05', 18)
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
        //                     totalFees: {
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
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         total: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         total: utils.parseUnits('-0.05', 18)
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
        //                     totalFees: {
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
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         total: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         total: utils.parseUnits('-0.05', 18)
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
        //             const [operationalModeExit, fraudulentTrade, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(lastTrade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(lastTrade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if trade party\'s total fee in last trade is not incremented by single fee in last trade relative to total fee in first trade', () => {
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
        //                     totalFees: {
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
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.4', 18), // <---- modified ----
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         total: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         total: utils.parseUnits('-0.05', 18)
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
        //             const [operationalModeExit, fraudulentTrade, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(lastTrade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(lastTrade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
        //
        // describe('challengeBySuccessivePayments()', () => {
        //     let overrideOptions, firstPayment, lastPayment, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund._reset(overrideOptions);
        //
        //         firstPayment = await mocks.mockPayment(glob.owner, {
        //             nonce: utils.bigNumberify(10),
        //             sender: {
        //                 wallet: glob.user_a
        //             },
        //             recipient: {
        //                 wallet: glob.user_b
        //             },
        //             blockNumber: utils.bigNumberify(blockNumber10)
        //         });
        //         lastPayment = await mocks.mockPayment(glob.owner, {
        //             nonce: utils.bigNumberify(20),
        //             amount: utils.parseUnits('50', 18),
        //             sender: {
        //                 wallet: glob.user_b,
        //                 nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
        //                 balances: {
        //                     current: utils.parseUnits('19649.9', 18),
        //                     previous: utils.parseUnits('19700', 18)
        //                 },
        //                 totalFee: utils.parseUnits('0.1', 18)
        //             },
        //             recipient: {
        //                 wallet: glob.user_a,
        //                 nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
        //                 balances: {
        //                     current: utils.parseUnits('9449.8', 18),
        //                     previous: utils.parseUnits('9399.8', 18)
        //                 },
        //                 totalFee: utils.parseUnits('0.2', 18)
        //             },
        //             singleFee: utils.parseUnits('0.1', 18),
        //             blockNumber: utils.bigNumberify(blockNumber10)
        //         });
        //
        //         topic = ethersFraudChallenge.interface.events.ChallengeBySuccessivePaymentsEvent.topics[0];
        //         filter = {
        //             fromBlock: await provider.getBlockNumber(),
        //             topics: [topic]
        //         };
        //     });
        //
        //     describe('if payments are genuine', () => {
        //         beforeEach(async () => {
        //             lastPayment = await mocks.mockPayment(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 amount: utils.parseUnits('50', 18),
        //                 sender: {
        //                     wallet: glob.user_b,
        //                     nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
        //                     balances: {
        //                         current: utils.parseUnits('19649.9', 18),
        //                         previous: utils.parseUnits('19700', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.1', 18)
        //                 },
        //                 recipient: {
        //                     wallet: glob.user_a,
        //                     nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
        //                     balances: {
        //                         current: utils.parseUnits('9449.8', 18),
        //                         previous: utils.parseUnits('9399.8', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.2', 18)
        //                 },
        //                 transfers: {
        //                     single: utils.parseUnits('50', 18),
        //                     total: utils.parseUnits('-50', 18)
        //                 },
        //                 singleFee: utils.parseUnits('0.1', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if payment party\'s nonce in last payment is not incremented by 1 relative to first payment', () => {
        //         beforeEach(async () => {
        //             lastPayment = await mocks.mockPayment(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 amount: utils.parseUnits('50', 18),
        //                 sender: {
        //                     wallet: glob.user_b,
        //                     nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
        //                     balances: {
        //                         current: utils.parseUnits('19649.9', 18),
        //                         previous: utils.parseUnits('19700', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.1', 18)
        //                 },
        //                 recipient: {
        //                     wallet: glob.user_a,
        //                     nonce: firstPayment.sender.nonce.add(utils.bigNumberify(2)), // <---- modified ----
        //                     balances: {
        //                         current: utils.parseUnits('9449.8', 18),
        //                         previous: utils.parseUnits('9399.8', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.2', 18)
        //                 },
        //                 transfers: {
        //                     single: utils.parseUnits('50', 18),
        //                     total: utils.parseUnits('-50', 18)
        //                 },
        //                 singleFee: utils.parseUnits('0.1', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if payment party\'s previous balance in last payment is not equal to current balance in first payment', () => {
        //         beforeEach(async () => {
        //             lastPayment = await mocks.mockPayment(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 amount: utils.parseUnits('50', 18),
        //                 sender: {
        //                     wallet: glob.user_b,
        //                     nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
        //                     balances: {
        //                         current: utils.parseUnits('19649.9', 18),
        //                         previous: utils.parseUnits('19700', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.1', 18)
        //                 },
        //                 recipient: {
        //                     wallet: glob.user_a,
        //                     nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
        //                     balances: {
        //                         current: utils.parseUnits('9449.8', 18),
        //                         previous: utils.parseUnits('1000', 18) // <---- modified ----
        //                     },
        //                     totalFee: utils.parseUnits('0.2', 18)
        //                 },
        //                 transfers: {
        //                     single: utils.parseUnits('50', 18),
        //                     total: utils.parseUnits('-50', 18)
        //                 },
        //                 singleFee: utils.parseUnits('0.1', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(lastPayment.recipient.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(lastPayment.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(lastPayment.recipient.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if payment party\'s total fee in last payment is not incremented by single fee in last payment relative to total fee in first payment', () => {
        //         beforeEach(async () => {
        //             lastPayment = await mocks.mockPayment(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 amount: utils.parseUnits('50', 18),
        //                 sender: {
        //                     wallet: glob.user_b,
        //                     nonce: firstPayment.recipient.nonce.add(utils.bigNumberify(2)),
        //                     balances: {
        //                         current: utils.parseUnits('19649.9', 18),
        //                         previous: utils.parseUnits('19700', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.1', 18)
        //                 },
        //                 recipient: {
        //                     wallet: glob.user_a,
        //                     nonce: firstPayment.sender.nonce.add(utils.bigNumberify(1)),
        //                     balances: {
        //                         current: utils.parseUnits('9449.8', 18),
        //                         previous: utils.parseUnits('9399.8', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.4', 18) // <---- modified ----
        //                 },
        //                 transfers: {
        //                     single: utils.parseUnits('50', 18),
        //                     total: utils.parseUnits('-50', 18)
        //                 },
        //                 singleFee: utils.parseUnits('0.1', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeBySuccessivePayments(firstPayment, lastPayment, glob.user_a, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(lastPayment.recipient.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(lastPayment.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(lastPayment.recipient.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
        //
        // describe('challengeByPaymentSucceedingTrade()', () => {
        //     let overrideOptions, currency, trade, payment, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //         currency = '0x0000000000000000000000000000000000000001';
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund._reset(overrideOptions);
        //
        //         trade = await mocks.mockTrade(glob.owner, {
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
        //         topic = ethersFraudChallenge.interface.events.ChallengeByPaymentSucceedingTradeEvent.topics[0];
        //         filter = {
        //             fromBlock: await provider.getBlockNumber(),
        //             topics: [topic]
        //         };
        //     });
        //
        //     describe('if trade and payment are genuine', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 amount: utils.parseUnits('50', 18),
        //                 sender: {
        //                     wallet: glob.user_b,
        //                     nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
        //                     balances: {
        //                         current: utils.parseUnits('19449.9', 18),
        //                         previous: utils.parseUnits('19500', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.1', 18)
        //                 },
        //                 recipient: {
        //                     wallet: glob.user_a,
        //                     nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     balances: {
        //                         current: utils.parseUnits('9649.8', 18),
        //                         previous: utils.parseUnits('9599.8', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.2', 18)
        //                 },
        //                 transfers: {
        //                     single: utils.parseUnits('50', 18),
        //                     total: utils.parseUnits('-50', 18)
        //                 },
        //                 singleFee: utils.parseUnits('0.1', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if payment party\'s nonce in payment is not incremented by 1 relative to trade', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 amount: utils.parseUnits('50', 18),
        //                 sender: {
        //                     wallet: glob.user_b,
        //                     nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
        //                     balances: {
        //                         current: utils.parseUnits('19449.9', 18),
        //                         previous: utils.parseUnits('19500', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.1', 18)
        //                 },
        //                 recipient: {
        //                     wallet: glob.user_a,
        //                     nonce: trade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
        //                     balances: {
        //                         current: utils.parseUnits('9649.8', 18),
        //                         previous: utils.parseUnits('9599.8', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.2', 18)
        //                 },
        //                 transfers: {
        //                     single: utils.parseUnits('50', 18),
        //                     total: utils.parseUnits('-50', 18)
        //                 },
        //                 singleFee: utils.parseUnits('0.1', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPaymentSucceedingTrade(trade, payment, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if payment party\'s previous balance in payment is not equal to current balance in trade', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 amount: utils.parseUnits('50', 18),
        //                 sender: {
        //                     wallet: glob.user_b,
        //                     nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
        //                     balances: {
        //                         current: utils.parseUnits('19449.9', 18),
        //                         previous: utils.parseUnits('19500', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.1', 18)
        //                 },
        //                 recipient: {
        //                     wallet: glob.user_a,
        //                     nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     balances: {
        //                         current: utils.parseUnits('9649.8', 18),
        //                         previous: utils.parseUnits('1000', 18) // <---- modified ----
        //                     },
        //                     totalFee: utils.parseUnits('0.2', 18)
        //                 },
        //                 transfers: {
        //                     single: utils.parseUnits('50', 18),
        //                     total: utils.parseUnits('-50', 18)
        //                 },
        //                 singleFee: utils.parseUnits('0.1', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPaymentSucceedingTrade(trade, payment, payment.recipient.wallet, currency, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.recipient.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(payment.recipient.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if payment party\'s total fee in payment is not incremented by single fee in payment relative to total fee in trade', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 amount: utils.parseUnits('50', 18),
        //                 sender: {
        //                     wallet: glob.user_b,
        //                     nonce: trade.seller.nonce.add(utils.bigNumberify(2)),
        //                     balances: {
        //                         current: utils.parseUnits('19449.9', 18),
        //                         previous: utils.parseUnits('19500', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.1', 18)
        //                 },
        //                 recipient: {
        //                     wallet: glob.user_a,
        //                     nonce: trade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     balances: {
        //                         current: utils.parseUnits('9649.8', 18),
        //                         previous: utils.parseUnits('9599.8', 18)
        //                     },
        //                     totalFee: utils.parseUnits('0.4', 18) // <---- modified ----
        //                 },
        //                 transfers: {
        //                     single: utils.parseUnits('50', 18),
        //                     total: utils.parseUnits('-50', 18)
        //                 },
        //                 singleFee: utils.parseUnits('0.1', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPaymentSucceedingTrade(trade, payment, payment.recipient.wallet, currency, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.recipient.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(payment.recipient.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
        //
        // describe('challengeByTradeSucceedingPayment()', () => {
        //     let overrideOptions, currency, payment, trade, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //         currency = '0x0000000000000000000000000000000000000001';
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund._reset(overrideOptions);
        //
        //         payment = await mocks.mockPayment(glob.owner, {
        //             nonce: utils.bigNumberify(10),
        //             sender: {
        //                 wallet: glob.user_a
        //             },
        //             recipient: {
        //                 wallet: glob.user_b
        //             },
        //             blockNumber: utils.bigNumberify(blockNumber10)
        //         });
        //
        //         topic = ethersFraudChallenge.interface.events.ChallengeByTradeSucceedingPaymentEvent.topics[0];
        //         filter = {
        //             fromBlock: await provider.getBlockNumber(),
        //             topics: [topic]
        //         };
        //     });
        //
        //     describe('if payment and trade are genuine', () => {
        //         beforeEach(async () => {
        //             trade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_b,
        //                     nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
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
        //                             current: utils.parseUnits('19749.1', 18),
        //                             previous: utils.parseUnits('19700', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.6496', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.1', 18),
        //                         conjugate: utils.parseUnits('0.0004', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_a,
        //                     nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
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
        //                             current: utils.parseUnits('9349.8', 18),
        //                             previous: utils.parseUnits('9399.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.44995', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         total: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         total: utils.parseUnits('-0.05', 18)
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
        //             ethersFraudChallenge.challengeByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if trade party\'s nonce in trade is not incremented by 1 relative to payment', () => {
        //         beforeEach(async () => {
        //             trade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_b,
        //                     nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
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
        //                             current: utils.parseUnits('19749.1', 18),
        //                             previous: utils.parseUnits('19700', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.6496', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.1', 18),
        //                         conjugate: utils.parseUnits('0.0004', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_a,
        //                     nonce: payment.sender.nonce.add(utils.bigNumberify(2)), // <---- modified ----
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
        //                             current: utils.parseUnits('9349.8', 18),
        //                             previous: utils.parseUnits('9399.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.44995', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         total: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         total: utils.parseUnits('-0.05', 18)
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
        //             ethersFraudChallenge.challengeByTradeSucceedingPayment(payment, trade, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if trade party\'s previous balance in trade is not equal to current balance in payment', () => {
        //         beforeEach(async () => {
        //             trade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_b,
        //                     nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
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
        //                             current: utils.parseUnits('19749.1', 18),
        //                             previous: utils.parseUnits('19700', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.6496', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.1', 18),
        //                         conjugate: utils.parseUnits('0.0004', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_a,
        //                     nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
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
        //                             current: utils.parseUnits('9349.8', 18),
        //                             previous: utils.parseUnits('1000', 18) // <---- modified ----
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.44995', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.2', 18),
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         total: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         total: utils.parseUnits('-0.05', 18)
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
        //             await ethersFraudChallenge.challengeByTradeSucceedingPayment(payment, trade, trade.seller.wallet, currency, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if trade party\'s total fee in trade is not incremented by single fee in trade relative to total fee in payment', () => {
        //         beforeEach(async () => {
        //             trade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_b,
        //                     nonce: payment.recipient.nonce.add(utils.bigNumberify(2)),
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
        //                             current: utils.parseUnits('19749.1', 18),
        //                             previous: utils.parseUnits('19700', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.6496', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.1', 18),
        //                         conjugate: utils.parseUnits('0.0004', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_a,
        //                     nonce: payment.sender.nonce.add(utils.bigNumberify(1)),
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
        //                             current: utils.parseUnits('9349.8', 18),
        //                             previous: utils.parseUnits('9399.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.44995', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.4', 18), // <---- modified ----
        //                         conjugate: utils.parseUnits('0.00005', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('50', 18),
        //                         total: utils.parseUnits('-50', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.05', 18),
        //                         total: utils.parseUnits('-0.05', 18)
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
        //             await ethersFraudChallenge.challengeByTradeSucceedingPayment(payment, trade, trade.seller.wallet, currency, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(trade.seller.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(trade.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(trade.seller.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
        //
        // describe('challengeByTradeOrderResiduals()', () => {
        //     let overrideOptions, firstTrade, lastTrade, currency, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //         currency = '0x0000000000000000000000000000000000000001';
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund._reset(overrideOptions);
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
        //         topic = ethersFraudChallenge.interface.events.ChallengeByTradeOrderResidualsEvent.topics[0];
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
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             wallet: firstTrade.buyer.order.hashes.wallet
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('300', 18),
        //                             previous: utils.parseUnits('400', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9699.7', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.3', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.3', 18),
        //                         conjugate: utils.parseUnits('0.0', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             wallet: firstTrade.seller.order.hashes.wallet
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('500', 18),
        //                             previous: utils.parseUnits('600', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19400', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.7994', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.0', 18),
        //                         conjugate: utils.parseUnits('0.0006', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('100', 18),
        //                         total: utils.parseUnits('300', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.1', 18),
        //                         total: utils.parseUnits('0.3', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.0002', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if wallet is buyer in the one trade and seller in the other trade', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: firstTrade.seller.wallet, // <---- modified ----
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             wallet: firstTrade.buyer.order.hashes.wallet
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('300', 18),
        //                             previous: utils.parseUnits('400', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9699.7', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.3', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.3', 18),
        //                         conjugate: utils.parseUnits('0.0', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: firstTrade.buyer.wallet, // <---- modified ----
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             wallet: firstTrade.seller.order.hashes.wallet
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('500', 18),
        //                             previous: utils.parseUnits('600', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19400', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.7994', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.0', 18),
        //                         conjugate: utils.parseUnits('0.0006', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('100', 18),
        //                         total: utils.parseUnits('300', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.1', 18),
        //                         total: utils.parseUnits('0.3', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.0002', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if trade party\'s nonce in last trade is not incremented by 1 relative to first trade', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(2)), // <---- modified ----
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             wallet: firstTrade.buyer.order.hashes.wallet
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('300', 18),
        //                             previous: utils.parseUnits('400', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9699.7', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.3', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.3', 18),
        //                         conjugate: utils.parseUnits('0.0', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             wallet: firstTrade.seller.order.hashes.wallet
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('500', 18),
        //                             previous: utils.parseUnits('600', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19400', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.7994', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.0', 18),
        //                         conjugate: utils.parseUnits('0.0006', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('100', 18),
        //                         total: utils.parseUnits('300', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.1', 18),
        //                         total: utils.parseUnits('0.3', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.0002', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByTradeOrderResiduals(firstTrade, lastTrade, glob.user_a, currency, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if trade party\'s previous residuals in last trade is not equal to current residuals in first trade', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             wallet: firstTrade.buyer.order.hashes.wallet
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('300', 18),
        //                             previous: utils.parseUnits('100', 18) // <---- modified ----
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9699.7', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.3', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.3', 18),
        //                         conjugate: utils.parseUnits('0.0', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             wallet: firstTrade.seller.order.hashes.wallet
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('500', 18),
        //                             previous: utils.parseUnits('600', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19400', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.7994', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.0', 18),
        //                         conjugate: utils.parseUnits('0.0006', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('100', 18),
        //                         total: utils.parseUnits('300', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.1', 18),
        //                         total: utils.parseUnits('0.3', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.0002', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByTradeOrderResiduals(firstTrade, lastTrade, lastTrade.buyer.wallet, currency, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isSeizedWallet(lastTrade.buyer.wallet),
        //                 ethersClientFund.locks(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
        //             seizure.source.should.equal(utils.getAddress(lastTrade.buyer.wallet));
        //             seizure.target.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
        //
        // describe('challengeByDoubleSpentOrders()', () => {
        //     let overrideOptions, firstTrade, lastTrade, currency, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 2e6};
        //         currency = '0x0000000000000000000000000000000000000001';
        //     });
        //
        //     beforeEach(async () => {
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
        //         topic = ethersFraudChallenge.interface.events.ChallengeByDoubleSpentOrdersEvent.topics[0];
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
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('300', 18),
        //                             previous: utils.parseUnits('400', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9699.7', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.3', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.3', 18),
        //                         conjugate: utils.parseUnits('0.0', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('500', 18),
        //                             previous: utils.parseUnits('600', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19400', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.7994', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.0', 18),
        //                         conjugate: utils.parseUnits('0.0006', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('100', 18),
        //                         total: utils.parseUnits('300', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.1', 18),
        //                         total: utils.parseUnits('0.3', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.0002', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByDoubleSpentOrders(firstTrade, lastTrade, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if first trade\'s buy order equals last trade\'s buy order', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             operator: firstTrade.buyer.order.hashes.operator // <---- modified ----
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('300', 18),
        //                             previous: utils.parseUnits('400', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9699.7', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.3', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.3', 18),
        //                         conjugate: utils.parseUnits('0.0', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('500', 18),
        //                             previous: utils.parseUnits('600', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19400', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.7994', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.0', 18),
        //                         conjugate: utils.parseUnits('0.0006', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('100', 18),
        //                         total: utils.parseUnits('300', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.1', 18),
        //                         total: utils.parseUnits('0.3', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.0002', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByDoubleSpentOrders(firstTrade, lastTrade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, doubleSpenderWallet, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isDoubleSpenderWallet(glob.user_a),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
        //             doubleSpenderWallet.should.be.true;
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if first trade\'s sell order equals last trade\'s sell order', () => {
        //         beforeEach(async () => {
        //             lastTrade = await mocks.mockTrade(glob.owner, {
        //                 nonce: utils.bigNumberify(20),
        //                 buyer: {
        //                     wallet: glob.user_a,
        //                     nonce: firstTrade.buyer.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Maker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         residuals: {
        //                             current: utils.parseUnits('300', 18),
        //                             previous: utils.parseUnits('400', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('9699.7', 18),
        //                             previous: utils.parseUnits('9599.8', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('9.3', 18),
        //                             previous: utils.parseUnits('9.4', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.3', 18),
        //                         conjugate: utils.parseUnits('0.0', 18)
        //                     }
        //                 },
        //                 seller: {
        //                     wallet: glob.user_b,
        //                     nonce: firstTrade.seller.nonce.add(utils.bigNumberify(1)),
        //                     liquidityRole: mocks.liquidityRoles.indexOf('Taker'),
        //                     order: {
        //                         amount: utils.parseUnits('1000', 18),
        //                         hashes: {
        //                             operator: firstTrade.seller.order.hashes.operator // <---- modified ----
        //                         },
        //                         residuals: {
        //                             current: utils.parseUnits('500', 18),
        //                             previous: utils.parseUnits('600', 18)
        //                         }
        //                     },
        //                     balances: {
        //                         intended: {
        //                             current: utils.parseUnits('19400', 18),
        //                             previous: utils.parseUnits('19500', 18)
        //                         },
        //                         conjugate: {
        //                             current: utils.parseUnits('19.7994', 18),
        //                             previous: utils.parseUnits('19.6996', 18)
        //                         }
        //                     },
        //                     totalFees: {
        //                         intended: utils.parseUnits('0.0', 18),
        //                         conjugate: utils.parseUnits('0.0006', 18)
        //                     }
        //                 },
        //                 transfers: {
        //                     intended: {
        //                         single: utils.parseUnits('100', 18),
        //                         total: utils.parseUnits('300', 18)
        //                     },
        //                     conjugate: {
        //                         single: utils.parseUnits('0.1', 18),
        //                         total: utils.parseUnits('0.3', 18)
        //                     }
        //                 },
        //                 singleFees: {
        //                     intended: utils.parseUnits('0.1', 18),
        //                     conjugate: utils.parseUnits('0.0002', 18)
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber20)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent trades, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByDoubleSpentOrders(firstTrade, lastTrade, overrideOptions);
        //             const [operationalModeExit, fraudulentTrade, doubleSpenderWallet, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentTrade(),
        //                 ethersFraudChallenge.isDoubleSpenderWallet(glob.user_a),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentTrade[0].toNumber().should.equal(lastTrade.nonce.toNumber());
        //             doubleSpenderWallet.should.be.true;
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });
    });
};
