const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const ClientFund = artifacts.require('ClientFund');
const MockedClientFundService = artifacts.require('MockedClientFundService');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');

chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = function (glob) {
    describe.only('ClientFund', function () {
        let web3ClientFund, ethersClientFund;
        let web3MockedClientFundAuthorizedService, ethersMockedClientFundAuthorizedService;
        let web3MockedClientFundUnauthorizedService, ethersMockedClientFundUnauthorizedService;
        let web3MockedBeneficiary, ethersBeneficiary;
        let depositIndexEther = -1, depositIndexERC20 = -1;
        const singleDepositEther = 5, singleDepositERC20 = 10;

        before(async () => {
        });

        beforeEach(async () => {
            web3ClientFund = await ClientFund.new(glob.owner);
            ethersClientFund = new Contract(web3ClientFund.address, ClientFund.abi, glob.signer_owner);

            // web3MockedClientFundAuthorizedService = await MockedClientFundService.new(glob.owner);
            // ethersMockedClientFundAuthorizedService = new Contract(web3MockedClientFundAuthorizedService.address, MockedClientFundService.abi, glob.signer_owner);
            // web3MockedClientFundUnauthorizedService = await MockedClientFundService.new(glob.owner);
            // ethersMockedClientFundUnauthorizedService = new Contract(web3MockedClientFundUnauthorizedService.address, MockedClientFundService.abi, glob.signer_owner);
            // web3MockedBeneficiary = await MockedBeneficiary.new(glob.owner);
            // ethersBeneficiary = new Contract(web3MockedBeneficiary.address, MockedBeneficiary.abi, glob.signer_owner);
            //
            // // Fully wire the mocked authorized service
            // await web3ClientFund.registerService(web3MockedClientFundAuthorizedService.address);
            // await web3ClientFund.authorizeRegisteredService(web3MockedClientFundAuthorizedService.address);
            // await web3MockedClientFundAuthorizedService.changeClientFund(web3ClientFund.address);
            //
            // // Partially wire the mocked unauthorized service
            // await web3MockedClientFundUnauthorizedService.changeClientFund(web3ClientFund.address);
            //
            // await web3ClientFund.registerBeneficiary(web3MockedBeneficiary.address);
        });

        describe.only('constructor()', () => {
            it('should initialize fields', async () => {
                (await web3ClientFund.deployer.call()).should.equal(glob.owner);
                (await web3ClientFund.operator.call()).should.equal(glob.owner);
            });
        });

        describe.only('depositCount()', () => {
            it('should return initial value', async () => {
                console.log(await ethersClientFund.depositCount(Wallet.createRandom().address));
                (await ethersClientFund.depositCount(Wallet.createRandom().address))
                    .should.eq.BN(0);
            });
        });

        describe.only('depositedBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersClientFund.depositedBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.depositedBalance(Wallet.createRandom().address, mocks.address0, 0))
                        .should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.depositedBalance(Wallet.createRandom().address, glob.web3Erc20.address, 0))
                        .should.eq.BN(0);
                });
            });
        });

        describe('settledBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersClientFund.settledBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.settledBalance(Wallet.createRandom().address, mocks.address0, 0))
                        .should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.settledBalance(Wallet.createRandom().address, glob.web3Erc20.address, 0))
                        .should.eq.BN(0);
                });
            });
        });

        describe('stagedBalance()', () => {
            describe('called with null wallet address', () => {
                it('should revert', async () => {
                    ethersClientFund.stagedBalance(mocks.address0, mocks.address0, 0).should.be.rejected;
                });
            });

            describe('of Ether', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.stagedBalance(Wallet.createRandom().address, mocks.address0, 0))
                        .should.eq.BN(0);
                });
            });

            describe('of ERC20 token', () => {
                it('should return initial value', async () => {
                    (await ethersClientFund.stagedBalance(Wallet.createRandom().address, glob.web3Erc20.address, 0))
                        .should.eq.BN(0);
                });
            });
        });

        describe('fallback function', () => {
            let depositCountBefore, depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore;

            before(async () => {
                depositCountBefore = await ethersClientFund.depositCount(glob.user_a);
                depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
            });

            it('should add deposit and increment deposited balance', async () => {
                await web3.eth.sendTransactionPromise({
                    from: glob.user_a,
                    to: web3ClientFund.address,
                    value: web3.toWei(singleDepositEther, 'ether'),
                    gas: glob.gasLimit
                });

                const depositCount = await ethersClientFund.depositCount(glob.user_a);
                depositCount.should.deep.equal(depositCountBefore.add(1));
                depositIndexEther = depositCountBefore.toNumber();

                const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                depositedBalance.should.deep.equal(depositedBalanceBefore.add(utils.parseEther(singleDepositEther.toString())));
                const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                settledBalance.should.deep.equal(settledBalanceBefore);
                const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                stagedBalance.should.deep.equal(stagedBalanceBefore);
            });
        });

        describe('depositEthersTo()', () => {
            let depositCountBefore, depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore;

            before(async () => {
                depositCountBefore = await ethersClientFund.depositCount(glob.user_a);
                depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
            });

            it('should add deposit and increment deposited balance', async () => {
                await web3ClientFund.depositEthersTo(
                    glob.user_a,
                    {
                        from: glob.user_a,
                        value: web3.toWei(singleDepositEther, 'ether'),
                        gas: glob.gasLimit
                    }
                );

                const depositCount = await ethersClientFund.depositCount(glob.user_a);
                depositCount.should.deep.equal(depositCountBefore.add(1));
                depositIndexEther = depositCountBefore.toNumber();

                const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                depositedBalance.should.deep.equal(depositedBalanceBefore.add(utils.parseEther(singleDepositEther.toString())));
                const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                settledBalance.should.deep.equal(settledBalanceBefore);
                const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                stagedBalance.should.deep.equal(stagedBalanceBefore);
            });
        });

        describe('depositTokens()', () => {
            let depositCountBefore, depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore;

            beforeEach(async () => {
                depositCountBefore = await ethersClientFund.depositCount(glob.user_a);
                depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
            });

            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokens(0, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with zero ERC20 contract address', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokens(singleDepositEther, 0, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokens(singleDepositERC20, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await glob.web3Erc20.approve(web3ClientFund.address, 0, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                        await glob.web3Erc20.approve(web3ClientFund.address, 9999, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                    });

                    it('should revert', async () => {
                        web3ClientFund.depositTokens(9999, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with prior approval and supported amount', () => {
                    beforeEach(async () => {
                        await glob.web3Erc20.approve(web3ClientFund.address, 0, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                        await glob.web3Erc20.approve(web3ClientFund.address, singleDepositERC20, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                    });

                    it('should add deposit and increment deposited balance of ', async () => {
                        await web3ClientFund.depositTokens(singleDepositERC20, glob.web3Erc20.address, 0, '', {from: glob.user_a});

                        const depositCount = await ethersClientFund.depositCount(glob.user_a);
                        depositCount.should.deep.equal(utils.bigNumberify(depositCountBefore.add(1)));
                        depositIndexERC20 = depositCountBefore.toNumber();

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.should.deep.equal(depositedBalanceBefore.add(singleDepositERC20));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.should.deep.equal(settledBalanceBefore);
                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.should.deep.equal(stagedBalanceBefore);
                    });
                });
            });
        });

        describe('depositTokensTo()', () => {
            let depositCountBefore, depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore;

            beforeEach(async () => {
                depositCountBefore = await ethersClientFund.depositCount(glob.user_a);
                depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
            });

            describe('of ERC20 token', () => {
                describe('if called with zero amount', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokensTo(glob.user_a, 0, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with zero ERC20 contract address', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokensTo(glob.user_a, singleDepositERC20, 0, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called without prior approval', () => {
                    it('should revert', async () => {
                        web3ClientFund.depositTokensTo(glob.user_a, singleDepositERC20, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with excessive amount', () => {
                    beforeEach(async () => {
                        await glob.web3Erc20.approve(web3ClientFund.address, 0, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                        await glob.web3Erc20.approve(web3ClientFund.address, 9999, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                    });

                    it('should revert', async () => {
                        web3ClientFund.depositTokensTo(glob.user_a, 9999, glob.web3Erc20.address, 0, '', {from: glob.user_a})
                            .should.be.rejected;
                    });
                });

                describe('if called with prior approval and supported amount', () => {
                    beforeEach(async () => {
                        await glob.web3Erc20.approve(web3ClientFund.address, 0, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                        await glob.web3Erc20.approve(web3ClientFund.address, singleDepositERC20, {
                            from: glob.user_a,
                            gas: glob.gasLimit
                        });
                    });

                    it('should add deposit and increment deposited balance', async () => {
                        await web3ClientFund.depositTokensTo(glob.user_a, singleDepositERC20, glob.web3Erc20.address, 0, '', {from: glob.user_a});

                        const depositCount = await ethersClientFund.depositCount(glob.user_a);
                        depositCount.should.deep.equal(utils.bigNumberify(depositCountBefore.add(1)));
                        depositIndexERC20 = depositCountBefore.toNumber();

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.should.deep.equal(depositedBalanceBefore.add(singleDepositERC20));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.should.deep.equal(settledBalanceBefore);
                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.should.deep.equal(stagedBalanceBefore);
                    });
                });
            });
        });

        describe('deposit()', () => {
            describe('of Ether', () => {
                it('should return deposit', async () => {
                    depositIndexEther.should.be.greaterThan(-1);

                    const deposit = await ethersClientFund.deposit(glob.user_a, depositIndexEther);
                    deposit.amount.should.deep.equal(utils.parseEther(singleDepositEther.toString()));
                    // TODO Compare to block number when deposit[1].timestamp has been replaced
                    deposit.currencyCt.should.equal(mocks.address0);
                    deposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                });
            });

            describe('of ERC20 token', () => {
                it('should return deposit', async () => {
                    depositIndexERC20.should.be.greaterThan(-1);

                    const deposit = await ethersClientFund.deposit(glob.user_a, depositIndexERC20);
                    deposit.amount.should.deep.equal(utils.bigNumberify(singleDepositERC20));
                    // TODO Compare to block number when deposit[1].timestamp has been replaced
                    deposit.currencyCt.should.equal(utils.getAddress(glob.web3Erc20.address));
                    deposit.currencyId.should.deep.equal(utils.bigNumberify(0));
                });
            });
        });

        describe('updateSettledBalance()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    ethersClientFund.updateSettledBalance(Wallet.createRandom().address, 1, Wallet.createRandom().address, 0)
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
                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    // if (depositedBalanceBefore.lt(requiredDepositedBalanceBefore)) {
                    //     await ethersClientFundUserA.depositEthersTo(glob.user_a, {
                    //         value: requiredDepositedBalanceBefore.sub(depositedBalanceBefore),
                    //         gasLimit: 1e6
                    //     });
                    //     depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    // }

                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                    updateAmount = utils.parseEther('1');

                    // TODO Remove
                    console.log([depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore].map((b) => b.toString()));
                });

                it('should successfully update settled balance of Ether', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalanceInClientFund(glob.user_a, updateAmount, mocks.address0, 0);

                    const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    utils.formatEther(settledBalance).should.equal(utils.formatEther(updateAmount.sub(depositedBalanceBefore)));
                    const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceBefore));
                    const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                    utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceBefore));

                    // TODO Remove
                    console.log([depositedBalance, settledBalance, stagedBalance].map((b) => b.toString()));
                });
            });

            describe('of ERC20 token', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, updateAmount;

                before(async () => {
                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    updateAmount = utils.bigNumberify(5);
                });

                it('should successfully update settled balance of ERC20 token', async () => {
                    await ethersMockedClientFundAuthorizedService.updateSettledBalanceInClientFund(glob.user_a, updateAmount, glob.web3Erc20.address, 0);

                    const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalance.toString().should.equal(updateAmount.sub(depositedBalanceBefore).toString());
                    const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    depositedBalance.toString().should.equal(depositedBalanceBefore.toString());
                    const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalance.toString().should.equal(stagedBalanceBefore.toString());
                });
            });
        });

        // TODO Unskip and assure sufficient deposits in client fund
        describe('stage()', () => {
            describe('by sender other than registered active service', () => {
                it('should revert', async () => {
                    ethersClientFund.stage(Wallet.createRandom().address, 1, Wallet.createRandom().address, 0)
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
                    depositedBalanceAfter, settledBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);

                    // TODO Remove
                    console.log([depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore].map((b) => b.toString()));
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

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));

                        // TODO Remove
                        console.log([depositedBalance, settledBalance, stagedBalance].map((b) => b.toString()));
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

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceAfter));
                    });
                });
            });

            describe('of ERC20 token', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, stageAmount,
                    depositedBalanceAfter, settledBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
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

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceAfter.toString());
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

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                        settledBalance.toString().should.equal(settledBalanceAfter.toString());
                    });
                });
            });
        });

        // TODO Unskip and assure sufficient deposits in client fund
        describe.skip('unstage()', () => {
            describe('called by owner', () => {
                it('should revert', async () => {
                    web3ClientFund.unstage(web3.toWei(1), mocks.address0, 0, {from: glob.owner})
                        .should.be.rejected;
                });
            });

            describe('of Ether', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, unstageAmount,
                    depositedBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        unstageAmount = stagedBalanceBefore.div(2);
                        depositedBalanceAfter = depositedBalanceBefore.add(unstageAmount);
                        stagedBalanceAfter = stagedBalanceBefore.sub(unstageAmount);
                    });

                    it('should successfully unstage the provided amount of Ether', async () => {
                        await web3ClientFund.unstage(web3.toWei(utils.formatEther(unstageAmount)), mocks.address0, 0, {from: glob.user_a});

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
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
                        await web3ClientFund.unstage(web3.toWei(utils.formatEther(unstageAmount), 'ether'), mocks.address0, 0, {from: glob.user_a});

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(stagedBalance).should.equal(utils.formatEther(stagedBalanceAfter));
                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(settledBalance).should.equal(utils.formatEther(settledBalanceBefore));
                    });
                });
            });

            describe('of ERC20 token', () => {
                let depositedBalanceBefore, settledBalanceBefore, stagedBalanceBefore, unstageAmount,
                    depositedBalanceAfter, stagedBalanceAfter;

                beforeEach(async () => {
                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                });

                describe('of amount less than or equal to deposited + settled balances', () => {
                    beforeEach(async () => {
                        unstageAmount = stagedBalanceBefore.div(2);
                        depositedBalanceAfter = depositedBalanceBefore.add(unstageAmount);
                        stagedBalanceAfter = stagedBalanceBefore.sub(unstageAmount);
                    });

                    it('should successfully unstage the provided amount of ERC20 token', async () => {
                        await web3ClientFund.unstage(web3.toBigNumber(unstageAmount.toString()), glob.web3Erc20.address, 0, {from: glob.user_a});

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
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
                        await web3ClientFund.unstage(web3.toBigNumber(unstageAmount.toString()), glob.web3Erc20.address, 0, {from: glob.user_a});

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
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
                    web3ClientFund.stageToBeneficiary(
                        web3MockedBeneficiary.address, web3.toWei(-1, 'ether'), mocks.address0, 0,
                        {
                            from: glob.user_a
                        }
                    ).should.be.rejected;
                });
            });

            describe('to unregistered beneficiary', () => {
                it('should revert', async () => {
                    web3ClientFund.stageToBeneficiary(
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

                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
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
                        await web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toWei(utils.formatEther(stageAmount), 'ether'), mocks.address0, 0,
                            {
                                from: glob.user_a
                            }
                        );

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
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
                        await web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toWei(utils.formatEther(stageAmount), 'ether'), mocks.address0, 0,
                            {
                                from: glob.user_a
                            }
                        );

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
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

                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
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
                        await web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toBigNumber(stageAmount.toString()), glob.web3Erc20.address, 0,
                            {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
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
                        await web3ClientFund.stageToBeneficiary(
                            web3MockedBeneficiary.address, web3.toBigNumber(stageAmount.toString()), glob.web3Erc20.address, 0,
                            {
                                from: glob.user_a,
                                gas: 1e6
                            }
                        );

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
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

                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
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

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
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

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                        utils.formatEther(depositedBalance).should.equal(utils.formatEther(depositedBalanceAfter));
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
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

                    depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                    settledBalanceBefore = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
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

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
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

                        const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                        depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
                        const settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
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
                depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                userABalanceOfEtherBefore = depositedBalance.add(settledBalance).add(stagedBalance);

                depositedBalance = await ethersClientFund.depositedBalance(glob.user_b, mocks.address0, 0);
                settledBalance = await ethersClientFund.settledBalance(glob.user_b, mocks.address0, 0);
                stagedBalance = await ethersClientFund.stagedBalance(glob.user_b, mocks.address0, 0);
                userBBalanceOfEtherBefore = depositedBalance.add(settledBalance).add(stagedBalance);

                depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                userABalanceOfErc20Before = depositedBalance.add(settledBalance).add(stagedBalance);

                depositedBalance = await ethersClientFund.depositedBalance(glob.user_b, glob.web3Erc20.address, 0);
                settledBalance = await ethersClientFund.settledBalance(glob.user_b, glob.web3Erc20.address, 0);
                stagedBalance = await ethersClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address, 0);
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

                depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, mocks.address0, 0);
                settledBalance = await ethersClientFund.settledBalance(glob.user_a, mocks.address0, 0);
                stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
                const userABalanceOfEtherAfter = depositedBalance.add(settledBalance).add(stagedBalance);
                utils.formatEther(userABalanceOfEtherAfter).should.equal(utils.formatEther('0'));

                depositedBalance = await ethersClientFund.depositedBalance(glob.user_b, mocks.address0, 0);
                settledBalance = await ethersClientFund.settledBalance(glob.user_b, mocks.address0, 0);
                stagedBalance = await ethersClientFund.stagedBalance(glob.user_b, mocks.address0, 0);
                const userBBalanceOfEtherAfter = depositedBalance.add(settledBalance).add(stagedBalance);
                utils.formatEther(userBBalanceOfEtherAfter).should.equal(
                    utils.formatEther(userBBalanceOfEtherBefore.add(userABalanceOfEtherBefore))
                );

                depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
                settledBalance = await ethersClientFund.settledBalance(glob.user_a, glob.web3Erc20.address, 0);
                stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                const userABalanceOfErc20After = depositedBalance.add(settledBalance).add(stagedBalance);
                userABalanceOfErc20After.toString().should.equal('0');

                depositedBalance = await ethersClientFund.depositedBalance(glob.user_b, glob.web3Erc20.address, 0);
                settledBalance = await ethersClientFund.settledBalance(glob.user_b, glob.web3Erc20.address, 0);
                stagedBalance = await ethersClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address, 0);
                const userBBalanceOfErc20After = depositedBalance.add(settledBalance).add(stagedBalance);
                userBBalanceOfErc20After.toString().should.equal(
                    userBBalanceOfErc20Before.add(userABalanceOfErc20Before).toString()
                );
            });
        });

        // TODO Unskip
        describe('withdraw()', () => {
            describe('of Ether', () => {
                let stagedBalanceBefore, stagedBalanceAfter, withdrawalAmount, accountBalanceBefore,
                    accountBalanceAfter;

                beforeEach(async () => {
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);

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
                        await web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), mocks.address0, 0, '', {from: glob.user_a});

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
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
                        await web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), mocks.address0, 0, '', {from: glob.user_a});

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, mocks.address0, 0);
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
                    stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);

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
                        await web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), glob.web3Erc20.address, 0, '', {from: glob.user_a});

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
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
                        await web3ClientFund.withdraw(web3.toWei(utils.formatEther(withdrawalAmount)), glob.web3Erc20.address, 0, '', {from: glob.user_a});

                        const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
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
            //         depositedBalanceBefore = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //         stagedBalanceBefore = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
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
            //             await web3ClientFund.unstage(Number(unstageAmount.toString()), glob.web3Erc20.address, 0, {from: glob.user_a});
            //
            //             const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //             stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
            //             const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
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
            //             await web3ClientFund.unstage(Number(unstageAmount.toString()), glob.web3Erc20.address, 0, {from: glob.user_a});
            //
            //             const stagedBalance = await ethersClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //             stagedBalance.toString().should.equal(stagedBalanceAfter.toString());
            //             const depositedBalance = await ethersClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address, 0);
            //             depositedBalance.toString().should.equal(depositedBalanceAfter.toString());
            //         });
            //     });
            // });
        });
    });
};
