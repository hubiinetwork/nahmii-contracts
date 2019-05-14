const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract} = require('ethers');
const NahmiiToken = artifacts.require('NahmiiToken');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('NahmiiToken', function () {
        let provider;
        let web3NahmiiToken, ethersNahmiiToken;

        before(() => {
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            web3NahmiiToken = await NahmiiToken.new();
            ethersNahmiiToken = new Contract(web3NahmiiToken.address, NahmiiToken.abi, glob.signer_owner);
        });

        describe('name()', () => {
            it('should equal value initialized', async () => {
                (await web3NahmiiToken.name.call()).should.equal('Nahmii');
            });
        });

        describe('setName()', () => {
            describe('if called by non-minter', () => {
                it('should should revert', async () => {
                    web3NahmiiToken.setName('some name', {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by minter', () => {
                it('should successfully set the value and emit event', async () => {
                    const result = await web3NahmiiToken.setName('some name');

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetName');

                    (await web3NahmiiToken.name.call()).should.equal('some name');
                });
            });
        });

        describe('symbol()', () => {
            it('should equal value initialized', async () => {
                (await web3NahmiiToken.symbol.call()).should.equal('NII');
            });
        });

        describe('setSymbol()', () => {
            describe('if called by non-minter', () => {
                it('should should revert', async () => {
                    web3NahmiiToken.setName('some name', {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by minter', () => {
                it('should successfully set the value and emit event', async () => {
                    const result = await web3NahmiiToken.setSymbol('some symbol');

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetSymbol');

                    (await web3NahmiiToken.symbol.call()).should.equal('some symbol');
                });
            });
        });

        describe('mintingDisabled()', () => {
            it('should equal value initialized', async () => {
                (await web3NahmiiToken.mintingDisabled.call()).should.be.false;
            });
        });

        describe('disabledMinting()', () => {
            describe('if called by non-minter', () => {
                it('should should revert', async () => {
                    web3NahmiiToken.disableMinting({from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by minter', () => {
                it('should successfully disable minting', async () => {
                    const result = await web3NahmiiToken.disableMinting();

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('DisableMinting');

                    (await web3NahmiiToken.mintingDisabled.call()).should.be.true;
                });
            });
        });

        describe('holdersCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersNahmiiToken.holdersCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('balanceUpdatesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersNahmiiToken.balanceUpdatesCount(glob.user_a))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('mint()', () => {
            describe('if called by non-minter', () => {
                it('should should revert', async () => {
                    web3NahmiiToken.mint(glob.user_a, 1000, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called when minting is disabled', () => {
                beforeEach(async () => {
                    await web3NahmiiToken.disableMinting();
                });

                it('should should revert', async () => {
                    web3NahmiiToken.mint(glob.user_a, 1000).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully mint', async () => {
                    const result = await web3NahmiiToken.mint(glob.user_a, 1000);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('Transfer');

                    (await ethersNahmiiToken.balanceOf(glob.user_a))
                        ._bn.should.eq.BN(1000);

                    (await ethersNahmiiToken.holdersCount())
                        ._bn.should.eq.BN(1);
                    (await ethersNahmiiToken.balanceUpdatesCount(glob.user_a))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('transfer()', () => {
            beforeEach(async () => {
                await web3NahmiiToken.mint(glob.user_a, 1000);
            });

            it('should successfully transfer', async () => {
                const result = await web3NahmiiToken.transfer(glob.user_b, 1000, {from: glob.user_a});

                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('Transfer');

                (await ethersNahmiiToken.balanceOf(glob.user_a))
                    ._bn.should.eq.BN(0);
                (await ethersNahmiiToken.balanceOf(glob.user_b))
                    ._bn.should.eq.BN(1000);

                (await ethersNahmiiToken.holdersCount())
                    ._bn.should.eq.BN(2);
                (await ethersNahmiiToken.balanceUpdatesCount(glob.user_a))
                    ._bn.should.eq.BN(2);
                (await ethersNahmiiToken.balanceUpdatesCount(glob.user_b))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('approve()', () => {
            describe('if allowance is zero', () => {
                it('should successfully approve', async () => {
                    const result = await web3NahmiiToken.approve(glob.user_b, 1000, {from: glob.user_a});

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('Approval');

                    (await ethersNahmiiToken.allowance(glob.user_a, glob.user_b))
                        ._bn.should.eq.BN(1000);
                });
            });

            describe('if allowance is non-zero', () => {
                beforeEach(async () => {
                    await web3NahmiiToken.approve(glob.user_b, 1000, {from: glob.user_a});
                });

                it('should revert', async () => {
                    web3NahmiiToken.approve(glob.user_b, 1000, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('transferFrom()', () => {
            beforeEach(async () => {
                await web3NahmiiToken.mint(glob.user_a, 1000);
                await web3NahmiiToken.approve(glob.owner, 1000, {from: glob.user_a})
            });

            it('should successfully transfer', async () => {
                const result = await web3NahmiiToken.transferFrom(glob.user_a, glob.user_b, 1000);

                result.logs.should.be.an('array').and.have.lengthOf(2);
                result.logs[0].event.should.equal('Transfer');
                result.logs[1].event.should.equal('Approval');

                (await ethersNahmiiToken.balanceOf(glob.user_a))
                    ._bn.should.eq.BN(0);
                (await ethersNahmiiToken.balanceOf(glob.user_b))
                    ._bn.should.eq.BN(1000);

                (await ethersNahmiiToken.holdersCount())
                    ._bn.should.eq.BN(2);
                (await ethersNahmiiToken.balanceUpdatesCount(glob.user_a))
                    ._bn.should.eq.BN(2);
                (await ethersNahmiiToken.balanceUpdatesCount(glob.user_b))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('balanceBlocksIn()', () => {
            let blockNumber;

            beforeEach(async () => {
                await web3NahmiiToken.mint(glob.user_a, 1000);
                await web3NahmiiToken.transfer(glob.user_b, 300, {from: glob.user_a});
                blockNumber = await provider.getBlockNumber();
            });

            it('should successfully return calculated balance blocks value', async () => {
                (await ethersNahmiiToken.balanceBlocksIn(
                    glob.user_a, blockNumber - 2, blockNumber - 1
                ))._bn.should.eq.BN(0);

                (await ethersNahmiiToken.balanceBlocksIn(
                    glob.user_a, blockNumber - 1, blockNumber
                ))._bn.should.eq.BN(1000);

                (await ethersNahmiiToken.balanceBlocksIn(
                    glob.user_a, blockNumber, blockNumber + 1
                ))._bn.should.eq.BN(700);

                (await ethersNahmiiToken.balanceBlocksIn(
                    glob.user_a, blockNumber - 1, blockNumber + 1
                ))._bn.should.eq.BN(1700);

                (await ethersNahmiiToken.balanceBlocksIn(
                    glob.user_b, blockNumber - 2, blockNumber - 1
                ))._bn.should.eq.BN(0);

                (await ethersNahmiiToken.balanceBlocksIn(
                    glob.user_b, blockNumber - 1, blockNumber
                ))._bn.should.eq.BN(0);

                (await ethersNahmiiToken.balanceBlocksIn(
                    glob.user_b, blockNumber, blockNumber + 1
                ))._bn.should.eq.BN(300);
            });
        });

        describe('holdersByIndices()', () => {
            beforeEach(async () => {
                await web3NahmiiToken.mint(glob.user_a, 1000);
                await web3NahmiiToken.transfer(glob.user_b, 1000, {from: glob.user_a});
            });

            describe('if low is greater than up', () => {
                it('should revert', async () => {
                    web3NahmiiToken.holdersByIndices.call(1, 0, false)
                        .should.be.rejected;
                });
            });

            describe('if posOnly is false', () => {
                it('should return the count of all holders', async () => {
                    const holders = await web3NahmiiToken.holdersByIndices.call(0, 1, false);

                    holders.should.be.an('array').and.have.lengthOf(2);
                    holders[0].should.equal(glob.user_a);
                    holders[1].should.equal(glob.user_b);
                });
            });

            describe('if posOnly is true', () => {
                it('should return the count of holders with positive balances', async () => {
                    const holders = await web3NahmiiToken.holdersByIndices.call(0, 1, true);

                    holders.should.be.an('array').and.have.lengthOf(1);
                    holders[0].should.equal(glob.user_b);
                });
            });
        });
    });
};
