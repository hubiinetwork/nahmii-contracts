const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');

chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;
const Wallet = ethers.Wallet;

module.exports = (glob) => {
    describe('Configuration', () => {
        let web3Configuration, provider, blockNumberAhead, blockNumberBehind;
        const feeUpdates = {
            tradeMakerFee: 0,
            tradeTakerFee: 0,
            paymentFee: 0,
            tradeMakerMinimumFee: 0,
            tradeTakerMinimumFee: 0,
            paymentMininumFee: 0
        };

        before(async () => {
            web3Configuration = glob.web3Configuration;
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            const blockNumber = await provider.getBlockNumber();
            blockNumberAhead = blockNumber + 10;
            blockNumberBehind = blockNumber - 10;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3Configuration.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('isRegisteredService', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                const registered = await web3Configuration.isRegisteredService.call(address, 'some_action');
                registered.should.be.false;
            });
        });

        describe('registerService()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                it('should register service and emit event', async () => {
                    const result = await web3Configuration.registerService(address, 'some_action');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('RegisterServiceEvent');
                    const registered = await web3Configuration.isRegisteredService.call(address, 'some_action');
                    registered.should.be.true;
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Configuration.registerService(address, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('deregisterService()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                it('should deregister service and emit event', async () => {
                    const result = await web3Configuration.deregisterService(address, 'some_action');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('DeregisterServiceEvent');
                    const registered = await web3Configuration.isRegisteredService.call(address, 'some_action');
                    registered.should.be.false;
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Configuration.deregisterService(address, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
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
                before(async () => {
                    await web3Configuration.registerService(glob.user_a, 'OperationalMode');
                });

                it('should set exit operational mode', async () => {
                    await web3Configuration.setOperationalModeExit({from: glob.user_a});
                    const operationalModeExit = await web3Configuration.isOperationalModeExit.call();
                    operationalModeExit.should.be.true;
                });
            });

            describe('if called with sender that is not owner or registered service', () => {
                it('should revert', async () => {
                    web3Configuration.setOperationalModeExit({from: glob.user_b}).should.be.rejected;
                });
            });
        });

        describe('getPartsPer()', () => {
            it('should get the value initialized at construction time', async () => {
                const partsPer = await web3Configuration.PARTS_PER.call();
                partsPer.toNumber().should.equal(1e18);
            });
        });

        describe('getTradeMakerFee()', () => {
            beforeEach(async () => {
                await web3Configuration.setTradeMakerFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.tradeMakerFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await web3Configuration.getTradeMakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await web3Configuration.getTradeMakerFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setTradeMakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.tradeMakerFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerFeeEvent');
                    const value = await web3Configuration.getTradeMakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getTradeMakerFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeMakerFee);
            });
        });

        describe('getTradeTakerFee()', () => {
            before(async () => {
                await web3Configuration.setTradeTakerFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.tradeTakerFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await web3Configuration.getTradeTakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await web3Configuration.getTradeTakerFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
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
                    const value = await web3Configuration.getTradeTakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getTradeTakerFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeTakerFee);
            });
        });

        describe('getPaymentFee()', () => {
            before(async () => {
                await web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.paymentFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await web3Configuration.getPaymentFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await web3Configuration.getPaymentFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
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
                    const value = await web3Configuration.getPaymentFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getPaymentFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getPaymentFeesCount.call();
                value.toNumber().should.equal(feeUpdates.paymentFee);
            });
        });

        describe('getTradeMakerMinimumFee()', () => {
            before(async () => {
                await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.tradeMakerMinimumFee++;
            });

            it('should get the nominal value', async () => {
                const value = await web3Configuration.getTradeMakerMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setTradeMakerMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.tradeMakerMinimumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerMinimumFeeEvent');
                    const value = await web3Configuration.getTradeMakerMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getTradeMakerMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeMakerMinimumFee);
            });
        });

        describe('getTradeTakerMinimumFee()', () => {
            before(async () => {
                await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.tradeTakerMinimumFee++;
            });

            it('should get the nominal value', async () => {
                const value = await web3Configuration.getTradeTakerMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setTradeTakerMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.tradeTakerMinimumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerMinimumFeeEvent');
                    const value = await web3Configuration.getTradeTakerMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getTradeTakerMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeTakerMinimumFee);
            });
        });

        describe('getPaymentMinimumFee()', () => {
            before(async () => {
                await web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.paymentMininumFee++;

            });

            it('should get the nominal value', async () => {
                const value = await web3Configuration.getPaymentMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setPaymentMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.paymentMininumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentMinimumFeeEvent');
                    const value = await web3Configuration.getPaymentMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getPaymentMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getPaymentMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.paymentMininumFee);
            });
        });

        describe('getCancelOrderChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                const value = await web3Configuration.getCancelOrderChallengeTimeout.call();
                value.toNumber().should.equal(0);
            });
        });

        describe('setCancelOrderChallengeTimeout()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await web3Configuration.getCancelOrderChallengeTimeout.call();
                });

                after(async () => {
                    await web3Configuration.setCancelOrderChallengeTimeout(initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCancelOrderChallengeTimeout(100);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrderChallengeTimeout');
                    const value = await web3Configuration.getCancelOrderChallengeTimeout.call();
                    value.toNumber().should.equal(100);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setCancelOrderChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getDealSettlementChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                const value = await web3Configuration.dealSettlementChallengeTimeout.call();
                value.toNumber().should.equal(0);
            });
        });

        describe('setDealSettlementChallengeTimeout()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await web3Configuration.dealSettlementChallengeTimeout.call();
                });

                after(async () => {
                    await web3Configuration.setDealSettlementChallengeTimeout(initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setDealSettlementChallengeTimeout(100);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDealSettlementChallengeTimeout');
                    const value = await web3Configuration.dealSettlementChallengeTimeout.call();
                    value.toNumber().should.equal(100);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setDealSettlementChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getUnchallengeOrderCandidateByTradeStake()', () => {
            it('should equal values initialized at construction time', async () => {
                const values = await web3Configuration.getUnchallengeOrderCandidateByTradeStake.call();
                values.should.be.an('array').and.have.lengthOf(2);
                values[0].should.equal('0x0000000000000000000000000000000000000000');
                values[1].toNumber().should.equal(0);
            });
        });

        describe('setUnchallengeOrderCandidateByTradeStake()', () => {
            describe('if called with sender that is owner', () => {
                let initialValues;

                before(async () => {
                    initialValues = await web3Configuration.unchallengeOrderCandidateByTradeStake.call();
                });

                after(async () => {
                    await web3Configuration.setUnchallengeOrderCandidateByTradeStake(initialValues[0], initialValues[1]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setUnchallengeOrderCandidateByTradeStake('0x0000000000000000000000000000000000000001', 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetUnchallengeDealSettlementOrderByTradeStakeEvent');
                    const values = await web3Configuration.unchallengeOrderCandidateByTradeStake.call();
                    values[0].should.equal('0x0000000000000000000000000000000000000001');
                    values[1].toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setUnchallengeOrderCandidateByTradeStake('0x0000000000000000000000000000000000000001', 1e18, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getFalseWalletSignatureStake()', () => {
            it('should equal values initialized at construction time', async () => {
                const values = await web3Configuration.getFalseWalletSignatureStake.call();
                values.should.be.an('array').and.have.lengthOf(2);
                values[0].should.equal('0x0000000000000000000000000000000000000000');
                values[1].toNumber().should.equal(0);
            });
        });

        describe('setFalseWalletSignatureStake()', () => {
            describe('if called with sender that is owner', () => {
                let initialValues;

                before(async () => {
                    initialValues = await web3Configuration.unchallengeOrderCandidateByTradeStake.call();
                });

                after(async () => {
                    await web3Configuration.setFalseWalletSignatureStake(initialValues[0], initialValues[1]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setFalseWalletSignatureStake('0x0000000000000000000000000000000000000001', 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFalseWalletSignatureStakeEvent');
                    const values = await web3Configuration.unchallengeOrderCandidateByTradeStake.call();
                    values[0].should.equal('0x0000000000000000000000000000000000000001');
                    values[1].toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setFalseWalletSignatureStake('0x0000000000000000000000000000000000000001', 1e18, {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};
