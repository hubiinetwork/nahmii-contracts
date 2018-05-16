const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const ethers = require('ethers');
const ethutil = require('ethereumjs-util');
const keccak256 = require("augmented-keccak256");
const Exchange = artifacts.require("Exchange");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

const utils = ethers.utils;

const liquidityRoles = ['Maker', 'Taker'];
const intentions = ['Buy', 'Sell'];
const challengePhases = ['Dispute', 'Closed'];

module.exports = (glob) => {
    describe('Exchange', () => {
        let truffleExchange, ethersExchange;
        let truffleConfiguration, ethersConfiguration;
        let truffleRevenueFund, ethersRevenueFund;
        let provider;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            truffleExchange = glob.web3Exchange;
            ethersExchange = glob.ethersIoExchange;
            truffleConfiguration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;
            truffleRevenueFund = glob.web3RevenueFund;
            ethersRevenueFund = glob.ethersIoRevenueFund;

            provider = glob.signer_owner.provider;

            await ethersExchange.changeConfiguration(ethersConfiguration.address);
            await ethersExchange.changeRevenueFund(ethersRevenueFund.address);
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await truffleExchange.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await truffleExchange.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleExchange.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await truffleExchange.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    truffleExchange.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersExchange.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await truffleExchange.configuration.call();
                });

                afterEach(async () => {
                    await truffleExchange.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleExchange.changeConfiguration('0x0123456789abcdef0123456789abcdef01234567');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await truffleExchange.configuration();
                    configuration.should.equal('0x0123456789abcdef0123456789abcdef01234567');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    truffleExchange.changeConfiguration('0x0123456789abcdef0123456789abcdef01234567', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeClientFund()', () => {
            describe('if called with owner as sender', () => {
                let clientFund;

                beforeEach(async () => {
                    clientFund = await truffleExchange.clientFund.call();
                });

                afterEach(async () => {
                    await truffleExchange.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleExchange.changeClientFund('0x0123456789abcdef0123456789abcdef01234567');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await truffleExchange.clientFund();
                    clientFund.should.equal('0x0123456789abcdef0123456789abcdef01234567');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    truffleExchange.changeClientFund('0x0123456789abcdef0123456789abcdef01234567', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeRevenueFund()', () => {
            describe('if called with owner as sender', () => {
                let revenueFund;

                beforeEach(async () => {
                    revenueFund = await truffleExchange.revenueFund.call();
                });

                afterEach(async () => {
                    await truffleExchange.changeRevenueFund(revenueFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleExchange.changeRevenueFund('0x0123456789abcdef0123456789abcdef01234567');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeRevenueFundEvent');
                    const revenueFund = await truffleExchange.revenueFund();
                    revenueFund.should.equal('0x0123456789abcdef0123456789abcdef01234567');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    truffleExchange.changeRevenueFund('0x0123456789abcdef0123456789abcdef01234567', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('changeCommunityVote()', () => {
            describe('if called with owner as sender', () => {
                let communityVote;

                beforeEach(async () => {
                    communityVote = await truffleExchange.communityVote.call();
                });

                afterEach(async () => {
                    await truffleExchange.changeCommunityVote(communityVote);
                });

                it('should set new value and emit event', async () => {
                    const result = await truffleExchange.changeCommunityVote('0x0123456789abcdef0123456789abcdef01234567');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeCommunityVoteEvent');
                    const communityVote = await truffleExchange.communityVote();
                    communityVote.should.equal('0x0123456789abcdef0123456789abcdef01234567');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    truffleExchange.changeCommunityVote('0x0123456789abcdef0123456789abcdef01234567', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('isSeizedWallet()', () => {
            it('should equal value initialized', async () => {
                const result = await ethersExchange.isSeizedWallet(glob.user_a);
                result.should.be.false;
            });
        });

        describe('seizedWalletsCount()', () => {
            it('should equal value initialized', async () => {
                const count = await ethersExchange.seizedWalletsCount();
                count.toNumber().should.equal(0);
            })
        });

        describe('seizedWallets()', () => {
            it('should equal value initialized', async () => {
                ethersExchange.seizedWallets(0).should.be.rejected;
            })
        });

        // TODO Complete: topic/event in logs
        describe('settleDealAsTrade()', () => {
            let trade, overrideOptions, topic, filter;

            beforeEach(async () => {
                overrideOptions = {gasLimit: 2e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setTradeMakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.001', 18), [], [], overrideOptions);
                await ethersConfiguration.setTradeMakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0001', 18), overrideOptions);
                await ethersConfiguration.setTradeTakerFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [1], [utils.parseUnits('0.1', 18)], overrideOptions);
                await ethersConfiguration.setTradeTakerMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);

                trade = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    rate: utils.bigNumberify(1000),
                    currencies: {
                        intended: '0x0000000000000000000000000000000000000001',
                        conjugate: '0x0000000000000000000000000000000000000002'
                    },
                    buyer: {
                        _address: glob.user_a,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Maker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party buy order hash'),
                                exchange: hashString('some exchange buy order hash')
                            },
                            residuals: {
                                current: utils.parseUnits('400', 18),
                                previous: utils.parseUnits('500', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('9599.8', 18),
                                previous: utils.parseUnits('9499.9', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('9.4', 18),
                                previous: utils.parseUnits('9.5', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.2', 18),
                            conjugate: utils.parseUnits('0.0', 18)
                        }
                    },
                    seller: {
                        _address: glob.user_b,
                        nonce: utils.bigNumberify(1),
                        rollingVolume: utils.bigNumberify(0),
                        liquidityRole: liquidityRoles.indexOf('Taker'),
                        order: {
                            amount: utils.parseUnits('100', 18),
                            hashes: {
                                party: hashString('some party sell order hash'),
                                exchange: hashString('some exchange sell order hash')
                            },
                            residuals: {
                                current: utils.parseUnits('600', 18),
                                previous: utils.parseUnits('700', 18)
                            }
                        },
                        balances: {
                            intended: {
                                current: utils.parseUnits('19500', 18),
                                previous: utils.parseUnits('19600', 18)
                            },
                            conjugate: {
                                current: utils.parseUnits('19.4996', 18),
                                previous: utils.parseUnits('19.5998', 18)
                            }
                        },
                        netFees: {
                            intended: utils.parseUnits('0.0', 18),
                            conjugate: utils.parseUnits('0.0004', 18)
                        }
                    },
                    transfers: {
                        intended: {
                            single: utils.parseUnits('100', 18),
                            net: utils.parseUnits('200', 18)
                        },
                        conjugate: {
                            single: utils.parseUnits('0.1', 18),
                            net: utils.parseUnits('0.2', 18)
                        }
                    },
                    singleFees: {
                        intended: utils.parseUnits('0.1', 18),
                        conjugate: utils.parseUnits('0.0002', 18)
                    },
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                trade = await augmentTradeSeal(trade, glob.owner);

                topic = ethersExchange.interface.events.SettleDealAsTradeEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if isImmediateSettlement is true', () => {
                it('should settle both trade parties', async () => {
                    await ethersExchange.settleDealAsTrade(trade, glob.user_a, overrideOptions);
                });
            });

            describe('if isImmediateSettlement is false', () => {
                beforeEach(() => {
                    trade.immediateSettlement = false;
                });

                describe('if reserve fund does not support settlement', () => {
                    it('should settle both trade parties', async () => {
                        await ethersExchange.settleDealAsTrade(trade, glob.user_a, overrideOptions);
                    });
                });

                describe('if reserve fund does support settlement', () => {
                    it('should settle only provided party', async () => {
                        await ethersExchange.settleDealAsTrade(trade, glob.user_a, overrideOptions);
                    });
                });
            });
        });

        // TODO Complete: topic/event in logs
        describe('settleDealAsPayment()', () => {
            let payment, overrideOptions, topic, filter;

            before(async () => {
                overrideOptions = {gasLimit: 1e6};
            });

            beforeEach(async () => {
                await ethersConfiguration.setPaymentFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [], [], overrideOptions);
                await ethersConfiguration.setPaymentMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);

                payment = {
                    nonce: utils.bigNumberify(1),
                    immediateSettlement: true,
                    amount: utils.parseUnits('100', 18),
                    currency: '0x0000000000000000000000000000000000000001',
                    source: {
                        _address: glob.user_c,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('9399.8', 18),
                            previous: utils.parseUnits('9500', 18)
                        },
                        netFee: utils.parseUnits('0.2', 18)
                    },
                    destination: {
                        _address: glob.user_d,
                        nonce: utils.bigNumberify(1),
                        balances: {
                            current: utils.parseUnits('19700', 18),
                            previous: utils.parseUnits('19600', 18)
                        },
                        netFee: utils.parseUnits('0.0', 18)
                    },
                    transfers: {
                        single: utils.parseUnits('100', 18),
                        net: utils.parseUnits('100', 18)
                    },
                    singleFee: utils.parseUnits('0.2', 18),
                    blockNumber: utils.bigNumberify(blockNumber10)
                };

                payment = await augmentPaymentSeals(payment, glob.user_c, glob.owner);

                topic = ethersExchange.interface.events.ChallengeFraudulentDealByPaymentEvent.topics[0];
                filter = {
                    fromBlock: blockNumber0,
                    topics: [topic]
                };
            });

            describe('if isImmediateSettlement is true', () => {
                it('should settle both payment parties', async () => {
                    await ethersExchange.settleDealAsPayment(payment, glob.user_a, overrideOptions);
                });
            });

            describe('if isImmediateSettlement is false', () => {
                beforeEach(() => {
                    payment.immediateSettlement = false;
                });

                describe('if reserve fund does not support settlement', () => {
                    it('should settle both payment parties', async () => {
                        await ethersExchange.settleDealAsPayment(payment, glob.user_a, overrideOptions);
                    });
                });

                describe('if reserve fund does support settlement', () => {
                    it('should settle only provided party', async () => {
                        await ethersExchange.settleDealAsPayment(payment, glob.user_a, overrideOptions);
                    });
                });
            });
        });
    });
};

const augmentTradeSeal = async (trade, address) => {
    const hash = hashTrade(trade);
    trade.seal = {
        hash: hash,
        signature: await sign(address, hash)
    };
    return trade;
};

const augmentPaymentSeals = async (payment, partyAddress, exchangeAddress) => {
    const partyHash = hashPaymentAsParty(payment);
    payment.seals = {
        party: {
            hash: partyHash,
            signature: await sign(partyAddress, partyHash)
        }
    };
    const exchangeHash = hashPaymentAsExchange(payment);
    payment.seals.exchange = {
        hash: exchangeHash,
        signature: await sign(exchangeAddress, exchangeHash)
    };
    return payment;
};

const augmentOrderSeals = async (order, partyAddress, exchangeAddress) => {
    const partyHash = hashOrderAsParty(order);
    order.seals = {
        party: {
            hash: partyHash,
            signature: await sign(partyAddress, partyHash)
        },
    };
    const exchangeHash = hashOrderAsExchange(order);
    order.seals.exchange = {
        hash: exchangeHash,
        signature: await sign(exchangeAddress, exchangeHash)
    };
    return order;
};

const hashTrade = (trade) => {
    return hashString(
        trade.nonce.toNumber()
    );
};

const hashPaymentAsParty = (payment) => {
    return hashString(
        payment.nonce.toNumber()
    );
};

const hashPaymentAsExchange = (payment) => {
    return hashTypedItems(
        {value: toRpcSig(payment.seals.party.signature), type: 'string'}
    );
};

const hashOrderAsParty = (order) => {
    return hashString(
        order.nonce.toNumber()
    );
};

const hashOrderAsExchange = (order) => {
    return hashTypedItems(
        {value: order.placement.residuals.current.toHexString(), type: 'hex'},
        {value: order.placement.residuals.previous.toHexString(), type: 'hex'},
        {value: toRpcSig(order.seals.party.signature), type: 'string'}
    );
};

const hashString = (...data) => {
    const hasher = keccak256.create();
    data.forEach((d) => hasher.update(d));
    return `0x${hasher.digest()}`;
};

const hashTypedItems = (...data) => {
    const hasher = keccak256.create();
    data.forEach((d) => hasher.update(d.value, d.type));
    return `0x${hasher.digest()}`;
};

const sign = async (address, hash) => {
    const sig = await web3.eth.sign(address, hash);
    return fromRpcSig(sig);
};

const fromRpcSig = (sig) => {
    sig = ethutil.fromRpcSig(sig);
    return {
        v: utils.bigNumberify(sig.v),
        r: `0x${sig.r.toString('hex')}`,
        s: `0x${sig.s.toString('hex')}`
    };
};

const toRpcSig = (sig) => {
    return ethutil.toRpcSig(
        sig.v.toNumber(),
        Buffer.from(sig.r.slice(2), 'hex'),
        Buffer.from(sig.s.slice(2), 'hex')
    );
};
