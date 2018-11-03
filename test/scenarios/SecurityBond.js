const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('StandardTokenEx');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const SecurityBond = artifacts.require('SecurityBond');
const MockedSecurityBondService = artifacts.require('MockedSecurityBondService');
const MockedConfiguration = artifacts.require('MockedConfiguration');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('SecurityBond', function () {
        let web3TransferControllerManager;
        let web3Configuration, ethersConfiguration;
        let web3ERC20;
        let web3SecurityBond, ethersSecurityBond;
        let web3MockedSecurityBondService, ethersMockedSecurityBondService;

        before(async () => {
            web3TransferControllerManager = await TransferControllerManager.deployed();

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            await web3ERC20.testMint(glob.user_a, 1000);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3SecurityBond = await SecurityBond.new(glob.owner);
            ethersSecurityBond = new Contract(web3SecurityBond.address, SecurityBond.abi, glob.signer_owner);

            await web3SecurityBond.changeConfiguration(web3Configuration.address);
            await web3SecurityBond.changeTransferControllerManager(web3TransferControllerManager.address);

            web3MockedSecurityBondService = await MockedSecurityBondService.new(glob.owner);
            ethersMockedSecurityBondService = new Contract(web3MockedSecurityBondService.address, MockedSecurityBondService.abi, glob.signer_owner);

            // Fully wire the mocked service
            await web3SecurityBond.registerService(web3MockedSecurityBondService.address);
            await web3SecurityBond.enableServiceAction(web3MockedSecurityBondService.address, 'stage');
            await web3MockedSecurityBondService.changeSecurityBond(web3SecurityBond.address);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3SecurityBond.deployer.call()).should.equal(glob.owner);
                (await web3SecurityBond.operator.call()).should.equal(glob.owner);
            });
        });

        describe('withdrawalTimeout()', () => {
            it('should return initial value', async () => {
                (await ethersSecurityBond.withdrawalTimeout())
                    ._bn.should.eq.BN(1800);
            });
        });

        describe('setWithdrawalTimeout()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3SecurityBond.setWithdrawalTimeout(1000, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                it('should revert', async () => {
                    const result = await web3SecurityBond.setWithdrawalTimeout(1000);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetWithdrawalTimeoutEvent');

                    (await ethersSecurityBond.withdrawalTimeout())
                        ._bn.should.eq.BN(1000);
                });
            });
        });

        describe('depositsCount()', () => {
            it('should return initial value', async () => {
                (await ethersSecurityBond.depositsCount(Wallet.createRandom().address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('withdrawalsCount()', () => {
            it('should return initial value', async () => {
                (await ethersSecurityBond.withdrawalsCount(Wallet.createRandom().address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('activeBalance()', () => {
            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersSecurityBond.activeBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersSecurityBond.activeBalance(web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('stagedBalance()', () => {
            describe('if called with null wallet address', () => {
                it('should revert', async () => {
                    ethersSecurityBond.stagedBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersSecurityBond.stagedBalance(Wallet.createRandom().address, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersSecurityBond.stagedBalance(Wallet.createRandom().address, web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('fallback function', () => {
            describe('first reception', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3SecurityBond.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersSecurityBond.depositsCount(glob.user_a))
                        ._bn.should.eq.BN(1);

                    (await ethersSecurityBond.activeBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                });
            });

            describe('second reception', () => {
                beforeEach(async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3SecurityBond.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });
                });

                it('should add on top of the first deposit', async () => {
                    await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: web3SecurityBond.address,
                        value: web3.toWei(1, 'ether'),
                        gas: 1e6
                    });

                    (await ethersSecurityBond.depositsCount(glob.user_a))
                        ._bn.should.eq.BN(2);

                    (await ethersSecurityBond.activeBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('receiveEthersTo()', () => {
            describe('first reception', () => {
                it('should add initial deposit and increment deposited balance', async () => {
                    const result = await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ReceiveEvent');

                    (await ethersSecurityBond.depositsCount(glob.user_a))
                        ._bn.should.eq.BN(1);

                    (await ethersSecurityBond.activeBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('1')._bn);
                });
            });

            describe('second reception', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );
                });

                it('should add on top of the first deposit', async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '',
                        {
                            from: glob.user_a,
                            value: web3.toWei(1, 'ether'),
                            gas: 1e6
                        }
                    );

                    (await ethersSecurityBond.depositsCount(glob.user_a))
                        ._bn.should.eq.BN(2);

                    (await ethersSecurityBond.activeBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('2')._bn);
                });
            });
        });

        describe('receiveTokens()', () => {
            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3SecurityBond.receiveTokens('', 0, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3SecurityBond.receiveTokens('', 10, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3SecurityBond.address, 9999, {from: glob.user_a, gas: 1e6});
                    });

                    it('should revert', async () => {
                        web3SecurityBond.receiveTokens('', 9999, web3ERC20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('first reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3SecurityBond.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add initial deposit and increment deposited balance', async () => {
                        const result = await web3SecurityBond.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReceiveEvent');

                        (await ethersSecurityBond.depositsCount(glob.user_a))
                            ._bn.should.eq.BN(1);

                        (await ethersSecurityBond.activeBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3SecurityBond.address, 20, {from: glob.user_a, gas: 1e6}
                        );
                        await web3SecurityBond.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3SecurityBond.receiveTokens(
                            '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        (await ethersSecurityBond.depositsCount(glob.user_a))
                            ._bn.should.eq.BN(2);

                        (await ethersSecurityBond.activeBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('receiveTokensTo()', () => {
            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3SecurityBond.receiveTokensTo(
                            glob.user_a, '', 0, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3SecurityBond.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(web3SecurityBond.address, 9999, {
                            from: glob.user_a,
                            gas: 1e6
                        });
                    });

                    it('should revert', async () => {
                        web3SecurityBond.receiveTokensTo(
                            glob.user_a, '', 9999, web3ERC20.address, 0, '', {from: glob.user_a}
                        ).should.be.rejected;
                    });
                });

                describe('first reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3SecurityBond.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add initial deposit and increment deposited balance', async () => {
                        const result = await web3SecurityBond.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ReceiveEvent');

                        (await ethersSecurityBond.depositsCount(glob.user_a))
                            ._bn.should.eq.BN(1);

                        (await ethersSecurityBond.activeBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(10);
                    });
                });

                describe('second reception', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3SecurityBond.address, 20, {from: glob.user_a, gas: 1e6}
                        );
                        await web3SecurityBond.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );
                    });

                    it('should add on top of the first deposit', async () => {
                        await web3SecurityBond.receiveTokensTo(
                            glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );

                        (await ethersSecurityBond.depositsCount(glob.user_a))
                            ._bn.should.eq.BN(2);

                        (await ethersSecurityBond.activeBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('deposit()', () => {
            describe('before first reception', () => {
                it('should revert', async () => {
                    web3SecurityBond.deposit.call(glob.user_a, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersSecurityBond.deposit(glob.user_a, 0);

                    deposit.amount._bn.should.eq.BN(utils.parseEther('1')._bn);
                    deposit.blockNumber.should.exist;
                    deposit.currencyCt.should.equal(mocks.address0);
                    deposit.currencyId._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3SecurityBond.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3SecurityBond.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersSecurityBond.deposit(glob.user_a, 0);

                    deposit.amount._bn.should.eq.BN(10);
                    deposit.blockNumber.should.exist;
                    deposit.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                    deposit.currencyId._bn.should.eq.BN(0);
                });
            });
        });

        describe('stage()', () => {
            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3MockedSecurityBondService.stage(
                        mocks.address0, 1e18
                    ).should.be.rejected;
                });
            });

            describe('if called by service that is not registered', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3MockedSecurityBondService.changeSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.stage(
                        glob.user_a, 1e18
                    ).should.be.rejected;
                });
            });

            describe('if called by registered service with action not enabled', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3SecurityBond.registerService(web3MockedSecurityBondService.address);
                    await web3MockedSecurityBondService.changeSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.stage(
                        glob.user_a, 1e18
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should successfully stage', async () => {
                    await web3MockedSecurityBondService.stage(glob.user_a, 3e17);

                    (await ethersSecurityBond.activeBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.7')._bn);
                    (await ethersSecurityBond.stagedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.3')._bn);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3SecurityBond.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3SecurityBond.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully stage', async () => {
                    await web3MockedSecurityBondService.stage(glob.user_a, 3e17);

                    (await ethersSecurityBond.activeBalance(web3ERC20.address, 0))
                        ._bn.should.eq.BN(7);
                    (await ethersSecurityBond.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(3);
                });
            });
        });

        describe('withdraw()', () => {
            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedSecurityBondService.stage(glob.user_a, 3e17);
                });

                it('should successfully withdraw', async () => {
                    const result = await web3SecurityBond.withdraw(
                        web3.toWei(0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('WithdrawEvent');

                    (await ethersSecurityBond.withdrawalsCount(glob.user_a))
                        ._bn.should.eq.BN(1);

                    (await ethersSecurityBond.stagedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(utils.parseEther('0.1')._bn);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3SecurityBond.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3SecurityBond.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await web3MockedSecurityBondService.stage(glob.user_a, 3e17);
                });

                it('should successfully withdraw', async () => {
                    const result = await web3SecurityBond.withdraw(
                        2, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('WithdrawEvent');

                    (await ethersSecurityBond.withdrawalsCount(glob.user_a))
                        ._bn.should.eq.BN(1);

                    (await ethersSecurityBond.stagedBalance(glob.user_a, web3ERC20.address, 0))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('withdrawal()', () => {
            describe('before first withdrawal', () => {
                it('should revert', async () => {
                    web3SecurityBond.withdrawal.call(glob.user_a, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedSecurityBondService.stage(glob.user_a, 3e17);
                    await web3SecurityBond.withdraw(
                        web3.toWei(0.2, 'ether'), mocks.address0, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully return withdrawal', async () => {
                    const withdrawal = await ethersSecurityBond.withdrawal(glob.user_a, 0);

                    withdrawal.amount._bn.should.eq.BN(utils.parseEther('0.2')._bn);
                    withdrawal.blockNumber.should.exist;
                    withdrawal.currencyCt.should.equal(mocks.address0);
                    withdrawal.currencyId._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await web3ERC20.approve(
                        web3SecurityBond.address, 10, {from: glob.user_a, gas: 1e6}
                    );
                    await web3SecurityBond.receiveTokensTo(
                        glob.user_a, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                    await web3MockedSecurityBondService.stage(glob.user_a, 3e17);
                    await web3SecurityBond.withdraw(
                        2, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                    );
                });

                it('should successfully return withdrawal', async () => {
                    const withdrawal = await ethersSecurityBond.withdrawal(glob.user_a, 0);

                    withdrawal.amount._bn.should.eq.BN(2);
                    withdrawal.blockNumber.should.exist;
                    withdrawal.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                    withdrawal.currencyId._bn.should.eq.BN(0);
                });
            });
        });
    });
};
