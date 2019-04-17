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
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedValidator = artifacts.require('MockedValidator');
const MockedWalletLocker = artifacts.require('MockedWalletLocker');

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
        let web3DriipSettlementDisputeByTrade, ethersDriipSettlementDisputeByTrade;
        let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
        let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
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
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner, web3SignerManager.address);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3WalletLocker = await MockedWalletLocker.new();
            ethersWalletLocker = new Contract(web3WalletLocker.address, MockedWalletLocker.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3DriipSettlementChallengeByTrade = await DriipSettlementChallengeByTrade.new(glob.owner);
            ethersDriipSettlementChallengeByTrade = new Contract(web3DriipSettlementChallengeByTrade.address, DriipSettlementChallengeByTrade.abi, glob.signer_owner);

            await ethersDriipSettlementChallengeByTrade.setConfiguration(ethersConfiguration.address);
            await ethersDriipSettlementChallengeByTrade.setValidator(ethersValidator.address);
            await ethersDriipSettlementChallengeByTrade.setWalletLocker(ethersWalletLocker.address);
            await ethersDriipSettlementChallengeByTrade.setDriipSettlementDisputeByTrade(ethersDriipSettlementDisputeByTrade.address);
            await ethersDriipSettlementChallengeByTrade.setDriipSettlementChallengeState(ethersDriipSettlementChallengeState.address);
            await ethersDriipSettlementChallengeByTrade.setNullSettlementChallengeState(ethersNullSettlementChallengeState.address);

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

        describe('startChallengeFromTrade()', () => {
            let trade;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

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

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByTrade.interface.events['StartChallengeFromTradeEvent'].topics
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallengeByTrade.startChallengeFromTrade(
                        trade, trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current,
                        {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const intendedProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.amounts.targetBalance._bn.should.eq.BN(0);
                    intendedProposal.currency.ct.should.equal(trade.currencies.intended.ct);
                    intendedProposal.currency.id._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    intendedProposal.walletInitiated.should.be.true;
                    intendedProposal.challenged.hash.should.equal(trade.seal.hash);
                    intendedProposal.challenged.kind.should.equal('trade');

                    const conjugateProposal = await ethersDriipSettlementChallengeState._proposals(1);
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.amounts.targetBalance._bn.should.eq.BN(0);
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
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});
                await ethersNullSettlementChallengeState._reset({gasLimit: 1e6});

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

            describe('if within operational constraints', () => {
                let filter;

                beforeEach(async () => {
                    filter = {
                        fromBlock: await provider.getBlockNumber(),
                        topics: ethersDriipSettlementChallengeByTrade.interface.events['StartChallengeFromTradeByProxyEvent'].topics
                    };
                });

                it('should start challenge successfully', async () => {
                    await ethersDriipSettlementChallengeByTrade.startChallengeFromTradeByProxy(
                        trade.buyer.wallet, trade, trade.buyer.balances.intended.current,
                        trade.buyer.balances.conjugate.current, {gasLimit: 3e6}
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    const intendedProposal = await ethersDriipSettlementChallengeState._proposals(0);
                    intendedProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    intendedProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.intended.current._bn);
                    intendedProposal.amounts.targetBalance._bn.should.eq.BN(0);
                    intendedProposal.currency.ct.should.equal(trade.currencies.intended.ct);
                    intendedProposal.currency.id._bn.should.eq.BN(trade.currencies.intended.id._bn);
                    intendedProposal.referenceBlockNumber._bn.should.eq.BN(trade.blockNumber._bn);
                    intendedProposal.nonce._bn.should.eq.BN(trade.buyer.nonce._bn);
                    intendedProposal.walletInitiated.should.be.false;
                    intendedProposal.challenged.hash.should.equal(trade.seal.hash);
                    intendedProposal.challenged.kind.should.equal('trade');

                    const conjugateProposal = await ethersDriipSettlementChallengeState._proposals(1);
                    conjugateProposal.wallet.should.equal(utils.getAddress(trade.buyer.wallet));
                    conjugateProposal.amounts.stage._bn.should.eq.BN(trade.buyer.balances.conjugate.current._bn);
                    conjugateProposal.amounts.targetBalance._bn.should.eq.BN(0);
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

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByTrade.interface.events['StopChallengeEvent'].topics
                };
            });

            it('should stop challenge successfully', async () => {
                await ethersDriipSettlementChallengeByTrade.stopChallenge(
                    mocks.address1, 10, {gasLimit: 1e6}
                );

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                proposal.wallet.should.equal(utils.getAddress(glob.owner));
                proposal.currency.ct.should.equal(mocks.address1);
                proposal.currency.id._bn.should.eq.BN(10);
                proposal.walletInitiated.should.be.true;
                proposal.terminated.should.be.true;
            });
        });

        describe('stopChallengeByProxy()', () => {
            let filter;

            beforeEach(async () => {
                await ethersValidator._reset({gasLimit: 4e6});
                await ethersWalletLocker._reset();
                await ethersDriipSettlementChallengeState._reset({gasLimit: 1e6});

                filter = {
                    fromBlock: await provider.getBlockNumber(),
                    topics: ethersDriipSettlementChallengeByTrade.interface.events['StopChallengeByProxyEvent'].topics
                };
            });

            it('should stop challenge successfully', async () => {
                await ethersDriipSettlementChallengeByTrade.stopChallengeByProxy(
                    glob.user_a, mocks.address1, 10, {gasLimit: 1e6}
                );

                const logs = await provider.getLogs(filter);
                logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                const proposal = await ethersDriipSettlementChallengeState._proposals(0);
                proposal.wallet.should.equal(utils.getAddress(glob.user_a));
                proposal.currency.ct.should.equal(mocks.address1);
                proposal.currency.id._bn.should.eq.BN(10);
                proposal.walletInitiated.should.be.false;
                proposal.terminated.should.be.true;
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

        describe('challengeByOrder()', () => {
            let order;

            before(async () => {
                await ethersDriipSettlementDisputeByTrade._reset();
                order = await mocks.mockOrder(glob.owner);
            });

            it('should call challengeByOrder() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallengeByTrade.challengeByOrder(order);

                (await ethersDriipSettlementDisputeByTrade._challengeByOrderCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('unchallengeOrderCandidateByTrade()', () => {
            let order, trade;

            before(async () => {
                await ethersDriipSettlementDisputeByTrade._reset();
                order = await mocks.mockOrder(glob.owner);
                trade = await mocks.mockTrade(glob.owner);
            });

            it('should call challengeByTrade() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallengeByTrade.unchallengeOrderCandidateByTrade(order, trade, {gasLimit: 2e6});

                (await ethersDriipSettlementDisputeByTrade._unchallengeOrderCandidateByTradeCount())
                    ._bn.should.eq.BN(1);
            });
        });

        describe('challengeByTrade()', () => {
            let trade;

            before(async () => {
                await ethersDriipSettlementDisputeByTrade._reset();
                trade = await mocks.mockTrade(glob.owner);
            });

            it('should call challengeByTrade() of its settlement challenge dispute instance', async () => {
                await ethersDriipSettlementChallengeByTrade.challengeByTrade(trade.buyer.wallet, trade, {gasLimit: 2e6});

                (await ethersDriipSettlementDisputeByTrade._challengeByTradeCount())
                    ._bn.should.eq.BN(1);
            });
        });
    });
};
