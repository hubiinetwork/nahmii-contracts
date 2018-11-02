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
        let provider, blockNumber, blockNumberAhead;
        const feeUpdates = {
            tradeMakerFee: 0,
            tradeTakerFee: 0,
            paymentFee: 0,
            tradeMakerMinimumFee: 0,
            tradeTakerMinimumFee: 0,
            paymentMininumFee: 0
        };

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3Configuration = await Configuration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, Configuration.abi, glob.signer_owner);

            blockNumber = await provider.getBlockNumber();
            blockNumberAhead = blockNumber + 15;
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
            describe('if called with owner as sender', () => {
                it('should set exit operational mode', async () => {
                    await web3Configuration.setOperationalModeExit();
                    const operationalModeExit = await web3Configuration.isOperationalModeExit.call();
                    operationalModeExit.should.be.true;
                });
            });

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
        });

        describe('PARTS_PER()', () => {
            it('should get the value initialized at construction time', async () => {
                (await ethersConfiguration.PARTS_PER())
                    ._bn.should.eq.BN(1e18.toString());
            });
        });

        describe('confirmations()', () => {
            it('should get the value initialized at construction time', async () => {
                (await ethersConfiguration.confirmations())
                    ._bn.should.eq.BN(12);
            });
        });

        describe('setConfirmations()', () => {
            describe('if provided with correct parameter and called with sender that is owner', () => {
                it('should successfully set new value and emit event', async () => {
                    const result = await web3Configuration.setConfirmations(10);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfirmationsEvent');

                    (await ethersConfiguration.confirmations())
                        ._bn.should.eq.BN(10);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setConfirmations(20, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.getTradeMakerFeesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getTradeMakerFee()', () => {
            beforeEach(async () => {
                await web3Configuration.setTradeMakerFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.tradeMakerFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    (await ethersConfiguration.getTradeMakerFee(blockNumberAhead, 0))
                        ._bn.should.eq.BN(1e15.toString());
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    (await ethersConfiguration.getTradeMakerFee(blockNumberAhead, 1))
                        ._bn.should.eq.BN(9e14.toString());
                });
            });
        });

        describe('setTradeMakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeMakerFee(
                        blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]
                    );
                    feeUpdates.tradeMakerFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerFeeEvent');

                    (await ethersConfiguration.getTradeMakerFee(blockNumberAhead, 0))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.getTradeMakerFeesCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerFee(
                        blockNumberAhead, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one + number of confirmations', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerFee(
                        blockNumber, 1e18, [1, 10], [1e17, 2e17]
                    ).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerFee(
                        blockNumberAhead, 1e18, [1, 10], [1e17, 2e17, 3e17]
                    ).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.getTradeTakerFeesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getTradeTakerFee()', () => {
            beforeEach(async () => {
                await web3Configuration.setTradeTakerFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.tradeTakerFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    (await ethersConfiguration.getTradeTakerFee(blockNumberAhead, 0))
                        ._bn.should.eq.BN(1e15.toString());
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    (await ethersConfiguration.getTradeTakerFee(blockNumberAhead, 1))
                        ._bn.should.eq.BN(9e14.toString());
                });
            });
        });

        describe('setTradeTakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.tradeTakerFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerFeeEvent');

                    (await ethersConfiguration.getTradeTakerFee(blockNumberAhead, 0))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.getTradeTakerFeesCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one + number of confirmations', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerFee(blockNumber, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getPaymentFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.getPaymentFeesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getPaymentFee()', () => {
            beforeEach(async () => {
                await web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.paymentFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    (await ethersConfiguration.getPaymentFee(blockNumberAhead, 0))
                        ._bn.should.eq.BN(1e15.toString());
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    (await ethersConfiguration.getPaymentFee(blockNumberAhead, 1))
                        ._bn.should.eq.BN(9e14.toString());
                });
            });
        });

        describe('setPaymentFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setPaymentFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.paymentFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentFeeEvent');

                    (await ethersConfiguration.getPaymentFee(blockNumberAhead, 0))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.getPaymentFeesCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one + number of confirmations', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentFee(blockNumber, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getCurrencyPaymentFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.getCurrencyPaymentFeesCount(Wallet.createRandom().address, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getCurrencyPaymentFee()', () => {
            let currencyCt, currencyId;

            before(() => {
                currencyCt = Wallet.createRandom().address;
                currencyId = 0;
            });

            beforeEach(async () => {
                await web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                await web3Configuration.setCurrencyPaymentFee(currencyCt, currencyId, blockNumberAhead, 2e15, [1, 10], [1e17, 2e17]);
            });

            describe('if called with non-existent currency', () => {
                describe('if called with non-existent currency contract', () => {
                    it('should get the currency agnostic value', async () => {
                        (await ethersConfiguration.getCurrencyPaymentFee(
                            Wallet.createRandom().address, currencyId, blockNumberAhead, 0
                        ))._bn.should.eq.BN(1e15.toString());
                    });
                });

                describe('if called with non-existent currency ID', () => {
                    it('should get the currency agnostic value', async () => {
                        (await ethersConfiguration.getCurrencyPaymentFee(currencyCt, 1, blockNumberAhead, 0))
                            ._bn.should.eq.BN(1e15.toString());
                    });
                });
            });

            describe('if called with existent currency', () => {
                describe('if called with non-existent discount key', () => {
                    it('should get the nominal value', async () => {
                        (await ethersConfiguration.getCurrencyPaymentFee(currencyCt, currencyId, blockNumberAhead, 0))
                            ._bn.should.eq.BN(2e15.toString());
                    });
                });

                describe('if called with existent discount key', () => {
                    it('should get the discounted value', async () => {
                        (await ethersConfiguration.getCurrencyPaymentFee(currencyCt, currencyId, blockNumberAhead, 1))
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

            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCurrencyPaymentFee(currencyCt, currencyId, blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCurrencyPaymentFeeEvent');

                    (await ethersConfiguration.getCurrencyPaymentFee(currencyCt, currencyId, blockNumberAhead, 0))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.getCurrencyPaymentFeesCount(currencyCt, currencyId))
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentFee(currencyCt, currencyId, blockNumberAhead, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one + number of confirmations', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentFee(currencyCt, currencyId, blockNumber, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentFee(currencyCt, currencyId, blockNumberAhead, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerMinimumFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.getTradeMakerMinimumFeesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getTradeMakerMinimumFee()', () => {
            beforeEach(async () => {
                await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.tradeMakerMinimumFee++;
            });

            it('should get the nominal value', async () => {
                (await ethersConfiguration.getTradeMakerMinimumFee(blockNumberAhead))
                    ._bn.should.eq.BN(1e14.toString());
            });
        });

        describe('setTradeMakerMinimumFee()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.tradeMakerMinimumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerMinimumFeeEvent');

                    (await ethersConfiguration.getTradeMakerMinimumFee(blockNumberAhead))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.getTradeMakerMinimumFeesCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one + number of confirmations', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeMakerMinimumFee(blockNumber, 1e18).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerMinimumFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.getTradeTakerMinimumFeesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getTradeTakerMinimumFee()', () => {
            beforeEach(async () => {
                await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.tradeTakerMinimumFee++;
            });

            it('should get the nominal value', async () => {
                (await ethersConfiguration.getTradeTakerMinimumFee(blockNumberAhead))
                    ._bn.should.eq.BN(1e14.toString());
            });
        });

        describe('setTradeTakerMinimumFee()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.tradeTakerMinimumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerMinimumFeeEvent');

                    (await ethersConfiguration.getTradeTakerMinimumFee(blockNumberAhead))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.getTradeTakerMinimumFeesCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one + number of confirmations', () => {
                it('should revert', async () => {
                    web3Configuration.setTradeTakerMinimumFee(blockNumber, 1e18).should.be.rejected;
                });
            });
        });

        describe('getPaymentMinimumFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.getPaymentMinimumFeesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getPaymentMinimumFee()', () => {
            beforeEach(async () => {
                await web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.paymentMininumFee++;
            });

            it('should get the nominal value', async () => {
                (await ethersConfiguration.getPaymentMinimumFee(blockNumberAhead))
                    ._bn.should.eq.BN(1e14.toString());
            });
        });

        describe('setPaymentMinimumFee()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.paymentMininumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentMinimumFeeEvent');

                    (await ethersConfiguration.getPaymentMinimumFee(blockNumberAhead))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.getPaymentMinimumFeesCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one + number of confirmations', () => {
                it('should revert', async () => {
                    web3Configuration.setPaymentMinimumFee(blockNumber, 1e18).should.be.rejected;
                });
            });
        });

        describe('getCurrencyPaymentMinimumFeesCount()', () => {
            it('should return the initial value', async () => {
                (await ethersConfiguration.getCurrencyPaymentMinimumFeesCount(Wallet.createRandom().address, 0))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('getCurrencyPaymentMinimumFee()', () => {
            let currencyCt, currencyId;

            before(() => {
                currencyCt = Wallet.createRandom().address;
                currencyId = 0;
            });

            beforeEach(async () => {
                await web3Configuration.setCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumberAhead, 1e14);
            });

            describe('if called with non-existent currency', () => {
                describe('if called with non-existent currency contract', () => {
                    it('should be reverted', () => {
                        web3Configuration.getCurrencyPaymentMinimumFee.call(
                            Wallet.createRandom().address, currencyId, blockNumberAhead, 0
                        ).should.be.rejected;
                    });
                });

                describe('if called with non-existent currency ID', () => {
                    it('should be reverted', () => {
                        web3Configuration.getCurrencyPaymentMinimumFee.call(
                            currencyCt, 1, blockNumberAhead, 0
                        ).should.be.rejected;
                    });
                });
            });

            describe('if called with existent currency', () => {
                it('should get the nominal value', async () => {
                    (await ethersConfiguration.getCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumberAhead))
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

            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumberAhead, 1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCurrencyPaymentMinimumFeeEvent');

                    (await ethersConfiguration.getCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumberAhead))
                        ._bn.should.eq.BN(1e18.toString());
                    (await ethersConfiguration.getCurrencyPaymentMinimumFeesCount(currencyCt, currencyId))
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one + number of confirmations', () => {
                it('should revert', async () => {
                    web3Configuration.setCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumber, 1e18).should.be.rejected;
                });
            });
        });

        describe('cancelOrderChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                (await ethersConfiguration.cancelOrderChallengeTimeout())
                    ._bn.should.eq.BN(60 * 60 * 24 * 3);
            });
        });

        describe('setCancelOrderChallengeTimeout()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCancelOrderChallengeTimeout(100);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrderChallengeTimeoutEvent');

                    (await ethersConfiguration.cancelOrderChallengeTimeout())
                        ._bn.should.eq.BN(100);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setCancelOrderChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('settlementChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                (await ethersConfiguration.settlementChallengeTimeout())
                    ._bn.should.eq.BN(60 * 60 * 24 * 5);
            });
        });

        describe('setSettlementChallengeTimeout()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setSettlementChallengeTimeout(100);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSettlementChallengeTimeoutEvent');

                    (await ethersConfiguration.settlementChallengeTimeout())
                        ._bn.should.eq.BN(100);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setSettlementChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('unchallengeOrderCandidateByTradeStake()', () => {
            it('should return initial value', async () => {
                (await ethersConfiguration.unchallengeOrderCandidateByTradeStake())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('setUnchallengeOrderCandidateByTradeStake()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setUnchallengeOrderCandidateByTradeStake(1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetUnchallengeDriipSettlementOrderByTradeStakeEvent');

                    (await ethersConfiguration.unchallengeOrderCandidateByTradeStake())
                        ._bn.should.eq.BN(1e18.toString());
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setUnchallengeOrderCandidateByTradeStake(1e18, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('falseWalletSignatureStake()', () => {
            it('should return initial value', async () => {
                (await ethersConfiguration.falseWalletSignatureStake())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('setFalseWalletSignatureStake()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setFalseWalletSignatureStake(1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFalseWalletSignatureStakeEvent');

                    (await ethersConfiguration.falseWalletSignatureStake())
                        ._bn.should.eq.BN(1e18.toString());
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setFalseWalletSignatureStake(1e18, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('duplicateDriipNonceStake()', () => {
            it('should return initial value', async () => {
                (await ethersConfiguration.duplicateDriipNonceStake())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('setDuplicateDriipNonceStake()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setDuplicateDriipNonceStake(1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDuplicateDriipNonceStakeEvent');

                    (await ethersConfiguration.duplicateDriipNonceStake())
                        ._bn.should.eq.BN(1e18.toString());
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setDuplicateDriipNonceStake(1e18, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('doubleSpentOrderStake()', () => {
            it('should return initial value', async () => {
                (await ethersConfiguration.doubleSpentOrderStake())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('setDoubleSpentOrderStake()', () => {
            describe('if called from non-deployer', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setDoubleSpentOrderStake(1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDoubleSpentOrderStakeEvent');

                    (await ethersConfiguration.doubleSpentOrderStake())
                        ._bn.should.eq.BN(1e18.toString());
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3Configuration.setDoubleSpentOrderStake(1e18, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });
    });
};
