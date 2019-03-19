const chai = require('chai');
const {Wallet, utils, Contract} = require('ethers');
const {util: {cryptography}} = require('omphalos-commons');
const mocks = require('../mocks');
const PaymentHasher = artifacts.require('PaymentHasher');
const TradeHasher = artifacts.require('TradeHasher');
const Configuration = artifacts.require('Configuration');
const SignerManager = artifacts.require('SignerManager');
const ValidatorV2 = artifacts.require('ValidatorV2');

chai.should();

module.exports = function (glob) {
    describe('ValidatorV2', () => {
        let provider;
        let blockNumberAhead;
        let web3PaymentHasher, ethersPaymentHasher;
        let web3TradeHasher, ethersTradeHasher;
        let web3Configuration, ethersConfiguration;
        let web3SignerManager, ethersSignerManager;
        let web3ValidatorV2, ethersValidatorV2;
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
            web3ValidatorV2 = await ValidatorV2.new(glob.owner, web3SignerManager.address);
            ethersValidatorV2 = new Contract(web3ValidatorV2.address, ValidatorV2.abi, glob.signer_owner);

            await ethersValidatorV2.setConfiguration(ethersConfiguration.address);
            await ethersValidatorV2.setPaymentHasher(ethersPaymentHasher.address);
            await ethersValidatorV2.setTradeHasher(ethersTradeHasher.address);

            blockNumberAhead = await provider.getBlockNumber() + 15;
        });

        describe('deployer()', () => {
            it('should equal value initialized', async () => {
                (await web3ValidatorV2.deployer.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3ValidatorV2.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3ValidatorV2.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3ValidatorV2.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3ValidatorV2.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3ValidatorV2.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3ValidatorV2.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3ValidatorV2.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3ValidatorV2.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3ValidatorV2.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
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
                    (await ethersValidatorV2.ethrecover(hash, signature.v, signature.r, signature.s))
                        .should.equal(utils.getAddress(glob.user_a));
                });
            });

            describe('if called with improper hash and signature', () => {
                it('should return improper address', async () => {
                    (await ethersValidatorV2.ethrecover(hash, signature.v, signature.s, signature.r))
                        .should.not.equal(glob.user_a);
                });
            });
        });

        describe('isSignedByRegisteredSigner()', () => {
            let hash, signature;

            beforeEach(async () => {
                hash = cryptography.hash('some message');
            });

            describe('if called with signature from unregistered signer', () => {
                beforeEach(async () => {
                    signature = await mocks.web3Sign(glob.user_a, hash);
                });

                it('should return true', async () => {
                    (await ethersValidatorV2.isSignedByRegisteredSigner(hash, signature.v, signature.r, signature.s))
                        .should.be.false;
                });
            });

            describe('if called with signature from registered signer', () => {
                beforeEach(async () => {
                    signature = await mocks.web3Sign(glob.owner, hash);
                });

                it('should return true', async () => {
                    (await ethersValidatorV2.isSignedByRegisteredSigner(hash, signature.v, signature.r, signature.s))
                        .should.be.true;
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
                    (await ethersValidatorV2.isSignedBy(hash, signature.v, signature.r, signature.s, glob.owner))
                        .should.be.true;
                });
            });

            describe('if called with non-signer wallet', () => {
                it('should return true', async () => {
                    (await ethersValidatorV2.isSignedBy(hash, signature.v, signature.r, signature.s, glob.user_a))
                        .should.be.false;
                });
            });
        });

        describe('isGenuineWalletSignature()', () => {
            let hash, signature;

            beforeEach(async () => {
                hash = cryptography.hash('some message');
                signature = await mocks.web3Sign(glob.owner, hash);
            });

            describe('if not genuine', () => {
                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuineWalletSignature(hash, signature, glob.user_a))
                        .should.be.false;
                });
            });

            describe('if genuine', () => {
                it('should return true', async () => {
                    (await ethersValidatorV2.isGenuineWalletSignature(hash, signature, glob.owner))
                        .should.be.true;
                });
            });
        });

        describe('isGenuineOperatorSignature()', () => {
            let hash, signature;

            beforeEach(async () => {
                hash = cryptography.hash('some message');
            });

            describe('if not genuine', () => {
                beforeEach(async () => {
                    signature = await mocks.web3Sign(glob.user_a, hash);
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuineOperatorSignature(hash, signature))
                        .should.be.false;
                });
            });

            describe('if genuine', () => {
                beforeEach(async () => {
                    signature = await mocks.web3Sign(glob.owner, hash);
                });

                it('should return true', async () => {
                    (await ethersValidatorV2.isGenuineOperatorSignature(hash, signature))
                        .should.be.true;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersValidatorV2.configuration();
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
                    configuration = await web3ValidatorV2.configuration.call();
                });

                afterEach(async () => {
                    await web3ValidatorV2.setConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3ValidatorV2.setConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');
                    const configuration = await web3ValidatorV2.configuration();
                    utils.getAddress(configuration).should.equal(utils.getAddress(address));
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3ValidatorV2.setConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('paymentHasher()', () => {
            it('should equal value initialized', async () => {
                const paymentHasher = await ethersValidatorV2.paymentHasher();
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
                    const result = await web3ValidatorV2.setPaymentHasher(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentHasherEvent');

                    (await ethersValidatorV2.paymentHasher())
                        .should.equal(utils.getAddress(address));
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3ValidatorV2.setPaymentHasher(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('tradeHasher()', () => {
            it('should equal value initialized', async () => {
                const tradeHasher = await ethersValidatorV2.tradeHasher();
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
                    const result = await web3ValidatorV2.setTradeHasher(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeHasherEvent');

                    (await ethersValidatorV2.tradeHasher())
                        .should.equal(utils.getAddress(address));
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3ValidatorV2.setTradeHasher(address, {from: glob.user_a}).should.be.rejected;
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
                            const result = await ethersValidatorV2.isGenuineTradeBuyerFeeOfFungible(trade);
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
                            const result = await ethersValidatorV2.isGenuineTradeBuyerFeeOfFungible(trade);
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
                            const result = await ethersValidatorV2.isGenuineTradeBuyerFeeOfFungible(trade);
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
                            const result = await ethersValidatorV2.isGenuineTradeBuyerFeeOfFungible(trade);
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
                            const result = await ethersValidatorV2.isGenuineTradeSellerFeeOfFungible(trade);
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
                            const result = await ethersValidatorV2.isGenuineTradeSellerFeeOfFungible(trade);
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
                            const result = await ethersValidatorV2.isGenuineTradeSellerFeeOfFungible(trade);
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
                            const result = await ethersValidatorV2.isGenuineTradeSellerFeeOfFungible(trade);
                            result.should.be.true;
                        });
                    });
                });
            });
        });

        describe('isGenuinePaymentWalletHash()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            describe('if not genuine', () => {
                beforeEach(() => {
                    payment.seals.wallet.hash = cryptography.hash('some message');
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentWalletHash(payment))
                        .should.be.false;
                });
            });

            describe('if genuine', () => {
                it('should return true', async () => {
                    (await ethersValidatorV2.isGenuinePaymentWalletHash(payment))
                        .should.be.true;
                });
            });
        });

        describe('isGenuinePaymentOperatorHash()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            describe('if not genuine', () => {
                beforeEach(() => {
                    payment.seals.operator.hash = cryptography.hash('some message');
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentOperatorHash(payment))
                        .should.be.false;
                });
            });

            describe('if genuine', () => {
                it('should return true', async () => {
                    (await ethersValidatorV2.isGenuinePaymentOperatorHash(payment))
                        .should.be.true;
                });
            });
        });

        describe('isGenuinePaymentWalletSeal()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            describe('if not genuine hash', () => {
                beforeEach(() => {
                    payment.seals.wallet.hash = cryptography.hash('some message');
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentWalletSeal(payment))
                        .should.be.false;
                });
            });

            describe('if not genuine signature', () => {
                beforeEach(async () => {
                    payment.seals.wallet.signature = await mocks.web3Sign(glob.user_a, payment.seals.wallet.hash)
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentWalletSeal(payment))
                        .should.be.false;
                });
            });

            describe('if genuine', () => {
                it('should return true', async () => {
                    (await ethersValidatorV2.isGenuinePaymentWalletSeal(payment))
                        .should.be.true;
                });
            });
        });

        describe('isGenuinePaymentOperatorSeal()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            describe('if not genuine hash', () => {
                beforeEach(() => {
                    payment.seals.operator.hash = cryptography.hash('some message');
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentOperatorSeal(payment))
                        .should.be.false;
                });
            });

            describe('if not genuine signature', () => {
                beforeEach(async () => {
                    payment.seals.wallet.signature = await mocks.web3Sign(glob.user_a, payment.seals.operator.hash)
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentOperatorSeal(payment))
                        .should.be.false;
                });
            });

            describe('if genuine', () => {
                it('should return true', async () => {
                    (await ethersValidatorV2.isGenuinePaymentOperatorSeal(payment))
                        .should.be.true;
                });
            });
        });

        describe('isGenuinePaymentSeals()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            describe('if not genuine wallet hash', () => {
                beforeEach(() => {
                    payment.seals.wallet.hash = cryptography.hash('some message');
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentSeals(payment))
                        .should.be.false;
                });
            });

            describe('if not genuine wallet signature', () => {
                beforeEach(async () => {
                    payment.seals.wallet.signature = await mocks.web3Sign(glob.user_a, payment.seals.wallet.hash)
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentSeals(payment))
                        .should.be.false;
                });
            });

            describe('if not genuine operator hash', () => {
                beforeEach(() => {
                    payment.seals.operator.hash = cryptography.hash('some message');
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentOperatorSeal(payment))
                        .should.be.false;
                });
            });

            describe('if not genuine operator signature', () => {
                beforeEach(async () => {
                    payment.seals.wallet.signature = await mocks.web3Sign(glob.user_a, payment.seals.operator.hash)
                });

                it('should return false', async () => {
                    (await ethersValidatorV2.isGenuinePaymentOperatorSeal(payment))
                        .should.be.false;
                });
            });

            describe('if genuine', () => {
                it('should return true', async () => {
                    (await ethersValidatorV2.isGenuinePaymentSeals(payment))
                        .should.be.true;
                });
            });
        });
    });
};
