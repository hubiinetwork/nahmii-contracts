const chai = require('chai');
const mockFs = require('mock-fs');
const fs = require('fs').promises;
const enumerate = require('./require-enumerate');

chai.should();

describe('update_require_messages', () => {
    beforeEach(async () => {
        mockFs({
            'contracts-bak': {},
            'contracts': {
                'SomeContract.sol': `
/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {ParentContract} from "./ParentContract.sol";

/**
 * @title SomeContract
 * @notice An contract that descends from ParentContract and exemplifies usage
 * of requre statements
 */
contract SomeContract is ParentContract {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public someProperty;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(uint256 _someProperty) ParentContract public {
        someProperty = _someProperty;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the new value of the property
    /// @param _someProperty The new value of the property
    function setSomeProperty(uint256 _someProperty)
    public
    {
        require(0 < _someProperty && _someProperty <= 10);
        require(0 < _someProperty && _someProperty <= 10, "Property is out of bounds");
        require(0 < _someProperty && _someProperty <= 10, "Property is out of bounds [SomeContract.sol:10]");
        require(0 < _someProperty && _someProperty <= 10, 'Property is out of bounds');
        require(0 < _someProperty && _someProperty <= 10, 'Property is out of bounds [SomeContract.sol:10]');
        require(
            0 < _someProperty && _someProperty <= 10, 
            "Property is out of bounds"
        );
        require(
            0 < _someProperty && _someProperty <= 10, 
            "Property is out of bounds [SomeContract.sol:10]"
        );
        require(
            0 < _someProperty && _someProperty <= 10,
            'Property is out of bounds'
        );
        require(
            0 < _someProperty && _someProperty <= 10,
            'Property is out of bounds [SomeContract.sol:10]'
        );
        
        someProperty = _someProperty;
    }
}`
            }
        });
    });

    describe('if called without options', () => {
        it('should successfully enumerate require messages', async () => {
            await enumerate('contracts/SomeContract.sol');

            const lines = (await fs.readFile('contracts/SomeContract.sol')).toString().split('\n');
            lines[39].should.match(/0 < _someProperty && _someProperty <= 10, "\[SomeContract\.sol:40\]"/);
            lines[40].should.match(/0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:41\]"/);
            lines[41].should.match(/0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:42\]"/);
            lines[42].should.match(/0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:43\]'/);
            lines[43].should.match(/0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:44\]'/);
            lines[46].should.match(/"Property is out of bounds \[SomeContract\.sol:45\]"/);
            lines[50].should.match(/"Property is out of bounds \[SomeContract\.sol:49\]"/);
            lines[54].should.match(/'Property is out of bounds \[SomeContract\.sol:53\]'/);
            lines[58].should.match(/'Property is out of bounds \[SomeContract\.sol:57\]'/);
        });
    });

    describe('if called with defaultQuote option', () => {
        it('should successfully enumerate require messages', async () => {
            await enumerate('contracts/SomeContract.sol', {defaultQuote: '\''});

            const lines = (await fs.readFile('contracts/SomeContract.sol')).toString().split('\n');
            lines[39].should.match(/0 < _someProperty && _someProperty <= 10, '\[SomeContract\.sol:40\]'/);
            lines[40].should.match(/0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:41\]"/);
            lines[41].should.match(/0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:42\]"/);
            lines[42].should.match(/0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:43\]'/);
            lines[43].should.match(/0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:44\]'/);
            lines[46].should.match(/"Property is out of bounds \[SomeContract\.sol:45\]"/);
            lines[50].should.match(/"Property is out of bounds \[SomeContract\.sol:49\]"/);
            lines[54].should.match(/'Property is out of bounds \[SomeContract\.sol:53\]'/);
            lines[58].should.match(/'Property is out of bounds \[SomeContract\.sol:57\]'/);
        });
    });

    describe('if called with backupDir option', () => {
        it('should successfully enumerate require messages', async () => {
            await enumerate('contracts/SomeContract.sol', {backupDir: 'contracts-bak'});

            let lines = (await fs.readFile('contracts/SomeContract.sol')).toString().split('\n');
            lines[39].should.match(/0 < _someProperty && _someProperty <= 10, "\[SomeContract\.sol:40\]"/);
            lines[40].should.match(/0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:41\]"/);
            lines[41].should.match(/0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:42\]"/);
            lines[42].should.match(/0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:43\]'/);
            lines[43].should.match(/0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:44\]'/);
            lines[46].should.match(/"Property is out of bounds \[SomeContract\.sol:45\]"/);
            lines[50].should.match(/"Property is out of bounds \[SomeContract\.sol:49\]"/);
            lines[54].should.match(/'Property is out of bounds \[SomeContract\.sol:53\]'/);
            lines[58].should.match(/'Property is out of bounds \[SomeContract\.sol:57\]'/);

            lines = (await fs.readFile('contracts-bak/SomeContract.sol')).toString().split('\n');
            lines[39].should.match(/\(0 < _someProperty && _someProperty <= 10\)/);
            lines[40].should.match(/\(0 < _someProperty && _someProperty <= 10, "Property is out of bounds"\)/);
            lines[41].should.match(/\(0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:10\]"\)/);
            lines[42].should.match(/\(0 < _someProperty && _someProperty <= 10, 'Property is out of bounds'\)/);
            lines[43].should.match(/\(0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:10\]'\)/);
            lines[46].should.match(/"Property is out of bounds"/);
            lines[50].should.match(/"Property is out of bounds \[SomeContract\.sol:10\]"/);
            lines[54].should.match(/'Property is out of bounds'/);
            lines[58].should.match(/'Property is out of bounds \[SomeContract\.sol:10\]'/);
        });
    });

    describe('if called with spread array of files', () => {
        it('should successfully enumerate require messages', async () => {
            const fileNames = ['contracts/SomeContract.sol'];

            await enumerate(...fileNames);

            const lines = (await fs.readFile('contracts/SomeContract.sol')).toString().split('\n');
            lines[39].should.match(/0 < _someProperty && _someProperty <= 10, "\[SomeContract\.sol:40\]"/);
            lines[40].should.match(/0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:41\]"/);
            lines[41].should.match(/0 < _someProperty && _someProperty <= 10, "Property is out of bounds \[SomeContract\.sol:42\]"/);
            lines[42].should.match(/0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:43\]'/);
            lines[43].should.match(/0 < _someProperty && _someProperty <= 10, 'Property is out of bounds \[SomeContract\.sol:44\]'/);
            lines[46].should.match(/"Property is out of bounds \[SomeContract\.sol:45\]"/);
            lines[50].should.match(/"Property is out of bounds \[SomeContract\.sol:49\]"/);
            lines[54].should.match(/'Property is out of bounds \[SomeContract\.sol:53\]'/);
            lines[58].should.match(/'Property is out of bounds \[SomeContract\.sol:57\]'/);
        });
    });
});