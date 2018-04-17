/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

/**
@title Reserve fund
@notice Fund into which users may make deposits and earn share of revenue relative to their contribution.
 There will likely be 2 instances of this smart contract, one for trade reserves and one for payment reserves.

*/

import './ERC20.sol';
import './SafeMath.sol';

using SafeMath for uint;

contract ReserveFund {

    //
	// Structures
	// -----------------------------------------------------------------------------------------------------------------
	struct DepositHistory {
		 address tokenAddress;
		 uint listIndex;
	 }

    struct DepositInfo {
 		int256 amount;
 		uint256 timestamp;
		uint256 balance;
 	}

	struct PerWalletInfo {

		DepositInfo[] depositsEther;
		mapping (address => DepositInfo[]) depositsToken;

		// Active balance of ethers and tokens.
		uint256 activeEtherBalance;
		mapping (address => uint256) activeTokenBalance;

		// Staged balance of ethers and tokens.
		uint256 stagedEtherBalance;
		mapping (address => uint256) stagedTokenBalance;

		DepositHistory[] depositsHistory;

        // Calculated ether balance blocks at each transfer to/from wallet
        uint256[] etherBalanceBlocks;

        // Block numbers at which address a has had its ether balance updated
        uint256[] etherBalanceBlockNumbers;
        uint256 lastEtherBalanceBlockNumber;

        // Calculated token balance blocks at each transfer to/from wallet
        mapping(address => uint256[]) tokenBalanceBlocks;

        // Block numbers at which address a has had its ether balance updated
        mapping(address => uint256[]) tokenBalanceBlockNumbers;
        mapping(address => uint256) lastEtherBalanceBlockNumber;
	}

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;
    
    uint256 aggregatedEtherBalance;
	mapping (address => uint256) aggregatedTokenBalance;

    uint256 aggregateAccrualEtherBalance;
    uint256 periodAccrualEtherBalance;
    mapping (address => uint256) aggregateAccrualTokenBalance;
    mapping (address => uint256) periodAccrualTokenBalance;

	mapping (address => PerWalletInfo) private walletInfoMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function ReserveFund(address _owner) public notNullAddress(_owner) {
		owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------

    function () public payable {
        require(msg.value > 0);

        if (msg.sender == owner) {
            periodAccrualEtherBalance += msg.value;
            aggregateAccrualEtherBalance += msg.value;
        }
        else {
            uint256 blockSpan = block.number - lastEtherBalanceBlockNumber;
            uint256 balanceBlock = walletInfoMap[wallet].activeEtherBalance * blockSpan;

            walletInfoMap[wallet].etherBalanceBlocks.push(balanceBlock);
            walletInfoMap[wallet].etherBalanceBlockList.push(block.number);
            etherLastBalanceBlockNumber = block.number;
         
            walletInfoMap[msg.sender].activeEtherBalance += msg.value;
		    aggregatedEtherBalance += msg.value;
        }

		//add to per-wallet active balance
		walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(msg.value), now, walletInfoMap[msg.sender].activeEtherBalance));
		walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length - 1));

		//emit event
		emit DepositEvent(msg.sender, msg.value, address(0));
	}

	function depositTokens(address tokenAddress, uint256 amount) public {
		require(tokenAddress != address(0));
		require(amount > 0);
        ERC20 token = ERC20(tokenAddress);

        if (msg.sender == owner) {
            periodAccrualTokenBalance[tokenAddress] += msg.value;
            aggregateAccrualTokenBalance[tokenAddress] += msg.value;
        else {
            uint256 blockSpan = block.number - lastTokenBalanceBlockNumber[tokenAddress];
            uint256 balanceBlock = walletInfoMap[wallet].activeTokenBalance[tokenAddress] * blockSpan;

            walletInfoMap[wallet].tokenBalanceBlocks[tokenAddress].push(balanceBlock);
            walletInfoMap[wallet].tokenBalanceBlockList[tokenAddress].push(block.number);
            lastTokenBalanceBlockNumber[tokenAddress] = block.number;
        
            walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] += msg.value;
		    aggregatedTokenBalance[tokenAddress] += msg.value;
        }

        require(token.transferFrom(msg.sender, this, amount));
        walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length - 1));
		walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length - 1));

        //emit event
		emit DepositEvent(msg.sender, amount, tokenAddress);
	}

	function deposit(address wallet, uint index) public view onlyOwner returns (int256 amount, address token, uint256 blockNumber) {
 		require(index < walletInfoMap[wallet].depositsHistory.length);

		DepositHistory storage dh = walletInfoMap[wallet].depositsHistory[index];
		//NOTE: Code duplication in order to keep compiler happy and avoid warnings
		if (dh.tokenAddress == address(0)) {
			DepositInfo[] storage di = walletInfoMap[wallet].depositsEther;

			amount = di[dh.listIndex].amount;
			token = address(0);
            blockNumber = walletInfoMap[wallet].etherBalanceBlockNumbers[index];
		} else {
			DepositInfo[] storage diT = walletInfoMap[wallet].depositsToken[dh.tokenAddress];
			amount = diT[dh.listIndex].amount;
			token = dh.tokenAddress;
            blockNumber = walletInfoMap[wallet].tokenBalanceBlockNumbers[tokenAddress][index];
		}
 	}

    function depositCount(address wallet) public view onlyOwner returns (uint256) {
        return walletInfoMap[wallet].depositsHistory.length;
    }

    function periodAccrualBalance(address currency) public view {

    }

    function aggregateAccrualBalance() {

    }

    function closeAccrualPeriod() {

    }

    function balanceBlocksIn(address addr, address currency, uint256 startBlock, uint256 endBlock) {
        
    }

    function stage(address tokenAddress, uint256 amount) public {
        require(msg.sender != owner);

        if (tokenAddress == address(0)) {
            if (amount > walletInfoMap[msg.sender].activeEtherBalance)
                amount = walletInfoMap[msg.sender].activeEtherBalance;
            require(amount > 0);

            walletInfoMap[msg.sender].activeEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].activeEtherBalance, amount);
            walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.add(walletInfoMap[msg.sender].stagedEtherBalance, amount);

            walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeEtherBalance));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length - 1));
        } else {
            if (amount > walletInfoMap[msg.sender].activeTokenBalance[tokenAddress])
                amount = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress];
            require(amount > 0);

            walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.sub(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);
            walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress], amount);

            walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length - 1));
        }

        //emit event
        emit StageEvent(msg.sender, amount, tokenAddress);
    }

	function activeBalance(address wallet, address tokenAddress, uint256 timestamp) public view returns (uint256) {
		//if no wallet provided, get the current aggregated balance
		if (wallet == address(0)) {
			if (tokenAddress == address(0))
				return aggregatedEtherBalance;
			return aggregatedTokenBalance[tokenAddress];
		}

		//if no timestamp, get the current balance
		if (timestamp == 0) {
			if (tokenAddress == address(0))
				return walletInfoMap[wallet].activeEtherBalance;
			return walletInfoMap[wallet].activeTokenBalance[tokenAddress];
		}

		if (tokenAddress == address(0))
			return activeBalanceLookup(timestamp, walletInfoMap[wallet].depositsEther);
		return activeBalanceLookup(timestamp, walletInfoMap[wallet].depositsToken[tokenAddress]);
	}

	function stagedBalance(address wallet, address tokenAddress) public view returns (uint256) {
		if (tokenAddress == address(0))
			return walletInfoMap[wallet].stagedEtherBalance;
		return walletInfoMap[wallet].stagedTokenBalance[tokenAddress];
	}

    function withdrawEther(uint256 amount) public {
		require(msg.sender != owner);
		if (amount > walletInfoMap[msg.sender].stagedEtherBalance) {
			amount = walletInfoMap[msg.sender].stagedEtherBalance;
		}
		require(amount > 0);

		msg.sender.transfer(amount);
		walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].stagedEtherBalance, amount);
	
		//raise event
		emit WithdrawEvent(msg.sender, amount, address(0));
	}

	function withdrawTokens(address tokenAddress, uint256 amount) public {
		require(msg.sender != owner);
		require(tokenAddress != address(0));
		if (amount > walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress]) {
			amount = walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress];
		}
		require(amount > 0);

		ERC20 token = ERC20(tokenAddress);
		token.transfer(msg.sender, amount);
		walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = SafeMath.sub(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress], amount);
	
		//raise event
		emit WithdrawEvent(msg.sender, amount, tokenAddress);
	}

    function twoWayTransfer(address wallet, TransferInfo inboundTx, TransferInfo outboundTx) public onlyOwner returns (bool) {
		require (inboundTx.amount > 0);
		require (outboundTx.amount > 0);
		require (wallet != address(0));

		// Perform outbound (SC to W) transfers
			
		if (outboundTx.tokenAddress == address(0)) {
			if (outboundTx.amount >= aggregatedEtherBalance) {
					return false;
			}

			walletInfoMap[wallet].stagedEtherBalance = SafeMath.add(walletInfoMap[wallet].stagedEtherBalance, outboundTx.amount);
			aggregatedEtherBalance = SafeMath.sub(aggregatedEtherBalance, outboundTx.amount);

		} else {
			if (outboundTx.amount >= aggregatedTokenBalance[outboundTx.tokenAddress]) {
				return false;
			}

			walletInfoMap[wallet].stagedTokenBalance[outboundTx.tokenAddress] = SafeMath.add(walletInfoMap[wallet].stagedTokenBalance[outboundTx.tokenAddress], outboundTx.amount);
			aggregatedTokenBalance[outboundTx.tokenAddress] = SafeMath.sub(aggregatedTokenBalance[outboundTx.tokenAddress] , outboundTx.amount);
		}

		// Perform inbound (w to SC) transfers

		if (inboundTx.tokenAddress == address(0)) {
			require(walletInfoMap[wallet].stagedEtherBalance >= inboundTx.amount);
			walletInfoMap[wallet].stagedEtherBalance = SafeMath.sub(walletInfoMap[wallet].stagedEtherBalance, inboundTx.amount);
			aggregatedEtherBalance = SafeMath.add(aggregatedEtherBalance, inboundTx.amount);

		} else {
			require(walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress] >= inboundTx.amount);
			walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress] = SafeMath.sub(walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress], inboundTx.amount);
			aggregatedTokenBalance[inboundTx.tokenAddress] = SafeMath.add(aggregatedTokenBalance[inboundTx.tokenAddress], inboundTx.amount);
		}		

		//raise event
		//
		emit TwoWayTransferEvent(wallet, inboundTx, outboundTx);
		
		return true;
	}

    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        address oldOwner;

        if (newOwner != owner) {
            // Set new owner
            oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    //
    // Internal helper functions
    // -----------------------------------------------------------------------------------------------------------------
    function calculateNewBalanceBlock(address wallet, address tokenAddress) internal returns(uint256) {
        uint256 currentBalance;
        
    }



    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}