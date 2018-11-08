const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract} = require('ethers');
const Configuration = artifacts.require('Configuration');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {

    describe('Configuration', () => {
        let web3Configuration, ethersConfiguration;
        let provider, blockNumber;

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3Configuration = await Configuration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, Configuration.abi, glob.signer_owner);

            blockNumber = await provider.getBlockNumber();
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
            describe('if called with registered service as sender', () => {
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

            describe('if called by non-deployer or registered service', () => {
                it('should revert', async () => {
                    web3Configuration.setOperationalModeExit({from: glob.user_b}).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should set exit operational mode', async () => {
                    await web3Configuration.setOperationalModeExit();
                    const operationalModeExit = await web3Configuration.isOperationalModeExit.call();
                    operationalModeExit.should.be.true;
                });
            });
        });

        describe('updateDelayBlocks()', () => {
            it('should revert', async () => {
                (await ethersConfiguration.updateDelayBlocks())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('updateDelayBlocksCount()', () => {
            it('should revert', async () => {
                (await ethersConfiguration.updateDelayBlocksCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('setUpdateDelayBlocks()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setUpdateDelayBlocks(
                        blockNumber + 1, 1, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setUpdateDelayBlocks(
                        blockNumber, 1
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new value and emit event', async () => {
                    const result = await web3Configuration.setUpdateDelayBlocks(
                        blockNumber + 1, 1
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
                (await ethersConfiguration.confirmationBlocks())
                    ._bn.should.eq.BN(12);
            });
        });

        describe('confirmationBlocksCount()', () => {
            it('should revert', async () => {
                (await ethersConfiguration.confirmationBlocksCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('setConfirmationBlocks()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setConfirmationBlocks(
                        blockNumber + 1, 1, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setConfirmationBlocks(
                        blockNumber, 1
                    ).should.be.rejected;
                });
            });

            describe('if provided with correct parameter and called with sender that is deployer', () => {
                it('should successfully set new value and emit event', async () => {
                    const result = await web3Configuration.setConfirmationBlocks(
                        blockNumber + 1, 1
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfirmationBlocksEvent');

                    (await ethersConfiguration.confirmationBlocks())
                        ._bn.should.eq.BN(1);
                    (await ethersConfiguration.confirmationBlocksCount())
                        ._bn.should.eq.BN(2);
                });
            });
        });

        describe('tradeMakerFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.tradeMakerFeesCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('tradeMakerFee()', () => {
            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    (await ethersConfiguration.tradeMakerFee(blockNumber + 1, 0))
                        ._bn.should.eq.BN(1e15.toString());
                });
            });
        });

        describe('setTradeMakerFee()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerFee(
                        blockNumber, 1e18, [1, 10], [1e17, 2e17]
                    ).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17, 3e17]
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeMakerFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17]
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerFeeEvent');

                    (await ethersConfiguration.tradeMakerFee(blockNumber + 1, 1))
                        ._bn.should.eq.BN(9e17.toString());
                    (await ethersConfiguration.tradeMakerFeesCount())
                        ._bn.should.eq.BN(2);
                });
            })
        });

        describe('tradeTakerFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.tradeTakerFeesCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('tradeTakerFee()', () => {
            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    (await ethersConfiguration.tradeTakerFee(blockNumber + 1, 0))
                        ._bn.should.eq.BN(2e15.toString());
                });
            });
        });

        describe('setTradeTakerFee()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerFee(
                        blockNumber, 1e18, [1, 10], [1e17, 2e17]
                    ).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17, 3e17]
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeTakerFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17]
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerFeeEvent');

                    (await ethersConfiguration.tradeTakerFee(blockNumber + 1, 1))
                        ._bn.should.eq.BN(9e17.toString());
                    (await ethersConfiguration.tradeTakerFeesCount())
                        ._bn.should.eq.BN(2);
                });
            })
        });

        describe('paymentFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.paymentFeesCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('paymentFee()', () => {
            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    (await ethersConfiguration.paymentFee(blockNumber + 1, 0))
                        ._bn.should.eq.BN(1e15.toString());
                });
            });
        });

        describe('setPaymentFee()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentFee(
                        blockNumber, 1e18, [1, 10], [1e17, 2e17]
                    ).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17, 3e17]
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setPaymentFee(
                        blockNumber + 1, 1e18, [1, 10], [1e17, 2e17]
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentFeeEvent');

                    (await ethersConfiguration.paymentFee(blockNumber + 1, 1))
                        ._bn.should.eq.BN(9e17.toString());
                    (await ethersConfiguration.paymentFeesCount())
                        ._bn.should.eq.BN(2);
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
                    blockNumber + 1, 1e15, [1, 10], [1e17, 2e17]
                );
                await web3Configuration.setCurrencyPaymentFee(
                    currencyCt, currencyId, blockNumber + 2, 2e15, [1, 10], [1e17, 2e17]
                );
            });

            describe('if called with non-existent currency', () => {
                describe('if called with non-existent currency contract', () => {
                    it('should get the currency agnostic value', async () => {
                        (await ethersConfiguration.currencyPaymentFee(
                            Wallet.createRandom().address, currencyId, blockNumber + 2, 0
                        ))._bn.should.eq.BN(1e15.toString());
                    });
                });

                describe('if called with non-existent currency ID', () => {
                    it('should get the currency agnostic value', async () => {
                        (await ethersConfiguration.currencyPaymentFee(currencyCt, 1, blockNumber + 2, 0))
                            ._bn.should.eq.BN(1e15.toString());
                    });
                });
            });

            describe('if called with existent currency', () => {
                describe('if called with non-existent discount key', () => {
                    it('should get the nominal value', async () => {
                        (await ethersConfiguration.currencyPaymentFee(currencyCt, currencyId, blockNumber + 2, 0))
                            ._bn.should.eq.BN(2e15.toString());
                    });
                });

                describe('if called with existent discount key', () => {
                    it('should get the discounted value', async () => {
                        (await ethersConfiguration.currencyPaymentFee(currencyCt, currencyId, blockNumber + 2, 1))
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

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentFee(
                        currencyCt, currencyId, blockNumber + 1, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentFee(currencyCt, currencyId, blockNumber, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentFee(currencyCt, currencyId, blockNumber + 1, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCurrencyPaymentFee(currencyCt, currencyId, blockNumber + 1, 1e18, [1, 10], [1e17, 2e17]);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCurrencyPaymentFeeEvent');

                    (await ethersConfiguration.currencyPaymentFee(currencyCt, currencyId, blockNumber + 1, 0))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.currencyPaymentFeesCount(currencyCt, currencyId))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('tradeMakerMinimumFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.tradeMakerMinimumFeesCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('tradeMakerMinimumFee()', () => {
            it('should get the initial value', async () => {
                (await ethersConfiguration.tradeMakerMinimumFee(blockNumber + 1))
                    ._bn.should.eq.BN(1e14.toString());
            });
        });

        describe('setTradeMakerMinimumFee()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerMinimumFee(
                        blockNumber + 1, 1e14, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerMinimumFee(blockNumber, 1e18)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new value and emit event', async () => {
                    const result = await web3Configuration.setTradeMakerMinimumFee(
                        blockNumber + 1, 1e18
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerMinimumFeeEvent');

                    (await ethersConfiguration.tradeMakerMinimumFee(blockNumber + 1))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.tradeMakerMinimumFeesCount())
                        ._bn.should.eq.BN(2);
                });
            });
        });

        describe('tradeTakerMinimumFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.tradeTakerMinimumFeesCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('tradeTakerMinimumFee()', () => {
            it('should get the initial value', async () => {
                (await ethersConfiguration.tradeTakerMinimumFee(blockNumber + 1))
                    ._bn.should.eq.BN(2e14.toString());
            });
        });

        describe('setTradeTakerMinimumFee()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerMinimumFee(
                        blockNumber + 1, 1e14, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerMinimumFee(blockNumber, 1e18)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new value and emit event', async () => {
                    const result = await web3Configuration.setTradeTakerMinimumFee(
                        blockNumber + 1, 1e18
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerMinimumFeeEvent');

                    (await ethersConfiguration.tradeTakerMinimumFee(blockNumber + 1))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.tradeTakerMinimumFeesCount())
                        ._bn.should.eq.BN(2);
                });
            });
        });

        describe('paymentMinimumFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.paymentMinimumFeesCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('paymentMinimumFee()', () => {
            it('should get the initial value', async () => {
                (await ethersConfiguration.paymentMinimumFee(blockNumber + 1))
                    ._bn.should.eq.BN(1e14.toString());
            });
        });

        describe('setPaymentMinimumFee()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentMinimumFee(
                        blockNumber + 1, 1e14, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentMinimumFee(blockNumber, 1e18)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new value and emit event', async () => {
                    const result = await web3Configuration.setPaymentMinimumFee(
                        blockNumber + 1, 1e18
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentMinimumFeeEvent');

                    (await ethersConfiguration.paymentMinimumFee(blockNumber + 1))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.paymentMinimumFeesCount())
                        ._bn.should.eq.BN(2);
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
                await web3Configuration.setCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumber + 1, 1e14);
            });

            describe('if called with non-existent currency', () => {
                describe('if called with non-existent currency contract', () => {
                    it('should be reverted', () => {
                        web3Configuration.currencyPaymentMinimumFee.call(
                            Wallet.createRandom().address, currencyId, blockNumber + 1, 0
                        ).should.be.rejected;
                    });
                });

                describe('if called with non-existent currency ID', () => {
                    it('should be reverted', () => {
                        web3Configuration.currencyPaymentMinimumFee.call(
                            currencyCt, 1, blockNumber + 1, 0
                        ).should.be.rejected;
                    });
                });
            });

            describe('if called with existent currency', () => {
                it('should get the initial value', async () => {
                    (await ethersConfiguration.currencyPaymentMinimumFee(currencyCt, currencyId, blockNumber + 1))
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

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentMinimumFee(
                        currencyCt, currencyId, blockNumber + 1, 1e14, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number below constraints', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumber, 1e18).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumber + 1, 1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCurrencyPaymentMinimumFeeEvent');

                    (await ethersConfiguration.currencyPaymentMinimumFee(currencyCt, currencyId, blockNumber + 1))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.currencyPaymentMinimumFeesCount(currencyCt, currencyId))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('cancelOrderChallengeTimeout()', () => {
            it('should equal value initialized', async () => {
                (await ethersConfiguration.cancelOrderChallengeTimeout())
                    ._bn.should.eq.BN(60 * 60 * 24 * 3);
            });
        });

        describe('setCancelOrderChallengeTimeout()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setCancelOrderChallengeTimeout(
                        blockNumber + 1, 100, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCancelOrderChallengeTimeout(blockNumber + 1, 100);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrderChallengeTimeoutEvent');

                    (await ethersConfiguration.cancelOrderChallengeTimeout())
                        ._bn.should.eq.BN(100);
                });
            });
        });

        describe('settlementChallengeTimeout()', () => {
            it('should equal value initialized', async () => {
                (await ethersConfiguration.settlementChallengeTimeout())
                    ._bn.should.eq.BN(60 * 60 * 24 * 5);
            });
        });

        describe('setSettlementChallengeTimeout()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setSettlementChallengeTimeout(
                        blockNumber + 1, 100, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setSettlementChallengeTimeout(
                        blockNumber + 1, 100
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSettlementChallengeTimeoutEvent');

                    (await ethersConfiguration.settlementChallengeTimeout())
                        ._bn.should.eq.BN(100);
                });
            });
        });

        describe('walletSettlementStakeFraction()', () => {
            it('should return initial value', async () => {
                (await ethersConfiguration.walletSettlementStakeFraction())
                    ._bn.should.eq.BN(1e17.toString());
            });
        });

        describe('setWalletSettlementStakeFraction()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setWalletSettlementStakeFraction(blockNumber + 1, 1e18, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setWalletSettlementStakeFraction(blockNumber + 1, 1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWalletSettlementStakeFractionEvent');

                    (await ethersConfiguration.walletSettlementStakeFraction())
                        ._bn.should.eq.BN(1e18.toString());
                });
            });
        });

        describe('operatorSettlementStakeFraction()', () => {
            it('should return initial value', async () => {
                (await ethersConfiguration.operatorSettlementStakeFraction())
                    ._bn.should.eq.BN(5e17.toString());
            });
        });

        describe('setOperatorSettlementStakeFraction()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setOperatorSettlementStakeFraction(blockNumber + 1, 1e18, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setOperatorSettlementStakeFraction(blockNumber + 1, 1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorSettlementStakeFractionEvent');

                    (await ethersConfiguration.operatorSettlementStakeFraction())
                        ._bn.should.eq.BN(1e18.toString());
                });
            });
        });

        describe('fraudStakeFraction()', () => {
            it('should return initial value', async () => {
                (await ethersConfiguration.fraudStakeFraction())
                    ._bn.should.eq.BN(5e17.toString());
            });
        });

        describe('setFraudStakeFraction()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setFraudStakeFraction(blockNumber + 1, 1e18, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setFraudStakeFraction(blockNumber + 1, 1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFraudStakeFractionEvent');

                    (await ethersConfiguration.fraudStakeFraction())
                        ._bn.should.eq.BN(1e18.toString());
                });
            });
        });
    });
};
