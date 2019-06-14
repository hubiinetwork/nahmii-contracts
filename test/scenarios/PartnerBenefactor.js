const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, Wallet, utils} = require('ethers');
const mocks = require('../mocks');
const PartnerBenefactor = artifacts.require('PartnerBenefactor');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('PartnerBenefactor', function () {
        let provider;
        let web3PartnerBenefactor, ethersPartnerBenefactor;
        let web3MockedBeneficiary, ethersMockedBeneficiary;

        before(async () => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3MockedBeneficiary = await MockedBeneficiary.new();
            ethersMockedBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);

            web3PartnerBenefactor = await PartnerBenefactor.new(glob.owner);
            ethersPartnerBenefactor = new Contract(web3PartnerBenefactor.address, PartnerBenefactor.abi, glob.signer_owner);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3PartnerBenefactor.deployer.call()).should.equal(glob.owner);
                (await web3PartnerBenefactor.operator.call()).should.equal(glob.owner);
            });
        });

        describe('beneficiaries()', () => {
            it('should revert', async () => {
                ethersPartnerBenefactor.beneficiaries(0)
                    .should.be.rejected;
            });
        });

        describe('beneficiaryIndexByAddress()', () => {
            it('should equal value initialized', async () => {
                (await ethersPartnerBenefactor.beneficiaryIndexByAddress(Wallet.createRandom().address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('isRegisteredBeneficiary()', () => {
            it('should equal value initialized', async () => {
                (await ethersPartnerBenefactor.isRegisteredBeneficiary(Wallet.createRandom().address))
                    .should.be.false;
            });
        });

        describe('registeredBeneficiariesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersPartnerBenefactor.registeredBeneficiariesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('registerBeneficiary()', () => {
            let beneficiary, filter;

            beforeEach(async () => {
                beneficiary = Wallet.createRandom().address;
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3PartnerBenefactor.registerBeneficiary(beneficiary, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    ethersPartnerBenefactor.registerBeneficiary(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersPartnerBenefactor.interface.events['RegisterBeneficiaryEvent'].topics
                    };
                });

                it('should successfully register beneficiary', async () => {
                    await ethersPartnerBenefactor.registerBeneficiary(beneficiary);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersPartnerBenefactor.beneficiaries(0))
                        .should.equal(beneficiary);
                    (await ethersPartnerBenefactor.beneficiaryIndexByAddress(beneficiary))
                        ._bn.should.eq.BN(1);
                    (await ethersPartnerBenefactor.isRegisteredBeneficiary(beneficiary))
                        .should.be.true;
                    (await ethersPartnerBenefactor.registeredBeneficiariesCount())
                        ._bn.should.eq.BN(1);
                });
            });

            describe('if called with registered beneficiary', () => {
                beforeEach(async () => {
                    await ethersPartnerBenefactor.registerBeneficiary(beneficiary);

                    filter = {
                        fromBlock: (await provider.getBlockNumber()) + 1,
                        topics: ethersPartnerBenefactor.interface.events['RegisterBeneficiaryEvent'].topics
                    };
                });

                it('should return without registering', async () => {
                    await ethersPartnerBenefactor.registerBeneficiary(beneficiary);

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });
        });

        describe('deregisterBeneficiary()', () => {
            let beneficiary, filter;

            beforeEach(async () => {
                beneficiary = Wallet.createRandom().address;

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersPartnerBenefactor.interface.events['DeregisterBeneficiaryEvent'].topics
                };
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3PartnerBenefactor.deregisterBeneficiary(beneficiary, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    ethersPartnerBenefactor.deregisterBeneficiary(mocks.address0)
                        .should.be.rejected;
                });
            });

            describe('if called with non-registered beneficiary', () => {
                it('should return without registering', async () => {
                    await ethersPartnerBenefactor.deregisterBeneficiary(beneficiary);

                    (await provider.getLogs(filter))
                        .should.be.an('array').that.is.empty;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await ethersPartnerBenefactor.registerBeneficiary(beneficiary);
                });

                it('should successfully deregister beneficiary', async () => {
                    await ethersPartnerBenefactor.deregisterBeneficiary(beneficiary);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    ethersPartnerBenefactor.beneficiaries(0)
                        .should.be.rejected;
                    (await ethersPartnerBenefactor.beneficiaryIndexByAddress(beneficiary))
                        ._bn.should.eq.BN(0);
                    (await ethersPartnerBenefactor.isRegisteredBeneficiary(beneficiary))
                        .should.be.false;
                    (await ethersPartnerBenefactor.registeredBeneficiariesCount())
                        ._bn.should.eq.BN(0);
                });
            });
        });
    });
};
