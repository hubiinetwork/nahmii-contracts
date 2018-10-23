const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');

const MockedClientFundService = artifacts.require('MockedClientFundService');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe('ClientFund', function () {
        let ethersClientFundUserA;
        let web3MockedClientFundAuthorizedService, ethersMockedClientFundAuthorizedService;
        let web3MockedClientFundUnauthorizedService, ethersMockedClientFundUnauthorizedService;
        let web3MockedBeneficiary, ethersBeneficiary;
        let depositEtherIndex = -1, depositERC20Index = -1;
        let currencyDepositEtherIndex = -1, currencyDepositERC20Index = -1;
        let depositEtherBlockNumber = -1, depositERC20BlockNumber = -1;
        let withdrawalEtherIndex = -1, withdrawalERC20Index = -1;
        let currencyWithdrawalEtherIndex = -1, currencyWithdrawalERC20Index = -1;
        let withdrawalEtherBlockNumber = -1, withdrawalERC20BlockNumber = -1;
        const singleDepositEther = 5, singleDepositERC20 = 10;
        let provider;

        before(async () => {
            ethersClientFundUserA = glob.ethersIoClientFund.connect(glob.signer_a);

            web3MockedClientFundAuthorizedService = await MockedClientFundService.new(glob.owner);
            ethersMockedClientFundAuthorizedService = new Contract(web3MockedClientFundAuthorizedService.address, MockedClientFundService.abi, glob.signer_owner);
            web3MockedClientFundUnauthorizedService = await MockedClientFundService.new(glob.owner);
            ethersMockedClientFundUnauthorizedService = new Contract(web3MockedClientFundUnauthorizedService.address, MockedClientFundService.abi, glob.signer_owner);
            web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            ethersBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);

            // Fully wire the mocked authorized service
            await glob.ethersIoClientFund.registerService(web3MockedClientFundAuthorizedService.address);
            await glob.web3ClientFund.authorizeRegisteredService(web3MockedClientFundAuthorizedService.address, {from: glob.user_a});
            await ethersMockedClientFundAuthorizedService.changeClientFund(glob.web3ClientFund.address);

            // Partially wire the mocked unauthorized service
            await ethersMockedClientFundUnauthorizedService.changeClientFund(glob.web3ClientFund.address);

            // Register beneficiary
            await glob.ethersIoClientFund.registerBeneficiary(web3MockedBeneficiary.address);

            provider = glob.signer_owner.provider;
        });

        describe('depositsCount()', () => {
            it('should return initial value', async () => {
                const address = Wallet.createRandom().address;
                const result = await glob.ethersIoClientFund.depositsCount(address);
                result.should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('depositsOfCurrencyCount()', () => {
            it('should return initial value', async () => {
                const address = Wallet.createRandom().address;
                const result = await glob.ethersIoClientFund.depositsOfCurrencyCount(address, mocks.address0, 0);
                result.should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('withdrawalsCount()', () => {
            it('should return initial value', async () => {
                const address = Wallet.createRandom().address;
                const result = await glob.ethersIoClientFund.withdrawalsCount(address);
                result.should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('withdrawalOfCurrencyCount()', () => {
            it('should return initial value', async () => {
                const address = Wallet.createRandom().address;
                const result = await glob.ethersIoClientFund.withdrawalOfCurrencyCount(address, mocks.address0, 0);
                result.should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('depositedBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.depositedBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await glob.ethersIoClientFund.depositedBalance(address, mocks.address0, 0);
                    result.should.deep.equal(utils.bigNumberify(0));
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await glob.ethersIoClientFund.depositedBalance(address, glob.web3Erc20.address, 0);
                    result.should.deep.equal(utils.bigNumberify(0));
                });
            });
        });

        describe('settledBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.settledBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await glob.ethersIoClientFund.settledBalance(address, mocks.address0, 0);
                    result.should.deep.equal(utils.bigNumberify(0));
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await glob.ethersIoClientFund.settledBalance(address, glob.web3Erc20.address, 0);
                    result.should.deep.equal(utils.bigNumberify(0));
                });
            });
        });

        describe('activeAccumulation()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.activeAccumulation(mocks.address0, mocks.address0, 0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                describe('called with no accumulation entries', () => {
                    it('should revert', async () => {
                        const address = Wallet.createRandom().address;
                        glob.ethersIoClientFund.activeAccumulation(address, mocks.address0, 0, 0).should.be.rejected;
                    });
                });
            });

            describe('of ERC20 token', () => {
                describe('called with no accumulation entries', () => {
                    it('should return initial value', async () => {
                        const address = Wallet.createRandom().address;
                        glob.ethersIoClientFund.activeAccumulation(address, glob.web3Erc20.address, 0, 0).should.be.rejected;
                    });
                });
            });
        });

        describe('activeAccumulationsCount()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.activeAccumulationsCount(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await glob.ethersIoClientFund.activeAccumulationsCount(address, mocks.address0, 0);
                    result.should.deep.equal(utils.bigNumberify(0));
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await glob.ethersIoClientFund.activeAccumulationsCount(address, glob.web3Erc20.address, 0);
                    result.should.deep.equal(utils.bigNumberify(0));
                });
            });
        });

        describe('stagedBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.stagedBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await glob.ethersIoClientFund.stagedBalance(address, mocks.address0, 0);
                    result.should.deep.equal(utils.bigNumberify(0));
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    const address = Wallet.createRandom().address;
                    const result = await glob.ethersIoClientFund.stagedBalance(address, glob.web3Erc20.address, 0);
                    result.should.deep.equal(utils.bigNumberify(0));
                });
            });
        });

        describe('fallback function', () => {
            let depositCountBefore, depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, activeAccumulationsCountBefore;

            before(async () => {
                depositCountBefore = await glob.ethersIoClientFund.depositsCount(glob.user_a);
                depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                activeAccumulationsCountBefore = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, mocks.address0, 0);
            });

            it('should add deposit and increment deposited balance', async () => {
                await web3.eth.sendTransactionPromise({
                    from: glob.user_a,
                    to: glob.web3ClientFund.address,
                    value: web3.toWei(singleDepositEther, 'ether'),
                    gas: glob.gasLimit
                });

                const depositsCount = await glob.ethersIoClientFund.depositsCount(glob.user_a);
                depositsCount.should.deep.equal(depositCountBefore.add(1));
                depositEtherIndex = depositCountBefore.toNumber();
                currencyDepositEtherIndex++;
                depositEtherBlockNumber = await provider.getBlockNumber();

                const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                depositedBalance.should.deep.equal(depositedBalanceBefore.add(utils.parseEther(singleDepositEther.toString())));
                const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                settledBalance.should.deep.equal(settledBalanceBefore);
                const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                stagedBalance.should.deep.equal(stagedBalanceBefore);

                const activeAccumulationsCount = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, mocks.address0, 0);
                activeAccumulationsCount._bn.should.eq.BN(activeAccumulationsCountBefore.add(1)._bn);
            });
        });

        describe('depositEthersTo()', () => {
            let depositCountBefore, depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, activeAccumulationsCountBefore;

            before(async () => {
                depositCountBefore = await glob.ethersIoClientFund.depositsCount(glob.user_a);
                depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                activeAccumulationsCountBefore = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, mocks.address0, 0);
            });

            it('should add deposit and increment deposited balance', async () => {
                await glob.web3ClientFund.depositEthersTo(
                    glob.user_a,
                    {
                        from: glob.user_a,
                        value: web3.toWei(singleDepositEther, 'ether'),
                        gas: glob.gasLimit
                    }
                );

                const depositsCount = await glob.ethersIoClientFund.depositsCount(glob.user_a);
                depositsCount.should.deep.equal(depositCountBefore.add(1));
                depositEtherIndex = depositCountBefore.toNumber();
                currencyDepositEtherIndex++;
                depositEtherBlockNumber = await provider.getBlockNumber();

                const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                depositedBalance.should.deep.equal(depositedBalanceBefore.add(utils.parseEther(singleDepositEther.toString())));
                const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                settledBalance.should.deep.equal(settledBalanceBefore);
                const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                stagedBalance.should.deep.equal(stagedBalanceBefore);

                const activeAccumulationsCount = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, mocks.address0, 0);
                activeAccumulationsCount._bn.should.eq.BN(activeAccumulationsCountBefore.add(1)._bn);
            });
        });

        describe('depositTokens()', () => {
            let depositCountBefore, depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, activeAccumulationsCountBefore;

            beforeEach(async () => {
                depositCountBefore = await glob.ethersIoClientFund.depositsCount(glob.user_a);
                depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                activeAccumulationsCountBefore = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, glob.web3Erc20.address, 0);
            });

            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        glob.web3ClientFund.depositTokens(0, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with zero ERC20 contract address', () => {
                    it('should revert', async () => {
                        glob.web3ClientFund.depositTokens(singleDepositEther, 0, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        glob.web3ClientFund.depositTokens(singleDepositERC20, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await glob.web3Erc20.approve(glob.web3ClientFund.address, 0, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                        await glob.web3Erc20.approve(glob.web3ClientFund.address, 9999, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                    });

                    it('should revert', async () => {
                        glob.web3ClientFund.depositTokens(9999, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with prior approval and supported amount', () => {
                    beforeEach(async () => {
                        await glob.web3Erc20.approve(glob.web3ClientFund.address, 0, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                        await glob.web3Erc20.approve(glob.web3ClientFund.address, singleDepositERC20, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                    });

                    it('should add deposit and increment deposited balance of ', async () => {
                        await glob.web3ClientFund.depositTokens(singleDepositERC20, glob.web3Erc20.address, 0, '', {from: glob.user_a});

                        const depositsCount = await glob.ethersIoClientFund.depositsCount(glob.user_a);
                        depositsCount.should.deep.equal(utils.bigNumberify(depositCountBefore.add(1)));
                        depositERC20Index = depositCountBefore.toNumber();
                        currencyDepositERC20Index++;
                        depositERC20BlockNumber = await provider.getBlockNumber();

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.should.deep.equal(depositedBalanceBefore.add(singleDepositERC20));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.should.deep.equal(settledBalanceBefore);
                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.should.deep.equal(stagedBalanceBefore);

                        const activeAccumulationsCount = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, glob.web3Erc20.address, 0);
                        activeAccumulationsCount._bn.should.eq.BN(activeAccumulationsCountBefore.add(1)._bn);
                    });
                });
            });
        });

        describe('depositTokensTo()', () => {
            let depositCountBefore, depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, activeAccumulationsCountBefore;

            beforeEach(async () => {
                depositCountBefore = await glob.ethersIoClientFund.depositsCount(glob.user_a);
                depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                activeAccumulationsCountBefore = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, glob.web3Erc20.address, 0);
            });

            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        glob.web3ClientFund.depositTokensTo(glob.user_a, 0, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with zero ERC20 contract address', () => {
                    it('should revert', async () => {
                        glob.web3ClientFund.depositTokensTo(glob.user_a, singleDepositERC20, 0, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        glob.web3ClientFund.depositTokensTo(glob.user_a, singleDepositERC20, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await glob.web3Erc20.approve(glob.web3ClientFund.address, 0, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                        await glob.web3Erc20.approve(glob.web3ClientFund.address, 9999, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                    });

                    it('should revert', async () => {
                        glob.web3ClientFund.depositTokensTo(glob.user_a, 9999, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with prior approval and supported amount', () => {
                    beforeEach(async () => {
                        await glob.web3Erc20.approve(glob.web3ClientFund.address, 0, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                        await glob.web3Erc20.approve(glob.web3ClientFund.address, singleDepositERC20, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                    });

                    it('should add deposit and increment deposited balance', async () => {
                        await glob.web3ClientFund.depositTokensTo(glob.user_a, singleDepositERC20, glob.web3Erc20.address, 0, '', {from: glob.user_a});

                        const depositsCount = await glob.ethersIoClientFund.depositsCount(glob.user_a);
                        depositsCount.should.deep.equal(utils.bigNumberify(depositCountBefore.add(1)));
                        depositERC20Index = depositCountBefore.toNumber();
                        currencyDepositERC20Index++;
                        depositERC20BlockNumber = await provider.getBlockNumber();

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.should.deep.equal(depositedBalanceBefore.add(singleDepositERC20));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.should.deep.equal(settledBalanceBefore);
                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.should.deep.equal(stagedBalanceBefore);

                        const activeAccumulationsCount = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, glob.web3Erc20.address, 0);
                        activeAccumulationsCount._bn.should.eq.BN(activeAccumulationsCountBefore.add(1)._bn);
                    });
                });
            });
        });

        describe('deposit()', () => {
            describe('of Ether', () => {
                it('should return deposit', async () => {
                    depositEtherIndex.should.be.greaterThan(-1);
                    depositEtherBlockNumber.should.be.greaterThan(-1);

                    const deposit = await glob.ethersIoClientFund.deposit(glob.user_a, depositEtherIndex);

                    deposit.amount.should.deep.equal(utils.parseEther(singleDepositEther.toString()));
                    deposit.blockNumber._bn.should.eq.BN(depositEtherBlockNumber);
                    deposit.currencyCt.should.equal(mocks.address0);
                    deposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                });
            });

            describe('of ERC20 token', () => {
                it('should return deposit', async () => {
                    depositERC20Index.should.be.greaterThan(-1);
                    depositERC20BlockNumber.should.be.greaterThan(-1);

                    const deposit = await glob.ethersIoClientFund.deposit(glob.user_a, depositERC20Index);

                    deposit.amount.should.deep.equal(utils.bigNumberify(singleDepositERC20));
                    deposit.blockNumber._bn.should.eq.BN(depositERC20BlockNumber);
                    deposit.currencyCt.should.equal(utils.getAddress(glob.web3Erc20.address));
                    deposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                });
            });
        });

        describe('depositOfCurrency()', () => {
            describe('of Ether', () => {
                it('should return currency deposit', async () => {
                    currencyDepositEtherIndex.should.be.greaterThan(-1);
                    depositEtherBlockNumber.should.be.greaterThan(-1);

                    const deposit = await glob.ethersIoClientFund.depositOfCurrency(glob.user_a, mocks.address0, 0, currencyDepositEtherIndex);

                    deposit.amount.should.deep.equal(utils.parseEther(singleDepositEther.toString()));
                    deposit.blockNumber._bn.should.eq.BN(depositEtherBlockNumber);
                });
            });

            describe('of ERC20 token', () => {
                it('should return currency deposit', async () => {
                    currencyDepositERC20Index.should.be.greaterThan(-1);
                    depositERC20BlockNumber.should.be.greaterThan(-1);

                    const deposit = await glob.ethersIoClientFund.depositOfCurrency(glob.user_a, glob.web3Erc20.address, 0, currencyDepositERC20Index);

                    deposit.amount.should.deep.equal(utils.bigNumberify(singleDepositERC20));
                    deposit.blockNumber._bn.should.eq.BN(depositERC20BlockNumber);
                });
            });
        });

        describe('updateSettledBalance()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.updateSettledBalance(Wallet.createRandom().address, 1, Wallet.createRandom().address, 0)
                        .should.be.rejected;
                });
            });

            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.updateSettledBalanceInClientFund(mocks.address0, utils.parseEther('1'), mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe.skip('called by unauthorized service', () => {
                it('should revert', async () => {
                    ethersMockedClientFundUnauthorizedService.updateSettledBalanceInClientFund(glob.user_a, utils.parseEther('1'), mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('called with negative amount', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.updateSettledBalanceInClientFund(glob.user_a, utils.parseEther('-1'), mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            // TODO Update with conditional top-up of deposited balance
            describe('of Ether', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, updateAmount;
                // let requiredDepositedBalanceBefore;

                before(async () => {
                    // requiredDepositedBalanceBefore = utils.parseEther('10');
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    // if (depositedBalanceBefore.lt(requiredDepositedBalanceBefore)) {
                    //     await ethersClientFundUserA.depositEthersTo(glob.user_a, {
                    //         value: requiredDepositedBalanceBefore.sub(depositedBalanceBefore),
                    //         gasLimit: 1e6
                    //     });
                    //     depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    // }

                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                    updateAmount = utils.parseEther('1');
                });

                it('should successfully update settled balance of Ether', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalanceInClientFund(glob.user_a, updateAmount, mocks.address0, 0);

                    const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    utils.formatEther(settledBalance).should.equal(utils.formatEther(updateAmount.sub(depositedBalanceBefore)));
                    const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceBefore));
                    const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                    utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceBefore));
                });
            });

            describe('of ERC20 token', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, updateAmount;

                before(async () => {
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    updateAmount = utils.bigNumberify(5);
                });

                it('should successfully update settled balance of ERC20 token', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalanceInClientFund(glob.user_a, updateAmount, glob.web3Erc20.address, 0);

                    const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalance.toString().should.equal(updateAmount.sub(depositedBalanceBefore).toString());
                    const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    depositedBalance.toString().should.equal(depositedBalanceBefore.toString());
                    const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalance.toString().should.equal(stagedBalanceBefore.toString());
                });
            });
        });

        // TODO Unskip and assure sufficient deposits in client fund
        describe('stage()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.stage(Wallet.createRandom().address, 1, Wallet.createRandom().address, 0)
                        .should.be.rejected;
                });
            });

            describe.skip('called by unauthorized service', () => {
                it('should revert', async () => {
                    ethersMockedClientFundUnauthorizedService.stageInClientFund(glob.user_a, utils.parseEther('1'), mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('called with negative amount', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, utils.parseEther('-1'), mocks.address0, 0)
                        .should.be.rejected;
                });
            });

            describe('of Ether', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                    depositedBalanceAfter, settledBalanceAfter, stagedBalanceAfter, activeAccumulationsCountBefore;

                beforeEach(async () => {
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                    activeAccumulationsCountBefore = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, mocks.address0, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        stageAmount = depositedBalanceBefore.add(settledBalanceBefore).div(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? 0 : stageAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? stageAmount : settledBalanceBefore
                        );
                        stagedBalanceAfter = stagedBalanceBefore.add(stageAmount);
                    });

                    it('should successfully stage the provided amount of Ether', async () => {
                        await ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, stageAmount, mocks.address0, 0, {gasLimit: 1e6});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));

                        const activeAccumulationsCount = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, mocks.address0, 0);
                        activeAccumulationsCount._bn.should.eq.BN(activeAccumulationsCountBefore.add(1)._bn);
                    });
                });

                describe('of amount greater than deposited + settled balances', () => {
                    let stagedAmount;

                    beforeEach(async () => {
                        stagedAmount = depositedBalanceBefore.add(settledBalanceBefore);
                        stageAmount = stagedAmount.mul(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? 0 : stagedAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? stagedAmount : settledBalanceBefore
                        );
                        stagedBalanceAfter = stagedBalanceBefore.add(stagedAmount);
                    });

                    it('should successfully stage the deposited + settled amount of Ether', async () => {
                        await ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, stageAmount, mocks.address0, 0, {gasLimit: 1e6});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));

                        const activeAccumulationsCount = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, mocks.address0, 0);
                        activeAccumulationsCount._bn.should.eq.BN(activeAccumulationsCountBefore.add(1)._bn);
                    });
                });
            });

            describe('of ERC20 token', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                    depositedBalanceAfter, settledBalanceAfter, stagedBalanceAfter, activeAccumulationsCountBefore;

                beforeEach(async () => {
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    activeAccumulationsCountBefore = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, glob.web3Erc20.address, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        stageAmount = depositedBalanceBefore.add(settledBalanceBefore).div(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? 0 : stageAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? stageAmount : settledBalanceBefore
                        );
                        stagedBalanceAfter = stagedBalanceBefore.add(stageAmount);
                    });

                    it('should successfully stage the provided amount of ERC20 token', async () => {
                        await ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, stageAmount, glob.web3Erc20.address, 0, {gasLimit: 2e6});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceAfter.toString());

                        const activeAccumulationsCount = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, glob.web3Erc20.address, 0);
                        activeAccumulationsCount._bn.should.eq.BN(activeAccumulationsCountBefore.add(1)._bn);
                    });
                });

                describe('of amount greater than deposited + settled balances', () => {
                    let stagedAmount;

                    beforeEach(async () => {
                        stagedAmount = depositedBalanceBefore.add(settledBalanceBefore);
                        stageAmount = stagedAmount.mul(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? 0 : stagedAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? stagedAmount : settledBalanceBefore
                        );
                        stagedBalanceAfter = stagedBalanceBefore.add(stagedAmount);
                    });

                    it('should successfully stage the deposited + settled amount of ERC20 token', async () => {
                        await ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, stageAmount, glob.web3Erc20.address, 0, {gasLimit: 2e6});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceAfter.toString());

                        const activeAccumulationsCount = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, glob.web3Erc20.address, 0);
                        activeAccumulationsCount._bn.should.eq.BN(activeAccumulationsCountBefore.add(1)._bn);
                    });
                });
            });
        });

        // TODO Unskip and assure sufficient deposits in client fund
        describe.skip('unstage()', () => {
            describe('called by owner', () => {
                it('should revert', async () => {
                    glob.web3ClientFund.unstage(web3.toWei(1), mocks.address0, 0, {from: glob.owner})
                        .should.be.rejected;
                });
            });

            describe('of Ether', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, unstageAmount,
                    depositedBalanceAfter, stagedBalanceAfter, activeAccumulationsCountBefore;

                beforeEach(async () => {
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                    activeAccumulationsCountBefore = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, mocks.address0, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        unstageAmount = stagedBalanceBefore.div(2);
                        depositedBalanceAfter = depositedBalanceBefore.add(unstageAmount);
                        stagedBalanceAfter = stagedBalanceBefore.sub(unstageAmount);
                    });

                    it('should successfully unstage the provided amount of Ether', async () => {
                        await glob.web3ClientFund.unstage(web3.toWei(utils.formatEther(unstageAmount)), mocks.address0, 0, {from: glob.user_a});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceBefore));
                    });
                });

                describe('of amount greater than deposited + settled balances', () => {
                    let unstagedAmount;

                    beforeEach(async () => {
                        unstagedAmount = stagedBalanceBefore;
                        unstageAmount = unstagedAmount.mul(2);
                        depositedBalanceAfter = depositedBalanceBefore.add(unstagedAmount);
                        stagedBalanceAfter = stagedBalanceBefore.sub(unstagedAmount);
                    });

                    it('should successfully unstage the staged amount of Ether', async () => {
                        await glob.web3ClientFund.unstage(web3.toWei(utils.formatEther(unstageAmount), 'ether'), mocks.address0, 0, {from: glob.user_a});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceBefore));
                    });
                });
            });

            describe('of ERC20 token', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, unstageAmount,
                    depositedBalanceAfter, stagedBalanceAfter, activeAccumulationsCountBefore;

                beforeEach(async () => {
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    activeAccumulationsCountBefore = await glob.ethersIoClientFund.activeAccumulationsCount(glob.user_a, glob.web3Erc20.address, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        unstageAmount = stagedBalanceBefore.div(2);
                        depositedBalanceAfter = depositedBalanceBefore.add(unstageAmount);
                        stagedBalanceAfter = stagedBalanceBefore.sub(unstageAmount);
                    });

                    it('should successfully unstage the provided amount of ERC20 token', async () => {
                        await glob.web3ClientFund.unstage(web3.toBigNumber(unstageAmount.toString()), glob.web3Erc20.address, 0, {from: glob.user_a});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceBefore.toString());
                    });
                });

                describe('of amount greater than deposited + settled balances', () => {
                    let unstagedAmount;

                    beforeEach(async () => {
                        unstagedAmount = stagedBalanceBefore;
                        unstageAmount = unstagedAmount.mul(2);
                        depositedBalanceAfter = depositedBalanceBefore.add(unstagedAmount);
                        stagedBalanceAfter = stagedBalanceBefore.sub(unstagedAmount);
                    });

                    it('should successfully unstage the staged amount of ERC20 token', async () => {
                        await glob.web3ClientFund.unstage(web3.toBigNumber(unstageAmount.toString()), glob.web3Erc20.address, 0, {from: glob.user_a});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceBefore.toString());
                    });
                });
            });
        });

        // TODO Unskip and assure sufficient deposits in client fund
        describe.skip('stageToBeneficiary()', () => {
            let overrideOptions;

            before(() => {
                overrideOptions = {gasLimit: 1e6};
            });

            describe('of negative amount', () => {
                it('should revert', async () => {
                    glob.web3ClientFund.stageToBeneficiary(
                        web3MockedBeneficiary.address, web3.toWei(-1, 'ether'), mocks.address0, 0,
                        {
                            from: glob.user_a
                        }
                    ).should.be.rejected;
                });
            });

            describe('to unregistered beneficiary', () => {
                it('should revert', async () => {
                    glob.web3ClientFund.stageToBeneficiary(
                        Wallet.createRandom().address, web3.toWei(1, 'ether'), mocks.address0, 0,
                        {
                            from: glob.user_a
                        }
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                    depositedBalanceAfter, settledBalanceAfter;

                beforeEach(async () => {
                    await ethersBeneficiary.reset(overrideOptions);

                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        stageAmount = depositedBalanceBefore.add(settledBalanceBefore).div(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? 0 : stageAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? stageAmount : settledBalanceBefore
                        );
                    });

                    it('should successfully stage the provided amount of Ether', async () => {
                        await glob.web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toWei(utils.formatEther(stageAmount), 'ether'), mocks.address0, 0,
                            {
                                from: glob.user_a
                            }
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        utils.formatEther(beneficiaryDeposit.amount).should.equal(utils.formatEther(stageAmount));
                        beneficiaryDeposit.currencyCt.should.equal(mocks.address0);
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('ether');
                    });
                });

                describe('of amount greater than deposited + settled balances', () => {
                    let stagedAmount;

                    beforeEach(async () => {
                        stagedAmount = depositedBalanceBefore.add(settledBalanceBefore);
                        stageAmount = stagedAmount.mul(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? 0 : stagedAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? stagedAmount : settledBalanceBefore
                        );
                    });

                    it('should successfully stage the deposited + settled amount of Ether', async () => {
                        await glob.web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toWei(utils.formatEther(stageAmount), 'ether'), mocks.address0, 0,
                            {
                                from: glob.user_a
                            }
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        utils.formatEther(beneficiaryDeposit.amount).should.equal(utils.formatEther(stagedAmount));
                        beneficiaryDeposit.currencyCt.should.equal(mocks.address0);
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('ether');
                    });
                });
            });

            describe('of ERC20 token', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                    depositedBalanceAfter, settledBalanceAfter;

                beforeEach(async () => {
                    await ethersBeneficiary.reset(overrideOptions);

                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        stageAmount = depositedBalanceBefore.add(settledBalanceBefore).div(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? 0 : stageAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? stageAmount : settledBalanceBefore
                        );
                    });

                    it('should successfully stage the provided amount of ERC20 token', async () => {
                        await glob.web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toBigNumber(stageAmount.toString()), glob.web3Erc20.address, 0,
                            {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceAfter.toString());

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        beneficiaryDeposit.amount.toString().should.equal(stageAmount.toString());
                        beneficiaryDeposit.currencyCt.should.equal(utils.getAddress(glob.web3Erc20.address));
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('');
                    });
                });

                describe.skip('of amount greater than deposited + settled balances', () => {
                    let stagedAmount;

                    beforeEach(async () => {
                        stagedAmount = depositedBalanceBefore.add(settledBalanceBefore).div(2).mul(2);
                        stageAmount = stagedAmount.mul(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? 0 : stagedAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? stagedAmount : settledBalanceBefore
                        );
                    });

                    it('should successfully stage the deposited + settled amount of ERC20 token', async () => {
                        await glob.web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toBigNumber(stageAmount.toString()), glob.web3Erc20.address, 0,
                            {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceAfter.toString());

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        beneficiaryDeposit.amount.toString().should.equal(stagedAmount.toString());
                        beneficiaryDeposit.currencyCt.should.equal(utils.getAddress(glob.web3Erc20.address));
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('');
                    });
                });
            });
        });

        // TODO Unskip and assure sufficient deposits in client fund
        describe.skip('stageToBeneficiaryUntargeted()', () => {
            let overrideOptions;

            before(() => {
                overrideOptions = {gasLimit: 2e6};
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    ethersMockedClientFundUnauthorizedService.stageToBeneficiaryUntargetedInClientFund(
                        glob.user_a, web3MockedBeneficiary.address, utils.parseEther('1'), mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('to unregistered beneficiary', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.stageToBeneficiaryUntargetedInClientFund(
                        glob.user_a, Wallet.createRandom().address, utils.parseEther('1'), mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('of negative amount', () => {
                it('should revert', async () => {
                    ethersMockedClientFundAuthorizedService.stageToBeneficiaryUntargetedInClientFund(
                        glob.user_a, web3MockedBeneficiary.address, utils.parseEther('-1'), mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                    depositedBalanceAfter, settledBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    await ethersBeneficiary.reset(overrideOptions);

                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        stageAmount = depositedBalanceBefore.add(settledBalanceBefore).div(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? 0 : stageAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? stageAmount : settledBalanceBefore
                        );
                        stagedBalanceAfter = stagedBalanceBefore.add(stageAmount);
                    });

                    it('should successfully stage the provided amount of Ether', async () => {
                        await ethersMockedClientFundAuthorizedService.stageToBeneficiaryUntargetedInClientFund(
                            glob.user_a, web3MockedBeneficiary.address, stageAmount, mocks.address0, 0, {gasLimit: 3e6}
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(mocks.address0);
                        utils.formatEther(beneficiaryDeposit.amount).should.equal(utils.formatEther(stageAmount));
                        beneficiaryDeposit.currencyCt.should.equal(mocks.address0);
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('ether');
                    });
                });

                describe('of amount greater than deposited + settled balances', () => {
                    let stagedAmount;

                    beforeEach(async () => {
                        stagedAmount = depositedBalanceBefore.add(settledBalanceBefore);
                        stageAmount = stagedAmount.mul(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? 0 : stagedAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? stagedAmount : settledBalanceBefore
                        );
                        stagedBalanceAfter = stagedBalanceBefore.add(stagedAmount);
                    });

                    it('should successfully stage the deposited + settled amount of Ether', async () => {
                        await ethersMockedClientFundAuthorizedService.stageToBeneficiaryUntargetedInClientFund(
                            glob.user_a, web3MockedBeneficiary.address, stageAmount, mocks.address0, 0, {gasLimit: 3e6}
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(mocks.address0);
                        utils.formatEther(beneficiaryDeposit.amount).should.equal(utils.formatEther(stagedAmount));
                        beneficiaryDeposit.currencyCt.should.equal(mocks.address0);
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('ether');
                    });
                });
            });

            describe.skip('of ERC20 token', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                    depositedBalanceAfter, settledBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    await ethersBeneficiary.reset(overrideOptions);

                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        stageAmount = depositedBalanceBefore.add(settledBalanceBefore).div(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? 0 : stageAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stageAmount) ? stageAmount : settledBalanceBefore
                        );
                        stagedBalanceAfter = stagedBalanceBefore.add(stageAmount);
                    });

                    it('should successfully stage the provided amount of ERC20 token', async () => {
                        await ethersMockedClientFundAuthorizedService.stageToBeneficiaryUntargetedInClientFund(
                            glob.user_a, web3MockedBeneficiary.address, stageAmount, glob.web3Erc20.address, 0, {gasLimit: 3e6}
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceAfter.toString());

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        beneficiaryDeposit.amount.toString().should.equal(stageAmount.toString());
                        beneficiaryDeposit.currencyCt.should.equal(glob.web3Erc20.address);
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('ether');
                    });
                });

                describe('of amount greater than deposited + settled balances', () => {
                    let stagedAmount;

                    beforeEach(async () => {
                        stagedAmount = depositedBalanceBefore.add(settledBalanceBefore);
                        stageAmount = stagedAmount.mul(2);
                        depositedBalanceAfter = depositedBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? 0 : stagedAmount.sub(settledBalanceBefore)
                        );
                        settledBalanceAfter = settledBalanceBefore.sub(
                            settledBalanceBefore.gt(stagedAmount) ? stagedAmount : settledBalanceBefore
                        );
                        stagedBalanceAfter = stagedBalanceBefore.add(stagedAmount);
                    });

                    it('should successfully stage the deposited + settled amount of ERC20 token', async () => {
                        await ethersMockedClientFundAuthorizedService.stageToBeneficiaryUntargetedInClientFund(
                            glob.user_a, web3MockedBeneficiary.address, stageAmount, glob.web3Erc20.address, 0, {gasLimit: 3e6}
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceAfter.toString());

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        beneficiaryDeposit.amount.toString().should.equal(stagedAmount.toString());
                        beneficiaryDeposit.currencyCt.should.equal(glob.web3Erc20.address);
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('ether');
                    });
                });
            });
        });

        // TODO Unskip and assure sufficient deposits in client fund
        describe.skip('seizeAllBalances()', () => {
            let userABalanceOfEtherBefore, userBBalanceOfEtherBefore;
            let userABalanceOfErc20Before, userBBalanceOfErc20Before;
            let depositedBalance, settledBalance, stagedBalance;

            before(async () => {
                depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                userABalanceOfEtherBefore = depositedBalance.add(settledBalance).add(stagedBalance);

                depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_b, mocks.address0, 0);
                settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_b, mocks.address0, 0);
                stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_b, mocks.address0, 0);
                userBBalanceOfEtherBefore = depositedBalance.add(settledBalance).add(stagedBalance);

                depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                userABalanceOfErc20Before = depositedBalance.add(settledBalance).add(stagedBalance);

                depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_b, glob.web3Erc20.address, 0);
                settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_b, glob.web3Erc20.address, 0);
                stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address, 0);
                userBBalanceOfErc20Before = depositedBalance.add(settledBalance).add(stagedBalance);
            });

            describe('called by unauthorized service', () => {
                it('should revert', async () => {
                    ethersMockedClientFundUnauthorizedService.seizeAllBalancesInClientFund(
                        glob.user_a, glob.user_b
                    ).should.be.rejected;
                });
            });

            it('should successfully transfer the full set of balances of Ether and ERC20 token', async () => {
                await ethersMockedClientFundAuthorizedService.seizeAllBalancesInClientFund(
                    glob.user_a, glob.user_b, {gasLimit: 3e6}
                );

                depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                const userABalanceOfEtherAfter = depositedBalance.add(settledBalance).add(stagedBalance);
                utils.formatEther(userABalanceOfEtherAfter).should.equal(utils.formatEther('0'));

                depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_b, mocks.address0, 0);
                settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_b, mocks.address0, 0);
                stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_b, mocks.address0, 0);
                const userBBalanceOfEtherAfter = depositedBalance.add(settledBalance).add(stagedBalance);
                utils.formatEther(userBBalanceOfEtherAfter).should.equal(
                    utils.formatEther(userBBalanceOfEtherBefore.add(userABalanceOfEtherBefore))
                );

                depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                const userABalanceOfErc20After = depositedBalance.add(settledBalance).add(stagedBalance);
                userABalanceOfErc20After.toString().should.equal('0');

                depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_b, glob.web3Erc20.address, 0);
                settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_b, glob.web3Erc20.address, 0);
                stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address, 0);
                const userBBalanceOfErc20After = depositedBalance.add(settledBalance).add(stagedBalance);
                userBBalanceOfErc20After.toString().should.equal(
                    userBBalanceOfErc20Before.add(userABalanceOfErc20Before).toString()
                );
            });
        });

        // TODO Unskip
        describe('withdraw()', () => {
            let withdrawalCountBefore;

            beforeEach(async () => {
                withdrawalCountBefore = await glob.ethersIoClientFund.withdrawalsCount(glob.user_a);
            });

            describe('of Ether', () => {
                let stagedBalanceBefore, stagedBalanceAfter, withdrawalAmount, accountBalanceBefore,
                    accountBalanceAfter;

                beforeEach(async () => {
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);

                    // const accountBalance = await web3.eth.getBalance(glob.user_a);
                    // accountBalanceBefore = utils.bigNumberify(accountBalance.toString());
                });

                describe('of amount less than or equal to staged balance', () => {
                    beforeEach(async () => {
                        withdrawalAmount = stagedBalanceBefore.div(2);
                        stagedBalanceAfter = stagedBalanceBefore.sub(withdrawalAmount);
                        // accountBalanceAfter = accountBalanceBefore.add(withdrawalAmount);
                    });

                    it('should successfully withdraw the withdrawal amount of Ether', async () => {
                        await glob.web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), mocks.address0, 0, '', {from: glob.user_a});

                        withdrawalEtherIndex = withdrawalCountBefore.toNumber();
                        currencyWithdrawalEtherIndex++;
                        withdrawalEtherBlockNumber = await provider.getBlockNumber();

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        // const accountBalance = await web3.eth.getBalance(glob.user_a);
                        // utils.formatEther(utils.bigNumberify(accountBalance.toString())).should.equal(utils.formatEther(accountBalanceAfter))
                    });
                });

                describe('of amount greater than staged balance', () => {
                    let withdrawnAmount;

                    beforeEach(async () => {
                        withdrawnAmount = stagedBalanceBefore;
                        withdrawalAmount = withdrawnAmount.mul(2);
                        stagedBalanceAfter = stagedBalanceBefore.sub(withdrawnAmount);
                        // accountBalanceAfter = accountBalanceBefore.add(withdrawnAmount);
                    });

                    it('should successfully withdraw the staged amount of Ether', async () => {
                        await glob.web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), mocks.address0, 0, '', {from: glob.user_a});

                        withdrawalEtherIndex = withdrawalCountBefore.toNumber();
                        currencyWithdrawalEtherIndex++;
                        withdrawalEtherBlockNumber = await provider.getBlockNumber();

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        // const accountBalance = await web3.eth.getBalance(glob.user_a);
                        // utils.formatEther(utils.bigNumberify(accountBalance.toString())).should.equal(utils.formatEther(accountBalanceAfter))
                    });
                });
            });

            describe('of ERC20 token', () => {
                let stagedBalanceBefore, stagedBalanceAfter, withdrawalAmount, accountBalanceBefore,
                    accountBalanceAfter;

                beforeEach(async () => {
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);

                    // const accountBalance = await web3.eth.getBalance(glob.user_a);
                    // accountBalanceBefore = utils.bigNumberify(accountBalance.toString());
                });

                describe('of amount less than or equal to staged balance', () => {
                    beforeEach(async () => {
                        withdrawalAmount = stagedBalanceBefore.div(2);
                        stagedBalanceAfter = stagedBalanceBefore.sub(withdrawalAmount);
                        // accountBalanceAfter = accountBalanceBefore.add(withdrawalAmount);
                    });

                    it('should successfully withdraw the provided amount of Ether', async () => {
                        await glob.web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), glob.web3Erc20.address, 0, '', {from: glob.user_a});

                        withdrawalERC20Index = withdrawalCountBefore.toNumber();
                        currencyWithdrawalERC20Index++;
                        withdrawalERC20BlockNumber = await provider.getBlockNumber();

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        // const accountBalance = await web3.eth.getBalance(glob.user_a);
                        // utils.formatEther(utils.bigNumberify(accountBalance.toString())).should.equal(utils.formatEther(accountBalanceAfter))
                    });
                });

                describe('of amount greater than staged balance', () => {
                    let withdrawnAmount;

                    beforeEach(async () => {
                        withdrawnAmount = stagedBalanceBefore;
                        withdrawalAmount = withdrawnAmount.mul(2);
                        stagedBalanceAfter = stagedBalanceBefore.sub(withdrawnAmount);
                        // accountBalanceAfter = accountBalanceBefore.add(withdrawnAmount);
                    });

                    it('should successfully withdraw the staged amount of Ether', async () => {
                        await glob.web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), glob.web3Erc20.address, 0, '', {from: glob.user_a});

                        withdrawalERC20Index = withdrawalCountBefore.toNumber();
                        currencyWithdrawalERC20Index++;
                        withdrawalERC20BlockNumber = await provider.getBlockNumber();

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        // const accountBalance = await web3.eth.getBalance(glob.user_a);
                        // utils.formatEther(utils.bigNumberify(accountBalance.toString())).should.equal(utils.formatEther(accountBalanceAfter))
                    });
                });
            });

            // describe('of ERC20 token', () => {
            //     let depositedBalanceBefore, stagedBalanceBefore, unstageAmount,
            //         depositedBalanceAfter, stagedBalanceAfter;
            //
            //     beforeEach(async () => {
            //         depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //         stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //     });
            //
            //     describe('of amount less than or equal to deposited + settled balances', () => {
            //         beforeEach(async () => {
            //             unstageAmount = stagedBalanceBefore.div(2);
            //             depositedBalanceAfter = depositedBalanceBefore.add(unstageAmount);
            //             stagedBalanceAfter = stagedBalanceBefore.sub(unstageAmount);
            //         });
            //
            //         it('should successfully unstage the provided amount of ERC20 token', async () => {
            //             await glob.web3ClientFund.unstage(Number(unstageAmount.toString()), glob.web3Erc20.address, 0, {from: glob.user_a});
            //
            //             const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //             stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
            //             const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //             depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
            //         });
            //     });
            //
            //     describe('of amount greater than deposited + settled balances', () => {
            //         let unstagedAmount;
            //
            //         beforeEach(async () => {
            //             unstagedAmount = stagedBalanceBefore;
            //             unstageAmount = unstagedAmount.mul(2);
            //             depositedBalanceAfter = depositedBalanceBefore.add(unstagedAmount);
            //             stagedBalanceAfter = stagedBalanceBefore.sub(unstagedAmount);
            //         });
            //
            //         it('should successfully unstage the staged amount of ERC20 token', async () => {
            //             await glob.web3ClientFund.unstage(Number(unstageAmount.toString()), glob.web3Erc20.address, 0, {from: glob.user_a});
            //
            //             const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //             stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
            //             const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //             depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
            //         });
            //     });
            // });
        });

        describe('withdrawal()', () => {
            describe('of Ether', () => {
                it('should return withdrawal', async () => {
                    withdrawalEtherIndex.should.be.greaterThan(-1);
                    withdrawalEtherBlockNumber.should.be.greaterThan(-1);

                    const withdrawal = await glob.ethersIoClientFund.withdrawal(glob.user_a, withdrawalEtherIndex);

                    // withdrawal.amount.should.deep.equal(utils.parseEther(singleWithdrawalEther.toString()));
                    withdrawal.blockNumber._bn.should.eq.BN(withdrawalEtherBlockNumber);
                    withdrawal.currencyCt.should.equal(mocks.address0);
                    withdrawal.currencyId.should.deep.equal(utils.bigNumberify(0));
                });
            });

            describe('of ERC20 token', () => {
                it('should return withdrawal', async () => {
                    withdrawalERC20Index.should.be.greaterThan(-1);
                    withdrawalERC20BlockNumber.should.be.greaterThan(-1);

                    const withdrawal = await glob.ethersIoClientFund.withdrawal(glob.user_a, withdrawalERC20Index);

                    // withdrawal.amount.should.deep.equal(utils.bigNumberify(singleDepositERC20));
                    withdrawal.blockNumber._bn.should.eq.BN(withdrawalERC20BlockNumber);
                    withdrawal.currencyCt.should.equal(utils.getAddress(glob.web3Erc20.address));
                    withdrawal.currencyId.should.deep.equal(utils.bigNumberify(0));
                });
            });
        });

        describe('withdrawalOfCurrency()', () => {
            describe('of Ether', () => {
                it('should return currency withdrawal', async () => {
                    currencyWithdrawalEtherIndex.should.be.greaterThan(-1);
                    withdrawalEtherBlockNumber.should.be.greaterThan(-1);

                    const withdrawal = await glob.ethersIoClientFund.withdrawalOfCurrency(glob.user_a, mocks.address0, 0, currencyWithdrawalEtherIndex);

                    // withdrawal.amount.should.deep.equal(utils.parseEther(singleWithdrawalERC20.toString()));
                    withdrawal.blockNumber._bn.should.eq.BN(withdrawalEtherBlockNumber);
                });
            });

            describe('of ERC20 token', () => {
                it('should return currency withdrawal', async () => {
                    currencyWithdrawalERC20Index.should.be.greaterThan(-1);
                    withdrawalERC20BlockNumber.should.be.greaterThan(-1);

                    const withdrawal = await glob.ethersIoClientFund.withdrawalOfCurrency(glob.user_a, glob.web3Erc20.address, 0, currencyWithdrawalERC20Index);

                    // withdrawal.amount.should.deep.equal(utils.bigNumberify(singleWithdrawalERC20));
                    withdrawal.blockNumber._bn.should.eq.BN(withdrawalERC20BlockNumber);
                });
            });
        });
    });
};
