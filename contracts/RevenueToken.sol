/*
/// Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {Ownable} from "./Ownable.sol";
import {ERC20} from "./ERC20.sol";

/**
@title RevenueToken
@dev Implementation of the EIP20 standard token (also known as ERC20 token) with the addition of calculation of balance blocks
 */
contract RevenueToken is ERC20, Ownable {
    using SafeMathUintLib for uint256;

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

    mapping(address => uint256) balances;
    mapping(address => uint256[]) balanceBlocks;
    mapping(address => uint256[]) balanceBlockNumbers;
    mapping(address => mapping(address => uint256)) private allowed;

    string public name = "Nahmii";
    string public symbol = "NII";
    uint8 public constant decimals = 15;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public ERC20() Ownable(msg.sender) {
        totalSupply = 0;
    }

    //
    // Token settings
    // -----------------------------------------------------------------------------------------------------------------
    function setTokenInformation(string newName, string newSymbol)
    public
    onlyDeployer
    {
        require(bytes(newName).length > 0);
        require(bytes(newSymbol).length > 0 && bytes(newSymbol).length < 5);

        name = newName;
        symbol = newSymbol;

        // Emit event
        emit SetTokenInformation(newName, newSymbol);
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice transfer token for a specified address
    /// @param _to The address to transfer to.
    /// @param value The amount to be transferred.
    function transfer(address _to, uint256 value)
    public
    returns
    (bool success)
    {
        balances[msg.sender] = balances[msg.sender].sub(value);
        balances[_to] = balances[_to].add(value);

        // Adjust balance blocks
        addBalanceBlocks(_to);

        // Add _to the token holders list
        if (!holdersMap[_to]) {
            holdersMap[_to] = true;
            holders.push(_to);
        }

        // Emit event
        emit Transfer(msg.sender, _to, value);
        return true;
    }

    /// @notice Gets the balance of the specified address.
    /// @param account The address whose balance is to be queried.
    /// @return An uint256 representing the amount owned by the passed address.
    function balanceOf(address account)
    public
    view
    returns (uint256 balance)
    {
        return balances[account];
    }

    /// @notice Transfer tokens from one address to another
    /// @param from address The address which you want to send tokens from
    /// @param to address The address which you want to transfer to
    /// @param value uint256 the amout of tokens to be transfered
    function transferFrom(address from, address to, uint256 value)
    public
    returns (bool success)
    {
        uint256 allowance = allowed[from][msg.sender];

        // Check is not needed because sub(allowance, value) will already throw if this condition is not met
        // require(value <= allowance);
        // SafeMath uses assert instead of require though, beware when using an analysis tool

        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        allowed[from][msg.sender] = allowance.sub(value);

        // Adjust balance blocks
        addBalanceBlocks(to);

        // Add to the token holders list
        if (!holdersMap[to]) {
            holdersMap[to] = true;
            holders.push(to);
        }

        // Emit event
        emit Transfer(from, to, value);
        return true;
    }

    /// @notice Approve the given address to spend the specified amount of tokens on behalf of msg.sender.
    /// @param spender The address which will spend the funds.
    /// @param value The amount of tokens to be spent.
    function approve(address spender, uint256 value)
    public
    returns (bool success)
    {
        // To change the approve amount you first have to reduce the addresses'
        // allowance to zero by calling `approve(spender, 0)` if it is not
        // already 0 to mitigate the race condition described here:
        // https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
        require(value == 0 || allowed[msg.sender][spender] == 0);

        allowed[msg.sender][spender] = value;

        // Emit event
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /// @notice Function to check the amount of tokens than an owner allowed to a spender.
    /// @param account address The address which owns the funds.
    /// @param spender address The address which will spend the funds.
    /// @return A uint256 specifing the amount of tokens still avaible for the spender.
    function allowance(address account, address spender)
    public
    view
    returns (uint256)
    {
        return allowed[account][spender];
    }

    /// @notice Increase the amount of tokens that an owner allowed to a spender.
    ///
    /// approve() should be called when allowed[_spender] == 0. To increment
    /// allowed value is better to use this function to avoid 2 calls (and wait until
    /// the first transaction is mined)
    /// From MonolithDAO Token.sol
    /// @param _spender The address which will spend the funds.
    /// @param _addedValue The amount of tokens to increase the allowance by.
    function increaseApproval(address _spender, uint _addedValue)
    public
    returns (bool)
    {
        allowed[msg.sender][_spender] = (allowed[msg.sender][_spender].add(_addedValue));

        // Emit event
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /// @notice Decrease the amount of tokens that an owner allowed to a spender.
    ///
    /// approve() should be called when allowed[_spender] == 0. To decrement
    /// allowed value is better to use this function to avoid 2 calls (and wait until
    /// the first transaction is mined)
    /// From MonolithDAO Token.sol
    /// @param _spender The address which will spend the funds.
    /// @param _subtractedValue The amount of tokens to decrease the allowance by.
    function decreaseApproval(address _spender, uint256 _subtractedValue)
    public
    returns (bool success)
    {
        uint256 oldValue = allowed[msg.sender][_spender];

        if (_subtractedValue > oldValue)
            allowed[msg.sender][_spender] = 0;

        else
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);

        // Emit event
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /// @notice Function to mint tokens
    /// @param _to The address that will receive the minted tokens.
    /// @param _amount The amount of tokens to mint.
    /// @return A boolean that indicates if the operation was successful.
    function mint(address _to, uint256 _amount)
    onlyDeployer
    public
    returns (bool)
    {
        totalSupply = totalSupply.add(_amount);
        balances[_to] = balances[_to].add(_amount);

        // Add to the token holders list
        if (!holdersMap[_to]) {
            holdersMap[_to] = true;
            holders.push(_to);
        }

        // Emit events
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }

    /// @notice Calculate the amount of balance blocks, i.e. the area under the curve (AUC) of balance as function of block number
    /// @dev The AUC is used as weight for the share of revenue that a token holder may claim
    /// @param wallet The wallet address for which calculation is done
    /// @param startBlock The start block number considered
    /// @param endBlock The end block number considered
    /// @return The calculated AUC
    function balanceBlocksIn(address wallet, uint256 startBlock, uint256 endBlock)
    public
    view
    returns (uint256)
    {
        require(startBlock < endBlock);
        require(wallet != address(0));

        uint256[] storage _balanceBlocks = balanceBlocks[wallet];
        uint256[] storage _balanceBlockNumbers = balanceBlockNumbers[wallet];

        if (_balanceBlockNumbers.length == 0 || endBlock < _balanceBlockNumbers[0])
            return 0;

        uint256 index = 0;
        while (index < _balanceBlockNumbers.length && _balanceBlockNumbers[index] < startBlock)
            index++;

        uint256 result;
        if (index >= _balanceBlockNumbers.length)
            result = _balanceBlocks[_balanceBlockNumbers.length - 1].mul(endBlock.sub(startBlock));

        else {
            uint256 low = (index == 0) ? startBlock : _balanceBlockNumbers[index - 1];

            uint256 h = _balanceBlockNumbers[index];
            if (h > endBlock)
                h = endBlock;

            h = h.sub(startBlock);
            result = (h == 0) ? 0 : beta(wallet, index).mul(h).div(_balanceBlockNumbers[index].sub(low));
            index++;

            while (index < _balanceBlockNumbers.length && _balanceBlockNumbers[index] < endBlock) {
                result = result.add(beta(wallet, index));
                index++;
            }

            if (index >= _balanceBlockNumbers.length)
                result = result.add(_balanceBlocks[_balanceBlockNumbers.length - 1].mul(endBlock.sub(_balanceBlockNumbers[_balanceBlockNumbers.length - 1])));

            else if (_balanceBlockNumbers[index - 1] < endBlock)
                result = result.add(beta(wallet, index).mul(endBlock.sub(_balanceBlockNumbers[index - 1])).div(_balanceBlockNumbers[index].sub(_balanceBlockNumbers[index - 1])));

        }

        return result;
    }

    /// @notice Get the count of holders
    /// @return The number of holders
    function holdersCount()
    public
    view
    returns (uint256)
    {
        return holders.length;
    }

    /// @notice Get the subset of holders with positive balance in the given 0 based index range
    /// @param low The lower inclusive index
    /// @param up The upper inclusive index
    /// @return The subset of registered holders
    function holdersByIndices(uint256 low, uint256 up)
    public
    view
    returns (address[])
    {
        require(low <= up);

        low = low < 0 ? 0 : low;
        up = up > holders.length - 1 ? holders.length - 1 : up;
        address[] memory _holders = new address[](up - low + 1);
        for (uint256 i = low; i <= up; i++)
            if (0 < balances[holders[i]])
                _holders[i - low] = holders[i];

        return _holders;
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function addBalanceBlocks(address _to) private {
        uint256 length;

        length = balanceBlockNumbers[msg.sender].length;
        balanceBlocks[msg.sender].push(balances[msg.sender].mul(block.number.sub(length > 0 ? balanceBlockNumbers[msg.sender][length - 1] : 0)));
        balanceBlockNumbers[msg.sender].push(block.number);

        length = balanceBlockNumbers[_to].length;
        balanceBlocks[_to].push(balances[_to].mul(block.number.sub(length > 0 ? balanceBlockNumbers[_to][length - 1] : 0)));
        balanceBlockNumbers[_to].push(block.number);
    }

    function beta(address wallet, uint256 index) private view returns (uint256) {
        if (index == 0)
            return 0;

        return balanceBlocks[wallet][index - 1].mul(balanceBlockNumbers[wallet][index].sub(balanceBlockNumbers[wallet][index - 1]));
    }
}