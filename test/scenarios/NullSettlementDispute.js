const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementDispute = artifacts.require('NullSettlementDispute');
const MockedNullSettlementChallenge = artifacts.require('MockedNullSettlementChallenge');
const MockedFraudChallenge = artifacts.require('MockedFraudChallenge');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');
const MockedValidator = artifacts.require('MockedValidator');
const MockedSecurityBond = artifacts.require('MockedSecurityBond');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('NullSettlementDispute', () => {
        let web3NullSettlementDispute, ethersNullSettlementDispute;
        let web3NullSettlementChallenge, ethersNullSettlementChallenge;
        let web3Validator, ethersValidator;
        let web3SecurityBond, ethersSecurityBond;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3CancelOrdersChallenge, ethersCancelOrdersChallenge;
        let provider;
        let blockNumber0;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3NullSettlementChallenge = await MockedNullSettlementChallenge.new(glob.owner);
            ethersNullSettlementChallenge = new Contract(web3NullSettlementChallenge.address, MockedNullSettlementChallenge.abi, glob.signer_owner);
            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3CancelOrdersChallenge = await MockedCancelOrdersChallenge.new();
            ethersCancelOrdersChallenge = new Contract(web3CancelOrdersChallenge.address, MockedCancelOrdersChallenge.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, glob.web3AccessorManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new();
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
            ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

            await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
            await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersNullSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
            await ethersNullSettlementDispute.changeNullSettlementChallenge(ethersNullSettlementChallenge.address);

            await ethersNullSettlementChallenge.changeNullSettlementDispute(ethersNullSettlementDispute.address);

            blockNumber0 = await provider.getBlockNumber();
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementDispute.deployer.call()).should.equal(glob.owner);
                (await web3NullSettlementDispute.operator.call()).should.equal(glob.owner);
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.validator.call())
                    .should.equal(web3Validator.address);
            })
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.changeValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');

                    (await ethersNullSettlementDispute.validator())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.fraudChallenge.call())
                    .should.equal(web3FraudChallenge.address);
            });
        });

        describe('changeFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.changeFraudChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');

                    (await ethersNullSettlementDispute.fraudChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('cancelOrdersChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.cancelOrdersChallenge.call())
                    .should.equal(web3CancelOrdersChallenge.address);
            });
        });

        describe('changeCancelOrdersChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.changeCancelOrdersChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCancelOrdersChallengeEvent');

                    (await ethersNullSettlementDispute.cancelOrdersChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.changeCancelOrdersChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallenge()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementDispute.nullSettlementChallenge.call())
                    .should.equal(web3NullSettlementChallenge.address);
            });
        });

        describe('changeNullSettlementChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with deployer as sender', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementDispute.changeNullSettlementChallenge(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeNullSettlementChallengeEvent');

                    (await ethersNullSettlementDispute.nullSettlementChallenge())
                        .should.equal(address);
                });
            });

            describe('if called with sender that is not deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementDispute.changeNullSettlementChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challengeByOrder()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            beforeEach(async () => {
                await web3Validator.reset();
                await web3FraudChallenge.reset();
                await web3CancelOrdersChallenge.reset();
                await web3NullSettlementChallenge._reset();
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if cancel order challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if null settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                    await ethersNullSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called from other than null settlement challenge', () => {
                let challenger;

                before(() => {
                    challenger = Wallet.createRandom().address;
                });

                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByOrder(order, challenger).should.be.rejected;
                });
            });

            describe('if called with improperly sealed order', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineOrderWalletSeal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([order.seals.exchange.hash]);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on closed null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on order whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalBlockNumber(1e6);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on negative proposal target balance amount', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalTargetBalanceAmount(-10);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if called on order whose amount is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('10000', 18));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByOrder(order).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('1000', 14));

                    topic = ethersNullSettlementDispute.interface.events['ChallengeByOrderEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should successfully challenge', async () => {
                    await ethersNullSettlementChallenge.challengeByOrder(order, {gasLimit: 1e6});

                    (await ethersNullSettlementChallenge._challengeCandidateOrdersCount())
                        ._bn.should.eq.BN(1);
                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalCandidateType())
                        .should.equal(mocks.challengeCandidateTypes.indexOf('Order'));
                    (await ethersNullSettlementChallenge._proposalCandidateIndex())
                        ._bn.should.eq.BN(0);
                    (await web3NullSettlementChallenge._proposalChallenger())
                        .should.equal(glob.owner);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByTrade()', () => {
            let trade;

            before(async () => {
                trade = await mocks.mockTrade(glob.owner);
            });

            beforeEach(async () => {
                await web3Validator.reset();
                await web3FraudChallenge.reset();
                await web3CancelOrdersChallenge.reset();
                await web3NullSettlementChallenge._reset();
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if cancel orders challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if null settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                    await ethersNullSettlementDispute.changeCancelOrdersChallenge(ethersCancelOrdersChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if called from other than null settlement challenge', () => {
                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByTrade(trade, trade.buyer.wallet, Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if called with wallet that is not trade party', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if called with fraudulent trade', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentTradeHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if called with trade with fraudulent order', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentOrderOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if called with cancelled order', () => {
                beforeEach(async () => {
                    await web3CancelOrdersChallenge.cancelOrdersByHash([trade.buyer.order.hashes.exchange]);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if called on closed null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if called on trade whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalBlockNumber(1e6);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if called on negative proposal target balance amount', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalTargetBalanceAmount(-10);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if called on trade whose single transfer is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('2', 17));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('5', 16));

                    topic = ethersNullSettlementDispute.interface.events['ChallengeByTradeEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should successfully challenge', async () => {
                    await ethersNullSettlementChallenge.challengeByTrade(trade, trade.buyer.wallet, {gasLimit: 1e6});

                    (await ethersNullSettlementChallenge._challengeCandidateTradesCount())
                        ._bn.should.eq.BN(1);
                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalCandidateType())
                        .should.equal(mocks.challengeCandidateTypes.indexOf('Trade'));
                    (await ethersNullSettlementChallenge._proposalCandidateIndex())
                        ._bn.should.eq.BN(0);
                    (await web3NullSettlementChallenge._proposalChallenger())
                        .should.equal(glob.owner);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });

        describe('challengeByPayment()', () => {
            let payment;

            before(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            beforeEach(async () => {
                await web3Validator.reset();
                await web3FraudChallenge.reset();
                await web3NullSettlementChallenge._reset();
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if fraud challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if null settlement challenge contract is not initialized', () => {
                beforeEach(async () => {
                    web3NullSettlementDispute = await NullSettlementDispute.new(glob.owner);
                    ethersNullSettlementDispute = new Contract(web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);

                    await ethersNullSettlementDispute.changeValidator(ethersValidator.address);
                    await ethersNullSettlementDispute.changeFraudChallenge(ethersFraudChallenge.address);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if called from other than null settlement challenge', () => {
                it('should revert', async () => {
                    ethersNullSettlementDispute.challengeByPayment(payment, payment.sender.wallet, Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if called with improperly sealed payment', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuinePaymentSeals(false);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if called with wallet that is not payment sender', () => {
                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, Wallet.createRandom().address).should.be.rejected;
                });
            });

            describe('if called with fraudulent payment', () => {
                beforeEach(async () => {
                    await web3FraudChallenge.setFraudulentPaymentOperatorHash(true);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if called on closed null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Closed'));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if called on payment whose block number is lower than the one of the proposal', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalBlockNumber(1e6);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if called on negative proposal target balance amount', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallenge._setProposalTargetBalanceAmount(-10);
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if called on payment whose single transfer is smaller than the proposal target balance amount', () => {
                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('2', 17));
                });

                it('should revert', async () => {
                    ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                let topic, filter;

                beforeEach(async () => {
                    await ethersNullSettlementChallenge._setChallengePhase(mocks.challengePhases.indexOf('Dispute'));
                    await ethersNullSettlementChallenge._setProposalTargetBalanceAmount(utils.parseUnits('5', 16));

                    topic = ethersNullSettlementDispute.interface.events['ChallengeByPaymentEvent'].topics[0];
                    filter = {
                        fromBlock: blockNumber0,
                        topics: [topic]
                    };
                });

                it('should successfully challenge', async () => {
                    await ethersNullSettlementChallenge.challengeByPayment(payment, payment.sender.wallet, {gasLimit: 1e6});

                    (await ethersNullSettlementChallenge._challengeCandidatePaymentsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersNullSettlementChallenge._proposalStatus())
                        .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                    (await ethersNullSettlementChallenge._proposalCandidateType())
                        .should.equal(mocks.challengeCandidateTypes.indexOf('Payment'));
                    (await ethersNullSettlementChallenge._proposalCandidateIndex())
                        ._bn.should.eq.BN(0);
                    (await web3NullSettlementChallenge._proposalChallenger())
                        .should.equal(glob.owner);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(topic);
                });
            });
        });
    });
};
