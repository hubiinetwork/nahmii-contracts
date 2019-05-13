const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ERC20Token = artifacts.require('TestERC20');
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
        let provider;
        let web3TransferControllerManager;
        let web3Configuration, ethersConfiguration;
        let web3ERC20, ethersERC20;
        let web3SecurityBond, ethersSecurityBond;
        let web3MockedSecurityBondService, ethersMockedSecurityBondService;
        let web3MockedBeneficiary, ethersMockedBeneficiary;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3TransferControllerManager = await TransferControllerManager.deployed();

            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3ERC20 = await ERC20Token.new();
            ethersERC20 = new Contract(web3ERC20.address, ERC20Token.abi, glob.signer_owner);

            await web3ERC20.mint(glob.user_a, 1000);

            await web3TransferControllerManager.registerCurrency(web3ERC20.address, 'ERC20', {from: glob.owner});

            web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            ethersMockedBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);

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

        describe('stagedBalance()', () => {
            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersSecurityBond.stagedBalance(glob.user_a, mocks.address0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersSecurityBond.stagedBalance(glob.user_a, web3ERC20.address, 0))
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

                        (await ethersERC20.balanceOf(ethersSecurityBond.address))._bn.should.eq.BN(10);
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

                        (await ethersERC20.balanceOf(ethersSecurityBond.address))._bn.should.eq.BN(20);
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

                        (await ethersERC20.balanceOf(ethersSecurityBond.address))._bn.should.eq.BN(10);
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

                        (await ethersERC20.balanceOf(ethersSecurityBond.address))._bn.should.eq.BN(20);
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

        describe('fractionalRewardByWallet()', () => {
            it('should successfully return meta', async () => {
                const result = await ethersSecurityBond.fractionalRewardByWallet(glob.user_a);

                result.fraction._bn.should.eq.BN(0);
                result.nonce._bn.should.eq.BN(0);
                result.unlockTime._bn.should.eq.BN(0);
            })
        });

        describe('absoluteRewardByWallet()', () => {
            it('should successfully return meta', async () => {
                const result = await ethersSecurityBond.absoluteRewardByWallet(glob.user_a, mocks.address0, 0);

                result.amount._bn.should.eq.BN(0);
                result.nonce._bn.should.eq.BN(0);
                result.unlockTime._bn.should.eq.BN(0);
            })
        });

        describe('claimNonceByWalletCurrency()', () => {
            it('should successfully return meta', async () => {
                (await ethersSecurityBond.claimNonceByWalletCurrency(glob.user_a, mocks.address0, 0))
                    ._bn.should.eq.BN(0);
            })
        });

        describe('rewardFractional()', () => {
            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3MockedSecurityBondService.rewardFractional(
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
                    web3MockedSecurityBondService.rewardFractional(
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
                    web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 1e18, 0
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully reward', async () => {
                    await web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 1e18, 0
                    );

                    const reward = await ethersSecurityBond.fractionalRewardByWallet(glob.user_a);
                    reward.fraction._bn.should.eq.BN(1e18.toString());
                    reward.nonce._bn.should.eq.BN(1);
                    reward.unlockTime._bn.should.be.gt.BN(0);
                });
            });
        });

        describe('rewardAbsolute()', () => {
            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3MockedSecurityBondService.rewardAbsolute(
                        mocks.address0, 1e18, mocks.address0, 0, 0
                    ).should.be.rejected;
                });
            });

            describe('if called by service that is not registered', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 1e18, mocks.address0, 0, 0
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
                    web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 1e18, mocks.address0, 0, 0
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should successfully reward', async () => {
                    await web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 1e18, mocks.address0, 0, 0
                    );

                    const reward = await ethersSecurityBond.absoluteRewardByWallet(glob.user_a, mocks.address0, 0);
                    reward.amount._bn.should.eq.BN(1e18.toString());
                    reward.nonce._bn.should.eq.BN(1);
                    reward.unlockTime._bn.should.be.gt.BN(0);
                });
            });
        });

        describe('depriveFractional()', () => {
            describe('if called by service that is not registered', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.depriveFractional(glob.user_a).should.be.rejected;
                });
            });

            describe('if called by registered service with action not enabled', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3SecurityBond.registerService(web3MockedSecurityBondService.address);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.depriveFractional(glob.user_a).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 5e17, 0
                    );
                });

                it('should successfully reward', async () => {
                    await web3MockedSecurityBondService.depriveFractional(glob.user_a);

                    const reward = await ethersSecurityBond.fractionalRewardByWallet(glob.user_a);
                    reward.fraction._bn.should.eq.BN(0);
                    reward.nonce._bn.should.eq.BN(2);
                    reward.unlockTime._bn.should.eq.BN(0);
                });
            });
        });

        describe('depriveAbsolute()', () => {
            describe('if called by service that is not registered', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.depriveAbsolute(glob.user_a, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if called by registered service with action not enabled', () => {
                beforeEach(async () => {
                    web3SecurityBond = await SecurityBond.new(glob.owner);
                    await web3SecurityBond.registerService(web3MockedSecurityBondService.address);
                    await web3MockedSecurityBondService.setSecurityBond(web3SecurityBond.address);
                });

                it('should revert', async () => {
                    web3MockedSecurityBondService.depriveAbsolute(glob.user_a, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 3e17, mocks.address0, 0, 0
                    );
                });

                it('should successfully reward', async () => {
                    await web3MockedSecurityBondService.depriveAbsolute(glob.user_a, mocks.address0, 0);

                    const reward = await ethersSecurityBond.absoluteRewardByWallet(glob.user_a, mocks.address0, 0);
                    reward.amount._bn.should.eq.BN(0);
                    reward.nonce._bn.should.eq.BN(2);
                    reward.unlockTime._bn.should.eq.BN(0);
                });
            });
        });

        describe('depositedFractionalBalance()', () => {
            describe('if security bond has zero deposited balance', () => {
                it('should return 0', async () => {
                    (await ethersSecurityBond.depositedFractionalBalance(mocks.address0, 0, 5e17.toString()))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('if fraction is 0', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should return 0', async () => {
                    (await ethersSecurityBond.depositedFractionalBalance(mocks.address0, 0, 0))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('if security bond has non-zero deposited balance and fraction is non-zero', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should fractional fractional balance', async () => {
                    (await ethersSecurityBond.depositedFractionalBalance(mocks.address0, 0, 5e17.toString()))
                        ._bn.should.eq.BN(utils.parseEther('0.5')._bn);
                });
            });
        });

        describe('claimAndTransferToBeneficiary()', () => {
            describe('if no reward has been given', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.claimAndTransferToBeneficiary(
                        web3MockedBeneficiary.address, 'staged', mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if reward has not been unlocked', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 5e17, 1e3
                    );
                    await web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 3e17, mocks.address0, 0, 1e3
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.claimAndTransferToBeneficiary(
                        web3MockedBeneficiary.address, 'staged', mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if security bond has zero deposited balance', () => {
                beforeEach(async () => {
                    await web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 5e17, 0
                    );
                    await web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 3e17, mocks.address0, 0, 0
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.claimAndTransferToBeneficiary(
                        web3MockedBeneficiary.address, 'staged', mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('of Ether', () => {
                    beforeEach(async () => {
                        await web3SecurityBond.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                        );
                        await web3MockedSecurityBondService.rewardFractional(
                            glob.user_a, 5e17, 0
                        );
                        await web3MockedSecurityBondService.rewardAbsolute(
                            glob.user_a, 3e17, mocks.address0, 0, 0
                        );
                    });

                    it('should successfully claim and transfer', async () => {
                        const result = await web3SecurityBond.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, 'staged', mocks.address0, 0, '', {from: glob.user_a}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryEvent');

                        (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.2')._bn);

                        const benefit = await ethersMockedBeneficiary._benefits(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_a));
                        benefit.balanceType.should.equal('staged');
                        benefit.figure.amount._bn.should.eq.BN(utils.parseEther('0.8')._bn);

                        (await provider.getBalance(ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(utils.parseEther('0.8')._bn);
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
                        await web3MockedSecurityBondService.rewardFractional(
                            glob.user_a, 5e17, 0
                        );
                        await web3MockedSecurityBondService.rewardAbsolute(
                            glob.user_a, 3, web3ERC20.address, 0, 0
                        );
                    });

                    it('should successfully claim and transfer', async () => {
                        const result = await web3SecurityBond.claimAndTransferToBeneficiary(
                            web3MockedBeneficiary.address, 'staged', web3ERC20.address, 0, '', {from: glob.user_a}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndTransferToBeneficiaryEvent');

                        (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(2);

                        const benefit = await ethersMockedBeneficiary._benefits(0);
                        benefit.wallet.should.equal(utils.getAddress(glob.user_a));
                        benefit.balanceType.should.equal('staged');
                        benefit.figure.amount._bn.should.eq.BN(8);
                        benefit.figure.currency.ct.should.equal(utils.getAddress(web3ERC20.address));
                        benefit.figure.currency.id._bn.should.eq.BN(0);
                        benefit.standard.should.be.a('string').that.is.empty;

                        (await ethersERC20.allowance(ethersSecurityBond.address, ethersMockedBeneficiary.address))
                            ._bn.should.eq.BN(8);
                    });
                });
            });

            describe('if claiming the same reward twice', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 5e17, 0
                    );
                    await web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 3e17, mocks.address0, 0, 0
                    );
                    await web3SecurityBond.claimAndTransferToBeneficiary(
                        web3MockedBeneficiary.address, 'staged', mocks.address0, 0, '', {from: glob.user_a}
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.claimAndTransferToBeneficiary(
                        web3MockedBeneficiary.address, 'staged', mocks.address0, 0, '', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });
        });

        describe('claimAndStage()', () => {
            describe('if no reward has been given', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.claimAndStage(
                        mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if reward has not been unlocked', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 5e17, 1e3
                    );
                    await web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 3e17, mocks.address0, 0, 1e3
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.claimAndStage(
                        mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if security bond has zero deposited balance', () => {
                beforeEach(async () => {
                    await web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 5e17, 0
                    );
                    await web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 3e17, mocks.address0, 0, 0
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.claimAndStage(
                        mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('of Ether', () => {
                    beforeEach(async () => {
                        await web3SecurityBond.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                        );
                        await web3MockedSecurityBondService.rewardFractional(
                            glob.user_a, 5e17, 0
                        );
                        await web3MockedSecurityBondService.rewardAbsolute(
                            glob.user_a, 3e17, mocks.address0, 0, 0
                        );
                    });

                    it('should successfully claim and stage', async () => {
                        const result = await web3SecurityBond.claimAndStage(
                            mocks.address0, 0, {from: glob.user_a}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndStageEvent');

                        (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.2')._bn);
                        (await ethersSecurityBond.stagedBalance(glob.user_a, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.8')._bn);
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
                        await web3MockedSecurityBondService.rewardFractional(
                            glob.user_a, 5e17, 0
                        );
                        await web3MockedSecurityBondService.rewardAbsolute(
                            glob.user_a, 3, web3ERC20.address, 0, 0
                        );
                    });

                    it('should successfully claim and stage', async () => {
                        const result = await web3SecurityBond.claimAndStage(
                            web3ERC20.address, 0, {from: glob.user_a}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('ClaimAndStageEvent');

                        (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(2);
                        (await ethersSecurityBond.stagedBalance(glob.user_a, web3ERC20.address, 0))
                            ._bn.should.eq.BN(8);
                    });
                });
            });

            describe('if claiming the same reward twice', () => {
                beforeEach(async () => {
                    await web3SecurityBond.receiveEthersTo(
                        glob.user_a, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                    );
                    await web3MockedSecurityBondService.rewardFractional(
                        glob.user_a, 5e17, 0
                    );
                    await web3MockedSecurityBondService.rewardAbsolute(
                        glob.user_a, 3e17, mocks.address0, 0, 0
                    );
                    await web3SecurityBond.claimAndStage(
                        mocks.address0, 0, {from: glob.user_a}
                    );
                });

                it('should revert', async () => {
                    web3SecurityBond.claimAndStage(
                        mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });
        });

        describe('withdraw()', () => {
            describe('if called with negative amount', () => {
                it('should revert', async () => {
                    web3SecurityBond.withdraw(
                        web3.toWei(-1, 'ether'), mocks.address0, 0, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                describe('of Ether', () => {
                    let balanceBefore;

                    beforeEach(async () => {
                        await web3SecurityBond.receiveEthersTo(
                            mocks.address0, '', {from: glob.user_a, value: web3.toWei(1, 'ether'), gas: 1e6}
                        );
                        await web3MockedSecurityBondService.rewardFractional(
                            glob.user_b, 5e17, 0
                        );
                        await web3MockedSecurityBondService.rewardAbsolute(
                            glob.user_b, 3e17, mocks.address0, 0, 0
                        );
                        await web3SecurityBond.claimAndStage(
                            mocks.address0, 0, {from: glob.user_b}
                        );

                        balanceBefore = await provider.getBalance(glob.user_b)._bn;
                    });

                    it('should successfully withdraw', async () => {
                        const result = await web3SecurityBond.withdraw(
                            web3.toWei(0.1, 'ether'), mocks.address0, 0, '', {from: glob.user_b}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('WithdrawEvent');

                        (await ethersSecurityBond.depositedBalance(mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.2')._bn);
                        (await ethersSecurityBond.stagedBalance(glob.user_b, mocks.address0, 0))
                            ._bn.should.eq.BN(utils.parseEther('0.7')._bn);

                        (await provider.getBalance(glob.user_b))
                            ._bn.should.be.gt.BN(balanceBefore);
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
                        await web3MockedSecurityBondService.rewardFractional(
                            glob.user_b, 5e17, 0
                        );
                        await web3MockedSecurityBondService.rewardAbsolute(
                            glob.user_b, 3, web3ERC20.address, 0, 0
                        );
                        await web3SecurityBond.claimAndStage(
                            web3ERC20.address, 0, {from: glob.user_b}
                        );
                    });

                    it('should successfully withdraw', async () => {
                        const result = await web3SecurityBond.withdraw(
                            1, web3ERC20.address, 0, '', {from: glob.user_b}
                        );

                        result.logs.should.be.an('array').and.have.lengthOf(1);
                        result.logs[0].event.should.equal('WithdrawEvent');

                        (await ethersSecurityBond.depositedBalance(web3ERC20.address, 0))
                            ._bn.should.eq.BN(2);
                        (await ethersSecurityBond.stagedBalance(glob.user_b, web3ERC20.address, 0))
                            ._bn.should.eq.BN(7);

                        (await ethersERC20.balanceOf(glob.user_b))
                            ._bn.should.eq.BN(1);
                    });
                });
            });
        });
    });
};
