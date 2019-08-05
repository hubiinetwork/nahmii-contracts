const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract, utils} = require('ethers');
const address0 = require('../mocks').address0;
const setTimeoutPromise = require('util').promisify(setTimeout);

chai.use(chaiAsPromised);
chai.should();

const Servable = artifacts.require('TestServable');

module.exports = (glob) => {
    describe('Servable', () => {
        let web3Servable, ethersServable;

        beforeEach(async () => {
            web3Servable = await Servable.new(glob.owner);
            ethersServable = new Contract(web3Servable.address, Servable.abi, glob.signer_owner);
        });
        
        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3Servable.deployer.call()).should.equal(glob.owner);
                (await web3Servable.operator.call()).should.equal(glob.owner);
            });
        });

        describe('serviceActivationTimeout()', () => {
            it('should equal value initialized', async () => {
                const timeout = await ethersServable.serviceActivationTimeout();
                timeout.eq(0).should.be.true;
            });
        });

        describe('setServiceActivationTimeout()', () => {
            it('should equal value initialized', async () => {
                const timeout = utils.bigNumberify(3600);
                await ethersServable.setServiceActivationTimeout(timeout);
                const result = await ethersServable.serviceActivationTimeout();
                result.eq(timeout).should.be.true;
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Servable.serviceActivationTimeout(0, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('isRegisteredService()', () => {
            it('should equal value initialized', async () => {
                const registered = await ethersServable.isRegisteredService(Wallet.createRandom().address);
                registered.should.be.false;
            });
        });

        describe('isRegisteredActiveService()', () => {
            it('should equal value initialized', async () => {
                const registeredActive = await ethersServable.isRegisteredActiveService(Wallet.createRandom().address);
                registeredActive.should.be.false;
            });
        });

        describe('registerService()', () => {
            let address;

            beforeEach(() => {
                address = Wallet.createRandom().address;
            });

            it('should register service contract and emit event', async () => {
                const result = await web3Servable.registerService(address);
                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('RegisterServiceEvent');
                const registered = await ethersServable.isRegisteredService(address);
                registered.should.be.true;
                const registeredActive = await ethersServable.isRegisteredActiveService(address);
                registeredActive.should.be.true;
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Servable.registerService(address, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3Servable.registerService(address0).should.be.rejected;
                });
            });

            describe('if called with address of self', () => {
                it('should revert', async () => {
                    web3Servable.registerService(web3Servable.address).should.be.rejected;
                });
            });
        });

        describe('registerServiceDeferred()', () => {
            let address;

            beforeEach(async () => {
                address = Wallet.createRandom().address;
                await ethersServable.setServiceActivationTimeout(utils.bigNumberify(3));
            });

            it('should register service contract and emit event', async () => {
                const result = await web3Servable.registerServiceDeferred(address);
                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('RegisterServiceDeferredEvent');
                const registered = await ethersServable.isRegisteredService(address);
                registered.should.be.true;
                let registeredActive = await ethersServable.isRegisteredActiveService(address);
                registeredActive.should.be.false;
                await setTimeoutPromise(4000);
                registeredActive = await ethersServable.isRegisteredActiveService(address);
                registeredActive.should.be.true;
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Servable.registerServiceDeferred(address, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3Servable.registerServiceDeferred(address0).should.be.rejected;
                });
            });

            describe('if called with address of self', () => {
                it('should revert', async () => {
                    web3Servable.registerServiceDeferred(web3Servable.address).should.be.rejected;
                });
            });
        });

        describe('deregisterService()', () => {
            let address;

            beforeEach(async () => {
                address = Wallet.createRandom().address;
                await ethersServable.registerService(address);
            });

            it('should deregister registered service contract', async () => {
                await ethersServable.deregisterService(address);
                const registered = await ethersServable.isRegisteredService(address);
                registered.should.be.false;
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Servable.deregisterService(address, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    ethersServable.deregisterService(address0).should.be.rejected;
                });
            });

            describe('if called with address of self', () => {
                it('should revert', async () => {
                    ethersServable.deregisterService(web3Servable.address).should.be.rejected;
                });
            });

            describe('if service contract is not registered', () => {
                it('should revert', async () => {
                    ethersServable.deregisterService(Wallet.createRandom().address).should.be.rejected;
                });
            });
        });

        describe('isEnabledServiceAction()', () => {
            it('should equal value initialized', async () => {
                const registered = await ethersServable.isEnabledServiceAction(Wallet.createRandom().address, 'some_action');
                registered.should.be.false;
            });
        });

        describe('enableServiceAction()', () => {
            let address, overrideOptions;

            beforeEach(async () => {
                address = Wallet.createRandom().address;
                overrideOptions = {gasLimit: 2e6};
                await ethersServable.registerService(address);
            });

            it('should enable service action and emit event', async () => {
                const result = await web3Servable.enableServiceAction(address, 'some_action', overrideOptions);
                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('EnableServiceActionEvent');
                const enabled = await ethersServable.isEnabledServiceAction(address, 'some_action');
                enabled.should.be.true;
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Servable.enableServiceAction(address, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    ethersServable.enableServiceAction(address0, 'some_action').should.be.rejected;
                });
            });

            describe('if called with address of self', () => {
                it('should revert', async () => {
                    ethersServable.enableServiceAction(web3Servable.address, 'some_action').should.be.rejected;
                });
            });

            describe('if called with service contract that is not registered', () => {
                it('should revert', async () => {
                    ethersServable.enableServiceAction(Wallet.createRandom().address, 'some_action').should.be.rejected;
                });
            });

            describe('if called with service contract action that is already enabled', () => {
                beforeEach(async () => {
                    await ethersServable.enableServiceAction(address, 'some_action', overrideOptions);
                });

                it('should revert', async () => {
                    ethersServable.enableServiceAction(address, 'some_action', overrideOptions).should.be.rejected;
                });
            });
        });

        describe('disableServiceAction()', () => {
            let address, overrideOptions;

            beforeEach(async () => {
                address = Wallet.createRandom().address;
                overrideOptions = {gasLimit: 2e6};
                await ethersServable.registerService(address);
                await ethersServable.enableServiceAction(address, 'some_action', overrideOptions)
            });

            it('should disable service action and emit event', async () => {
                const result = await web3Servable.disableServiceAction(address, 'some_action', overrideOptions);
                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('DisableServiceActionEvent');
                const enabled = await ethersServable.isEnabledServiceAction(address, 'some_action');
                enabled.should.be.false;
            });

            describe('if called with sender that is not owner', () => {
                it('should revert', async () => {
                    web3Servable.disableServiceAction(address, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    ethersServable.disableServiceAction(address0, 'some_action').should.be.rejected;
                });
            });

            describe('if called with address of self', () => {
                it('should revert', async () => {
                    ethersServable.disableServiceAction(web3Servable.address, 'some_action').should.be.rejected;
                });
            });

            describe('if called with service contract action that is already disabled', () => {
                beforeEach(async () => {
                    await ethersServable.disableServiceAction(address, 'some_action', overrideOptions);
                });

                it('should revert', async () => {
                    ethersServable.disableServiceAction(address, 'some_action', overrideOptions).should.be.rejected;
                });
            });
        });
    });
};
