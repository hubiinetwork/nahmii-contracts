const chai = require('chai');
const mocks = require('../mocks');
const {Contract} = require('ethers');
const PaymentHasher = artifacts.require('PaymentHasher');

chai.should();

module.exports = function (glob) {
    describe('PaymentHasher', () => {
        let web3PaymentHasher, ethersPaymentHasher;

        before(async () => {
            web3PaymentHasher = await PaymentHasher.new(glob.owner);
            ethersPaymentHasher = new Contract(web3PaymentHasher.address, PaymentHasher.abi, glob.signer_owner);
        });

        describe('hashPaymentAsWallet()', () => {
            let payment;

            before(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersPaymentHasher.hashPaymentAsWallet(payment);
                result.should.equal(payment.seals.wallet.hash);
            });
        });

        describe('hashPaymentAsOperator()', () => {
            let payment;

            before(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            it('should calculate identical hash', async () => {
                const result = await ethersPaymentHasher.hashPaymentAsOperator(payment);
                result.should.equal(payment.seals.operator.hash);
            });
        });
    });
};
