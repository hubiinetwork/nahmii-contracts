const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const DriipSettlementChallengeByTrade = artifacts.require('DriipSettlementChallengeByTrade');
const SignerManager = artifacts.require('SignerManager');
const MockedDriipSettlementDisputeByTrade = artifacts.require('MockedDriipSettlementDisputeByTrade');
const MockedDriipSettlementChallengeState = artifacts.require('MockedDriipSettlementChallengeState');
const MockedNullSettlementChallengeState = artifacts.require('MockedNullSettlementChallengeState');
const MockedDriipSettlementState = artifacts.require('MockedDriipSettlementState');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');
const MockedBalanceTracker = artifacts.require('MockedBalanceTracker');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

module.exports = (glob) => {
    describe('DriipSettlementChallengeByTrade', () => {
        let web3DriipSettlementChallengeByTrade, ethersDriipSettlementChallengeByTrade;
        let web3SignerManager;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let web3WalletLocker, ethersWalletLocker;
        let web3BalanceTracker, ethersBalanceTracker;
        let web3DriipSettlementDisputeByTrade, ethersDriipSettlementDisputeByTrade;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
        let web3DriipSettlementState, ethersDriipSettlementState;
        let provider;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3SignerManager = await SignerManager.new(glob.owner);

            web3DriipSettlementDisputeByTrade = await MockedDriipSettlementDisputeByTrade.new();
            ethersDriipSettlementDisputeByTrade = new Contract(web3DriipSettlementDisputeByTrade.address, MockedDriipSettlementDisputeByTrade.abi, glob.signer_owner);
            web3DriipSettlementChallengeState = await MockedDriipSettlementChallengeState.new();
            ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, MockedDriipSettlementChallengeState.abi, glob.signer_owner);
            web3NullSettlementChallengeState = await MockedNullSettlementChallengeState.new();
            ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, MockedNullSettlementChallengeState.abi, glob.signer_owner);
            web3DriipSettlementState = await MockedDriipSettlementState.new();
            ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, MockedDriipSettlementState.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
            web3BalanceTracker = await MockedBalanceTracker.new();
            ethersBalanceTracker = new Contract(web3BalanceTracker.address, MockedBalanceTracker.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3DriipSettlementChallengeByTrade = await DriipSettlementChallengeByTrade.new(glob.owner);
            ethersDriipSettlementChallengeByTrade = new Contract(web3DriipSettlementChallengeByTrade.address, DriipSettlementChallengeByTrade.abi, glob.signer_owner);

            await ethersDriipSettlementChallengeByTrade.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementChallengeByTrade.setValidator(ethersValidator.address);
            await ethersDriipSettlementChallengeByTrade.setWalletLocker(ethersWalletLocker.address);
            await ethersDriipSettlementChallengeByTrade.setBalanceTracker(ethersBalanceTracker.address);
            await ethersDriipSettlementChallengeByTrade.setDriipSettlementDisputeByTrade(ethersDriipSettlementDisputeByTrade.address);
            await ethersDriipSettlementChallengeByTrade.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);
            await ethersDriipSettlementChallengeByTrade.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);
            await ethersDriipSettlementChallengeByTrade.setDriipSettlementState(ethersDriipSettlementState.address);

            await ethersConfiguration.setEarliestSettlementBlockNumber(0);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3DriipSettlementChallengeByTrade.deployer.call()).should.equal(glob.owner);
                (await web3DriipSettlementChallengeByTrade.operator.call()).should.equal(glob.owner);
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByTrade.configuration())
                    .should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('setConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByTrade.setConfiguration(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetConfigurationEvent');

                    (await ethersDriipSettlementChallengeByTrade.configuration())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByTrade.setConfiguration(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByTrade.validator())
                    .should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('setValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByTrade.setValidator(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetValidatorEvent');

                    (await ethersDriipSettlementChallengeByTrade.validator())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByTrade.setValidator(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementDisputeByTrade()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByTrade.driipSettlementDisputeByTrade())
                    .should.equal(utils.getAddress(ethersDriipSettlementDisputeByTrade.address));
            });
        });

        describe('setDriipSettlementDisputeByTrade()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByTrade.setDriipSettlementDisputeByTrade(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementDisputeByTradeEvent');

                    (await ethersDriipSettlementChallengeByTrade.driipSettlementDisputeByTrade())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByTrade.setDriipSettlementDisputeByTrade(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('driipSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByTrade.driipSettlementChallengeState())
                    .should.equal(utils.getAddress(ethersDriipSettlementChallengeState.address));
            });
        });

        describe('setDriipSettlementChallengeState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByTrade.setDriipSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeStateEvent');

                    (await ethersDriipSettlementChallengeByTrade.driipSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByTrade.setDriipSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('nullSettlementChallengeState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByTrade.nullSettlementChallengeState())
                    .should.equal(utils.getAddress(ethersNullSettlementChallengeState.address));
            });
        });

        describe('setNullSettlementChallengeState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByTrade.setNullSettlementChallengeState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetNullSettlementChallengeStateEvent');

                    (await ethersDriipSettlementChallengeByTrade.nullSettlementChallengeState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByTrade.setNullSettlementChallengeState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('driipSettlementState()', () => {
            it('should equal value initialized', async () => {
                (await ethersDriipSettlementChallengeByTrade.driipSettlementState())
                    .should.equal(utils.getAddress(ethersDriipSettlementState.address));
            });
        });

        describe('setDriipSettlementState()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called by deployer', () => {
                it('should set new value and emit event', async () => {
                    const result = await web3DriipSettlementChallengeByTrade.setDriipSettlementState(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementStateEvent');

                    (await ethersDriipSettlementChallengeByTrade.driipSettlementState())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3DriipSettlementChallengeByTrade.setDriipSettlementState(address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });
        });

        describe('startChallengeFromTrade()', () => {
            let trade;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersBalanceTracker._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});

                trade = await mocks.mockTrade(glob.owner, {buyer: {wallet: glob.owner}});
            });

            describe('if wallet is locked', () => {
                beforeEach(async () => {
                    await web3WalletLocker._setLocked(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement block number', () => {
                beforeEach(async () => {
                    await web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called from sender that is not trade party', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping driip settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallengeState._setProposal(true);
                    await web3DriipSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallengeState._setProposal(true);
                    await web3NullSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce is not greater than highest nonce settled of intended currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                        trade.buyer.wallet, trade.currencies.intended, trade.buyer.nonce
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce is not greater than highest nonce settled of conjugate currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                        trade.buyer.wallet, trade.currencies.conjugate, trade.buyer.nonce
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if there is no existent driip settlement challenge proposal to suggest unsynchronized trade balance', () => {
                let filter;

                beforeEach(async () => {
                    await web3DriipSettlementChallengeState._setProposal(false);
                    await web3DriipSettlementChallengeState._setProposalTerminated(true);

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        trade.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByTrade.interface.events['StartChallengeFromTradeEvent'].topics
                    };
                });

                it('should start challenge successfully without correcting cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._initiateProposalsCount())
                        ._bn.should.eq.BN(2);

                    const intendedProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.intended.current.sub(utils.parseUnits('10000', 18)).mul(-1)._bn
                    );
                    intendedProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(intendedProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.intended.current)._bn
                    );
                    intendedProposal.currency.ct.should.equal(trade.currencies.intended.ct);
                    intendedProposal.currency.id._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    intendedProposal.walletInitiated.should.be.true;
                    intendedProposal.challenged.hash.should.equal(trade.seal.hash);
                    intendedProposal.challenged.kind.should.equal('trade');

                    const conjugateProposal = await ethersDriipSettlementChallengeState._proposals(1);
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.conjugate.current.sub(utils.parseUnits('10000', 18)).mul(-1)._bn
                    );
                    conjugateProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(conjugateProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.conjugate.current)._bn
                    );
                    conjugateProposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                    conjugateProposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    conjugateProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    conjugateProposal.walletInitiated.should.be.true;
                    conjugateProposal.challenged.hash.should.equal(trade.seal.hash);
                    conjugateProposal.challenged.kind.should.equal('trade');
                });
            });

            describe('if there exist a driip settlement challenge proposal but the trade includes its causal rebalance', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(0);

                    await ethersDriipSettlementState.initSettlement(
                        'trade', trade.seal.hash,
                        trade.seller.wallet, trade.seller.nonce,
                        trade.buyer.wallet, trade.buyer.nonce,
                        {gasLimit: 1e6}
                    );
                    await ethersDriipSettlementState._setSettlementPartyDoneBlockNumber(
                        mocks.settlementRoles.indexOf('Target'), trade.blockNumber
                    );

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        trade.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByTrade.interface.events['StartChallengeFromTradeEvent'].topics
                    };
                });

                it('should start challenge successfully without correcting cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._proposalsCount())
                        ._bn.should.eq.BN(3);
                    (await ethersDriipSettlementChallengeState._initiateProposalsCount())
                        ._bn.should.eq.BN(2);

                    const intendedProposal = await ethersDriipSettlementChallengeState._proposals(1);
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.intended.current.sub(utils.parseUnits('10000', 18)).mul(-1)._bn
                    );
                    intendedProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(intendedProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.intended.current)._bn
                    );
                    intendedProposal.currency.ct.should.equal(trade.currencies.intended.ct);
                    intendedProposal.currency.id._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    intendedProposal.walletInitiated.should.be.true;
                    intendedProposal.challenged.hash.should.equal(trade.seal.hash);
                    intendedProposal.challenged.kind.should.equal('trade');

                    const conjugateProposal = await ethersDriipSettlementChallengeState._proposals(2);
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.conjugate.current.sub(utils.parseUnits('10000', 18)).mul(-1)._bn
                    );
                    conjugateProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(conjugateProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.conjugate.current)._bn
                    );
                    conjugateProposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                    conjugateProposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    conjugateProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    conjugateProposal.walletInitiated.should.be.true;
                    conjugateProposal.challenged.hash.should.equal(trade.seal.hash);
                    conjugateProposal.challenged.kind.should.equal('trade');
                });
            });

            describe('if there exist a driip settlement challenge proposal and the trade does not include its causal rebalance', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(0);
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('100', 18));

                    await ethersDriipSettlementState.initSettlement(
                        'trade', trade.seal.hash,
                        trade.seller.wallet, trade.seller.nonce,
                        trade.buyer.wallet, trade.buyer.nonce,
                        {gasLimit: 1e6}
                    );
                    await ethersDriipSettlementState._setSettlementPartyDoneBlockNumber(
                        mocks.settlementRoles.indexOf('Target'), trade.blockNumber.add(1)
                    );

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        trade.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByTrade.interface.events['StartChallengeFromTradeEvent'].topics
                    };
                });

                it('should start challenge successfully with corrected cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._proposalsCount())
                        ._bn.should.eq.BN(3);
                    (await ethersDriipSettlementChallengeState._initiateProposalsCount())
                        ._bn.should.eq.BN(2);

                    const intendedProposal = await ethersDriipSettlementChallengeState._proposals(1);
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.intended.current.sub(
                            utils.parseUnits('10000', 18).add(utils.parseUnits('100', 18))
                        ).mul(-1)._bn
                    );
                    intendedProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(intendedProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.intended.current)._bn
                    );
                    intendedProposal.currency.ct.should.equal(trade.currencies.intended.ct);
                    intendedProposal.currency.id._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    intendedProposal.walletInitiated.should.be.true;
                    intendedProposal.challenged.hash.should.equal(trade.seal.hash);
                    intendedProposal.challenged.kind.should.equal('trade');

                    const conjugateProposal = await ethersDriipSettlementChallengeState._proposals(2);
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.conjugate.current.sub(
                            utils.parseUnits('10000', 18).add(intendedProposal.amounts.stage) // 100 units set as proposal stage amount are overridden in mocked contract
                        ).mul(-1)._bn
                    );
                    conjugateProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(conjugateProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.conjugate.current)._bn
                    );
                    conjugateProposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                    conjugateProposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    conjugateProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    conjugateProposal.walletInitiated.should.be.true;
                    conjugateProposal.challenged.hash.should.equal(trade.seal.hash);
                    conjugateProposal.challenged.kind.should.equal('trade');
                });
            });
        });

        describe('startChallengeFromTradeByProxy()', () => {
            let trade;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersBalanceTracker._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementState._reset({gasLimit: 1e6});

                trade = await mocks.mockTrade(glob.owner, {buyer: {wallet: glob.owner}});
            });

            describe('if called with improperly sealed trade', () => {
                beforeEach(async () => {
                    await web3Validator.setGenuineTradeSeal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if current block number is below earliest settlement block number', () => {
                beforeEach(async () => {
                    await web3Configuration.setEarliestSettlementBlockNumber((await provider.getBlockNumber()) + 1000);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called from sender that is not trade party', () => {
                beforeEach(async () => {
                    await web3Validator.setTradeParty(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping null settlement challenge', () => {
                beforeEach(async () => {
                    await web3DriipSettlementChallengeState._setProposal(true);
                    await web3DriipSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with overlapping null settlement challenge', () => {
                beforeEach(async () => {
                    await web3NullSettlementChallengeState._setProposal(true);
                    await web3NullSettlementChallengeState._setProposalTerminated(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce is not greater than highest nonce settled of intended currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                        trade.buyer.wallet, trade.currencies.intended, trade.buyer.nonce
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if trade party\'s nonce is not greater than highest nonce settled of conjugate currency', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                        trade.buyer.wallet, trade.currencies.conjugate, trade.buyer.nonce
                    );
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    ).should.be.rejected;
                });
            });

            describe('if there is no existent driip settlement challenge proposal to suggest unsynchronized trade balance', () => {
                let filter;

                beforeEach(async () => {
                    await web3DriipSettlementChallengeState._setProposal(false);
                    await web3DriipSettlementChallengeState._setProposalTerminated(true);

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        trade.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByTrade.interface.events['StartChallengeFromTradeByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully without correcting cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._initiateProposalsCount())
                        ._bn.should.eq.BN(2);

                    const intendedProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.intended.current.sub(utils.parseUnits('10000', 18)).mul(-1)._bn
                    );
                    intendedProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(intendedProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.intended.current)._bn
                    );
                    intendedProposal.currency.ct.should.equal(trade.currencies.intended.ct);
                    intendedProposal.currency.id._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    intendedProposal.walletInitiated.should.be.false;
                    intendedProposal.challenged.hash.should.equal(trade.seal.hash);
                    intendedProposal.challenged.kind.should.equal('trade');

                    const conjugateProposal = await ethersDriipSettlementChallengeState._proposals(1);
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.conjugate.current.sub(utils.parseUnits('10000', 18)).mul(-1)._bn
                    );
                    conjugateProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(conjugateProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.conjugate.current)._bn
                    );
                    conjugateProposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                    conjugateProposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    conjugateProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    conjugateProposal.walletInitiated.should.be.false;
                    conjugateProposal.challenged.hash.should.equal(trade.seal.hash);
                    conjugateProposal.challenged.kind.should.equal('trade');
                });
            });

            describe('if there exist a driip settlement challenge proposal but the trade includes its causal rebalance', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(0);

                    await ethersDriipSettlementState.initSettlement(
                        'trade', trade.seal.hash,
                        trade.seller.wallet, trade.seller.nonce,
                        trade.buyer.wallet, trade.buyer.nonce,
                        {gasLimit: 1e6}
                    );
                    await ethersDriipSettlementState._setSettlementPartyDoneBlockNumber(
                        mocks.settlementRoles.indexOf('Target'), trade.blockNumber
                    );

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        trade.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByTrade.interface.events['StartChallengeFromTradeByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully without correcting cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._proposalsCount())
                        ._bn.should.eq.BN(3);
                    (await ethersDriipSettlementChallengeState._initiateProposalsCount())
                        ._bn.should.eq.BN(2);

                    const intendedProposal = await ethersDriipSettlementChallengeState._proposals(1);
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.intended.current.sub(utils.parseUnits('10000', 18)).mul(-1)._bn
                    );
                    intendedProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(intendedProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.intended.current)._bn
                    );
                    intendedProposal.currency.ct.should.equal(trade.currencies.intended.ct);
                    intendedProposal.currency.id._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    intendedProposal.walletInitiated.should.be.false;
                    intendedProposal.challenged.hash.should.equal(trade.seal.hash);
                    intendedProposal.challenged.kind.should.equal('trade');

                    const conjugateProposal = await ethersDriipSettlementChallengeState._proposals(2);
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.conjugate.current.sub(utils.parseUnits('10000', 18)).mul(-1)._bn
                    );
                    conjugateProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(conjugateProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.conjugate.current)._bn
                    );
                    conjugateProposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                    conjugateProposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    conjugateProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    conjugateProposal.walletInitiated.should.be.false;
                    conjugateProposal.challenged.hash.should.equal(trade.seal.hash);
                    conjugateProposal.challenged.kind.should.equal('trade');
                });
            });

            describe('if there exist a driip settlement challenge proposal and the trade does not include its causal rebalance', () => {
                let filter;

                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(true);
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                    await ethersDriipSettlementChallengeState._setProposalNonce(0);
                    await ethersDriipSettlementChallengeState._setProposalStageAmount(utils.parseUnits('100', 18));

                    await ethersDriipSettlementState.initSettlement(
                        'trade', trade.seal.hash,
                        trade.seller.wallet, trade.seller.nonce,
                        trade.buyer.wallet, trade.buyer.nonce,
                        {gasLimit: 1e6}
                    );
                    await ethersDriipSettlementState._setSettlementPartyDoneBlockNumber(
                        mocks.settlementRoles.indexOf('Target'), trade.blockNumber.add(1)
                    );

                    await ethersBalanceTracker._set(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        {gasLimit: 1e6}
                    );
                    await ethersBalanceTracker._setFungibleRecord(
                        await ethersBalanceTracker.depositedBalanceType(), utils.parseUnits('10000', 18),
                        trade.blockNumber, {gasLimit: 1e6}
                    );

                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByTrade.interface.events['StartChallengeFromTradeByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully with corrected cumulative transfer amount', async () => {
                    await ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._proposalsCount())
                        ._bn.should.eq.BN(3);
                    (await ethersDriipSettlementChallengeState._initiateProposalsCount())
                        ._bn.should.eq.BN(2);

                    const intendedProposal = await ethersDriipSettlementChallengeState._proposals(1);
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.intended.current.sub(
                            utils.parseUnits('10000', 18).add(utils.parseUnits('100', 18))
                        ).mul(-1)._bn
                    );
                    intendedProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(intendedProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.intended.current)._bn
                    );
                    intendedProposal.currency.ct.should.equal(trade.currencies.intended.ct);
                    intendedProposal.currency.id._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    intendedProposal.walletInitiated.should.be.false;
                    intendedProposal.challenged.hash.should.equal(trade.seal.hash);
                    intendedProposal.challenged.kind.should.equal('trade');

                    const conjugateProposal = await ethersDriipSettlementChallengeState._proposals(2);
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.amounts.cumulativeTransfer._bn.should.eq.BN(
                        trade.buyer.balances.conjugate.current.sub(
                            utils.parseUnits('10000', 18).add(intendedProposal.amounts.stage) // 100 units set as proposal stage amount are overridden in mocked contract
                        ).mul(-1)._bn
                    );
                    conjugateProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.amounts.targetBalance._bn.should.eq.BN(
                        utils.parseUnits('10000', 18).add(conjugateProposal.amounts.cumulativeTransfer.mul(-1))
                            .sub(trade.buyer.balances.conjugate.current)._bn
                    );
                    conjugateProposal.currency.ct.should.equal(trade.currencies.conjugate.ct);
                    conjugateProposal.currency.id._bn.should.eq.BN(trade.currencies.conjugate.id._bn);
                    conjugateProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    conjugateProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    conjugateProposal.walletInitiated.should.be.false;
                    conjugateProposal.challenged.hash.should.equal(trade.seal.hash);
                    conjugateProposal.challenged.kind.should.equal('trade');
                });
            });
        });

        describe('stopChallenge()', () => {
            let filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

                await ethersDriipSettlementChallengeState._setProposal(true);
                await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                await ethersDriipSettlementChallengeState._setProposalNonce(1);
                await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(10);
                await ethersDriipSettlementChallengeState._setProposalStageAmount(20);
                await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(30);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByTrade.interface.events['StopChallengeEvent'].topics
                };
            });

            describe('if called with undefined proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.stopChallenge(
                        mocks.address1, 10, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with terminated proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.stopChallenge(
                        mocks.address1, 10, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should stop challenge successfully', async () => {
                    await ethersDriipSettlementChallengeByTrade.stopChallenge(
                        mocks.address1, 10, {gasLimit: 2e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    dscProposal.wallet.should.equal(utils.getAddress(glob.owner));
                    dscProposal.currency.ct.should.equal(mocks.address1);
                    dscProposal.currency.id._bn.should.eq.BN(10);
                    dscProposal.walletInitiated.should.be.true;
                    dscProposal.terminated.should.be.true;

                    (await ethersNullSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                    nscProposal.wallet.should.equal(utils.getAddress(glob.owner));
                    nscProposal.currency.ct.should.equal(mocks.address1);
                    nscProposal.currency.id._bn.should.eq.BN(10);
                    nscProposal.terminated.should.be.true;
                });
            });
        });

        describe('stopChallengeByProxy()', () => {
            let filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

                await ethersDriipSettlementChallengeState._setProposal(true);
                await ethersDriipSettlementChallengeState._setProposalTerminated(false);
                await ethersDriipSettlementChallengeState._setProposalNonce(1);
                await ethersDriipSettlementChallengeState._setProposalCumulativeTransferAmount(10);
                await ethersDriipSettlementChallengeState._setProposalStageAmount(20);
                await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(30);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByTrade.interface.events['StopChallengeByProxyEvent'].topics
                };
            });

            describe('if called with undefined proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposal(false);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.stopChallengeByProxy(
                        glob.user_a, mocks.address1, 10, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if called with terminated proposal', () => {
                beforeEach(async () => {
                    await ethersDriipSettlementChallengeState._setProposalTerminated(true);
                });

                it('should revert', async () => {
                    ethersDriipSettlementChallengeByTrade.stopChallengeByProxy(
                        glob.user_a, mocks.address1, 10, {gasLimit: 2e6}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should stop challenge successfully', async () => {
                    await ethersDriipSettlementChallengeByTrade.stopChallengeByProxy(
                        glob.user_a, mocks.address1, 10, {gasLimit: 2e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersDriipSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const dscProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    dscProposal.wallet.should.equal(utils.getAddress(glob.user_a));
                    dscProposal.currency.ct.should.equal(mocks.address1);
                    dscProposal.currency.id._bn.should.eq.BN(10);
                    dscProposal.walletInitiated.should.be.false;
                    dscProposal.terminated.should.be.true;

                    (await ethersNullSettlementChallengeState._terminateProposalsCount())
                        ._bn.should.eq.BN(1);

                    const nscProposal = await ethersNullSettlementChallengeState._proposals(0);
                    nscProposal.wallet.should.equal(utils.getAddress(glob.user_a));
                    nscProposal.currency.ct.should.equal(mocks.address1);
                    nscProposal.currency.id._bn.should.eq.BN(10);
                    nscProposal.terminated.should.be.true;
                });
            });
        });

        describe('hasProposalExpired()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalExpired(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.hasProposalExpired(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalNonce()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalNonce(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalNonce(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalReferenceBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalReferenceBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalReferenceBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalExpirationTime()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalExpirationTime(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalExpirationTime(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalStatus()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalStatus(mocks.settlementStatuses.indexOf('Disqualified'));
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalStatus(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.settlementStatuses.indexOf('Disqualified'));
            });
        });

        describe('proposalStageAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalStageAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalStageAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalTargetBalanceAmount()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalTargetBalanceAmount(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalTargetBalanceAmount(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalChallengedHash()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalChallengedHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalChallengedHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1)
            });
        });

        describe('proposalChallengedKind()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalChallengedKind('trade');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalChallengedKind(glob.owner, mocks.address0, 0))
                    .should.equal('trade');
            });
        });

        describe('proposalWalletInitiated()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalWalletInitiated(true);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalWalletInitiated(glob.owner, mocks.address0, 0))
                    .should.be.true;
            });
        });

        describe('proposalDisqualificationChallenger()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationChallenger(glob.user_a);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalDisqualificationChallenger(glob.owner, mocks.address0, 0))
                    .should.equal(utils.getAddress(glob.user_a));
            });
        });

        describe('proposalDisqualificationBlockNumber()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationBlockNumber(1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalDisqualificationBlockNumber(glob.owner, mocks.address0, 0))
                    ._bn.should.eq.BN(1);
            });
        });

        describe('proposalDisqualificationCandidateHash()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationCandidateHash(mocks.hash1);
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalDisqualificationCandidateHash(glob.owner, mocks.address0, 0))
                    .should.equal(mocks.hash1);
            });
        });

        describe('proposalDisqualificationCandidateKind()', () => {
            beforeEach(async () => {
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersDriipSettlementChallengeState._setProposalDisqualificationCandidateKind('trade');
            });

            it('should return from corresponding function in challenge state instance', async () => {
                (await ethersDriipSettlementChallengeByTrade.proposalDisqualificationCandidateKind(glob.owner, mocks.address0, 0))
                    .should.equal('trade');
            });
        });

        describe('unchallengeOrderCandidateByTrade()', () => {
            let order, trade, filter;

            beforeEach(async () => {
                await ethersDriipSettlementDisputeByTrade._reset();

                await ethersDriipSettlementChallengeState._setProposalNonce(0);

                order = await mocks.mockOrder(glob.owner);
                trade = await mocks.mockTrade(glob.owner);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByTrade.interface.events['UnchallengeOrderByTradeEvent'].topics
                };
            });

            it('should call challengeByTrade() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallengeByTrade.unchallengeOrderCandidateByTrade(order, trade, {gasLimit: 2e6});

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                (await ethersDriipSettlementDisputeByTrade._unchallengeOrderCandidateByTradeCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('challengeByTrade()', () => {
            let trade, filter;

            beforeEach(async () => {
                await ethersDriipSettlementDisputeByTrade._reset();

                await ethersDriipSettlementChallengeState._setProposalNonce(0);

                trade = await mocks.mockTrade(glob.owner);

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByTrade.interface.events['ChallengeByTradeEvent'].topics
                };
            });

            it('should call challengeByTrade() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallengeByTrade.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 2e6});

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                (await ethersDriipSettlementDisputeByTrade._challengeByTradeCount())
                    ._bn.should.eq.BN(1);
            });
        });
    });
};
