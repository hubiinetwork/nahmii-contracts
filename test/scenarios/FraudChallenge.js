const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet} = require('ethers');
const mocks = require('../mocks');
const cryptography = require('omphalos-commons').util.cryptography;

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('FraudChallenge', () => {
        let web3FraudChallenge, ethersFraudChallengeOwner;
        let ethersFraudChallengeUserA, ethersFraudChallengeUserB;

        before(async () => {
            web3FraudChallenge = glob.web3FraudChallenge;
            ethersFraudChallengeOwner = glob.ethersIoFraudChallenge;
            ethersFraudChallengeUserA = ethersFraudChallengeOwner.connect(glob.signer_a);
            ethersFraudChallengeUserB = ethersFraudChallengeOwner.connect(glob.signer_b);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3FraudChallenge.deployer.call()).should.equal(glob.owner);
                (await web3FraudChallenge.operator.call()).should.equal(glob.owner);
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                const wallet = Wallet.createRandom().address;
                const result = await ethersFraudChallengeOwner.isSeizedWallet(wallet);
                result.should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudChallengeOwner.seizedWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('seizedWallets()', () => {
            it('should equal value initialized', async () => {
                ethersFraudChallengeOwner.seizedWallets(0).should.be.rejected;
            })
        });

        describe('addSeizedWallet()', () => {
            let wallet;

            beforeEach(() => {
                wallet = Wallet.createRandom().address;
            });

            describe('if called as deployer', () => {
                it('should add seized wallet', async () => {
                    await ethersFraudChallengeOwner.addSeizedWallet(wallet);
                    const seized = await ethersFraudChallengeOwner.isSeizedWallet(wallet);
                    seized.should.be.true;
                });
            });

            describe('if called as registered service action', () => {
                before(async () => {
                    await ethersFraudChallengeOwner.registerService(glob.user_a);
                    await ethersFraudChallengeOwner.enableServiceAction(glob.user_a, 'add_seized_wallet', {gasLimit: 1e6});
                });

                it('should add seized wallet', async () => {
                    await ethersFraudChallengeUserA.addSeizedWallet(wallet);
                    const seized = await ethersFraudChallengeOwner.isSeizedWallet(wallet);
                    seized.should.be.true;
                });
            });

            describe('if called as neither deployer nor registered service action', () => {
                it('should revert', async () => {
                    ethersFraudChallengeUserB.addSeizedWallet(wallet).should.be.rejected;
                });
            });
        });

        describe('isDoubleSpenderWallet()', () => {
            it('should equal value initialized', async () => {
                const wallet = Wallet.createRandom().address;
                const result = await ethersFraudChallengeOwner.isDoubleSpenderWallet(wallet);
                result.should.be.false;
            });
        });

        describe('doubleSpenderWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudChallengeOwner.doubleSpenderWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('doubleSpenderWallets()', () => {
            it('should equal value initialized', async () => {
                ethersFraudChallengeOwner.doubleSpenderWallets(0).should.be.rejected;
            })
        });

        describe('addDoubleSpenderWallet()', () => {
            let wallet;

            beforeEach(() => {
                wallet = Wallet.createRandom().address;
            });

            describe('if called as deployer', () => {
                it('should add double spender wallet', async () => {
                    await ethersFraudChallengeOwner.addDoubleSpenderWallet(wallet);
                    const doubleSpender = await ethersFraudChallengeOwner.isDoubleSpenderWallet(wallet);
                    doubleSpender.should.be.true;
                });
            });

            describe('if called as registered service action', () => {
                before(async () => {
                    await ethersFraudChallengeOwner.registerService(glob.user_a);
                    await ethersFraudChallengeOwner.enableServiceAction(glob.user_a, 'add_double_spender_wallet', {gasLimit: 1e6});
                });

                it('should add double spender wallet', async () => {
                    await ethersFraudChallengeUserA.addDoubleSpenderWallet(wallet);
                    const doubleSpender = await ethersFraudChallengeOwner.isDoubleSpenderWallet(wallet);
                    doubleSpender.should.be.true;
                });
            });

            describe('if called as neither deployer nor registered service action', () => {
                it('should revert', async () => {
                    ethersFraudChallengeUserB.addDoubleSpenderWallet(wallet).should.be.rejected;
                });
            });
        });

        describe('fraudulentOrderHashesCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudChallengeOwner.fraudulentOrderHashesCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('fraudulentOrderHashes()', () => {
            it('should equal value initialized', async () => {
                ethersFraudChallengeOwner.fraudulentOrderHashes(0).should.be.rejected;
            })
        });

        describe('isFraudulentOrderHash()', () => {
            it('should equal value initialized', async () => {
                const hash = cryptography.hash('some order');
                const fraudulentOrderHash = await ethersFraudChallengeOwner.isFraudulentOrderHash(hash);
                fraudulentOrderHash.should.be.false;
            })
        });

        describe('addFraudulentOrderHash()', () => {
            let overrideOptions, order;

            before(() => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            describe('if called as deployer', () => {
                it('should add fraudulent order', async () => {
                    await ethersFraudChallengeOwner.addFraudulentOrderHash(order.seals.operator.hash, overrideOptions);
                    const fraudulentOrderHash = await ethersFraudChallengeOwner.isFraudulentOrderHash(order.seals.operator.hash);
                    fraudulentOrderHash.should.be.true;
                });
            });

            describe('if called as registered service action', () => {
                before(async () => {
                    await ethersFraudChallengeOwner.registerService(glob.user_a);
                    await ethersFraudChallengeOwner.enableServiceAction(glob.user_a, 'add_fraudulent_order', {gasLimit: 1e6});
                });

                it('should add fraudulent order', async () => {
                    await ethersFraudChallengeUserA.addFraudulentOrderHash(order.seals.operator.hash, overrideOptions);
                    const fraudulentOrderHash = await ethersFraudChallengeOwner.isFraudulentOrderHash(order.seals.operator.hash);
                    fraudulentOrderHash.should.be.true;
                });
            });

            describe('if called as neither deployer nor registered service action', () => {
                it('should revert', async () => {
                    ethersFraudChallengeUserB.addFraudulentOrderHash(order.seals.operator.hash, overrideOptions).should.be.rejected;
                });
            });
        });

        describe('fraudulentTradeHashesCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudChallengeOwner.fraudulentTradeHashesCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('fraudulentTradeHashes()', () => {
            it('should equal value initialized', async () => {
                ethersFraudChallengeOwner.fraudulentTradeHashes(0).should.be.rejected;
            })
        });

        describe('isFraudulentTradeHash()', () => {
            it('should equal value initialized', async () => {
                const hash = cryptography.hash('some trade');
                const fraudulentTradeHash = await ethersFraudChallengeOwner.isFraudulentTradeHash(hash);
                fraudulentTradeHash.should.be.false;
            });
        });

        describe('addFraudulentTradeHash()', () => {
            let overrideOptions, trade;

            before(() => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                trade = await mocks.mockTrade(glob.owner);
            });

            describe('if called as deployer', () => {
                it('should add fraudulent trade', async () => {
                    await ethersFraudChallengeOwner.addFraudulentTradeHash(trade.seal.hash, overrideOptions);
                    const fraudulentTradeDriipSettlementHash = await ethersFraudChallengeOwner.isFraudulentTradeHash(trade.seal.hash);
                    fraudulentTradeDriipSettlementHash.should.be.true;
                });
            });

            describe('if called as registered service action', () => {
                before(async () => {
                    await ethersFraudChallengeOwner.registerService(glob.user_a);
                    await ethersFraudChallengeOwner.enableServiceAction(glob.user_a, 'add_fraudulent_trade', {gasLimit: 1e6});
                });

                it('should add fraudulent trade', async () => {
                    await ethersFraudChallengeUserA.addFraudulentTradeHash(trade.seal.hash, overrideOptions);
                    const fraudulentTradeDriipSettlementHash = await ethersFraudChallengeOwner.isFraudulentTradeHash(trade.seal.hash);
                    fraudulentTradeDriipSettlementHash.should.be.true;
                });
            });

            describe('if called as neither deployer nor registered service action', () => {
                it('should revert', async () => {
                    ethersFraudChallengeUserB.addFraudulentTradeHash(trade.seal.hash, overrideOptions).should.be.rejected;
                });
            });
        });

        describe('fraudulentPaymentHashesCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersFraudChallengeOwner.fraudulentPaymentHashesCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('fraudulentPaymentHashes()', () => {
            it('should equal value initialized', async () => {
                ethersFraudChallengeOwner.fraudulentPaymentHashes(0).should.be.rejected;
            })
        });

        describe('isFraudulentPaymentHash()', () => {
            it('should equal value initialized', async () => {
                const hash = cryptography.hash('some payment');
                const fraudulentPaymentHash = await ethersFraudChallengeOwner.isFraudulentPaymentHash(hash);
                fraudulentPaymentHash.should.be.false;
            })
        });

        describe('addFraudulentPaymentHash()', () => {
            let overrideOptions, payment;

            before(() => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            describe('if called as deployer', () => {
                it('should add fraudulent payment', async () => {
                    await ethersFraudChallengeOwner.addFraudulentPaymentHash(payment.seals.operator.hash, overrideOptions);
                    const fraudulentPaymentHash = await ethersFraudChallengeOwner.isFraudulentPaymentHash(payment.seals.operator.hash);
                    fraudulentPaymentHash.should.be.true;
                });
            });

            describe('if called as registered service action', () => {
                before(async () => {
                    await ethersFraudChallengeOwner.registerService(glob.user_a);
                    await ethersFraudChallengeOwner.enableServiceAction(glob.user_a, 'add_fraudulent_payment', {gasLimit: 1e6});
                });

                it('should add fraudulent payment', async () => {
                    await ethersFraudChallengeUserA.addFraudulentPaymentHash(payment.seals.operator.hash, overrideOptions);
                    const fraudulentPaymentHash = await ethersFraudChallengeOwner.isFraudulentPaymentHash(payment.seals.operator.hash);
                    fraudulentPaymentHash.should.be.true;
                });
            });

            describe('if called as neither deployer nor registered service action', () => {
                it('should revert', async () => {
                    ethersFraudChallengeUserB.addFraudulentPaymentHash(payment.seals.operator.hash, overrideOptions).should.be.rejected;
                });
            });
        });
    });
};
