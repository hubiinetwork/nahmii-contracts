const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {Wallet, Contract} = require('ethers');
const address0 = require('../mocks').address0;
const AuthorizableServable = artifacts.require('TestAuthorizableServable');

chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('AuthorizableServable', () => {
        let web3AuthorizableServable, ethersAuthorizableServable;

        beforeEach(async () => {
            web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
            ethersAuthorizableServable = new Contract(web3AuthorizableServable.address, AuthorizableServable.abi, glob.signer_owner);
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                (await web3AuthorizableServable.deployer.call()).should.equal(glob.owner);
                (await web3AuthorizableServable.operator.call()).should.equal(glob.owner);
            });
        });

        describe('disableInitialServiceAuthorization()', () => {
            it('should successfully disable initial authorization', async () => {
                (await web3AuthorizableServable.initialServiceAuthorizationDisabled.call())
                    .should.be.false;

                await web3AuthorizableServable.disableInitialServiceAuthorization();

                (await web3AuthorizableServable.initialServiceAuthorizationDisabled.call())
                    .should.be.true;
            });
        });

        describe('isAuthorizedRegisteredService()', () => {
            it('should equal value initialized', async () => {
                (await web3AuthorizableServable.isAuthorizedRegisteredService.call(
                    Wallet.createRandom().address, glob.user_a
                )).should.be.false;
            });
        });

        describe('isAuthorizedRegisteredServiceAction()', () => {
            it('should equal value initialized', async () => {
                (await web3AuthorizableServable.isAuthorizedRegisteredServiceAction.call(
                    Wallet.createRandom().address, 'some_action', Wallet.createRandom().address
                )).should.be.false;
            });
        });

        describe('authorizeInitialService()', () => {
            let service;

            before(() => {
                service = Wallet.createRandom().address;
            });

            beforeEach(async () => {
                await web3AuthorizableServable.registerService(service);
            });

            describe('if called by non-deployer', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeInitialService(service, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeInitialService(address0)
                        .should.be.rejected;
                });
            });

            describe('if called with address of authorizable servable', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeInitialService(web3AuthorizableServable.address)
                        .should.be.rejected;
                });
            });

            describe('if called with after initial authorization has been disabled', () => {
                beforeEach(async () => {
                    await web3AuthorizableServable.disableInitialServiceAuthorization();
                });

                it('should revert', async () => {
                    web3AuthorizableServable.authorizeInitialService(service)
                        .should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeInitialService(glob.owner)
                        .should.be.rejected;
                });
            });

            describe('if called with unregistered service', () => {
                beforeEach(async () => {
                    web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.authorizeInitialService(service)
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should revert', async () => {
                    const result = await web3AuthorizableServable.authorizeInitialService(service);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('AuthorizeInitialServiceEvent');

                    (await web3AuthorizableServable.initialServiceAuthorizedMap.call(service))
                        .should.be.true;

                    (await web3AuthorizableServable.isAuthorizedRegisteredService.call(service, Wallet.createRandom().address))
                        .should.be.true;

                    (await web3AuthorizableServable.isAuthorizedRegisteredServiceAction.call(
                        service, 'some_action', Wallet.createRandom().address
                    )).should.be.false;

                    await web3AuthorizableServable.enableServiceAction(service, 'some_action');

                    (await web3AuthorizableServable.isAuthorizedRegisteredServiceAction.call(
                        service, 'some_action', Wallet.createRandom().address
                    )).should.be.true;
                });
            });
        });

        describe('authorizeRegisteredService()', () => {
            let service;

            before(() => {
                service = Wallet.createRandom().address;
            });

            beforeEach(async () => {
                await web3AuthorizableServable.registerService(service);
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(address0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with address of authorizable servable', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(web3AuthorizableServable.address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(glob.user_a, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with unregistered service', () => {
                beforeEach(async () => {
                    web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(service, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with initial service', () => {
                beforeEach(async () => {
                    await web3AuthorizableServable.authorizeInitialService(service);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredService(service, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should authorize registered service contract and emit event', async () => {
                    const result = await web3AuthorizableServable.authorizeRegisteredService(service, {from: glob.user_a});

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('AuthorizeRegisteredServiceEvent');

                    (await web3AuthorizableServable.isAuthorizedRegisteredService.call(service, glob.user_a))
                        .should.be.true;

                    (await web3AuthorizableServable.isAuthorizedRegisteredServiceAction.call(
                        service, 'some_action', glob.user_a
                    )).should.be.false;

                    await web3AuthorizableServable.enableServiceAction(service, 'some_action');

                    (await web3AuthorizableServable.isAuthorizedRegisteredServiceAction.call(
                        service, 'some_action', glob.user_a
                    )).should.be.true;
                });
            });
        });

        describe('unauthorizeRegisteredService()', () => {
            let service;

            before(() => {
                service = Wallet.createRandom().address;
            });

            beforeEach(async () => {
                await web3AuthorizableServable.registerService(service);
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredService(address0, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with address of authorizable servable', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredService(web3AuthorizableServable.address, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredService(glob.owner, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with unregistered service', () => {
                beforeEach(async () => {
                    web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredService(service, {from: glob.user_a})
                        .should.be.rejected;
                });
            });

            describe('if called with initial registered service', () => {
                beforeEach(async () => {
                    await web3AuthorizableServable.authorizeInitialService(service);
                });

                it('should unauthorize initial registered service contract and emit event', async () => {
                    const result = await web3AuthorizableServable.unauthorizeRegisteredService(service, {from: glob.user_a});

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('UnauthorizeRegisteredServiceEvent');

                    (await web3AuthorizableServable.isAuthorizedRegisteredService.call(service, glob.user_a))
                        .should.be.false;
                });
            });

            describe('if called with registered service', () => {
                beforeEach(async () => {
                    await web3AuthorizableServable.authorizeRegisteredService(service, {from: glob.user_a})
                });

                it('should unauthorize registered service contract and emit event', async () => {
                    (await web3AuthorizableServable.isAuthorizedRegisteredService.call(service, glob.user_a))
                        .should.be.true;

                    const result = await web3AuthorizableServable.unauthorizeRegisteredService(service, {from: glob.user_a});

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('UnauthorizeRegisteredServiceEvent');

                    (await web3AuthorizableServable.isAuthorizedRegisteredService.call(service, glob.user_a))
                        .should.be.false;

                    (await web3AuthorizableServable.isAuthorizedRegisteredServiceAction.call(
                        service, 'some_action', glob.user_a
                    )).should.be.false;

                    await web3AuthorizableServable.enableServiceAction(service, 'some_action');

                    (await web3AuthorizableServable.isAuthorizedRegisteredServiceAction.call(
                        service, 'some_action', glob.user_a
                    )).should.be.false;
                });
            });
        });

        describe('authorizeRegisteredServiceAction()', () => {
            let service;

            before(() => {
                service = Wallet.createRandom().address;
            });

            beforeEach(async () => {
                await web3AuthorizableServable.registerService(service);
                await web3AuthorizableServable.enableServiceAction(service, 'some_action');
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(
                        address0, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with address of authorizable servable', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(
                        web3AuthorizableServable.address, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(
                        glob.user_a, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with unregistered service', () => {
                beforeEach(async () => {
                    web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(
                        Wallet.createRandom().address, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with action that is not enabled', () => {
                beforeEach(async () => {
                    web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
                    await web3AuthorizableServable.registerService(service);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(
                        service, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with initial service', () => {
                beforeEach(async () => {
                    await web3AuthorizableServable.authorizeInitialService(service);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.authorizeRegisteredServiceAction(
                        service, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should authorize registered service contract and emit event', async () => {
                    (await ethersAuthorizableServable.isAuthorizedRegisteredService(service, glob.user_a))
                        .should.be.false;
                    (await ethersAuthorizableServable.isAuthorizedRegisteredServiceAction(
                        service, 'some_action', glob.user_a
                    )).should.be.false;

                    const result = await web3AuthorizableServable.authorizeRegisteredServiceAction(
                        service, 'some_action', {from: glob.user_a}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('AuthorizeRegisteredServiceActionEvent');

                    (await ethersAuthorizableServable.isAuthorizedRegisteredService(service, glob.user_a))
                        .should.be.false;
                    (await ethersAuthorizableServable.isAuthorizedRegisteredServiceAction(
                        service, 'some_action', glob.user_a
                    )).should.be.true;
                });
            });
        });

        describe('unauthorizeRegisteredServiceAction()', () => {
            let service;

            before(() => {
                service = Wallet.createRandom().address;
            });

            beforeEach(async () => {
                await web3AuthorizableServable.registerService(service);
                await web3AuthorizableServable.enableServiceAction(service, 'some_action');
                await web3AuthorizableServable.authorizeRegisteredServiceAction(
                    service, 'some_action', {from: glob.user_a}
                );
            });

            describe('if called with null address', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(
                        address0, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with address of authorizable servable', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(
                        web3AuthorizableServable.address, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with address of sender', () => {
                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(
                        glob.user_a, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with unregistered service', () => {
                beforeEach(async () => {
                    web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(
                        service, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with action that is not enabled', () => {
                beforeEach(async () => {
                    web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
                    await web3AuthorizableServable.registerService(service);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(
                        service, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if called with initial service', () => {
                beforeEach(async () => {
                    web3AuthorizableServable = await AuthorizableServable.new(glob.owner);
                    await web3AuthorizableServable.registerService(service);
                    await web3AuthorizableServable.authorizeInitialService(service);
                });

                it('should revert', async () => {
                    web3AuthorizableServable.unauthorizeRegisteredServiceAction(
                        service, 'some_action', {from: glob.user_a}
                    ).should.be.rejected;
                });
            });

            describe('if within operational constraints', () => {
                it('should unauthorize registered service contract and emit event', async () => {
                    (await ethersAuthorizableServable.isAuthorizedRegisteredServiceAction(
                        service, 'some_action', glob.user_a
                    )).should.be.true;

                    const result = await web3AuthorizableServable.unauthorizeRegisteredServiceAction(
                        service, 'some_action', {from: glob.user_a}
                    );

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('UnauthorizeRegisteredServiceActionEvent');

                    (await ethersAuthorizableServable.isAuthorizedRegisteredServiceAction(
                        service, 'some_action', glob.user_a
                    )).should.be.false;
                });
            });
        });
    });
};
