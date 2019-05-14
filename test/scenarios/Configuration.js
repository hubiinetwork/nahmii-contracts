const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract} = require('ethers');
const {address0} = require('../mocks');
const Configuration = artifacts.require('Configuration');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('Configuration', () => {
            let web3Configuration, ethersConfiguration;
            let provider;

            before(async () => {
                provider = glob.signer_owner.provider;
            });

            beforeEach(async () => {
                web3Configuration = await Configuration.new(glob.owner);
                ethersConfiguration = new Contract(web3Configuration.address, Configuration.abi, glob.signer_owner);
            });

            describe('constructor', () => {
                it('should initialize fields', async () => {
                    (await web3Configuration.deployer.call()).should.equal(glob.owner);
                    (await web3Configuration.operator.call()).should.equal(glob.owner);
                });
            });

            describe('operationalMode()', () => {
                it('should equal value initialized', async () => {
                    const operationalMode = await web3Configuration.operationalMode.call();
                    operationalMode.toNumber().should.equal(0);
                });
            });

            describe('isOperationalModeNormal()', () => {
                it('should equal value initialized', async () => {
                    const operationalModeNormal = await web3Configuration.isOperationalModeNormal.call();
                    operationalModeNormal.should.be.true;
                });
            });

            describe('isOperationalModeExit()', () => {
                it('should equal value initialized', async () => {
                    const operationalModeExit = await web3Configuration.isOperationalModeExit.call();
                    operationalModeExit.should.be.false;
                });
            });

            describe('setOperationalModeExit()', () => {
                describe('if called as registered service and relevant action enabled', () => {
                    beforeEach(async () => {
                        await web3Configuration.registerService(glob.user_a);
                        await web3Configuration.enableServiceAction(glob.user_a, 'operational_mode');
                    });

                    it('should set exit operational mode', async () => {
                        await web3Configuration.setOperationalModeExit({from: glob.user_a});
                        const operationalModeExit = await web3Configuration.isOperationalModeExit.call();
                        operationalModeExit.should.be.true;
                    });
                });

                describe('if called as non-registered service', () => {
                    it('should revert', async () => {
                        web3Configuration.setOperationalModeExit({from: glob.user_b}).should.be.rejected;
                    });
                });
            });

            describe('updateDelayBlocks()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.updateDelayBlocks())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('updateDelayBlocksCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.updateDelayBlocksCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('setUpdateDelayBlocks()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setUpdateDelayBlocks(
                            (await provider.getBlockNumber()) + 1, 1, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setUpdateDelayBlocks(
                            await provider.getBlockNumber(), 1
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new value and emit event', async () => {
                        const result = await web3Configuration.setUpdateDelayBlocks(
                            (await provider.getBlockNumber()) + 1, 1
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetUpdateDelayBlocksEvent');

                        (await ethersConfiguration.updateDelayBlocks())
                            ._bn.should.eq.BN(1);
                        (await ethersConfiguration.updateDelayBlocksCount())
                            ._bn.should.eq.BN(2);
                    });
                });
            });

            describe('confirmationBlocks()', () => {
                it('should revert', async () => {
                    ethersConfiguration.confirmationBlocks()
                        .should.be.rejected;
                });
            });

            describe('confirmationBlocksCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.confirmationBlocksCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('setConfirmationBlocks()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setConfirmationBlocks(
                            (await provider.getBlockNumber()) + 1, 1, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setConfirmationBlocks(
                            await provider.getBlockNumber(), 1
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new value and emit event', async () => {
                        const result = await web3Configuration.setConfirmationBlocks(
                            (await provider.getBlockNumber()) + 1, 1
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetConfirmationBlocksEvent');

                        (await ethersConfiguration.confirmationBlocks())
                            ._bn.should.eq.BN(1);
                        (await ethersConfiguration.confirmationBlocksCount())
                            ._bn.should.eq.BN(1);
                    });
                });
            });

            describe('tradeMakerFeesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.tradeMakerFeesCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('tradeMakerFee()', () => {
                it('should revert', async () => {
                    ethersConfiguration.tradeMakerFee((await provider.getBlockNumber()) + 1, 0)
                        .should.be.rejected;
                });
            });

            describe('setTradeMakerFee()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeMakerFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeMakerFee(
                            await provider.getBlockNumber(), 1e18, [1, 10], [1e17, 2e17]
                        ).should.be.rejected;
                    });
                });

                describe('if lengths of discount keys and values differ', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeMakerFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17, 3e17]
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setTradeMakerFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17]
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetTradeMakerFeeEvent');

                        (await ethersConfiguration.tradeMakerFee((await provider.getBlockNumber()) + 1, 1))
                            ._bn.should.eq.BN(9e17.toString());
                        (await ethersConfiguration.tradeMakerFeesCount())
                            ._bn.should.eq.BN(1);
                    });
                })
            });

            describe('tradeTakerFeesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.tradeTakerFeesCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('tradeTakerFee()', () => {
                it('should revert', async () => {
                    ethersConfiguration.tradeTakerFee((await provider.getBlockNumber()) + 1, 0)
                        .should.be.rejected;
                });
            });

            describe('setTradeTakerFee()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeTakerFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeTakerFee(
                            await provider.getBlockNumber(), 1e18, [1, 10], [1e17, 2e17]
                        ).should.be.rejected;
                    });
                });

                describe('if lengths of discount keys and values differ', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeTakerFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17, 3e17]
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setTradeTakerFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17]
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetTradeTakerFeeEvent');

                        (await ethersConfiguration.tradeTakerFee((await provider.getBlockNumber()) + 1, 1))
                            ._bn.should.eq.BN(9e17.toString());
                        (await ethersConfiguration.tradeTakerFeesCount())
                            ._bn.should.eq.BN(1);
                    });
                })
            });

            describe('paymentFeesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.paymentFeesCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('paymentFee()', () => {
                it('should revert', async () => {
                    ethersConfiguration.paymentFee((await provider.getBlockNumber()) + 1, 0)
                        .should.be.rejected;
                });
            });

            describe('setPaymentFee()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setPaymentFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setPaymentFee(
                            await provider.getBlockNumber(), 1e18, [1, 10], [1e17, 2e17]
                        ).should.be.rejected;
                    });
                });

                describe('if lengths of discount keys and values differ', () => {
                    it('should revert', async () => {
                        web3Configuration.setPaymentFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17, 3e17]
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setPaymentFee(
                            (await provider.getBlockNumber()) + 1, 1e18, [1, 10], [1e17, 2e17]
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetPaymentFeeEvent');

                        (await ethersConfiguration.paymentFee((await provider.getBlockNumber()) + 1, 1))
                            ._bn.should.eq.BN(9e17.toString());
                        (await ethersConfiguration.paymentFeesCount())
                            ._bn.should.eq.BN(1);
                    });
                })
            });

            describe('currencyPaymentFeesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.currencyPaymentFeesCount(Wallet.createRandom().address, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('currencyPaymentFee()', () => {
                let currencyCt, currencyId;

                before(() => {
                    currencyCt = Wallet.createRandom().address;
                    currencyId = 0;
                });

                beforeEach(async () => {
                    await web3Configuration.setPaymentFee(
                        (await provider.getBlockNumber()) + 1, 1e15, [1, 10], [1e17, 2e17]
                    );
                    await web3Configuration.setCurrencyPaymentFee(
                        (await provider.getBlockNumber()) + 1, currencyCt, currencyId, 2e15, [1, 10], [1e17, 2e17]
                    );
                });

                describe('if called with non-existent currency', () => {
                    describe('if called with non-existent currency contract', () => {
                        it('should get the currency agnostic value', async () => {
                            (await ethersConfiguration.currencyPaymentFee(
                                (await provider.getBlockNumber()) + 1, Wallet.createRandom().address, currencyId, 0
                            ))._bn.should.eq.BN(1e15.toString());
                        });
                    });

                    describe('if called with non-existent currency ID', () => {
                        it('should get the currency agnostic value', async () => {
                            (await ethersConfiguration.currencyPaymentFee((await provider.getBlockNumber()) + 1, currencyCt, 1, 0))
                                ._bn.should.eq.BN(1e15.toString());
                        });
                    });
                });

                describe('if called with existent currency', () => {
                    describe('if called with non-existent discount key', () => {
                        it('should get the nominal value', async () => {
                            (await ethersConfiguration.currencyPaymentFee((await provider.getBlockNumber()) + 1, currencyCt, currencyId, 0))
                                ._bn.should.eq.BN(2e15.toString());
                        });
                    });

                    describe('if called with existent discount key', () => {
                        it('should get the discounted value', async () => {
                            (await ethersConfiguration.currencyPaymentFee((await provider.getBlockNumber()) + 1, currencyCt, currencyId, 1))
                                ._bn.should.eq.BN(18e14.toString());
                        });
                    });
                });
            });

            describe('setCurrencyPaymentFee()', () => {
                let currencyCt, currencyId;

                before(async () => {
                    currencyCt = Wallet.createRandom().address;
                    currencyId = 0;
                });

                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setCurrencyPaymentFee(
                            (await provider.getBlockNumber()) + 1, currencyCt, currencyId, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setCurrencyPaymentFee(await provider.getBlockNumber(), currencyCt, currencyId, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                    });
                });

                describe('if lengths of discount keys and values differ', () => {
                    it('should revert', async () => {
                        web3Configuration.setCurrencyPaymentFee((await provider.getBlockNumber()) + 1, currencyCt, currencyId, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setCurrencyPaymentFee((await provider.getBlockNumber()) + 1, currencyCt, currencyId, 1e18, [1, 10], [1e17, 2e17]);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetCurrencyPaymentFeeEvent');

                        (await ethersConfiguration.currencyPaymentFee((await provider.getBlockNumber()) + 1, currencyCt, currencyId, 0))
                            ._bn.should.eq.BN(1e18.toString());
                        (await ethersConfiguration.currencyPaymentFeesCount(currencyCt, currencyId))
                            ._bn.should.eq.BN(1);
                    });
                });
            });

            describe('tradeMakerMinimumFeesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.tradeMakerMinimumFeesCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('tradeMakerMinimumFee()', () => {
                it('should revert', async () => {
                    ethersConfiguration.tradeMakerMinimumFee((await provider.getBlockNumber()) + 1)
                        .should.be.rejected;
                });
            });

            describe('setTradeMakerMinimumFee()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeMakerMinimumFee(
                            (await provider.getBlockNumber()) + 1, 1e14, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeMakerMinimumFee(await provider.getBlockNumber(), 1e18)
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new value and emit event', async () => {
                        const result = await web3Configuration.setTradeMakerMinimumFee(
                            (await provider.getBlockNumber()) + 1, 1e18
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetTradeMakerMinimumFeeEvent');

                        (await ethersConfiguration.tradeMakerMinimumFee((await provider.getBlockNumber()) + 1))
                            ._bn.should.eq.BN(1e18.toString());
                        (await ethersConfiguration.tradeMakerMinimumFeesCount())
                            ._bn.should.eq.BN(1);
                    });
                });
            });

            describe('tradeTakerMinimumFeesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.tradeTakerMinimumFeesCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('tradeTakerMinimumFee()', () => {
                it('should revert', async () => {
                    ethersConfiguration.tradeTakerMinimumFee((await provider.getBlockNumber()) + 1)
                        .should.be.rejected;
                });
            });

            describe('setTradeTakerMinimumFee()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeTakerMinimumFee(
                            (await provider.getBlockNumber()) + 1, 1e14, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setTradeTakerMinimumFee(await provider.getBlockNumber(), 1e18)
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new value and emit event', async () => {
                        const result = await web3Configuration.setTradeTakerMinimumFee(
                            (await provider.getBlockNumber()) + 1, 1e18
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetTradeTakerMinimumFeeEvent');

                        (await ethersConfiguration.tradeTakerMinimumFee((await provider.getBlockNumber()) + 1))
                            ._bn.should.eq.BN(1e18.toString());
                        (await ethersConfiguration.tradeTakerMinimumFeesCount())
                            ._bn.should.eq.BN(1);
                    });
                });
            });

            describe('paymentMinimumFeesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.paymentMinimumFeesCount())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('paymentMinimumFee()', () => {
                it('should revert', async () => {
                    ethersConfiguration.paymentMinimumFee((await provider.getBlockNumber()) + 1)
                        .should.be.rejected;
                });
            });

            describe('setPaymentMinimumFee()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setPaymentMinimumFee(
                            (await provider.getBlockNumber()) + 1, 1e14, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setPaymentMinimumFee(await provider.getBlockNumber(), 1e18)
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new value and emit event', async () => {
                        const result = await web3Configuration.setPaymentMinimumFee(
                            (await provider.getBlockNumber()) + 1, 1e18
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetPaymentMinimumFeeEvent');

                        (await ethersConfiguration.paymentMinimumFee((await provider.getBlockNumber()) + 1))
                            ._bn.should.eq.BN(1e18.toString());
                        (await ethersConfiguration.paymentMinimumFeesCount())
                            ._bn.should.eq.BN(1);
                    });
                });
            });

            describe('currencyPaymentMinimumFeesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.currencyPaymentMinimumFeesCount(Wallet.createRandom().address, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('currencyPaymentMinimumFee()', () => {
                let currencyCt, currencyId;

                before(() => {
                    currencyCt = Wallet.createRandom().address;
                    currencyId = 0;
                });

                beforeEach(async () => {
                    await web3Configuration.setCurrencyPaymentMinimumFee((await provider.getBlockNumber()) + 1, currencyCt, currencyId, 1e14);
                });

                describe('if called with non-existent currency', () => {
                    describe('if called with non-existent currency contract', () => {
                        it('should be reverted', async () => {
                            web3Configuration.currencyPaymentMinimumFee.call(
                                (await provider.getBlockNumber()) + 1, Wallet.createRandom().address, currencyId, 0
                            ).should.be.rejected;
                        });
                    });

                    describe('if called with non-existent currency ID', () => {
                        it('should be reverted', async () => {
                            web3Configuration.currencyPaymentMinimumFee.call(
                                (await provider.getBlockNumber()) + 1, currencyCt, 1, 0
                            ).should.be.rejected;
                        });
                    });
                });

                describe('if called with existent currency', () => {
                    it('should get the initial value', async () => {
                        (await ethersConfiguration.currencyPaymentMinimumFee((await provider.getBlockNumber()) + 1, currencyCt, currencyId))
                            ._bn.should.eq.BN(1e14.toString());
                    });
                });
            });

            describe('setCurrencyPaymentMinimumFee()', () => {
                let currencyCt, currencyId;

                before(async () => {
                    currencyCt = Wallet.createRandom().address;
                    currencyId = 0;
                });

                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setCurrencyPaymentMinimumFee(
                            (await provider.getBlockNumber()) + 1, currencyCt, currencyId, 1e14, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setCurrencyPaymentMinimumFee(
                            await provider.getBlockNumber(), currencyCt, currencyId, 1e18
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setCurrencyPaymentMinimumFee(
                            (await provider.getBlockNumber()) + 1, currencyCt, currencyId, 1e18
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetCurrencyPaymentMinimumFeeEvent');

                        (await ethersConfiguration.currencyPaymentMinimumFee((await provider.getBlockNumber()) + 1, currencyCt, currencyId))
                            ._bn.should.eq.BN(1e18.toString());
                        (await ethersConfiguration.currencyPaymentMinimumFeesCount(currencyCt, currencyId))
                            ._bn.should.eq.BN(1);
                    });
                });
            });

            describe('feeCurrenciesCount()', () => {
                it('should return the initial value', async () => {
                    (await ethersConfiguration.feeCurrenciesCount(address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('feeCurrency()', () => {
                it('should revert', async () => {
                    ethersConfiguration.feeCurrency((await provider.getBlockNumber()) + 1, address0, 0)
                        .should.be.rejected;
                });
            });

            describe('setFeeCurrency()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setFeeCurrency(
                            (await provider.getBlockNumber()) + 1, address0, 0, address0, 0, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with block number below constraints', () => {
                    it('should revert', async () => {
                        web3Configuration.setFeeCurrency(
                            await provider.getBlockNumber(), address0, 0, address0, 0
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new value and emit event', async () => {
                        const result = await web3Configuration.setFeeCurrency(
                            (await provider.getBlockNumber()) + 1, address0, 0, address0, 0
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetFeeCurrencyEvent');

                        const feeCurrency = await ethersConfiguration.feeCurrency((await provider.getBlockNumber()) + 1, address0, 0);
                        feeCurrency.ct.should.equal(address0);
                        feeCurrency.id._bn.should.eq.BN(0);
                        (await ethersConfiguration.feeCurrenciesCount(address0, 0))
                            ._bn.should.eq.BN(1);
                    });
                });
            });

            describe('walletLockTimeout()', () => {
                it('should revert', async () => {
                    ethersConfiguration.walletLockTimeout()
                        .should.be.rejected;
                });
            });

            describe('setWalletLockTimeout()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setWalletLockTimeout(
                            (await provider.getBlockNumber()) + 1, 100, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setWalletLockTimeout((await provider.getBlockNumber()) + 1, 100);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetWalletLockTimeoutEvent');

                        (await ethersConfiguration.walletLockTimeout())
                            ._bn.should.eq.BN(100);
                    });
                });
            });

            describe('cancelOrderChallengeTimeout()', () => {
                it('should revert', async () => {
                    ethersConfiguration.cancelOrderChallengeTimeout()
                        .should.be.rejected;
                });
            });

            describe('setCancelOrderChallengeTimeout()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setCancelOrderChallengeTimeout(
                            (await provider.getBlockNumber()) + 1, 100, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setCancelOrderChallengeTimeout((await provider.getBlockNumber()) + 1, 100);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetCancelOrderChallengeTimeoutEvent');

                        (await ethersConfiguration.cancelOrderChallengeTimeout())
                            ._bn.should.eq.BN(100);
                    });
                });
            });

            describe('settlementChallengeTimeout()', () => {
                it('should revert', async () => {
                    ethersConfiguration.settlementChallengeTimeout()
                        .should.be.rejected;
                });
            });

            describe('setSettlementChallengeTimeout()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setSettlementChallengeTimeout(
                            (await provider.getBlockNumber()) + 1, 100, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setSettlementChallengeTimeout(
                            (await provider.getBlockNumber()) + 1, 100
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetSettlementChallengeTimeoutEvent');

                        (await ethersConfiguration.settlementChallengeTimeout())
                            ._bn.should.eq.BN(100);
                    });
                });
            });

            describe('fraudStakeFraction()', () => {
                it('should revert', async () => {
                    ethersConfiguration.fraudStakeFraction()
                        .should.be.rejected;
                });
            });

            describe('setFraudStakeFraction()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setFraudStakeFraction((await provider.getBlockNumber()) + 1, 1e18, {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setFraudStakeFraction((await provider.getBlockNumber()) + 1, 1e18);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetFraudStakeFractionEvent');

                        (await ethersConfiguration.fraudStakeFraction())
                            ._bn.should.eq.BN(1e18.toString());
                    });
                });
            });

            describe('walletSettlementStakeFraction()', () => {
                it('should revert', async () => {
                    ethersConfiguration.walletSettlementStakeFraction()
                        .should.be.rejected;
                });
            });

            describe('setWalletSettlementStakeFraction()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setWalletSettlementStakeFraction((await provider.getBlockNumber()) + 1, 1e18, {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setWalletSettlementStakeFraction((await provider.getBlockNumber()) + 1, 1e18);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetWalletSettlementStakeFractionEvent');

                        (await ethersConfiguration.walletSettlementStakeFraction())
                            ._bn.should.eq.BN(1e18.toString());
                    });
                });
            });

            describe('operatorSettlementStakeFraction()', () => {
                it('should revert', async () => {
                    ethersConfiguration.operatorSettlementStakeFraction()
                        .should.be.rejected;
                });
            });

            describe('setOperatorSettlementStakeFraction()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setOperatorSettlementStakeFraction((await provider.getBlockNumber()) + 1, 1e18, {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setOperatorSettlementStakeFraction((await provider.getBlockNumber()) + 1, 1e18);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetOperatorSettlementStakeFractionEvent');

                        (await ethersConfiguration.operatorSettlementStakeFraction())
                            ._bn.should.eq.BN(1e18.toString());
                    });
                });
            });

            describe('operatorSettlementStake()', () => {
                it('should revert', async () => {
                    ethersConfiguration.operatorSettlementStake()
                        .should.be.rejected;
                });
            });

            describe('setOperatorSettlementStake()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setOperatorSettlementStake(
                            (await provider.getBlockNumber()) + 1, 1e18, address0, 0, {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should successfully set new values and emit event', async () => {
                        const result = await web3Configuration.setOperatorSettlementStake(
                            (await provider.getBlockNumber()) + 1, 1e18, address0, 0
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetOperatorSettlementStakeEvent');

                        const stake = await ethersConfiguration.operatorSettlementStake();
                        stake.amount._bn.should.eq.BN(1e18.toString());
                        stake.currencyCt.should.equal(address0);
                        stake.currencyId._bn.should.eq.BN(0);
                    });
                });
            });

            describe('earliestSettlementBlockNumber()', () => {
                it('should equal value initialized', async () => {
                    (await ethersConfiguration.earliestSettlementBlockNumber())
                        ._bn.should.eq.BN(0);
                });
            });

            describe('earliestSettlementBlockNumberUpdateDisabled()', () => {
                it('should equal value initialized', async () => {
                    (await web3Configuration.earliestSettlementBlockNumberUpdateDisabled.call())
                        .should.be.false;
                });
            });

            describe('disableEarliestSettlementBlockNumberUpdate()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.disableEarliestSettlementBlockNumberUpdate({from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should equal value initialized', async () => {
                        const result = await web3Configuration.disableEarliestSettlementBlockNumberUpdate();

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('DisableEarliestSettlementBlockNumberUpdateEvent');

                        (await web3Configuration.earliestSettlementBlockNumberUpdateDisabled.call())
                            .should.be.true;
                    });
                });
            });

            describe('setEarliestSettlementBlockNumber()', () => {
                describe('if called by non-operator', () => {
                    it('should revert', async () => {
                        web3Configuration.setEarliestSettlementBlockNumber(1000, {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with update disabled', () => {
                    before(async () => {
                        await web3Configuration.disableEarliestSettlementBlockNumberUpdate();
                    });

                    it('should revert', async () => {
                        web3Configuration.setEarliestSettlementBlockNumber(1000, {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if within operational constraints', () => {
                    it('should equal value initialized', async () => {
                        const result = await web3Configuration.setEarliestSettlementBlockNumber(1000);

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('SetEarliestSettlementBlockNumberEvent');

                        (await ethersConfiguration.earliestSettlementBlockNumber())
                            ._bn.should.eq.BN(1000);
                    });
                });
            });
        }
    );
};
