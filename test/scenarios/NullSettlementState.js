const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const BN = require('bn.js');
const bnChai = require('bn-chai');
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const NullSettlementState = artifacts.require('NullSettlementState');
const MockedCommunityVote = artifacts.require('MockedCommunityVote');

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(bnChai(BN));
chai.should();

let provider;

module.exports = (glob) => {
    describe('NullSettlementState', () => {
        let web3NullSettlementState, ethersNullSettlementState;
        let web3CommunityVote, ethersCommunityVote;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3CommunityVote = await MockedCommunityVote.new();
            ethersCommunityVote = new Contract(web3CommunityVote.address, MockedCommunityVote.abi, glob.signer_owner);
        });

        beforeEach(async () => {
            web3NullSettlementState = await NullSettlementState.new(glob.owner);
            ethersNullSettlementState = new Contract(web3NullSettlementState.address, NullSettlementState.abi, glob.signer_owner);

            await ethersNullSettlementState.setCommunityVote(web3CommunityVote.address);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3NullSettlementState.address).should.have.lengthOf(42);
            });
        });

        describe('deployer()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementState.deployer.call()).should.equal(glob.owner);
            });
        });

        describe('setDeployer()', () => {
            describe('if called with (current) deployer as sender', () => {
                afterEach(async () => {
                    await web3NullSettlementState.setDeployer(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementState.setDeployer(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDeployerEvent');

                    (await web3NullSettlementState.deployer.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementState.setDeployer(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('operator()', () => {
            it('should equal value initialized', async () => {
                (await web3NullSettlementState.operator.call()).should.equal(glob.owner);
            });
        });

        describe('setOperator()', () => {
            describe('if called with (current) operator as sender', () => {
                afterEach(async () => {
                    await web3NullSettlementState.setOperator(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementState.setOperator(glob.user_a);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetOperatorEvent');

                    (await web3NullSettlementState.operator.call()).should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) operator', () => {
                it('should revert', async () => {
                    web3NullSettlementState.setOperator(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('communityVote()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementState.communityVote())
                    .should.equal(utils.getAddress(ethersCommunityVote.address));
            });
        });

        describe('setCommunityVote()', () => {
            describe('if called by deployer', () => {
                let address;

                before(() => {
                    address = Wallet.createRandom().address;
                });

                it('should set new value and emit event', async () => {
                    const result = await web3NullSettlementState.setCommunityVote(address);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCommunityVoteEvent');

                    (await ethersNullSettlementState.communityVote())
                        .should.equal(address);
                });
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementState.setCommunityVote(
                        Wallet.createRandom().address, {from: glob.user_a}
                    ).should.be.rejected;
                });
            });
        });

        describe('communityVoteFrozen()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementState.communityVoteFrozen())
                    .should.be.false;
            });
        });

        describe('freezeCommunityVote()', () => {
            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3NullSettlementState.freezeCommunityVote({from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called by deployer', () => {
                let address;

                before(async () => {
                    address = Wallet.createRandom().address;
                });

                it('should disable changing community vote', async () => {
                    await web3NullSettlementState.freezeCommunityVote();
                    web3NullSettlementState.setCommunityVote(address).should.be.rejected;
                });
            });
        });

        describe('maxNullNonce()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementState.maxNullNonce())
                    ._bn.should.eq.BN(0)
            });
        });

        describe('setMaxNullNonce()', () => {
            let filter;

            beforeEach(async () => {
                await ethersNullSettlementState.registerService(glob.owner);

                filter = await fromBlockTopicsFilter(
                    ethersNullSettlementState.interface.events.SetMaxNullNonceEvent.topics
                );
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementState.setMaxNullNonce(10).should.be.rejected
                });
            });

            describe('if called by enabled service action', () => {
                beforeEach(async () => {
                    await ethersNullSettlementState.enableServiceAction(
                        glob.owner, await ethersNullSettlementState.SET_MAX_NULL_NONCE_ACTION(),
                        {gasLimit: 1e6}
                    );
                });

                it('should successfully set the new max null nonce', async () => {
                    await ethersNullSettlementState.setMaxNullNonce(10);

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersNullSettlementState.maxNullNonce())._bn.should.eq.BN(10);
                });
            });
        });

        describe('updateMaxNullNonceFromCommunityVote()', () => {
            let filter;

            beforeEach(async () => {
                ethersCommunityVote._reset();

                filter = await fromBlockTopicsFilter(
                    ethersNullSettlementState.interface.events.UpdateMaxNullNonceFromCommunityVoteEvent.topics
                );
            });

            describe('if community vote returns 0', () => {
                it('should not update max null nonce', async () => {
                    await ethersNullSettlementState.updateMaxNullNonceFromCommunityVote();
                });
            });

            describe('if community vote returns greater than 0', () => {
                beforeEach(async () => {
                    await ethersCommunityVote.setMaxNullNonce(10)
                });

                it('should successfully set the new max null nonce', async () => {
                    await ethersNullSettlementState.updateMaxNullNonceFromCommunityVote();

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersNullSettlementState.maxNullNonce())._bn.should.eq.BN(10);
                });
            });
        });

        describe('maxNonceByWalletAndCurrency()', () => {
            it('should equal value initialized', async () => {
                (await ethersNullSettlementState.maxNonceByWalletAndCurrency(
                    glob.user_a, {ct: mocks.address0, id: 0}
                ))._bn.should.eq.BN(0);
            });
        });

        describe('setMaxNonceByWalletAndCurrency()', () => {
            let filter;

            beforeEach(async () => {
                await ethersNullSettlementState.registerService(glob.owner);

                filter = await fromBlockTopicsFilter(
                    ethersNullSettlementState.interface.events.SetMaxNonceByWalletAndCurrencyEvent.topics
                );
            });

            describe('if called by non-enabled service action', () => {
                it('should revert', async () => {
                    ethersNullSettlementState.setMaxNonceByWalletAndCurrency(
                        glob.user_a, {ct: mocks.address0, id: 0}, 10
                    ).should.be.rejected
                });
            });

            describe('if called by enabled service action', () => {
                beforeEach(async () => {
                    await ethersNullSettlementState.enableServiceAction(
                        glob.owner, await ethersNullSettlementState.SET_MAX_NONCE_ACTION(),
                        {gasLimit: 1e6}
                    );
                });

                it('should successfully set the new max nonce', async () => {
                    await ethersNullSettlementState.setMaxNonceByWalletAndCurrency(
                        glob.user_a, {ct: mocks.address0, id: 0}, 10
                    );

                    const logs = await provider.getLogs(filter);
                    logs[logs.length - 1].topics[0].should.equal(filter.topics[0]);

                    (await ethersNullSettlementState.maxNonceByWalletAndCurrency(
                        glob.user_a, {ct: mocks.address0, id: 0}
                    ))._bn.should.eq.BN(10);
                });
            });
        });
    });
};

const fromBlockTopicsFilter = async (topics) => {
    return {
        fromBlock: await provider.getBlockNumber(),
        topics
    };
};
