const chai = require('chai');
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const {Wallet, Contract, utils} = require('ethers');
const mocks = require('../mocks');
const MockedFraudChallenge = artifacts.require("MockedFraudChallenge");
const MockedConfiguration = artifacts.require("MockedConfiguration");
const MockedValidator = artifacts.require("MockedValidator");
const MockedClientFund = artifacts.require("MockedClientFund");
const MockedSecurityBond = artifacts.require("MockedSecurityBond");

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

let provider;

module.exports = (glob) => {
    describe('FraudChallengeByPayment', () => {
        let web3FraudChallengeByPayment, ethersFraudChallengeByPayment;
        let web3FraudChallenge, ethersFraudChallenge;
        let web3Configuration, ethersConfiguration;
        let web3ClientFund, ethersClientFund;
        let web3SecurityBond, ethersSecurityBond;
        let web3Validator, ethersValidator;
        let blockNumber0, blockNumber10, blockNumber20;

        before(async () => {
            provider = glob.signer_owner.provider;

            web3FraudChallengeByPayment = glob.web3FraudChallengeByPayment;
            ethersFraudChallengeByPayment = glob.ethersIoFraudChallengeByPayment;

            web3FraudChallenge = await MockedFraudChallenge.new(glob.owner);
            ethersFraudChallenge = new Contract(web3FraudChallenge.address, MockedFraudChallenge.abi, glob.signer_owner);
            web3Configuration = await MockedConfiguration.new(glob.owner);
            ethersConfiguration = new Contract(web3Configuration.address, MockedConfiguration.abi, glob.signer_owner);
            web3Validator = await MockedValidator.new(glob.owner);
            ethersValidator = new Contract(web3Validator.address, MockedValidator.abi, glob.signer_owner);
            web3SecurityBond = await MockedSecurityBond.new(/*glob.owner*/);
            ethersSecurityBond = new Contract(web3SecurityBond.address, MockedSecurityBond.abi, glob.signer_owner);
            web3ClientFund = await MockedClientFund.new(/*glob.owner*/);
            ethersClientFund = new Contract(web3ClientFund.address, MockedClientFund.abi, glob.signer_owner);

            await ethersFraudChallengeByPayment.changeFraudChallenge(ethersFraudChallenge.address);
            await ethersFraudChallengeByPayment.changeConfiguration(ethersConfiguration.address);
            await ethersFraudChallengeByPayment.changeValidator(ethersValidator.address);
            await ethersFraudChallengeByPayment.changeSecurityBond(ethersSecurityBond.address);
            await ethersFraudChallengeByPayment.changeClientFund(ethersClientFund.address);

            await ethersConfiguration.registerService(ethersFraudChallengeByPayment.address, 'OperationalMode');
        });

        beforeEach(async () => {
            blockNumber0 = await provider.getBlockNumber();
            blockNumber10 = blockNumber0 + 10;
            blockNumber20 = blockNumber0 + 20;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3FraudChallengeByPayment.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized', async () => {
                const owner = await ethersFraudChallengeByPayment.owner();
                owner.should.equal(utils.getAddress(glob.owner));
            });
        });

        describe('changeOwner()', () => {
            describe('if called with (current) owner as sender', () => {
                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeOwnerEvent');
                    const owner = await web3FraudChallengeByPayment.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not (current) owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('fraudChallenge()', () => {
            it('should equal value initialized', async () => {
                const fraudChallenge = await ethersFraudChallengeByPayment.fraudChallenge();
                fraudChallenge.should.equal(utils.getAddress(ethersFraudChallenge.address));
            });
        });

        describe('changeFraudChallenge()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let fraudChallenge;

                beforeEach(async () => {
                    fraudChallenge = await web3FraudChallengeByPayment.fraudChallenge.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeFraudChallenge(fraudChallenge);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeFraudChallenge(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeFraudChallengeEvent');
                    const fraudChallenge = await web3FraudChallengeByPayment.fraudChallenge();
                    utils.getAddress(fraudChallenge).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeFraudChallenge(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersFraudChallengeByPayment.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            });
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3FraudChallengeByPayment.configuration.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3FraudChallengeByPayment.configuration();
                    utils.getAddress(configuration).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('validator()', () => {
            it('should equal value initialized', async () => {
                const validator = await ethersFraudChallengeByPayment.validator();
                validator.should.equal(utils.getAddress(ethersValidator.address));
            });
        });

        describe('changeValidator()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let validator;

                beforeEach(async () => {
                    validator = await web3FraudChallengeByPayment.validator.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeValidator(validator);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeValidator(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeValidatorEvent');
                    const validator = await web3FraudChallengeByPayment.validator();
                    utils.getAddress(validator).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeValidator(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('securityBond()', () => {
            it('should equal value initialized', async () => {
                const securityBond = await ethersFraudChallengeByPayment.securityBond();
                securityBond.should.equal(utils.getAddress(ethersSecurityBond.address));
            });
        });

        describe('changeSecurityBond()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let securityBond;

                beforeEach(async () => {
                    securityBond = await web3FraudChallengeByPayment.securityBond.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeSecurityBond(securityBond);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeSecurityBond(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeSecurityBondEvent');
                    const securityBond = await web3FraudChallengeByPayment.securityBond();
                    utils.getAddress(securityBond).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeSecurityBond(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('clientFund()', () => {
            it('should equal value initialized', async () => {
                const clientFund = await ethersFraudChallengeByPayment.clientFund();
                clientFund.should.equal(utils.getAddress(ethersClientFund.address));
            });
        });

        describe('changeClientFund()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let clientFund;

                beforeEach(async () => {
                    clientFund = await web3FraudChallengeByPayment.clientFund.call();
                });

                afterEach(async () => {
                    await web3FraudChallengeByPayment.changeClientFund(clientFund);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3FraudChallengeByPayment.changeClientFund(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeClientFundEvent');
                    const clientFund = await web3FraudChallengeByPayment.clientFund();
                    utils.getAddress(clientFund).should.equal(address);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3FraudChallengeByPayment.changeClientFund(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('challengeByPayment()', () => {
            let payment, overrideOptions, filter;

            before(async () => {
                overrideOptions = {gasLimit: 2e6};
                await ethersConfiguration.setFalseWalletSignatureStake(mocks.address0, utils.bigNumberify(1000));
            });

            beforeEach(async () => {
                await ethersFraudChallenge.reset(overrideOptions);
                await ethersConfiguration.reset(overrideOptions);
                await ethersValidator.reset(overrideOptions);
                await ethersClientFund.reset(overrideOptions);
                await ethersSecurityBond.reset(overrideOptions);

                filter = await fromBlockTopicsFilter(
                    ...ethersFraudChallengeByPayment.interface.events.ChallengeByPaymentEvent.topics
                );
            });

            describe('if payment is genuine', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challengeByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not sealed by exchange', () => {
                beforeEach(async () => {
                    ethersValidator.setGenuinePaymentExchangeSeal(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challengeByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment is not properly hashed by wallet', () => {
                beforeEach(async () => {
                    ethersValidator.setGenuinePaymentWalletHash(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should revert', async () => {
                    return ethersFraudChallengeByPayment.challengeByPayment(payment, overrideOptions).should.be.rejected;
                });
            });

            describe('if payment wallet signature is fraudulent', () => {
                beforeEach(async () => {
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                    payment.seals.wallet.signature = await mocks.createWeb3Signer(glob.user_a)(payment.seals.wallet.hash);
                    payment.seals.exchange.hash = mocks.hashPaymentAsExchange(payment);
                    payment.seals.exchange.signature = await mocks.createWeb3Signer(glob.owner)(payment.seals.exchange.hash);
                });

                it('should set operational mode exit, store fraudulent payment and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentsCount, stagesCount, stage, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersSecurityBond.stagesCount(),
                        ethersSecurityBond.stages(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    stagesCount.eq(1).should.be.true;
                    stage.wallet.should.equal(utils.getAddress(glob.owner));
                    stage.currency.should.equal(mocks.address0);
                    stage.amount.eq(utils.bigNumberify(1000)).should.be.true;
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment fee is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentFee(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentsCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(payment.sender.wallet);
                    seizure.source.should.equal(payment.sender.wallet);
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment sender is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentSender(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and seize buyer\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentsCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(payment.sender.wallet);
                    seizure.source.should.equal(payment.sender.wallet);
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });

            describe('if payment recipient is fraudulent', () => {
                beforeEach(async () => {
                    await ethersValidator.setGenuinePaymentRecipient(false);
                    payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
                });

                it('should set operational mode exit, store fraudulent payment and seize seller\'s funds', async () => {
                    await ethersFraudChallengeByPayment.challengeByPayment(payment, overrideOptions);
                    const [operationalModeExit, fraudulentPaymentsCount, seizedWalletsCount, seizedWallet, seizure, logs] = await Promise.all([
                        ethersConfiguration.isOperationalModeExit(),
                        ethersFraudChallenge.fraudulentPaymentsCount(),
                        ethersFraudChallenge.seizedWalletsCount(),
                        ethersFraudChallenge.seizedWallets(utils.bigNumberify(0)),
                        ethersClientFund.seizures(utils.bigNumberify(0)),
                        provider.getLogs(filter)
                    ]);
                    operationalModeExit.should.be.true;
                    fraudulentPaymentsCount.eq(1).should.be.true;
                    seizedWalletsCount.eq(1).should.be.true;
                    seizedWallet.should.equal(payment.recipient.wallet);
                    seizure.source.should.equal(payment.recipient.wallet);
                    seizure.destination.should.equal(utils.getAddress(glob.owner));
                    logs.should.have.lengthOf(1);
                });
            });
        });

        // describe('challengeByPayment()', () => {
        //     let payment, overrideOptions, topic, filter;
        //
        //     before(async () => {
        //         overrideOptions = {gasLimit: 1e6};
        //     });
        //
        //     beforeEach(async () => {
        //         await ethersClientFund.reset(overrideOptions);
        //
        //         await ethersConfiguration.setPaymentFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.002', 18), [], [], overrideOptions);
        //         await ethersConfiguration.setPaymentMinimumFee(utils.bigNumberify(blockNumber10), utils.parseUnits('0.0002', 18), overrideOptions);
        //         await ethersConfiguration.setFalseWalletSignatureStake(mocks.address0, utils.parseUnits('100', 18));
        //
        //         topic = ethersFraudChallenge.interface.events.ChallengeByPaymentEvent.topics[0];
        //         filter = {
        //             fromBlock: blockNumber0,
        //             topics: [topic]
        //         };
        //     });
        //
        //     describe('if payment it genuine', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if wallet hash differs from calculated', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             payment.seals.wallet.hash = utils.id('some non-existent hash');
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if exchange hash differs from calculated', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             payment.seals.exchange.hash = utils.id('some non-existent hash');
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if not signed by exchange', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             payment.seals.exchange.signature = payment.seals.wallet.signature;
        //         });
        //
        //         it('should revert', async () => {
        //             ethersFraudChallenge.challengeByPayment(payment, overrideOptions).should.be.rejected;
        //         });
        //     });
        //
        //     describe('if not signed by wallet', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {blockNumber: utils.bigNumberify(blockNumber10)});
        //             const signAsWallet = mocks.createWeb3Signer(glob.user_a);
        //             payment.seals.wallet.signature = await signAsWallet(payment.seals.wallet.hash);
        //             payment.seals.exchange.hash = mocks.hashPaymentAsExchange(payment);
        //             const signAsExchange = mocks.createWeb3Signer(glob.owner);
        //             payment.seals.exchange.signature = await signAsExchange(payment.seals.exchange.hash);
        //         });
        //
        //         it('should record fraudulent payment, toggle operational mode and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if sender address equals recipient address', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 sender: {wallet: glob.user_a},
        //                 recipient: {wallet: glob.user_a},
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.seizures(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.destination.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if sender\'s current balance field differs from calculated', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 sender: {
        //                     balances: {
        //                         current: utils.bigNumberify(0)
        //                     }
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.seizures(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.destination.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (sender\'s) payment fee is greater than the nominal payment fee', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 singleFee: utils.parseUnits('2.0', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.seizures(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.destination.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (sender\'s) payment fee is different than provided by Configuration contract', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 singleFee: utils.parseUnits('0.2', 18).mul(utils.bigNumberify(90)).div(utils.bigNumberify(100)),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.seizures(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.destination.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if (sender\'s) payment fee is smaller than the minimum payment fee', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 singleFee: utils.parseUnits('0.002', 18),
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.sender.wallet),
        //                 ethersClientFund.seizures(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.sender.wallet));
        //             seizure.destination.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        //
        //     describe('if recipient\'s current balance field differs from calculated', () => {
        //         beforeEach(async () => {
        //             payment = await mocks.mockPayment(glob.owner, {
        //                 recipient: {
        //                     balances: {
        //                         current: utils.bigNumberify(0)
        //                     }
        //                 },
        //                 blockNumber: utils.bigNumberify(blockNumber10)
        //             });
        //         });
        //
        //         it('should toggle operational mode, record fraudulent payment, seize wallet and emit event', async () => {
        //             await ethersFraudChallenge.challengeByPayment(payment, overrideOptions);
        //             const [operationalModeExit, fraudulentPayment, seizedSender, seizure, logs] = await Promise.all([
        //                 ethersConfiguration.isOperationalModeExit(),
        //                 ethersFraudChallenge.fraudulentPayment(),
        //                 ethersFraudChallenge.isSeizedWallet(payment.recipient.wallet),
        //                 ethersClientFund.seizures(0),
        //                 provider.getLogs(filter)
        //             ]);
        //             operationalModeExit.should.be.true;
        //             fraudulentPayment[0].toNumber().should.equal(payment.nonce.toNumber());
        //             seizedSender.should.be.true;
        //             seizure.source.should.equal(utils.getAddress(payment.recipient.wallet));
        //             seizure.destination.should.equal(utils.getAddress(glob.owner));
        //             logs[logs.length - 1].topics[0].should.equal(topic);
        //         });
        //     });
        // });

    });
};

const fromBlockTopicsFilter = async (...topics) => {
    return {
        fromBlock: await provider.getBlockNumber(),
        topics
    };
};

