const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementChallenge = artifacts.require('DriipSettlementChallenge');
const MockedDriipSettlementDispute = artifacts.require('MockedDriipSettlementDispute');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('DriipSettlementChallenge', () => {
        let web3DriipSettlementChallenge, ethersDriipSettlementChallenge;
        let web3DriipSettlementDispute, ethersDriipSettlementDispute;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3DriipSettlementDispute = await MockedDriipSettlementDispute.new();
            ethersDriipSettlementDispute = new Contract(web3DriipSettlementDispute.address, MockedDriipSettlementDispute.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
            ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);

            await ethersDriipSettlementChallenge.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementChallenge.setValidator(ethersValidator.address);
            await ethersDriipSettlementChallenge.setDriipSettlementDispute(ethersDriipSettlementDispute.address);

            await ethersConfiguration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 1e4);
            await ethersConfiguration.setWalletLockTimeout((await provider.getBlockNumber()) + 1, 60 * 60 * 24 * 30);
            await ethersConfiguration.setEarliestSettlementBlockNumber(0);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementChallenge.deployer.call()).should.equal(glob.owner);
                (await web3DriipSettlementChallenge.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.configuration())
                    .should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallenge.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementChallenge.configuration())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.validator())
                    .should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallenge.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementChallenge.validator())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementDispute()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.driipSettlementDispute())
                    .should.equal(utils.getAddress(ethersDriipSettlementDispute.address));
            });
        });

        describe('setDriipSettlementDispute()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallenge.setDriipSettlementDispute(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementDisputeEvent');

                    (await ethersDriipSettlementChallenge.driipSettlementDispute())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setDriipSettlementDispute(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('proposalIndexByWalletCurrency()', () => {
            it('should return default values', async () => {
                (await ethersDriipSettlementChallenge.proposalIndexByWalletCurrency(
                    Wallet.createRandom().address, mocks.address0, 0
                ))._bn.should.eq.BN(0);
            });
        });

        describe('disqualificationIndexByWalletCurrency()', () => {
            it('should return default values', async () => {
                (await ethersDriipSettlementChallenge.disqualificationIndexByWalletCurrency(
                    Wallet.createRandom().address, mocks.address0, 0
                ))._bn.should.eq.BN(0);
            });
        });

        describe('challengeWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.challengeWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('lockedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.lockedWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('proposalsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.proposalsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('disqualificationsCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.disqualificationsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('challengeTradeHashesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.challengeTradeHashesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('challengePaymentHashesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.challengePaymentHashesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('walletChallengeTradeHashIndicesCount()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                (await ethersDriipSettlementChallenge.walletChallengeTradeHashIndicesCount(address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('walletChallengePaymentHashIndicesCount()', () => {
            it('should equal value initialized', async () => {
                const address = Wallet.createRandom().address;
                (await ethersDriipSettlementChallenge.walletChallengePaymentHashIndicesCount(address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('startChallengeFromTrade()', () => {
            let trade;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});

                trade = await mocks.mockTrade(glob.owner, {buyer: {wallet: glob.owner}});
            });

            describe('if wallet has previous disqualified driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    await web3DriipSettlementChallenge.lockWallet(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement challenge block', () => {
                beforeEach(async () => {
                    web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called from sender that is not trade party', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with negative intended stage amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current.mul(-1), trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with negative conjugate stage amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current.mul(-1)
                    ).should.be.rejected;
                });
            });

            describe('if called with intended stage amount that exceeds intended balance amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current.mul(2), trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with conjugate stage amount that exceeds conjugate balance amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current.mul(2)
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach( async () => {
                    topic = ethersDriipSettlementChallenge.interface.events['StartChallengeFromTradeEvent'].topics[0];
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: [topic]
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );

                    // Index is 1-based
                    const intendedIndex = await ethersDriipSettlementChallenge.proposalIndexByWalletCurrency(
                        trade.buyer.wallet, trade.currencies.intended.ct, trade.currencies.intended.id
                    );
                    intendedIndex._bn.should.eq.BN(1);

                    // Index is 1-based
                    const conjugateIndex = await ethersDriipSettlementChallenge.proposalIndexByWalletCurrency(
                        trade.buyer.wallet, trade.currencies.conjugate.ct, trade.currencies.conjugate.id
                    );
                    conjugateIndex._bn.should.eq.BN(2);

                    const intendedProposal = await ethersDriipSettlementChallenge.proposals(intendedIndex.sub(1));
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.nonce._bn.should.eq.BN(trade.nonce._bn);
                    intendedProposal.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    intendedProposal.stageAmount._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.targetBalanceAmount._bn.should.eq.BN(0);
                    intendedProposal.driipType.should.equal(mocks.driipTypes.indexOf('Trade'));
                    intendedProposal.balanceReward.should.be.true;

                    const conjugateProposal = await ethersDriipSettlementChallenge.proposals(conjugateIndex.sub(1));
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.nonce._bn.should.eq.BN(trade.nonce._bn);
                    conjugateProposal.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    conjugateProposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    conjugateProposal.stageAmount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.targetBalanceAmount._bn.should.eq.BN(0);
                    conjugateProposal.driipType.should.equal(mocks.driipTypes.indexOf('Trade'));
                    conjugateProposal.balanceReward.should.be.true;

                    (await ethersDriipSettlementChallenge.challengeWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge.challengeTradeHashesCount())
                        ._bn.should.eq.BN(1);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called before an ongoing settlement challenge has expired', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });
        });

        describe('startChallengeFromTradeByProxy()', () => {
            let trade;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});

                trade = await mocks.mockTrade(glob.owner, {buyer: {wallet: glob.owner}});
            });

            describe('if called by non-operator', () => {
                beforeEach(async () => {
                    ethersDriipSettlementChallenge = ethersDriipSettlementChallenge.connect(glob.signer_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement challenge block', () => {
                beforeEach(async () => {
                    web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with wallet is not trade party', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        Wallet.createRandom().address, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with negative intended stage amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current.mul(-1), trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with negative conjugate stage amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current.mul(-1)
                    ).should.be.rejected;
                });
            });

            describe('if called with intended stage amount that exceeds intended balance amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current.mul(2), trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if called with conjugate stage amount that exceeds conjugate balance amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current.mul(2)
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach( async () => {
                    topic = ethersDriipSettlementChallenge.interface.events['StartChallengeFromTradeByProxyEvent'].topics[0];
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: [topic]
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );

                    // Index is 1-based
                    const intendedIndex = await ethersDriipSettlementChallenge.proposalIndexByWalletCurrency(
                        trade.buyer.wallet, trade.currencies.intended.ct, trade.currencies.intended.id
                    );
                    intendedIndex._bn.should.eq.BN(1);

                    // Index is 1-based
                    const conjugateIndex = await ethersDriipSettlementChallenge.proposalIndexByWalletCurrency(
                        trade.buyer.wallet, trade.currencies.conjugate.ct, trade.currencies.conjugate.id
                    );
                    conjugateIndex._bn.should.eq.BN(2);

                    const intendedProposal = await ethersDriipSettlementChallenge.proposals(intendedIndex.sub(1));
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.nonce._bn.should.eq.BN(trade.nonce._bn);
                    intendedProposal.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    intendedProposal.stageAmount._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.targetBalanceAmount._bn.should.eq.BN(0);
                    intendedProposal.driipType.should.equal(mocks.driipTypes.indexOf('Trade'));
                    intendedProposal.balanceReward.should.be.false;

                    const conjugateProposal = await ethersDriipSettlementChallenge.proposals(conjugateIndex.sub(1));
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.nonce._bn.should.eq.BN(trade.nonce._bn);
                    conjugateProposal.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    conjugateProposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    conjugateProposal.stageAmount._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.targetBalanceAmount._bn.should.eq.BN(0);
                    conjugateProposal.driipType.should.equal(mocks.driipTypes.indexOf('Trade'));
                    conjugateProposal.balanceReward.should.be.false;

                    (await ethersDriipSettlementChallenge.challengeWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge.challengeTradeHashesCount())
                        ._bn.should.eq.BN(1);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called before an ongoing settlement challenge has expired', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });
        });

        describe('startChallengeFromPayment()', () => {
            let payment;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});

                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
            });

            describe('if wallet has previous disqualified driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    await web3DriipSettlementChallenge.lockWallet(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement challenge block', () => {
                beforeEach(async () => {
                    web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called from sender that is not payment party', () => {
                beforeEach(async () => {
                    await web3Validator.setPaymentParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with negative intended stage amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current.mul(-1)
                    ).should.be.rejected;
                });
            });

            describe('if called with stage amount that exceeds balance amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current.mul(2)
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach( async () => {
                    topic = ethersDriipSettlementChallenge.interface.events['StartChallengeFromPaymentEvent'].topics[0];
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: [topic]
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    // Index is 1-based
                    const index = await ethersDriipSettlementChallenge.proposalIndexByWalletCurrency(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    );
                    index._bn.should.eq.BN(1);

                    const proposal = await ethersDriipSettlementChallenge.proposals(index.sub(1));
                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.nonce._bn.should.eq.BN(payment.nonce._bn);
                    proposal.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    proposal.stageAmount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    proposal.targetBalanceAmount._bn.should.eq.BN(0);
                    proposal.driipType.should.equal(mocks.driipTypes.indexOf('Payment'));
                    proposal.balanceReward.should.be.true;

                    (await ethersDriipSettlementChallenge.challengeWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge.challengePaymentHashesCount())
                        ._bn.should.eq.BN(1);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called before an ongoing settlement challenge has expired', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });
        });

        describe('startChallengeFromPaymentByProxy()', () => {
            let payment;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});

                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
            });

            describe('if called by non-operator', () => {
                beforeEach(async () => {
                    ethersDriipSettlementChallenge = ethersDriipSettlementChallenge.connect(glob.signer_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement challenge block', () => {
                beforeEach(async () => {
                    web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with negative intended stage amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current.mul(-1)
                    ).should.be.rejected;
                });
            });

            describe('if called with wallet that is not payment party', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        Wallet.createRandom().address, payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if called with stage amount that exceeds balance amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current.mul(2)
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach( async () => {
                    topic = ethersDriipSettlementChallenge.interface.events['StartChallengeFromPaymentByProxyEvent'].topics[0];
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: [topic]
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    // Index is 1-based
                    const index = await ethersDriipSettlementChallenge.proposalIndexByWalletCurrency(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    );
                    index._bn.should.eq.BN(1);

                    const proposal = await ethersDriipSettlementChallenge.proposals(index.sub(1));
                    proposal.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    proposal.nonce._bn.should.eq.BN(payment.nonce._bn);
                    proposal.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.status.should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                    proposal.stageAmount._bn.should.eq.BN(payment.sender.balances.current._bn);
                    proposal.targetBalanceAmount._bn.should.eq.BN(0);
                    proposal.driipType.should.equal(mocks.driipTypes.indexOf('Payment'));
                    proposal.balanceReward.should.be.false;

                    (await ethersDriipSettlementChallenge.challengeWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge.challengePaymentHashesCount())
                        ._bn.should.eq.BN(1);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });

            describe('if called before an ongoing settlement challenge has expired', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });
        });

        describe('hasProposalExpired()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should return true', async () => {
                    (await ethersDriipSettlementChallenge.hasProposalExpired(glob.owner, mocks.address0, 0))
                        .should.be.true;
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
                });

                describe('if settlement challenge has completed for the wallet and currency', () => {
                    beforeEach(async () => {
                        await web3Configuration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 0);

                        await ethersDriipSettlementChallenge.startChallengeFromPayment(
                            payment, payment.sender.balances.current, {gasLimit: 2e6}
                        );
                    });

                    it('should return true', async () => {
                        (await ethersDriipSettlementChallenge.hasProposalExpired(
                            glob.owner, payment.currency.ct, payment.currency.id
                        )).should.be.true;
                    });
                });

                describe('if settlement challenge is ongoing for the wallet and currency', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementChallenge.startChallengeFromPayment(
                            payment, payment.sender.balances.current, {gasLimit: 2e6}
                        );
                    });

                    it('should return false', async () => {
                        (await ethersDriipSettlementChallenge.hasProposalExpired(
                            glob.owner, payment.currency.ct, payment.currency.id
                        )).should.be.false;
                    });
                });
            });
        });

        describe('proposalNonce()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalNonce(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return nonce of proposal', async () => {
                    (await ethersDriipSettlementChallenge.proposalNonce(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    ))._bn.should.eq.BN(payment.nonce._bn);
                });
            });
        });

        describe('proposalBlockNumber()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalBlockNumber(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return block number of proposal', async () => {
                    (await ethersDriipSettlementChallenge.proposalBlockNumber(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    ))._bn.should.eq.BN(payment.blockNumber._bn);
                });
            });
        });

        describe('proposalExpirationTime()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalExpirationTime(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment, timestampBefore;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const blockNumber = await provider.getBlockNumber();
                    const block = (await provider.getBlock(blockNumber));
                    timestampBefore = block.timestamp;
                });

                it('should return end time of proposal', async () => {
                    (await ethersDriipSettlementChallenge.proposalExpirationTime(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    ))._bn.should.be.gt.BN(timestampBefore);
                });
            });
        });

        describe('proposalStatus()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalStatus(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return status of proposal', async () => {
                    (await ethersDriipSettlementChallenge.proposalStatus(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    )).should.equal(mocks.settlementStatuses.indexOf('Qualified'));
                });
            });
        });

        describe('proposalStageAmount()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalStageAmount(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return stage amount of proposal', async () => {
                    (await ethersDriipSettlementChallenge.proposalStageAmount(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    ))._bn.should.eq.BN(payment.sender.balances.current._bn);
                });
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalTargetBalanceAmount(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return target balance amount of proposal', async () => {
                    (await ethersDriipSettlementChallenge.proposalTargetBalanceAmount(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    ))._bn.should.eq.BN(0);
                });
            });
        });

        describe('proposalDriipHash()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalDriipHash(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return status of proposal', async () => {
                    (await ethersDriipSettlementChallenge.proposalDriipHash(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    )).should.equal(payment.seals.operator.hash);
                });
            });
        });

        describe('proposalDriipType()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalDriipType(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected
                });
            });

            describe('if settlement challenge has been started for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return status of proposal', async () => {
                    (await ethersDriipSettlementChallenge.proposalDriipType(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    )).should.equal(mocks.driipTypes.indexOf('Payment'));
                });
            });
        });

        describe('proposalBalanceReward()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalBalanceReward(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started by wallet', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return true', async () => {
                    (await ethersDriipSettlementChallenge.proposalBalanceReward(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    )).should.be.true;
                });
            });

            describe('if settlement challenge has been started by proxy', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return false', async () => {
                    (await ethersDriipSettlementChallenge.proposalBalanceReward(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    )).should.be.false;
                });
            });
        });

        describe('setProposalExpirationTime()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setProposalExpirationTime(
                        glob.owner, mocks.address0, 0, 1000
                    ).should.be.rejected
                });
            });

            describe('if no settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.setProposalExpirationTime(
                        glob.owner, mocks.address0, 0, 1000
                    ).should.be.rejected
                });
            });

            describe('if within operational constraints', () => {
                let payment;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should successfully set end time of proposal', async () => {
                    await ethersDriipSettlementChallenge.setProposalExpirationTime(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, 1000
                    );

                    (await ethersDriipSettlementChallenge.proposalExpirationTime(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    ))._bn.should.eq.BN(1000);
                });
            });
        });

        describe('setProposalStatus()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setProposalStatus(
                        glob.owner, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                    ).should.be.rejected
                });
            });

            describe('if no settlement challenge has been started for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.setProposalStatus(
                        glob.owner, mocks.address0, 0, mocks.settlementStatuses.indexOf('Disqualified')
                    ).should.be.rejected
                });
            });

            describe('if within operational constraints', () => {
                let payment;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should successfully set status of proposal', async () => {
                    await ethersDriipSettlementChallenge.setProposalStatus(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, mocks.settlementStatuses.indexOf('Disqualified')
                    );

                    (await ethersDriipSettlementChallenge.proposalStatus(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    )).should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
                });
            });
        });

        describe('challengeByOrder()', () => {
            let order;

            before(async () => {
                await ethersDriipSettlementDispute._reset();
                order = await mocks.mockOrder(glob.owner);
            });

            it('should call challengeByOrder() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallenge.challengeByOrder(order);

                (await ethersDriipSettlementDispute._challengeByOrderCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('unchallengeOrderCandidateByTrade()', () => {
            let order, trade;

            before(async () => {
                await ethersDriipSettlementDispute._reset();
                order = await mocks.mockOrder(glob.owner);
                trade = await mocks.mockTrade(glob.owner);
            });

            it('should call challengeByTrade() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallenge.unchallengeOrderCandidateByTrade(order, trade, {gasLimit: 2e6});

                (await ethersDriipSettlementDispute._unchallengeOrderCandidateByTradeCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('challengeByTrade()', () => {
            let trade;

            before(async () => {
                await ethersDriipSettlementDispute._reset();
                trade = await mocks.mockTrade(glob.owner);
            });

            it('should call challengeByTrade() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallenge.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 2e6});

                (await ethersDriipSettlementDispute._challengeByTradeCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('challengeByPayment()', () => {
            let payment;

            before(async () => {
                await ethersDriipSettlementDispute._reset();
                payment = await mocks.mockPayment(glob.owner);
            });

            it('should call challengeByPayment() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallenge.challengeByPayment(payment.sender.wallet, payment, {gasLimit: 2e6});

                (await ethersDriipSettlementDispute._challengeByPaymentCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('candidateHashesCount()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallenge.candidateHashesCount())._bn.should.eq.BN(0);
            });
        });

        describe('lockWallet()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.lockWallet(glob.user_a)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should successfully push the array element', async () => {
                    await ethersDriipSettlementChallenge.lockWallet(glob.user_a, {gasLimit: 1e6});

                    (await ethersDriipSettlementChallenge.lockedByWallet(glob.user_a))
                        .should.be.true;
                });
            });
        });

        describe('isLockedWallet()', () => {
            beforeEach(async () => {
                await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
            });

            describe('if called on unlocked wallet', () => {
                it('should return false', async () => {
                    (await web3DriipSettlementChallenge.isLockedWallet(glob.user_a))
                        .should.be.false;
                });
            });

            describe('if called before lock timeout', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge.lockWallet(glob.user_a, {gasLimit: 1e6});
                });

                it('should successfully push the array element', async () => {
                    (await ethersDriipSettlementChallenge.isLockedWallet(glob.user_a))
                        .should.be.true;
                });
            });

            describe('if called after lock timeout', () => {
                beforeEach(async () => {
                    await ethersConfiguration.setWalletLockTimeout((await provider.getBlockNumber()) + 1, 0);

                    await ethersDriipSettlementChallenge.lockWallet(glob.user_a, {gasLimit: 1e6});
                });

                it('should successfully push the array element', async () => {
                    (await ethersDriipSettlementChallenge.isLockedWallet(glob.user_a))
                        .should.be.false;
                });
            });
        });

        describe('addDisqualification()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.addDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, payment.seals.operator.hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if no proposal exists for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.addDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, payment.seals.operator.hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should successfully push the array element', async () => {
                    await ethersDriipSettlementChallenge.addDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, payment.seals.operator.hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    );

                    // Index is 1-based
                    const index = await ethersDriipSettlementChallenge.disqualificationIndexByWalletCurrency(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    );
                    index._bn.should.eq.BN(1);

                    const disqualification = await ethersDriipSettlementChallenge.disqualifications(index.sub(1));
                    disqualification.wallet.should.equal(utils.getAddress(payment.sender.wallet));
                    disqualification.nonce._bn.should.eq.BN(payment.nonce._bn);
                    disqualification.candidateType.should.equal(mocks.candidateTypes.indexOf('Payment'));
                    disqualification.candidateHash.should.equal(payment.seals.operator.hash);
                    disqualification.challenger.should.equal(utils.getAddress(glob.user_a));
                });
            });
        });

        describe('removeDisqualification()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.removeDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has not been disqualified for the wallet and currency', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.removeDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    await ethersDriipSettlementChallenge.addDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, payment.seals.operator.hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    );
                });

                it('should successfully push the array element', async () => {
                    await ethersDriipSettlementChallenge.removeDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, {gasLimit: 3e6}
                    );

                    (await ethersDriipSettlementChallenge.disqualificationIndexByWalletCurrency(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    ))._bn.should.eq.BN(0);
                });
            });
        });

        describe('disqualificationCandidateType()', () => {
            describe('if no settlement challenge has been disqualified for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.disqualificationCandidateType(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been disqualified for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    await ethersDriipSettlementChallenge.addDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, payment.seals.operator.hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    );
                });

                it('should return candidate type of the disqualification', async () => {
                    (await ethersDriipSettlementChallenge.disqualificationCandidateType(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    )).should.equal(mocks.candidateTypes.indexOf('Payment'));
                });
            });
        });

        describe('disqualificationCandidateHash()', () => {
            describe('if no settlement challenge has been disqualified for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.disqualificationCandidateHash(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been disqualified for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    await ethersDriipSettlementChallenge.addDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, payment.seals.operator.hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    );
                });

                it('should return candidate type of the disqualification', async () => {
                    (await ethersDriipSettlementChallenge.disqualificationCandidateHash(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id
                    )).should.equal(payment.seals.operator.hash);
                });
            });
        });

        describe('disqualificationChallenger()', () => {
            describe('if no settlement challenge has been started for the wallet and currency', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.disqualificationChallenger(
                        glob.owner, mocks.address0, 0
                    ).should.be.rejected;
                });
            });

            describe('if settlement challenge has been disqualified for the wallet and currency', () => {
                let payment;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);

                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    await ethersDriipSettlementChallenge.addDisqualification(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id, payment.seals.operator.hash,
                        mocks.candidateTypes.indexOf('Payment'), glob.user_a, {gasLimit: 3e6}
                    );
                });

                it('should return default value', async () => {
                    (await ethersDriipSettlementChallenge.disqualificationChallenger(
                        payment.sender.wallet, payment.currency.ct, payment.currency.id,
                    )).should.equal(utils.getAddress(glob.user_a));
                });
            });
        });
    });
};
