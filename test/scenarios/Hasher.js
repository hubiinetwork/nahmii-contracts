const chai = require('chai');
const mocks = require('../mocks');

chai.should();

module.exports = function (glob) {
    describe('Hasher', () => {
        let ethersHasher;

        before(() => {
            ethersHasher = glob.ethersIoHasher;
        });

        describe('hashTrade()', () => {
            let trade;

            before(async () => {
                trade = await mocks.mockTrade(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersHasher.hashTrade(trade);
                result.should.equal(trade.seal.hash)
            });
        });

        describe('hashPaymentAsWallet()', () => {
            let payment;

            before(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersHasher.hashPaymentAsWallet(payment);
                result.should.equal(payment.seals.wallet.hash);
            });
        });

        describe('hashPaymentAsOperator()', () => {
            let payment;

            before(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersHasher.hashPaymentAsOperator(payment);
                result.should.equal(payment.seals.exchange.hash);
            });
        });

        describe('hashOrderAsWallet()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersHasher.hashOrderAsWallet(order);
                result.should.equal(order.seals.wallet.hash);
            });
        });

        describe('hashOrderAsOperator()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersHasher.hashOrderAsOperator(order);
                result.should.equal(order.seals.exchange.hash);
            });
        });
    });
};
