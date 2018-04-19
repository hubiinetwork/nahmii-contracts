const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const Configuration = artifacts.require('Configuration');

chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('Configuration', () => {

        let instance = null;

        before(async () => {
            instance = await Configuration.deployed();
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await instance.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized at construction time', async () => {
                const owner = await instance.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('changeOwner()', () => {
            describe('if called with current owner as sender', () => {
                after(async () => {
                    await instance.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should successfully set new owner and emit event', async () => {
                    const result = await instance.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await instance.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not current owner', () => {
                it('should fail to set new owner', async () => {
                    instance.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('has()', () => {
            describe('if called without there being any configuration item', () => {
                it('should return false', async () => {
                    const value = await instance.has.call('some_name');
                    value.should.be.false;
                });
            });

            describe('if called after the first configuration item has been set', () => {
                before(async () => {
                    await instance.set('some_name', 'some_value');
                });

                it('should return true', async () => {
                    const value = await instance.has.call('some_name');
                    value.should.be.true;
                });
            });
        });

        describe('set()', () => {
            describe('if called owner as sender', () => {
                it('should successfully set new configuration item and emit event', async () => {
                    const result = await instance.set('some_name', 'some_value');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetEvent');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set value', async () => {
                    instance.set('some_name', 'some_value', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('unset()', () => {
            describe('if called owner as sender', () => {
                it('should successfully unset configuration item and emit event', async () => {
                    const result = await instance.unset('some_name');
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('UnsetEvent');
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to unset condfiguration item', async () => {
                    instance.unset('some_name', {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('get()', () => {
            before(async () => {
                await instance.set('some_name', 'some_value');
            });

            it('should get configuration item value that has previously been set', async () => {
                const value = await instance.get.call('some_name');
                value.toString().should.have.string(web3.fromAscii('some_value').toString());
            });

            describe('if configuration item has not previously been set', () => {
                it('should fail to get value', async () => {
                    instance.get.call('some_non-existent_name').should.be.rejected;
                });
            });
        });

        describe('getAsString()', () => {
            before(async () => {
                await instance.set('some_name', 'some_value');
            });

            it('should get configuration item value that has previously been set', async () => {
                const value = await instance.getAsString.call('some_name');
                value.should.equal('some_value');
            });

            describe('if configuration item has not previously been set', () => {
                it('should fail to get value', async () => {
                    instance.getAsString.call('some_non-existent_name').should.be.rejected;
                });
            });
        });

        describe('getAsUint()', () => {
            before(async () => {
                await instance.set('some_name', '0x000000000000000000000000000000000000000000000000000000000000000a');
            });

            it('should get configuration item value that has previously been set', async () => {
                const value = await instance.getAsUint.call('some_name');
                value.toNumber().should.equal(10);
            });

            describe('if configuration item has not previously been set', () => {
                it('should fail to get value', async () => {
                    instance.getAsString.call('some_non-existent_name').should.be.rejected;
                });
            });
        });

        describe('getAsBool()', () => {
            describe('if configuration item value is set to non-zero hex', () => {
                before(async () => {
                    await instance.set('some_name', '0x0000000000000000000000000000000000000000000000000000000000000001');
                });

                it('should get truthy value', async () => {
                    const value = await instance.getAsBool.call('some_name');
                    value.should.be.true;
                });
            });

            describe('if configuration item value is set to zero hex', () => {
                before(async () => {
                    await instance.set('some_name', '0x0');
                });

                it('should get falsy value', async () => {
                    const value = await instance.getAsBool.call('some_name');
                    value.should.be.false;
                });
            });

            describe('if configuration item has not previously been set', () => {
                it('should fail to get value', async () => {
                    instance.getAsString.call('some_non-existent_name').should.be.rejected;
                });
            });
        });

        describe('names()', () => {
            describe('if called with index smaller than length of names', () => {
                it('should equal name of set configuration item', async () => {
                    const name = await instance.names.call(0);
                    name.should.equal('some_name');
                });
            });
        });

        describe('getCount()', () => {
            it('should equal the number of set configuration items', async () => {
                const count = await instance.getCount.call();
                count.toNumber().should.equal(1);
            });
        });
    });
};
