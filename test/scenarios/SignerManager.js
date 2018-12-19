const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const SignerManager = artifacts.require('SignerManager');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('SignerManager', () => {
        let web3SignerManager, ethersSignerManager;

        beforeEach(async () => {
            web3SignerManager = await SignerManager.new(glob.owner);
            ethersSignerManager = new Contract(web3SignerManager.address, SignerManager.abi, glob.signer_owner);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3SignerManager.deployer.call()).should.equal(glob.owner);
                (await web3SignerManager.operator.call()).should.equal(glob.owner);

                (await ethersSignerManager.signerIndicesMap(glob.owner))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('isSigner()', () => {
            describe('signer is not registered', () => {
                it('should return false', async () => {
                    (await web3SignerManager.isSigner.call(Wallet.createRandom().address))
                        .should.be.false;
                });
            });

            describe('signer is registered', () => {
                it('should return true', async () => {
                    (await web3SignerManager.isSigner.call(glob.owner))
                        .should.be.true;
                });
            });
        });

        describe('signersCount()', () => {
            it('should return initial value', async () => {
                (await ethersSignerManager.signersCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('signerIndex()', () => {
            describe('signer is not registered', () => {
                it('should revert', async () => {
                    web3SignerManager.signerIndex.call(Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('signer is registered', () => {
                it('should return index of signer', async () => {
                    (await ethersSignerManager.signerIndex(glob.owner))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('registerSigner()', () => {
            describe('if called by non-operator', () => {
                it('should revert', async () => {
                    web3SignerManager.registerSigner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3SignerManager.registerSigner(mocks.address0).should.be.rejected;
                });
            });

            describe('if called with address of signer manager', () => {
                it('should revert', async () => {
                    web3SignerManager.registerSigner(web3SignerManager.address).should.be.rejected;
                });
            });

            describe('if signer is not previously registered', () => {
                let signer;

                before(() => {
                    signer = Wallet.createRandom().address;
                });

                it('successfully register signer', async () => {
                    const result = await web3SignerManager.registerSigner(signer);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('RegisterSignerEvent');

                    (await web3SignerManager.isSigner.call(signer))
                        .should.be.true;
                });
            });

            describe('if signer is previously registered', () => {
                let signer;

                before(() => {
                    signer = Wallet.createRandom().address;
                });

                beforeEach(async () => {
                    await web3SignerManager.registerSigner(signer);
                });

                it('successfully register signer', async () => {
                    const result = await web3SignerManager.registerSigner(signer);

                    result.logs.should.be.an('array').and.have.lengthOf(0);

                    (await web3SignerManager.isSigner.call(signer))
                        .should.be.true;
                });
            });
        });

        describe('signersByIndices()', () => {
            describe('if low argument is greater than up argument', () => {
                it('should revert', async () => {
                    web3SignerManager.signersByIndices.call(1, 0).should.be.rejected;
                });
            });

            describe('if within boundaries', () => {
                it('should return signers', async () => {
                    const result = await web3SignerManager.signersByIndices.call(0, 0);

                    result.should.be.an('array').and.have.lengthOf(1);
                    result[0].should.equal(glob.owner);
                });
            });
        });
    });
};
