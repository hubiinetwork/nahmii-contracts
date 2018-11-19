const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('StandardTokenEx');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const SecurityBond = artifacts.require('SecurityBond');
const MockedSecurityBondService = artifacts.require('MockedSecurityBondService');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');

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
        let web3MockedBeneficiary, ethersBeneficiary;

        before(async () => {
            web3TransferControllerManager = await TransferControllerManager.deployed();

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            ethersBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            await web3ERC20.testMint(glob.user_a, 1000);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3SecurityBond = await SecurityBond.new(glob.owner);
            ethersSecurityBond = new Contract(web3SecurityBond.address, SecurityBond.abi, glob.signer_owner);

            await web3SecurityBond.setConfiguration(web3Configuration.address);
            await web3SecurityBond.setTransferControllerManager(web3TransferControllerManager.address);

            web3MockedSecurityBondService = await MockedSecurityBondService.new(glob.owner);
            ethersMockedSecurityBondService = new Contract(web3MockedSecurityBondService.address, MockedSecurityBondService.abi, glob.signer_owner);

            // Fully wire the mocked service
            await web3SecurityBond.registerService(web3MockedSecurityBondService.address);
            await web3SecurityBond.enableServiceAction(web3MockedSecurityBondService.address, 'reward');
            await web3SecurityBond.enableServiceAction(web3MockedSecurityBondService.address, 'deprive');
            await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
        });

        describe('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3SecurityBond.deployer.call()).should.equal(glob.owner);
                (await web3SecurityBond.operator.call()).should.equal(glob.owner);
            });
        });

        describe('depositsCount()', () => {
            it('should return initial value', async () => {
                (await ethersSecurityBond.depositsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('depositedBalance()', () => {
            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('inUseCurrenciesCount()', () => {
            it('should return initial value', async () => {
                (await ethersSecurityBond.inUseCurrenciesCount())
                    ._bn.should.eq.BN(0);
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

                    (await ethersSecurityBond.depositsCount())
                        ._bn.should.eq.BN(1);

                    (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
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

                    (await ethersSecurityBond.depositsCount())
                        ._bn.should.eq.BN(2);

                    (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
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

                    (await ethersSecurityBond.depositsCount())
                        ._bn.should.eq.BN(1);

                    (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
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

                    (await ethersSecurityBond.depositsCount())
                        ._bn.should.eq.BN(2);

                    (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
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

                        (await ethersSecurityBond.depositsCount())
                            ._bn.should.eq.BN(1);

                        (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
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

                        (await ethersSecurityBond.depositsCount())
                            ._bn.should.eq.BN(2);

                        (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
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

                        (await ethersSecurityBond.depositsCount())
                            ._bn.should.eq.BN(1);

                        (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
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

                        (await ethersSecurityBond.depositsCount())
                            ._bn.should.eq.BN(2);

                        (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(20);
                    });
                });
            });
        });

        describe('deposit()', () => {
            describe('before first reception', () => {
                it('should revert', async () => {
                    web3SecurityBond.deposit.call(0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const deposit = await ethersSecurityBond.deposit(0);

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
                    const deposit = await ethersSecurityBond.deposit(0);

                    deposit.amount._bn.should.eq.BN(10);
                    deposit.blockNumber.should.exist;
                    deposit.currencyCt.should.equal(utils.getAddress(web3ERC20.address));
                    deposit.currencyId._bn.should.eq.BN(0);
                });
            });
        });

        describe('inUseCurrenciesByIndices()', () => {
            describe('before first reception', () => {
                it('should revert', async () => {
                    web3SecurityBond.inUseCurrenciesByIndices.call(0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return deposit', async () => {
                    const inUseCurrencies = await ethersSecurityBond.inUseCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(mocks.address0);
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
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
                    const inUseCurrencies = await ethersSecurityBond.inUseCurrenciesByIndices(0, 0);

                    inUseCurrencies[0].ct.should.equal(utils.getAddress(web3ERC20.address));
                    inUseCurrencies[0].id._bn.should.eq.BN(0);
                });
            });
        });

        describe('rewardMetaByWallet()', () => {
            it('should successfully return meta', async () => {
                const result = await ethersSecurityBond.rewardMetaByWallet(glob.user_a);

                result.rewardFraction._bn.should.eq.BN(0);
                result.rewardNonce._bn.should.eq.BN(0);
            })
        });

        describe('stageNonceByWalletCurrency()', () => {
            it('should successfully return meta', async () => {
                (await ethersSecurityBond.stageNonceByWalletCurrency(glob.user_a, mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            })
        });

        describe('reward()', () => {
            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3MockedSecurityBondService.reward(
                        mocks.address0, 1e18, 0
                    ).should.be.rejected;
                });
            });

            describe('if called by service that is not registered', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.reward(
                        glob.user_a, 1e18, 0
                    ).should.be.rejected;
                });
            });

            describe('if called by registered service with action not enabled', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3SecurityBond.registerService(web3MockedSecurityBondService.address);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.reward(
                        glob.user_a, 1e18, 0
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully reward', async () => {
                    await web3MockedSecurityBondService.reward(
                        glob.user_a, 1e18, 0
                    );

                    const meta = await ethersSecurityBond.rewardMetaByWallet(glob.user_a);
                    meta.rewardFraction._bn.should.eq.BN(1e18.toString());
                    meta.rewardNonce._bn.should.eq.BN(1);
                    meta.unlockTime._bn.should.be.gt.BN(0);
                });
            });
        });

        describe('deprive()', () => {
            describe('if called by service that is not registered', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.deprive(glob.user_a).should.be.rejected;
                });
            });

            describe('if called by registered service with action not enabled', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3SecurityBond.registerService(web3MockedSecurityBondService.address);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.deprive(glob.user_a).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await web3MockedSecurityBondService.reward(
                        glob.user_a, 1e18, 0
                    );
                });

                it('should successfully reward', async () => {
                    await web3MockedSecurityBondService.deprive(glob.user_a);

                    const meta = await ethersSecurityBond.rewardMetaByWallet(glob.user_a);
                    meta.rewardFraction._bn.should.eq.BN(0);
                    meta.rewardNonce._bn.should.eq.BN(2);
                    meta.unlockTime._bn.should.eq.BN(0);
                });
            });
        });

        describe('stageToBeneficiary()', () => {
            describe('if called without in-use currencies present', () => {
                it('should revert', async () => {
                    web3SecurityBond.stageToBeneficiary(
                        web3MockedBeneficiary.address, mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if no reward has been granted', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.stageToBeneficiary(
                        web3MockedBeneficiary.address, mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called before reward has been unlocked', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedSecurityBondService.reward(
                        glob.user_a, 5e17, 1e3
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.stageToBeneficiary(
                        web3MockedBeneficiary.address, mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('of Ether', () => {
                    beforeEach(async () => {
                        await web3SecurityBond.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                        );
                        await web3MockedSecurityBondService.reward(
                            glob.user_a, 5e17, 0
                        );
                    });

                    it('should successfully stage', async () => {
                        await web3SecurityBond.stageToBeneficiary(
                            web3MockedBeneficiary.address, mocks.address0, 0, {from: glob.user_a}
                        );

                        (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.5')._bn);
                    });
                });

                describe('of ERC20 token', () => {
                    beforeEach(async () => {
                        await web3ERC20.approve(
                            web3SecurityBond.address, 10, {from: glob.user_a, gas: 1e6}
                        );
                        await web3SecurityBond.receiveTokensTo(
                            mocks.address0, '', 10, web3ERC20.address, 0, '', {from: glob.user_a, gas: 1e6}
                        );
                        await web3MockedSecurityBondService.reward(
                            glob.user_a, 5e17, 0
                        );
                    });

                    it('should successfully stage', async () => {
                        await web3SecurityBond.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3ERC20.address, 0, {from: glob.user_a}
                        );

                        (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(5);
                    });
                });
            });

            describe('if called twice on the same nonce', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedSecurityBondService.reward(
                        glob.user_a, 5e17, 0
                    );
                    await web3SecurityBond.stageToBeneficiary(
                        web3MockedBeneficiary.address, mocks.address0, 0, {from: glob.user_a}
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.stageToBeneficiary(
                        web3MockedBeneficiary.address, mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });
        });
    });
};
