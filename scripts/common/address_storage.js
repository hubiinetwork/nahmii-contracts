/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// -----------------------------------------------------------------------------------------------------------------

function AddressStorage(filename, network) {
    assert.ok(typeof filename === 'string' && filename.length, "Invalid filename");
    assert.ok(typeof network === 'string' && network.length, "Invalid network name");

    this.filename = filename;
    this.network = network;
    this.contents = {
        networks: {},
        updatedAt: new Date().toISOString()
    };
}

AddressStorage.prototype.load = function () {
    var self = this;

    return new Promise((resolve, reject) => {
        var newContents;

        try {
            //No need to handle the error. If the file doesn't exist then we'll start afresh with a new object.
            newContents = fs.readFileSync(self.filename, {encoding: 'utf8'});
            newContents = JSON.parse(newContents);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                reject(err);
                return;
            }
            newContents = {};
        }
        if (typeof newContents.networks !== 'object')
            newContents.networks = {};

        self.contents = newContents;
        resolve();
    });
};

AddressStorage.prototype.save = function () {
    var self = this;

    return new Promise((resolve, reject) => {
        var folder = self.filename.substr(0, self.filename.lastIndexOf(path.sep));

        //write json file (by this time the build folder should exists)
        try {
            fs.mkdirSync(folder);
        }
        catch (err) {
            if (err.code !== 'EEXIST') {
                reject(err);
                return;
            }
        }

        self.contents.updatedAt = new Date().toISOString();

        fs.writeFile(self.filename, JSON.stringify(self.contents, null, 4), 'utf8', function (err) {
            if (!err)
                resolve();
            else
                reject(err);
        });
    });
};

AddressStorage.prototype.clear = function () {
    if (typeof this.contents.networks[this.network] !== 'undefined')
        delete this.contents.networks[this.network];
};

AddressStorage.prototype.set = function (key, address) {
    assert.ok(typeof key === 'string' && key.length, "Invalid key");
    if (address) {

        if (address.substr(0, 2).toLowerCase() != '0x')
            address = "0x" + address;
        assert.ok(/^[0-9a-f]{40}$/i.test(address.substr(2)), "Invalid address");

        if (typeof this.contents.networks[this.network] !== 'object')
            this.contents.networks[this.network] = {};
        this.contents.networks[this.network][key] = address;
    }
    else {
        if (typeof this.contents.networks[this.network] === 'object')
            delete this.contents.networks[this.network][key];
    }
};

AddressStorage.prototype.get = function (key) {
    assert.ok(typeof key === 'string' && key.length, "Invalid key");

    if (typeof this.contents.networks[this.network] !== 'object' || typeof this.contents.networks[this.network][key] !== 'string')
        return null;
    return this.contents.networks[this.network][key];
};

AddressStorage.prototype.toJSON = function() {
    return JSON.stringify(this.contents, null, 2);
};

module.exports = AddressStorage;
