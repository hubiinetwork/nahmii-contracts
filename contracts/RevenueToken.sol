pragma solidity ^0.4.23;

/**
 * Originally from https://github.com/OpenZeppelin/zeppelin-solidity
 * Modified by https://www.coinfabrik.com/
 *
 * This version is being used for Truffle Unit Testing. Please do not remove.
 */

import './ERC20.sol';
import './SafeMathUint.sol';
import './Ownable.sol';

/**
 * @title Standard token
 * @dev Basic implementation of the EIP20 standard token (also known as ERC20 token).
 */
contract RevenueToken is ERC20, Ownable {
    using SafeMathUint for uint256;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event Mint(address indexed to, uint256 amount);

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 private totalSupply;

    address[] public holders;
    mapping(address => bool) holdersMap;
    uint private holderEnumIndex;

    mapping(address => uint256) balances;
    mapping(address => mapping(uint256 => uint256)) balanceBlocks;
    mapping(address => uint256[]) balanceBlockNumbers;
    mapping(address => mapping(address => uint256)) private allowed;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public ERC20() Ownable(msg.sender) {
        totalSupply = 0;

        //balanceBlocks[msg.sender][block.number] = 0;
        //balanceBlockNumbers[msg.sender].push(block.number);

        holderEnumIndex = 0;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @dev transfer token for a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address _to, uint256 value) public returns (bool success) {
        balanceBlocks[msg.sender][block.number] = balances[msg.sender].mul(block.number.sub(balanceBlockNumbers[msg.sender].length > 0 ? balanceBlockNumbers[msg.sender][balanceBlockNumbers[msg.sender].length - 1] : 0));
        balanceBlockNumbers[msg.sender].push(block.number);
        balances[msg.sender] = balances[msg.sender].sub(value);

        balanceBlocks[_to][block.number] = balances[_to].mul(block.number.sub(balanceBlockNumbers[_to].length > 0 ? balanceBlockNumbers[_to][balanceBlockNumbers[_to].length - 1] : 0));
        balanceBlockNumbers[_to].push(block.number);
        balances[_to] = balances[_to].add(value);

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
     * @dev Gets the balance of the specified address.
     * @param account The address whose balance is to be queried.
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address account) public view returns (uint256 balance) {
        return balances[account];
    }

    /**
     * @dev Transfer tokens from one address to another
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
     * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
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
     * @dev Function to check the amount of tokens than an owner allowed to a spender.
     * @param account address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifing the amount of tokens still avaible for the spender.
     */
    function allowance(address account, address spender) public view returns (uint256 remaining) {
        return allowed[account][spender];
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
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
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
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
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _to, uint256 _amount) onlyOwner public returns (bool)
    {
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




    //IMPORTANT: access should be public or only owner+token_holder_revenue_funds?
    function balanceBlocksIn(address a, uint256 from, uint256 to) public constant returns (uint256) {
        // Def:
        //  * balance block = balance * block span
        // 
        // Variables with example contents:
        //  * Function arguments
        //    - Start block number: from = 5312000
        //    - End block number: to = 5323000
        //
        //  * Historical evolution of balance of address a
        //    - Balance: b[] = [1000000000000000, 2000000000000000, 3000000000000000, 4000000000000000]
        //
        //  * Block numbers at which address a has had its balance updated
        //    - Balance block numbers: bbn[] = [5310000, 5316000, 5318000, 5324000]
        //
        //  * Calculated balance blocks at each transfer to/from address a
        //    - Balance blocks: bb{} = {5310000: 0, 5316000: 6000000000000000000, 5318000: 4000000000000000000, 5324000: 18000000000000000000}
        //
        // ---
        // 
        // if ( bbn.length == 0 || 0 == to - from )
        //     return 0
        //
        // i = 0
        // while ( i < bbn.length
        //   && bbn[ i ] <= from )
        //     i++
        //
        // low = i == 0 ? from : bbn[ i - 1 ]
        //
        // res = bb[ i ]
        //   * ( bbn[ i ] - from )
        //   / ( bbn[ i ] - low )
        // i++
        //
        // while ( i < bbn.length
        //   && bbn[ i ] <= to )
        //     res += bb[ i ]
        //     i++
        //
        // if ( i >= bbn.length )
        //     res += b[b.length - 1] * ( to - bbn[ i - 1 ] )
        // else if ( bbn[ i - 1 ] < to )
        //     res += bb[ i ]
        //       * ( to - bbn[ i - 1 ] )
        //       / ( bbn[ i ] - bbn[ i - 1 ] )
        //
        // return res

        if (0 == balanceBlockNumbers[a].length || 0 == to.sub(from)) {
            return 0;
        }

        uint256 i = 0;
        while (i < balanceBlockNumbers[a].length
        && balanceBlockNumbers[a][i] <= from) {
            i++;
        }

        uint256 low = 0 == i ? from : balanceBlockNumbers[a][i - 1];

        uint256 res = balanceBlocks[a][i].mul(balanceBlockNumbers[a][i].sub(from)).div(balanceBlockNumbers[a][i].sub(low));
        i++;

        while (i < balanceBlockNumbers[a].length
        && balanceBlockNumbers[a][i] <= to) {
            res = res.add(balanceBlocks[a][i++]);
        }

        if (i >= balanceBlockNumbers[a].length) {
            res = res.add(balances[a].mul(to.sub(balanceBlockNumbers[a][i - 1])));
        } else if (balanceBlockNumbers[a][i - 1] < to) {
            res = res.add(balanceBlocks[a][i].mul(to.sub(balanceBlockNumbers[a][i - 1])).div(balanceBlockNumbers[a][i].sub(balanceBlockNumbers[a][i - 1])));
        }

        return res;
    }

    function startHoldersEnum() onlyOwner public view {
        holderEnumIndex = 0;
    }

    function holdersEnum() onlyOwner public view returns (address[]) {
        address[] memory _holders = new address[](128);
        uint256 counter = 0;

        while (counter < 128 && holderEnumIndex < holders.length) {
            if (balances[holders[holderEnumIndex]] > 0) {
                _holders[counter] = holders[holderEnumIndex];
                counter++;
            }
            holderEnumIndex++;
        }
        //while (counter < 128) {
        //    _holders[counter] = address(0);
        //    counter++;
        //}
        return  _holders;
    }
}