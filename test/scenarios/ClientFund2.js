const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');

const MockedClientFundService = artifacts.require('MockedClientFundService');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');

chai.use(chaiAsPromised);
chai.should();

module.exports = function (glob) {
    describe.only('ClientFund', function () {
        let web3MockedClientFundAuthorizedService, ethersMockedClientFundAuthorizedService;
        let web3MockedClientFundUnauthorizedService, ethersMockedClientFundUnauthorizedService;
        let web3MockedBeneficiary, ethersBeneficiary;
        let depositIndexEther = -1, depositIndexERC20 = -1;
        const singleDepositEther = 2.5, singleDepositERC20 = 10;

        before(async () => {
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
        });

        describe('depositCount()', () => {
            it('should return initial value', async () => {
                const address = Wallet.createRandom().address;
                const result = await glob.ethersIoClientFund.depositCount(address);
                result.should.deep.equal(utils.bigNumberify(0));
            });
        });

        describe('depositedBalance()', () => {
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

        describe('stagedBalance()', () => {
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

        describe('settledBalance()', () => {
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

        describe('fallback function', () => {
            let depositCountBefore, depositedBalanceBefore;

            before(async () => {
                depositCountBefore = await glob.ethersIoClientFund.depositCount(glob.user_a);
                depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
            });

            it('should add deposit and increment deposited balance', async () => {
                await web3.eth.sendTransactionPromise({
                    from: glob.user_a,
                    to: glob.web3ClientFund.address,
                    value: web3.toWei(singleDepositEther, 'ether'),
                    gas: glob.gasLimit
                });

                const depositCount = await glob.ethersIoClientFund.depositCount(glob.user_a);
                depositCount.should.deep.equal(depositCountBefore.add(1));
                depositIndexEther = depositCountBefore.toNumber();

                const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                depositedBalance.should.deep.equal(depositedBalanceBefore.add(utils.parseEther(singleDepositEther.toString())));
            });
        });

        describe('depositEthersTo()', () => {
            let depositCountBefore, depositedBalanceBefore;

            before(async () => {
                depositCountBefore = await glob.ethersIoClientFund.depositCount(glob.user_a);
                depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
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

                const depositCount = await glob.ethersIoClientFund.depositCount(glob.user_a);
                depositCount.should.deep.equal(depositCountBefore.add(1));
                depositIndexEther = depositCountBefore.toNumber();

                const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                depositedBalance.should.deep.equal(depositedBalanceBefore.add(utils.parseEther(singleDepositEther.toString())));
            });
        });

        describe.skip('depositTokens()', () => {
            let depositCountBefore;

            beforeEach(async () => {
                depositCountBefore = await glob.ethersIoClientFund.depositCount(glob.user_a);
            });

            describe('of ERC20 token', () => {
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
                    await glob.ethersIoClientFund.depositTokens(singleDepositERC20, glob.web3Erc20.address, 0, '');

                    const depositCount = await glob.ethersIoClientFund.depositCount(glob.user_a);
                    depositCount.should.deep.equal(utils.bigNumberify(depositCountBefore.add(1)));
                    depositIndexERC20 = depositCountBefore.toNumber();

                    const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3ClientFund.address, 0);
                    depositedBalance.should.deep.equal(depositedBalanceBefore.add(utils.parseEther(singleDepositERC20.toString())));
                });
            });
        });

        describe.skip('depositTokensTo()', () => {
            let depositCountBefore;

            beforeEach(async () => {
                depositCountBefore = await glob.ethersIoClientFund.depositCount(glob.user_a);
            });

            describe('of ERC20 token', () => {
                beforeEach(async () => {
                    await glob.web3Erc20.approve(glob.web3ClientFund.address, 0, {from: glob.user_a});
                    await glob.web3Erc20.approve(glob.web3ClientFund.address, singleDepositERC20, {from: glob.user_a});
                });

                it('should add deposit and increment deposited balance', async () => {
                    await glob.web3ClientFund.depositTokensTo(glob.user_a, singleDepositERC20, glob.web3Erc20.address, 0, '');

                    const depositCount = await glob.ethersIoClientFund.depositCount(glob.user_a);
                    depositCount.should.deep.equal(utils.bigNumberify(depositCountBefore.add(1)));
                    depositIndexERC20 = depositCountBefore.toNumber();

                    const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3ClientFund.address, 0);
                    depositedBalance.should.deep.equal(depositedBalanceBefore.add(utils.parseEther(singleDepositERC20.toString())));
                });
            });
        });

        describe('deposit()', () => {
            describe('of Ether', () => {
                it('should return deposit', async () => {
                    depositIndexEther.should.be.greaterThan(-1);

                    const deposit = await glob.ethersIoClientFund.deposit(glob.user_a, depositIndexEther);
                    deposit.amount.should.deep.equal(utils.parseEther(singleDepositEther.toString()));
                    // TODO Compare to block number when deposit[1].timestamp has been replaced
                    deposit.currencyCt.should.equal(mocks.address0);
                    deposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                });
            });

            describe.skip('of ERC20 token', () => {
                it('should return deposit', async () => {
                    depositIndexERC20.should.be.greaterThan(-1);

                    const deposit = await glob.ethersIoClientFund.deposit(glob.user_a, depositIndexERC20);
                    deposit.amount.should.deep.equal(utils.bigNumberify(singleDepositERC20));
                    // TODO Compare to block number when deposit[1].timestamp has been replaced
                    deposit.currencyCt.should.equal(glob.web3Erc20.address);
                    deposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                });
            });
        });

        describe('updateSettledBalance()', () => {
            describe('by wallet', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.updateSettledBalance(Wallet.createRandom().address, 1, Wallet.createRandom().address, 0)
                        .should.be.rejected;
                });
            });

            describe('by registered service contract', () => {
                describe('of Ether', () => {
                    let depositedBalance, offChainBalance;

                    before(async () => {
                        depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        offChainBalance = utils.parseEther('1');
                    });

                    it('should successfully update settled balance of Ether', async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalanceInClientFund(glob.user_a, offChainBalance, mocks.address0, 0);
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);

                        settledBalance.toString().should.equal(offChainBalance.sub(depositedBalance).toString());
                    });
                });

                describe.skip('of ERC20 token', () => {
                    let depositedBalance, offChainBalance;

                    before(async () => {
                        depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        offChainBalance = utils.bigNumberify(5)
                    });

                    it('should successfully update settled balance of ERC20 token', async () => {
                        await ethersMockedClientFundAuthorizedService.updateSettledBalanceInClientFund(glob.user_a, offChainBalance, glob.web3Erc20.address, 0);
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(offChainBalance.sub(depositedBalance).toString());
                    });
                });
            });
        });

        describe('stage()', () => {
            describe('by wallet', () => {
                it('should revert', async () => {
                    glob.ethersIoClientFund.stage(Wallet.createRandom().address, 1, Wallet.createRandom().address, 0)
                        .should.be.rejected;
                });
            });

            describe('by registered service contract', () => {
                describe('of Ether', () => {
                    let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                        depositedBalanceAfter, settledBalanceAfter, stagedBalanceAfter;

                    beforeEach(async () => {
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
                            await ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, stageAmount, mocks.address0, 0);

                            const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                            utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                            const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                            utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                            const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                            utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));
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
                            await ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, stageAmount, mocks.address0, 0);

                            const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                            utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                            const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                            utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                            const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                            utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));
                        });
                    });
                });

                describe.skip('of ERC20 token', () => {
                    let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                        depositedBalanceAfter, settledBalanceAfter, stagedBalanceAfter;

                    beforeEach(async () => {
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
                            await ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, stageAmount, glob.web3Erc20.address, 0);

                            const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                            utils.formatUnits(stagedBalance).should.equal(utils.formatUnits(stagedBalanceAfter));
                            const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                            utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
                            const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                            utils.formatUnits(settledBalance).should.equal(utils.formatUnits(settledBalanceAfter));
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
                            await ethersMockedClientFundAuthorizedService.stageInClientFund(glob.user_a, stageAmount, glob.web3Erc20.address, 0);

                            const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                            utils.formatUnits(stagedBalance).should.equal(utils.formatUnits(stagedBalanceAfter));
                            const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                            utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
                            const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                            utils.formatUnits(settledBalance).should.equal(utils.formatUnits(settledBalanceAfter));
                        });
                    });
                });
            });
        });

        // TODO Unskip
        describe.skip('unstage()', () => {
            describe('of Ether', () => {
                let depositedBalanceBefore, stagedBalanceBefore, unstageAmount,
                    depositedBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
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
                    });
                });
            });

            describe.skip('of ERC20 token', () => {
                let depositedBalanceBefore, stagedBalanceBefore, unstageAmount,
                    depositedBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        unstageAmount = stagedBalanceBefore.div(2);
                        depositedBalanceAfter = depositedBalanceBefore.add(unstageAmount);
                        stagedBalanceAfter = stagedBalanceBefore.sub(unstageAmount);
                    });

                    it('should successfully unstage the provided amount of ERC20 token', async () => {
                        await glob.web3ClientFund.unstage(Number(utils.formatUnits(unstageAmount)), glob.web3Erc20.address, 0, {from: glob.user_a});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(stagedBalance).should.equal(utils.formatUnits(stagedBalanceAfter));
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
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
                        await glob.web3ClientFund.unstage(Number(utils.formatUnits(unstageAmount)), glob.web3Erc20.address, 0, {from: glob.user_a});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(stagedBalance).should.equal(utils.formatUnits(stagedBalanceAfter));
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
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
                        stagedBalanceAfter = stagedBalanceBefore.add(stagedAmount);
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
                        await glob.web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toBN(stageAmount.toString()), glob.web3Erc20.address, 0,
                            {
                                from: glob.user_a
                            }
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(settledBalance).should.equal(utils.formatUnits(settledBalanceAfter));

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        utils.formatUnits(beneficiaryDeposit.amount).should.equal(utils.formatUnits(stageAmount));
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
                        await glob.web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toBN(stageAmount.toString()), glob.web3Erc20.address, 0,
                            {
                                from: glob.user_a
                            }
                        );

                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(settledBalance).should.equal(utils.formatUnits(settledBalanceAfter));

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        utils.formatUnits(beneficiaryDeposit.amount).should.equal(utils.formatUnits(stagedAmount));
                        beneficiaryDeposit.currencyCt.should.equal(glob.web3Erc20.address);
                        beneficiaryDeposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                        beneficiaryDeposit.standard.should.equal('ether');
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
                        utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(settledBalance).should.equal(utils.formatUnits(settledBalanceAfter));

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        utils.formatUnits(beneficiaryDeposit.amount).should.equal(utils.formatUnits(stageAmount));
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
                        utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
                        const settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(settledBalance).should.equal(utils.formatUnits(settledBalanceAfter));

                        const beneficiaryDeposit = await ethersBeneficiary.getDeposit(0);
                        beneficiaryDeposit.wallet.should.equal(utils.getAddress(glob.user_a));
                        utils.formatUnits(beneficiaryDeposit.amount).should.equal(utils.formatUnits(stagedAmount));
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
            // let userABalanceOfErc20Before, userBBalanceOfErc20Before;
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

                // depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20, 0);
                // settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20, 0);
                // stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20, 0);
                // userABalanceOfErc20Before = depositedBalance.add(settledBalance).add(stagedBalance);
                //
                // depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_b, glob.web3Erc20, 0);
                // settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_b, glob.web3Erc20, 0);
                // stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_b, glob.web3Erc20, 0);
                // userBBalanceOfErc20Before = depositedBalance.add(settledBalance).add(stagedBalance);
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

                // depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20, 0);
                // settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_a, glob.web3Erc20, 0);
                // stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20, 0);
                // const userABalanceOfErc20After = depositedBalance.add(settledBalance).add(stagedBalance);
                // utils.formatUnits(userABalanceOfErc20After).should.equal(utils.formatUnits('0'));
                //
                // depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_b, glob.web3Erc20, 0);
                // settledBalance = await glob.ethersIoClientFund.settledBalance(glob.user_b, glob.web3Erc20, 0);
                // stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_b, glob.web3Erc20, 0);
                // const userBBalanceOfErc20After = depositedBalance.add(settledBalance).add(stagedBalance);
                // utils.formatUnits(userBBalanceOfErc20After).should.equal(
                //     utils.formatUnits(userBBalanceOfErc20Before.add(userABalanceOfErc20Before))
                // );
            });
        });

        describe('withdraw()', () => {
            describe('of Ether', () => {
                let stagedBalanceBefore, stagedBalanceAfter, withdrawalAmount, accountBalanceBefore, accountBalanceAfter;

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

                    it('should successfully withdraw the provided amount of Ether', async () => {
                        await glob.web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), mocks.address0, 0, '', {from: glob.user_a});

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

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        // const accountBalance = await web3.eth.getBalance(glob.user_a);
                        // utils.formatEther(utils.bigNumberify(accountBalance.toString())).should.equal(utils.formatEther(accountBalanceAfter))
                    });
                });
            });

            describe.skip('of ERC20 token', () => {
                let depositedBalanceBefore, stagedBalanceBefore, unstageAmount,
                    depositedBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    depositedBalanceBefore = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        unstageAmount = stagedBalanceBefore.div(2);
                        depositedBalanceAfter = depositedBalanceBefore.add(unstageAmount);
                        stagedBalanceAfter = stagedBalanceBefore.sub(unstageAmount);
                    });

                    it('should successfully unstage the provided amount of ERC20 token', async () => {
                        await glob.web3ClientFund.unstage(Number(utils.formatUnits(unstageAmount)), glob.web3Erc20.address, 0, {from: glob.user_a});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(stagedBalance).should.equal(utils.formatUnits(stagedBalanceAfter));
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
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
                        await glob.web3ClientFund.unstage(Number(utils.formatUnits(unstageAmount)), glob.web3Erc20.address, 0, {from: glob.user_a});

                        const stagedBalance = await glob.ethersIoClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(stagedBalance).should.equal(utils.formatUnits(stagedBalanceAfter));
                        const depositedBalance = await glob.ethersIoClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        utils.formatUnits(depositedBalance).should.equal(utils.formatUnits(depositedBalanceAfter));
                    });
                });
            });
        });
    });
};
