/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import './ERC20.sol';
import './SafeMathUint.sol';
import './Ownable.sol';
import {SelfDestructible} from "./SelfDestructible.sol";

/**
 * @title Standard token
 * @dev Basic implementation of the EIP20 standard token (also known as ERC20 token).
 */
contract RevenueToken is ERC20, Ownable, SelfDestructible {
    using SafeMathUint for uint256;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event Mint(address indexed to, uint256 amount);
    event SetTokenInformation(string name, string symbol);

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 private totalSupply;

    address[] public holders;
    mapping(address => bool) holdersMap;
    uint private holderEnumIndex;

    mapping(address => uint256) balances;
    mapping(address => uint256[]) balanceBlocks;
    mapping(address => uint256[]) balanceBlockNumbers;
    mapping(address => mapping(address => uint256)) private allowed;

    string public name = "Striim";
    string public symbol = "STRM";
    uint8 public constant decimals = 15;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public ERC20() Ownable(msg.sender) {
        totalSupply = 0;
        holderEnumIndex = 0;
    }

    //
    // Token settings
    // -----------------------------------------------------------------------------------------------------------------
    function setTokenInformation(string newName, string newSymbol) public onlyOwner {
        require(bytes(newName).length > 0);
        require(bytes(newSymbol).length > 0 && bytes(newSymbol).length < 5);

        name = newName;
        symbol = newSymbol;

        //emit event
        emit SetTokenInformation(newName, newSymbol);
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @notice transfer token for a specified address
     * @param _to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address _to, uint256 value) public returns (bool success) {
        balances[msg.sender] = balances[msg.sender].sub(value);
        balances[_to] = balances[_to].add(value);

        //adjust balance blocks
        addBalanceBlocks(_to);

        //add _to the token holders list
        if (!holdersMap[_to]) {
            holdersMap[_to] = true;
            holders.push(_to);
        }

        //raise event
        emit Transfer(msg.sender, _to, value);
        return true;
    }

    /**
     * @notice Gets the balance of the specified address.
     * @param account The address whose balance is to be queried.
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address account) public view returns (uint256 balance) {
        return balances[account];
    }

    /**
     * @notice Transfer tokens from one address to another
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amout of tokens to be transfered
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        uint256 allowance = allowed[from][msg.sender];

        // Check is not needed because sub(allowance, value) will already throw if this condition is not met
        // require(value <= allowance);
        // SafeMath uses assert instead of require though, beware when using an analysis tool

        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        allowed[from][msg.sender] = allowance.sub(value);

        //adjust balance blocks
        addBalanceBlocks(to);

        //add to the token holders list
        if (!holdersMap[to]) {
            holdersMap[to] = true;
            holders.push(to);
        }

        //raise event
        emit Transfer(from, to, value);
        return true;
    }

    /**
     * @notice Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value) public returns (bool success) {
        // To change the approve amount you first have to reduce the addresses'
        //  allowance to zero by calling `approve(spender, 0)` if it is not
        //  already 0 to mitigate the race condition described here:
        //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        require(value == 0 || allowed[msg.sender][spender] == 0);

        allowed[msg.sender][spender] = value;

        //raise event
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @notice Function to check the amount of tokens than an owner allowed to a spender.
     * @param account address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifing the amount of tokens still avaible for the spender.
     */
    function allowance(address account, address spender) public view returns (uint256) {
        return allowed[account][spender];
    }

    /**
     * @notice Increase the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        allowed[msg.sender][_spender] = (allowed[msg.sender][_spender].add(_addedValue));

        //raise event
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @notice Decrease the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(address _spender, uint256 _subtractedValue) public returns (bool success) {
        uint256 oldValue = allowed[msg.sender][_spender];

        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }

        //raise event
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @notice Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _to, uint256 _amount) onlyOwner public returns (bool) {
        totalSupply = totalSupply.add(_amount);
        balances[_to] = balances[_to].add(_amount);

        //add to the token holders list
        if (!holdersMap[_to]) {
            holdersMap[_to] = true;
            holders.push(_to);
        }

        //raise events
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }

    /**
    * @notice Calculate the amount of balance blocks, i.e. the area under the curve (AUC) of balance as function of block number
    * @dev The AUC is used as weight for the share of revenue that a token holder may claim
    * @param wallet The wallet address for which calculation is done
    * @param startBlock The start block number considered
    * @param endBlock The end block number considered
    * @return The calculated AUC
    */
    function balanceBlocksIn(address wallet, uint256 startBlock, uint256 endBlock) public view returns (uint256) {
        uint256 idx;
        uint256 low;
        uint256 res;
        uint256 h;

        require (startBlock < endBlock);
        require (wallet != address(0));

        uint256[] storage _balanceBlocks = balanceBlocks[wallet];
        uint256[] storage _balanceBlockNumbers = balanceBlockNumbers[wallet];

        if (_balanceBlockNumbers.length == 0 || endBlock < _balanceBlockNumbers[0]) {
            return 0;
        }

        idx = 0;
        while (idx < _balanceBlockNumbers.length && _balanceBlockNumbers[idx] < startBlock) {
            idx++;
        }

        if (idx >= _balanceBlockNumbers.length) {
            res = _balanceBlocks[_balanceBlockNumbers.length - 1].mul( endBlock.sub(startBlock) );
        }
        else {
            low = (idx == 0) ? startBlock : _balanceBlockNumbers[idx - 1];

            h = _balanceBlockNumbers[idx];
            if (h > endBlock) {
                h = endBlock;
            }

            h = h.sub(startBlock);
            res = (h == 0) ? 0 : beta(wallet, idx).mul( h ).div( _balanceBlockNumbers[idx].sub(low) );
            idx++;

            while (idx < _balanceBlockNumbers.length && _balanceBlockNumbers[idx] < endBlock) {
                res = res.add(beta(wallet, idx));
                idx++;
            }

            if (idx >= _balanceBlockNumbers.length) {
                res = res.add(_balanceBlocks[_balanceBlockNumbers.length - 1].mul( endBlock.sub(_balanceBlockNumbers[_balanceBlockNumbers.length - 1]) ));
            } else if (_balanceBlockNumbers[idx - 1] < endBlock) {
                res = res.add(beta(wallet, idx).mul( endBlock.sub(_balanceBlockNumbers[idx - 1]) ).div( _balanceBlockNumbers[idx].sub(_balanceBlockNumbers[idx - 1]) ));
            }
        }

        return res;
    }

    //HOW TO USE:
    //1. Owner checks current block number and calls startHoldersEnum
    //2. If current block number != block number stored in step 1, go to step 1
    //3. Owner calls holdersEnum and saves returned addresses until address[index] == 0
    //4. If address[0] == 0, go to step 2
    //5. Done

    //A cheaper alternative is to monitor all Transfer events and store them in a database.
    function startHoldersEnum() onlyOwner public {
        holderEnumIndex = 0;
    }

    function holdersEnum() onlyOwner public returns (address[]) {
        address[] memory _holders = new address[](1024);
        uint256 counter = 0;

        while (counter < _holders.length && holderEnumIndex < holders.length) {
            if (balances[holders[holderEnumIndex]] > 0) {
                _holders[counter] = holders[holderEnumIndex];
                counter++;
            }
            holderEnumIndex++;
        }

        return  _holders;
    }

    //
    // Internal functions
    // -----------------------------------------------------------------------------------------------------------------
    function addBalanceBlocks(address _to) private {
        uint256 len;

        len = balanceBlockNumbers[msg.sender].length;
        balanceBlocks[msg.sender].push(balances[msg.sender].mul(block.number.sub(len > 0 ? balanceBlockNumbers[msg.sender][len- 1] : 0)));
        balanceBlockNumbers[msg.sender].push(block.number);

        len = balanceBlockNumbers[_to].length;
        balanceBlocks[_to].push(balances[_to].mul(block.number.sub(len > 0 ? balanceBlockNumbers[_to][len - 1] : 0)));
        balanceBlockNumbers[_to].push(block.number);
    }

    function beta(address wallet, uint256 idx) private view returns (uint256) {
        if (idx == 0)
            return 0;
        return balanceBlocks[wallet][idx - 1].mul(balanceBlockNumbers[wallet][idx].sub(balanceBlockNumbers[wallet][idx - 1]));
    }
}