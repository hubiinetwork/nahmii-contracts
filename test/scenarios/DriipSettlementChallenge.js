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

        describe('proposalsByWallet()', () => {
            it('should return default values', async () => {
                const address = Wallet.createRandom().address;
                const result = await ethersDriipSettlementChallenge.proposalsByWallet(address);
                result.status.should.equal(mocks.proposalStatuses.indexOf('Unknown'));
                result.nonce._bn.should.eq.BN(0);
            });
        });

        describe('challengedWalletsCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersDriipSettlementChallenge.challengedWalletsCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('challengedTradeHashesCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersDriipSettlementChallenge.challengedTradeHashesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('challengedPaymentHashesCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersDriipSettlementChallenge.challengedPaymentHashesCount())
                    ._bn.should.eq.BN(0);
            });
        });

        describe('walletChallengedTradeHashesCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                (await ethersDriipSettlementChallenge.walletChallengedTradeHashesCount(address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('walletChallengedPaymentHashesCount()', () => {
            it('should return value initialized ', async () => {
                const address = Wallet.createRandom().address;
                (await ethersDriipSettlementChallenge.walletChallengedPaymentHashesCount(address))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('startChallengeFromTrade()', () => {
            let trade, topic, filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});

                trade = await mocks.mockTrade(glob.owner, {buyer: {wallet: glob.owner}});

                topic = ethersDriipSettlementChallenge.interface.events['StartChallengeFromTradeEvent'].topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
                    ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
                    ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);

                    await ethersDriipSettlementChallenge.setValidator(ethersValidator.address);
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
                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );

                    const proposal = await ethersDriipSettlementChallenge.proposalsByWallet(trade.buyer.wallet);
                    proposal.nonce._bn.should.eq.BN(trade.nonce._bn);
                    proposal.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.driipType.should.equal(mocks.driipTypes.indexOf('Trade'));
                    proposal.driipIndex._bn.should.eq.BN(0);
                    proposal.candidateType.should.equal(mocks.candidateTypes.indexOf('None'));
                    proposal.candidateIndex._bn.should.eq.BN(0);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.balanceReward.should.be.true;

                    (await ethersDriipSettlementChallenge.challengedWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge.challengedTradeHashesCount())
                        ._bn.should.eq.BN(1);
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
            let trade, topic, filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});

                trade = await mocks.mockTrade(glob.owner, {buyer: {wallet: glob.owner}});

                topic = ethersDriipSettlementChallenge.interface.events['StartChallengeFromTradeByProxyEvent'].topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if called from non-deployer', () => {
                beforeEach(async () => {
                    ethersDriipSettlementChallenge = ethersDriipSettlementChallenge.connect(glob.signer_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
                    ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
                    ).should.be.rejected;
                });
            });

            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
                    ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);

                    await ethersDriipSettlementChallenge.setValidator(ethersValidator.address);
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

            describe('if called with wallet is not trade party', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        Wallet.createRandom().address, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current
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
                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );

                    const proposal = await ethersDriipSettlementChallenge.proposalsByWallet(trade.buyer.wallet);
                    proposal.nonce._bn.should.eq.BN(trade.nonce._bn);
                    proposal.blockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.driipType.should.equal(mocks.driipTypes.indexOf('Trade'));
                    proposal.driipIndex._bn.should.eq.BN(0);
                    proposal.candidateType.should.equal(mocks.candidateTypes.indexOf('None'));
                    proposal.candidateIndex._bn.should.eq.BN(0);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.balanceReward.should.be.false;

                    (await ethersDriipSettlementChallenge.challengedWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge.challengedTradeHashesCount())
                        ._bn.should.eq.BN(1);
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
            let payment, topic, filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});

                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                topic = ethersDriipSettlementChallenge.interface.events['StartChallengeFromPaymentEvent'].topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
                    ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
                    ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);

                    await ethersDriipSettlementChallenge.setValidator(ethersValidator.address);
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

            describe('if called with negative intended stage amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current.mul(-1)
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

            describe('if called with stage amount that exceeds balance amount', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current.mul(2)
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const proposal = await ethersDriipSettlementChallenge.proposalsByWallet(payment.sender.wallet);
                    proposal.nonce._bn.should.eq.BN(payment.nonce._bn);
                    proposal.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.driipType.should.equal(mocks.driipTypes.indexOf('Payment'));
                    proposal.driipIndex._bn.should.eq.BN(0);
                    proposal.candidateType.should.equal(mocks.candidateTypes.indexOf('None'));
                    proposal.candidateIndex._bn.should.eq.BN(0);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.balanceReward.should.be.true;

                    (await ethersDriipSettlementChallenge.challengedWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge.challengedPaymentHashesCount())
                        ._bn.should.eq.BN(1);
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
            let payment, topic, filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});

                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});

                topic = ethersDriipSettlementChallenge.interface.events['StartChallengeFromPaymentByProxyEvent'].topics[0];
                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: [topic]
                };
            });

            describe('if called from non-deployer', () => {
                beforeEach(async () => {
                    ethersDriipSettlementChallenge = ethersDriipSettlementChallenge.connect(glob.signer_a);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current
                    ).should.be.rejected;
                });
            });

            describe('if validator contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
                    ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);
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

            describe('if configuration contract is not initialized', () => {
                beforeEach(async () => {
                    web3DriipSettlementChallenge = await DriipSettlementChallenge.new(glob.owner);
                    ethersDriipSettlementChallenge = new Contract(web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);

                    await ethersDriipSettlementChallenge.setValidator(ethersValidator.address);
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
                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromPaymentByProxy(
                        payment.sender.wallet, payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const proposal = await ethersDriipSettlementChallenge.proposalsByWallet(payment.sender.wallet);
                    proposal.nonce._bn.should.eq.BN(payment.nonce._bn);
                    proposal.blockNumber._bn.should.eq.BN(payment.blockNumber._bn);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.driipType.should.equal(mocks.driipTypes.indexOf('Payment'));
                    proposal.driipIndex._bn.should.eq.BN(0);
                    proposal.candidateType.should.equal(mocks.candidateTypes.indexOf('None'));
                    proposal.candidateIndex._bn.should.eq.BN(0);
                    proposal.status.should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                    proposal.balanceReward.should.be.false;

                    (await ethersDriipSettlementChallenge.challengedWalletsCount())
                        ._bn.should.eq.BN(1);
                    (await ethersDriipSettlementChallenge.challengedPaymentHashesCount())
                        ._bn.should.eq.BN(1);
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

        describe('challengePhase()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return Closed', async () => {
                    (await ethersDriipSettlementChallenge.challengePhase(glob.owner))
                        .should.equal(mocks.challengePhases.indexOf('Closed'));
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
                });

                describe('if settlement challenge has completed for given wallet', () => {
                    beforeEach(async () => {
                        await web3Configuration.setSettlementChallengeTimeout((await provider.getBlockNumber()) + 1, 0);
                        await ethersDriipSettlementChallenge.startChallengeFromPayment(
                            payment, payment.sender.balances.current, {gasLimit: 2e6}
                        );
                    });

                    it('should return Closed', async () => {
                        (await ethersDriipSettlementChallenge.challengePhase(glob.owner))
                            .should.equal(mocks.challengePhases.indexOf('Closed'));
                    });
                });

                describe('if settlement challenge is ongoing for given wallet', () => {
                    beforeEach(async () => {
                        await ethersDriipSettlementChallenge.startChallengeFromPayment(
                            payment, payment.sender.balances.current, {gasLimit: 2e6}
                        );
                    });

                    it('should return Dispute', async () => {
                        (await ethersDriipSettlementChallenge.challengePhase(glob.owner))
                            .should.equal(mocks.challengePhases.indexOf('Dispute'));
                    });
                });
            });
        });

        describe('proposalNonce()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    (await ethersDriipSettlementChallenge.proposalNonce(glob.owner))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return nonce of ongoing challenge', async () => {
                    (await ethersDriipSettlementChallenge.proposalNonce(glob.owner))
                        ._bn.should.eq.BN(payment.nonce._bn);
                });
            });
        });

        describe('proposalBlockNumber()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    (await ethersDriipSettlementChallenge.proposalBlockNumber(glob.owner))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return block number of ongoing challenge', async () => {
                    (await ethersDriipSettlementChallenge.proposalBlockNumber(glob.owner))
                        ._bn.should.eq.BN(payment.blockNumber._bn);
                });
            });
        });

        describe('proposalTimeout()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    (await ethersDriipSettlementChallenge.proposalTimeout(glob.owner))._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                let timestampBefore;

                beforeEach(async () => {
                    const payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );

                    const blockNumber = await provider.getBlockNumber();
                    const block = (await provider.getBlock(blockNumber));
                    timestampBefore = block.timestamp;
                });

                it('should return timeout of ongoing challenge', async () => {
                    (await ethersDriipSettlementChallenge.proposalTimeout(glob.owner))
                        ._bn.should.be.gt.BN(timestampBefore);
                });
            });
        });

        describe('proposalStatus()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    (await ethersDriipSettlementChallenge.proposalStatus(glob.owner))
                        .should.equal(mocks.proposalStatuses.indexOf('Unknown'));
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    const payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return status of ongoing challenge', async () => {
                    (await ethersDriipSettlementChallenge.proposalStatus(glob.owner))
                        .should.equal(mocks.proposalStatuses.indexOf('Qualified'));
                });
            });
        });

        describe('proposalCurrencyCount()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should return default value', async () => {
                    (await ethersDriipSettlementChallenge.proposalCurrencyCount(glob.owner))
                        ._bn.should.eq.BN(0);
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    const payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return currency count of ongoing challenge', async () => {
                    (await ethersDriipSettlementChallenge.proposalCurrencyCount(glob.owner))
                        ._bn.should.eq.BN(1);
                });
            });
        });

        describe('proposalCurrency()', () => {
            describe('if no settlement challenge has been started for given wallet', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalCurrency(glob.owner, 0).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                let payment;

                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return currency at given index of ongoing challenge', async () => {
                    const result = await ethersDriipSettlementChallenge.proposalCurrency(glob.owner, 0);
                    result.ct.should.equal(payment.currency.ct);
                    result.id._bn.should.eq.BN(payment.currency.id._bn);
                });
            });
        });

        describe('proposalStageAmount()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
            });

            describe('if no settlement challenge has been started for given wallet', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalStageAmount(glob.owner, payment.currency).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return stage amount at given index of ongoing challenge', async () => {
                    (await ethersDriipSettlementChallenge.proposalStageAmount(glob.owner, payment.currency))
                        ._bn.should.eq.BN(payment.sender.balances.current._bn);
                });
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            let payment;

            beforeEach(async () => {
                payment = await mocks.mockPayment(glob.owner, {sender: {wallet: glob.owner}});
            });

            describe('if no settlement challenge has been started for given wallet', () => {
                it('should revert', async () => {
                    ethersDriipSettlementChallenge.proposalTargetBalanceAmount(glob.owner, payment.currency).should.be.rejected;
                });
            });

            describe('if settlement challenge has been started for given wallet', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallenge.startChallengeFromPayment(
                        payment, payment.sender.balances.current, {gasLimit: 3e6}
                    );
                });

                it('should return stage amount at given index of ongoing challenge', async () => {
                    (await ethersDriipSettlementChallenge.proposalTargetBalanceAmount(glob.owner, payment.currency))
                        ._bn.should.eq.BN(0);
                });
            });
        });

        describe('proposalCandidateType()', () => {
            it('should return default value', async () => {
                (await ethersDriipSettlementChallenge.proposalCandidateType(glob.owner))
                    .should.equal(mocks.candidateTypes.indexOf('None'));
            });
        });

        describe('proposalCandidateIndex()', () => {
            it('should return default value', async () => {
                (await ethersDriipSettlementChallenge.proposalCandidateIndex(glob.owner))
                    ._bn.should.eq.BN(0);
            });
        });

        describe('proposalChallenger()', () => {
            it('should return default value', async () => {
                (await ethersDriipSettlementChallenge.proposalChallenger(glob.owner))
                    .should.equal(mocks.address0);
            });
        });

        describe('proposalBalanceReward()', () => {
            it('should return default value', async () => {
                (await ethersDriipSettlementChallenge.proposalBalanceReward(glob.owner))
                    .should.be.false;
            });
        });

        describe('setProposalTimeout()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setProposalTimeout(glob.owner, 1000)
                        .should.be.rejected
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    await web3DriipSettlementChallenge.setProposalTimeout(glob.owner, 1000);

                    (await ethersDriipSettlementChallenge.proposalTimeout(glob.owner))
                        ._bn.should.eq.BN(1000);
                });
            });
        });

        describe('setProposalStatus()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setProposalStatus(
                        glob.owner, mocks.proposalStatuses.indexOf('Disqualified')
                    ).should.be.rejected
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    await web3DriipSettlementChallenge.setProposalStatus(
                        glob.owner, mocks.proposalStatuses.indexOf('Disqualified')
                    );

                    (await ethersDriipSettlementChallenge.proposalStatus(glob.owner))
                        .should.equal(mocks.proposalStatuses.indexOf('Disqualified'));
                });
            });
        });

        describe('setProposalCandidateType()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setProposalCandidateType(
                        glob.owner, mocks.candidateTypes.indexOf('Payment')
                    ).should.be.rejected
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    await web3DriipSettlementChallenge.setProposalCandidateType(
                        glob.owner, mocks.candidateTypes.indexOf('Payment')
                    );

                    (await ethersDriipSettlementChallenge.proposalCandidateType(glob.owner))
                        .should.equal(mocks.candidateTypes.indexOf('Payment'));
                });
            });
        });

        describe('setProposalCandidateIndex()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setProposalCandidateIndex(glob.owner, 10)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    await web3DriipSettlementChallenge.setProposalCandidateIndex(glob.owner, 10);

                    (await ethersDriipSettlementChallenge.proposalCandidateIndex(glob.owner))
                        ._bn.should.eq.BN(10);
                });
            });
        });

        describe('setProposalChallenger()', () => {
            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.setProposalChallenger(glob.owner, glob.user_a)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                });

                it('should successfully set the new value', async () => {
                    await web3DriipSettlementChallenge.setProposalChallenger(glob.owner, glob.user_a);

                    (await ethersDriipSettlementChallenge.proposalChallenger(glob.owner))
                        .should.eq.BN(glob.user_a);
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
                await ethersDriipSettlementChallenge.challengeByPayment(payment, {gasLimit: 2e6});

                (await ethersDriipSettlementDispute._challengeByPaymentCount())
                    ._bn.should.eq.BN(1);
            });
        });
        
        describe('challengeCandidateOrderHashesCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersDriipSettlementChallenge.challengeCandidateOrderHashesCount())._bn.should.eq.BN(0);
            });
        });

        describe('addChallengeCandidateOrderHash()', () => {
            let order;

            before(async () => {
                order = await mocks.mockOrder(glob.owner);
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.addChallengeCandidateOrderHash(order.seals.operator.hash)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                let challengeCandidateOrderHashesCountBefore;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                    challengeCandidateOrderHashesCountBefore = await ethersDriipSettlementChallenge.challengeCandidateOrderHashesCount();
                });

                it('should successfully push the array element', async () => {
                    await ethersDriipSettlementChallenge.addChallengeCandidateOrderHash(order.seals.operator.hash, {gasLimit: 2e6});

                    (await ethersDriipSettlementChallenge.challengeCandidateOrderHashesCount())
                        ._bn.should.eq.BN(challengeCandidateOrderHashesCountBefore.add(1)._bn);
                });
            });
        });

        describe('challengeCandidateTradeHashesCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersDriipSettlementChallenge.challengeCandidateTradeHashesCount())._bn.should.eq.BN(0);
            });
        });

        describe('addChallengeCandidateTradeHash()', () => {
            let trade;

            before(async () => {
                trade = await mocks.mockTrade(glob.owner);
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.addChallengeCandidateTradeHash(trade.seal.hash)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                let challengeCandidateTradeHashesCountBefore;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                    challengeCandidateTradeHashesCountBefore = await ethersDriipSettlementChallenge.challengeCandidateTradeHashesCount();
                });

                it('should successfully push the array element', async () => {
                    await ethersDriipSettlementChallenge.addChallengeCandidateTradeHash(trade.seal.hash, {gasLimit: 2e6});

                    (await ethersDriipSettlementChallenge.challengeCandidateTradeHashesCount())
                        ._bn.should.eq.BN(challengeCandidateTradeHashesCountBefore.add(1)._bn);
                });
            });
        });

        describe('challengeCandidatePaymentHashesCount()', () => {
            it('should return value initialized ', async () => {
                (await ethersDriipSettlementChallenge.challengeCandidatePaymentHashesCount())._bn.should.eq.BN(0);
            });
        });

        describe('addChallengeCandidatePaymentHash()', () => {
            let payment;

            before(async () => {
                payment = await mocks.mockPayment(glob.owner);
            });

            describe('if called from other than settlement dispute', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallenge.addChallengeCandidatePaymentHash(payment.seals.operator.hash)
                        .should.be.rejected;
                });
            });

            describe('if called from settlement dispute', () => {
                let challengeCandidatePaymentHashesCountBefore;

                beforeEach(async () => {
                    await web3DriipSettlementChallenge.setDriipSettlementDispute(glob.owner);
                    challengeCandidatePaymentHashesCountBefore = await ethersDriipSettlementChallenge.challengeCandidatePaymentHashesCount();
                });

                it('should successfully push the array element', async () => {
                    await ethersDriipSettlementChallenge.addChallengeCandidatePaymentHash(payment.seals.operator.hash, {gasLimit: 2e6});

                    (await ethersDriipSettlementChallenge.challengeCandidatePaymentHashesCount())
                        ._bn.should.eq.BN(challengeCandidatePaymentHashesCountBefore.add(1)._bn);
                });
            });
        });
    });
};
