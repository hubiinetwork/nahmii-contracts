const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const {Wallet} = require('ethers');
const address0 = require('../mocks').address0;

chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('AuthorizableServable', () => {
        let web3AuthorizableServable, ethersAuthorizableServable;

        before(async () => {
            web3AuthorizableServable = glob.web3AuthorizableServable;
            ethersAuthorizableServable = glob.ethersIoAuthorizableServable;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3AuthorizableServable.deployer.call()).should.equal(glob.owner);
                (await web3AuthorizableServable.operator.call()).should.equal(glob.owner);
            });
        });

        describe('isAuthorizedServiceForWallet()', () => {
            it('should equal value initialized', async () => {
                const authorized = await ethersAuthorizableServable.isAuthorizedServiceForWallet(Wallet.createRandom().address, glob.user_a);
                authorized.should.be.false;
            });
        });

        describe('authorizeRegisteredService()', () => {
            let address;

            beforeEach(async () => {
                address = Wallet.createRandom().address;
                await web3AuthorizableServable.registerService(address);
            });

            it('should authorize registered service contract and emit event', async () => {
                const result = await web3AuthorizableServable.authorizeRegisteredService(address, {from: glob.user_a});
                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('AuthorizeRegisteredServiceEvent');
                const authorized = await ethersAuthorizableServable.isAuthorizedServiceForWallet(address, glob.user_a);
                authorized.should.be.true;
            });

            describe('if called with sender that is owner', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(glob.owner).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(address0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with address that is not the one of registered service contract', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(Wallet.createRandom().address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('unauthorizeRegisteredService()', () => {
            let address;

            beforeEach(async () => {
                address = Wallet.createRandom().address;
                await web3AuthorizableServable.registerService(address);
            });

            it('should unauthorize registered service contract and emit event', async () => {
                const result = await web3AuthorizableServable.unauthorizeRegisteredService(address, {from: glob.user_a});
                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('UnauthorizeRegisteredServiceEvent');
                const authorized = await ethersAuthorizableServable.isAuthorizedServiceForWallet(address, glob.user_a);
                authorized.should.be.false;
            });

            describe('if called with sender that is owner', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredService(glob.owner).should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredService(address0, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredService(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with address that is not the one of registered service contract', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredService(Wallet.createRandom().address, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('isAuthorizedServiceActionForWallet()', () => {
            it('should equal value initialized', async () => {
                const authorized = await ethersAuthorizableServable.isAuthorizedServiceActionForWallet(Wallet.createRandom().address, 'some_action', glob.user_a);
                authorized.should.be.false;
            });
        });

        describe('authorizeRegisteredServiceAction()', () => {
            let address;

            beforeEach(async () => {
                address = Wallet.createRandom().address;
                await web3AuthorizableServable.registerService(address);
                await web3AuthorizableServable.enableServiceAction(address, 'some_action');
            });

            it('should authorize registered service contract and emit event', async () => {
                const result = await web3AuthorizableServable.authorizeRegisteredServiceAction(address, 'some_action', {from: glob.user_a});
                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('AuthorizeRegisteredServiceActionEvent');
                const authorizedServiceAction = await ethersAuthorizableServable.isAuthorizedServiceActionForWallet(address, 'some_action', glob.user_a);
                authorizedServiceAction.should.be.true;
                const authorizedService = await ethersAuthorizableServable.isAuthorizedServiceForWallet(address, glob.user_a);
                authorizedService.should.be.false;
            });

            describe('if called with sender that is owner', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(glob.owner, 'some_action').should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(address0, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(glob.user_a, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with address that is not the one of registered service contract', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(Wallet.createRandom().address, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with action that is not enabled', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(address, 'some_disabled_action', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('unauthorizeRegisteredServiceAction()', () => {
            let address;

            beforeEach(async () => {
                address = Wallet.createRandom().address;
                await web3AuthorizableServable.registerService(address);
                await web3AuthorizableServable.enableServiceAction(address, 'some_action');
            });

            it('should unauthorize registered service contract and emit event', async () => {
                const result = await web3AuthorizableServable.unauthorizeRegisteredServiceAction(address, 'some_action', {from: glob.user_a});
                result.logs.should.be.an('array').and.have.lengthOf(1);
                result.logs[0].event.should.equal('UnauthorizeRegisteredServiceActionEvent');
                const authorized = await ethersAuthorizableServable.isAuthorizedServiceActionForWallet(address, 'some_action', glob.user_a);
                authorized.should.be.false;
            });

            describe('if called with sender that is owner', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(glob.owner, 'some_action').should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(address0, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(glob.user_a, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with address that is not the one of registered service contract', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(Wallet.createRandom().address, 'some_action', {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with action that is not enabled', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(address, 'some_disabled_action', {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};
