const chai = require('chai');
const {Wallet, utils} = require('ethers');
const mocks = require('../mocks');

chai.should();

module.exports = function (glob) {
    describe('Validator', () => {
        let provider;
        let blockNumberAhead;
        let ethersHasher;
        let web3Configuration, ethersConfiguration;
        let web3Validator, ethersValidator;
        let partsPer;

        before(async () => {
            provider = glob.signer_owner.provider;

            ethersHasher = glob.ethersIoHasher;
            web3Configuration = glob.web3Configuration;
            ethersConfiguration = glob.ethersIoConfiguration;
            web3Validator = glob.web3Validator;
            ethersValidator = glob.ethersIoValidator;

            await ethersValidator.changeConfiguration(ethersConfiguration.address);
            await ethersValidator.changeHasher(ethersHasher.address);

            partsPer = await ethersConfiguration.getPartsPer();
        });

        beforeEach(async () => {
            blockNumberAhead = await provider.getBlockNumber() + 10;
        });

        describe('configuration()', () => {
            it('should equal value initialized', async () => {
                const configuration = await ethersValidator.configuration();
                configuration.should.equal(utils.getAddress(ethersConfiguration.address));
            })
        });

        describe('changeConfiguration()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let configuration;

                beforeEach(async () => {
                    configuration = await web3Validator.configuration.call();
                });

                afterEach(async () => {
                    await web3Validator.changeConfiguration(configuration);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Validator.changeConfiguration(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeConfigurationEvent');
                    const configuration = await web3Validator.configuration();
                    utils.getAddress(configuration).should.equal(utils.getAddress(address));
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Validator.changeConfiguration(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('hasher()', () => {
            it('should equal value initialized', async () => {
                const hasher = await ethersValidator.hasher();
                hasher.should.equal(utils.getAddress(ethersHasher.address));
            })
        });

        describe('changeHasher()', () => {
            let address;

            before(() => {
                address = Wallet.createRandom().address;
            });

            describe('if called with owner as sender', () => {
                let hasher;

                beforeEach(async () => {
                    hasher = await web3Validator.hasher.call();
                });

                afterEach(async () => {
                    await web3Validator.changeHasher(hasher);
                });

                it('should set new value and emit event', async () => {
                    const result = await web3Validator.changeHasher(address);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('ChangeHasherEvent');
                    const hasher = await web3Validator.hasher();
                    utils.getAddress(hasher).should.equal(utils.getAddress(address));
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Validator.changeHasher(address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe.skip('isGenuineTradeMakerFee()', () => {
            let amountIntended, amountConjugate, trade;

            before(() => {
                amountIntended = utils.parseUnits('100', 18);
                amountConjugate = amountIntended.div(utils.bigNumberify(1000));
            });

            beforeEach(async () => {
                await web3Configuration.setTradeMakerFee(blockNumberAhead, 1e15, [0, 10], [1e17, 2e17]);
                await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14);
            });

            describe('if trade maker fee is genuine', () => {
                describe('if maker is buyer', () => {
                    beforeEach(async () => {
                        const fee = await ethersConfiguration.getTradeMakerFee(utils.bigNumberify(blockNumberAhead), utils.bigNumberify(0));
                        trade = await mocks.mockTrade(glob.owner, {
                            singleFees: {
                                intended: amountIntended.mul(fee).div(partsPer)
                            },
                            blockNumber: utils.bigNumberify(blockNumberAhead)
                        });
                    });

                    it('should successfully validate', async () => {
                        const result = await ethersValidator.isGenuineTradeMakerFee(trade);
                        result.should.be.true;
                    });
                });

                describe('if maker is seller', () => {
                    beforeEach(async () => {
                        const fee = await ethersConfiguration.getTradeMakerFee(utils.bigNumberify(blockNumberAhead), utils.bigNumberify(0));
                        trade = await mocks.mockTrade(glob.owner, {
                            buyer: {
                                liquidityRole: mocks.liquidityRoles.indexOf('Taker')
                            },
                            seller: {
                                liquidityRole: mocks.liquidityRoles.indexOf('Maker')
                            },
                            singleFees: {
                                conjugate: amountConjugate.mul(fee).div(partsPer)
                            },
                            blockNumber: utils.bigNumberify(blockNumberAhead)
                        });
                    });

                    it('should successfully validate', async () => {
                        const result = await ethersValidator.isGenuineTradeMakerFee(trade);
                        result.should.be.true;
                    });
                });
            });
        });
    });
};
