const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const Exchange = artifacts.require('Exchange');

chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('Exchange', () => {

        let instance = null;

        before(async () => {
            instance = await Exchange.deployed();
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
    });
};
