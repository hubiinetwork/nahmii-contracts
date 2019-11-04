const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract} = require('ethers');
const NahmiiToken = artifacts.require('NahmiiToken');
const MockedTokenUpgradeAgent = artifacts.require('MockedTokenUpgradeAgent');

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
                    await web3NahmiiToken.setName('some name', {from: glob.user_a})
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
                    await web3NahmiiToken.setName('some name', {from: glob.user_a})
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
                    await web3NahmiiToken.disableMinting({from: glob.user_a})
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

        describe('balanceRecordsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersNahmiiToken.balanceRecordsCount(glob.user_a))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('mint()', () => {
            describe('if called by non-minter', () => {
                it('should should revert', async () => {
                    await web3NahmiiToken.mint(glob.user_a, 1000, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called when minting is disabled', () => {
                beforeEach(async () => {
                    await web3NahmiiToken.disableMinting();
                });

                it('should should revert', async () => {
                    await web3NahmiiToken.mint(glob.user_a, 1000).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully mint', async () => {
                    const result = await web3NahmiiToken.mint(glob.user_a, 1000);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('Transfer');

                    (await ethersNahmiiToken.balanceOf(glob.user_a))
                        ._bn.should.eq.BN(1000);

                    (await ethersNahmiiToken.balanceRecordsCount(glob.user_a))
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

                (await ethersNahmiiToken.balanceRecordsCount(glob.user_a))
                    ._bn.should.eq.BN(2);
                (await ethersNahmiiToken.balanceRecordsCount(glob.user_b))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('approve()', () => {
            describe('if old allowance is zero', () => {
                it('should successfully approve', async () => {
                    const result = await web3NahmiiToken.approve(glob.user_b, 1000, {from: glob.user_a});

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('Approval');

                    (await ethersNahmiiToken.allowance(glob.user_a, glob.user_b))
                        ._bn.should.eq.BN(1000);
                });
            });

            describe('if old allowance is non-zero', () => {
                beforeEach(async () => {
                    await web3NahmiiToken.approve(glob.user_b, 1000, {from: glob.user_a});
                });

                describe('if new allowance is non-zero', () => {
                    it('should revert', async () => {
                        await web3NahmiiToken.approve(glob.user_b, 1000, {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if new allowance is zero', () => {
                    it('should successfully approve', async () => {
                        const result = await web3NahmiiToken.approve(glob.user_b, 0, {from: glob.user_a});

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('Approval');

                        (await ethersNahmiiToken.allowance(glob.user_a, glob.user_b))
                            ._bn.should.eq.BN(0);
                    });
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

                (await ethersNahmiiToken.balanceRecordsCount(glob.user_a))
                    ._bn.should.eq.BN(2);
                (await ethersNahmiiToken.balanceRecordsCount(glob.user_b))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('upgrade()', () => {
            let web3UpgradeAgent;

            beforeEach(async () => {
                await web3NahmiiToken.mint(glob.user_a, 1000);

                web3UpgradeAgent = await MockedTokenUpgradeAgent.new(web3NahmiiToken.address);
            });

            describe('if agent upgrades', () => {
                beforeEach(async () => {
                    await web3UpgradeAgent._setUpgradeFrom(true);
                });

                it('should successfully decrement the old balance', async () => {
                    const result = await web3NahmiiToken.upgrade(web3UpgradeAgent.address, 600, {
                        from: glob.user_a,
                        gas: 1e6
                    });

                    result.logs.should.be.an('array').and.have.lengthOf(2);

                    result.logs.map(l => l.event).should.include('Upgrade');

                    (await ethersNahmiiToken.balanceOf(glob.user_a))
                        ._bn.should.eq.BN(400);
                });
            });

            describe('if agent does not upgrade', () => {
                beforeEach(async () => {
                    await web3UpgradeAgent._setUpgradeFrom(false);
                });

                it('should not decrement the old balance', async () => {
                    const result = await web3NahmiiToken.upgrade(web3UpgradeAgent.address, 600, {
                        from: glob.user_a,
                        gas: 1e6
                    });

                    result.logs.should.be.an('array');
                    result.logs.map(l => l.event).should.not.include('Upgrade');

                    (await ethersNahmiiToken.balanceOf(glob.user_a))
                        ._bn.should.eq.BN(1000);
                });
            });
        });

        describe('upgradeFrom()', () => {
            let web3UpgradeAgent;

            beforeEach(async () => {
                await web3NahmiiToken.mint(glob.user_a, 1000);

                web3UpgradeAgent = await MockedTokenUpgradeAgent.new(web3NahmiiToken.address);
            });

            describe('if agent upgrades', () => {
                beforeEach(async () => {
                    await web3NahmiiToken.approve(glob.owner, 600, {from: glob.user_a});

                    await web3UpgradeAgent._setUpgradeFrom(true);
                });

                it('should successfully decrement the old balance', async () => {
                    const result = await web3NahmiiToken.upgradeFrom(web3UpgradeAgent.address, glob.user_a, 600, {
                        gas: 1e6
                    });

                    result.logs.should.be.an('array').and.have.lengthOf(3);

                    result.logs.map(l => l.event).should.include('UpgradeFrom');

                    (await ethersNahmiiToken.balanceOf(glob.user_a))
                        ._bn.should.eq.BN(400);
                });
            });

            describe('if agent does not upgrade', () => {
                beforeEach(async () => {
                    await web3NahmiiToken.approve(glob.owner, 600, {from: glob.user_a});

                    await web3UpgradeAgent._setUpgradeFrom(false);
                });

                it('should not decrement the old balance', async () => {
                    const result = await web3NahmiiToken.upgradeFrom(web3UpgradeAgent.address, glob.user_a, 600, {
                        gas: 1e6
                    });

                    result.logs.should.be.an('array');
                    result.logs.map(l => l.event).should.not.include('UpgradeFrom');

                    (await ethersNahmiiToken.balanceOf(glob.user_a))
                        ._bn.should.eq.BN(1000);
                });
            });

            describe('if wallet is not approved to burn', () => {
                beforeEach(async () => {
                    await web3NahmiiToken.approve(glob.owner, 500, {from: glob.user_a});

                    await web3UpgradeAgent._setUpgradeFrom(true);
                });

                it('should revert', async () => {
                    await web3NahmiiToken.upgradeFrom(web3UpgradeAgent.address, glob.user_a, 600, {
                        gas: 1e6
                    }).should.be.rejected;
                });
            });
        });

        describe('recordBalance()', () => {
            describe('if the records count is zero', () => {
                it('should revert', async () => {
                    await ethersNahmiiToken.recordBalance(glob.user_a, 0).should.be.rejected;
                });
            });

            describe('if the records count is non-zero', () => {
                beforeEach(async () => {
                    await web3NahmiiToken.mint(glob.user_a, 1000);
                    await web3NahmiiToken.mint(glob.user_a, 2000);
                    await web3NahmiiToken.mint(glob.user_a, 3000);
                });

                it('should return the balance at the given record index', async () => {
                    (await ethersNahmiiToken.recordBalance(glob.user_a, 0))
                        ._bn.should.eq.BN(1000);
                    (await ethersNahmiiToken.recordBalance(glob.user_a, 1))
                        ._bn.should.eq.BN(3000);
                    (await ethersNahmiiToken.recordBalance(glob.user_a, 2))
                        ._bn.should.eq.BN(6000);
                });
            });
        });

        describe('recordBlockNumber()', () => {
            describe('if the records count is zero', () => {
                it('should revert', async () => {
                    await ethersNahmiiToken.recordBlockNumber(glob.user_a, 0).should.be.rejected;
                });
            });

            describe('if the records count is non-zero', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3NahmiiToken.mint(glob.user_a, 1000);
                    await web3NahmiiToken.mint(glob.user_a, 2000);
                    await web3NahmiiToken.mint(glob.user_a, 3000);

                    blockNumber = await provider.getBlockNumber()
                });

                it('should return the balance at the given record index', async () => {
                    (await ethersNahmiiToken.recordBlockNumber(glob.user_a, 0))
                        ._bn.should.eq.BN(blockNumber - 2);
                    (await ethersNahmiiToken.recordBlockNumber(glob.user_a, 1))
                        ._bn.should.eq.BN(blockNumber - 1);
                    (await ethersNahmiiToken.recordBlockNumber(glob.user_a, 2))
                        ._bn.should.eq.BN(blockNumber);
                });
            });
        });

        describe('recordIndexByBlockNumber()', () => {
            describe('if the records count is zero', () => {
                it('should return -1', async () => {
                    (await ethersNahmiiToken.recordIndexByBlockNumber(glob.user_a, 1000))
                        ._bn.should.eq.BN(-1);
                });
            });

            describe('if the records count is non-zero', () => {
                let blockNumber;

                beforeEach(async () => {
                    await web3NahmiiToken.mint(glob.user_a, 1000);
                    await web3NahmiiToken.mint(glob.user_a, 2000);
                    await web3NahmiiToken.mint(glob.user_a, 3000);

                    blockNumber = await provider.getBlockNumber();
                });

                it('should return the balance at the given record index', async () => {
                    (await ethersNahmiiToken.recordIndexByBlockNumber(glob.user_a, blockNumber - 2))
                        ._bn.should.eq.BN(0);
                    (await ethersNahmiiToken.recordIndexByBlockNumber(glob.user_a, blockNumber - 1))
                        ._bn.should.eq.BN(1);
                    (await ethersNahmiiToken.recordIndexByBlockNumber(glob.user_a, blockNumber))
                        ._bn.should.eq.BN(2);
                    (await ethersNahmiiToken.recordIndexByBlockNumber(glob.user_a, blockNumber + 10))
                        ._bn.should.eq.BN(2);
                });
            });
        });
    });
};
