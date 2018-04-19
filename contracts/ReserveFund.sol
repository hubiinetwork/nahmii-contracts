/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;

/**
@title Reserve fund
@notice Fund into which users may make deposits and earn share of revenue relative to their contribution.
 There will likely be 2 instances of this smart contract, one for trade reserves and one for payment reserves.

*/

import './ERC20.sol';
import './SafeMath.sol';

contract ReserveFund {

    using SafeMath for uint256;

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
        mapping(address => uint256) lastTokenBalanceBlockNumber;
	}

	struct TransferInfo {
		address tokenAddress; // 0 for ethers.
		uint256 amount;
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

    uint256[] etherAccrualBlockNumbers;
    mapping(address => uint256[]) tokenAccrualBlockNumbers;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address wallet, uint256 amount, address tokenAddress);
    event StageEvent(address wallet, uint256 amount, address tokenAddress);
    event WithdrawEvent(address wallet, uint256 amount, address tokenAddress);
    event TwoWayTransferEvent(address wallet, TransferInfo inboundTx, TransferInfo outboundTx);

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
            periodAccrualEtherBalance.add(msg.value);
            aggregateAccrualEtherBalance.add(msg.value);
            etherAccrualBlockNumbers.push(block.number);
        }
        else {
            uint256 blockSpan = block.number.sub(walletInfoMap[msg.sender].lastEtherBalanceBlockNumber);
            uint256 balanceBlock = walletInfoMap[msg.sender].activeEtherBalance.mul(blockSpan);

            walletInfoMap[msg.sender].etherBalanceBlocks.push(balanceBlock);
            walletInfoMap[msg.sender].etherBalanceBlockNumbers.push(block.number);
            walletInfoMap[msg.sender].lastEtherBalanceBlockNumber = block.number;
         
            walletInfoMap[msg.sender].activeEtherBalance.add(msg.value);
		    aggregatedEtherBalance.add(msg.value);
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
            periodAccrualTokenBalance[tokenAddress].add(amount);
            aggregateAccrualTokenBalance[tokenAddress].add(amount);
            tokenAccrualBlockNumbers[tokenAddress].push(block.number);
        }
        else {
            uint256 blockSpan = block.number.sub(walletInfoMap[msg.sender].lastTokenBalanceBlockNumber[tokenAddress]);
            uint256 balanceBlock = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress].mul(blockSpan);

            walletInfoMap[msg.sender].tokenBalanceBlocks[tokenAddress].push(balanceBlock);
            walletInfoMap[msg.sender].tokenBalanceBlockNumbers[tokenAddress].push(block.number);
            walletInfoMap[msg.sender].lastTokenBalanceBlockNumber[tokenAddress] = block.number;
        
            walletInfoMap[msg.sender].activeTokenBalance[tokenAddress].add(amount);
		    aggregatedTokenBalance[tokenAddress].add(amount);
        }

        require(token.transferFrom(msg.sender, this, amount));
        walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length - 1));
		walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length - 1));

        //emit event
		emit DepositEvent(msg.sender, amount, tokenAddress);
	}

	function deposit(address wallet, uint index) public view returns (int256 amount, address token, uint256 blockNumber) {
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
            blockNumber = walletInfoMap[wallet].tokenBalanceBlockNumbers[dh.tokenAddress][index];
		}
 	}

    function depositCount(address wallet) public view returns (uint256) {
        return walletInfoMap[wallet].depositsHistory.length;
    }

    function periodAccrualBalance(address tokenAddress) public view returns (uint256) {
        return tokenAddress == address(0) ? periodAccrualEtherBalance : periodAccrualTokenBalance[tokenAddress];
    }

    function aggregateAccrualBalance(address tokenAddress) public view returns (uint256) {
        return tokenAddress == address(0) ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[tokenAddress];
    }

    function closeAccrualPeriod() public onlyOwner {

    }

    function balanceBlocksIn(address addr, address currency, uint256 startBlock, uint256 endBlock) public {
        
    }

    function stage(address tokenAddress, uint256 amount) public {
        require(msg.sender != owner);

        if (tokenAddress == address(0)) {
            if (amount > walletInfoMap[msg.sender].activeEtherBalance)
                amount = walletInfoMap[msg.sender].activeEtherBalance;
            require(amount > 0);

            walletInfoMap[msg.sender].activeEtherBalance.sub(amount);
            walletInfoMap[msg.sender].stagedEtherBalance.sub(amount);

            walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeEtherBalance));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length - 1));
        } else {
            if (amount > walletInfoMap[msg.sender].activeTokenBalance[tokenAddress])
                amount = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress];
            require(amount > 0);

            walletInfoMap[msg.sender].activeTokenBalance[tokenAddress].sub(amount);
            walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress].sub(amount);

            walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]));

            walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length - 1));
        }

        //emit event
        emit StageEvent(msg.sender, amount, tokenAddress);
    }

	function activeBalance(address wallet, address tokenAddress) public view returns (uint256) {
		//if no wallet provided, get the current aggregated balance
		if (wallet == address(0)) {
			if (tokenAddress == address(0))
				return aggregatedEtherBalance;

			return aggregatedTokenBalance[tokenAddress];
		}
        else {
            if (tokenAddress == address(0))
				return walletInfoMap[wallet].activeEtherBalance;

			return walletInfoMap[wallet].activeTokenBalance[tokenAddress];
		}	
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
		walletInfoMap[msg.sender].stagedEtherBalance.sub(amount);
	
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
		walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress].sub(amount);
	
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

			walletInfoMap[wallet].stagedEtherBalance.add(outboundTx.amount);
			aggregatedEtherBalance.sub(outboundTx.amount);

		} else {
			if (outboundTx.amount >= aggregatedTokenBalance[outboundTx.tokenAddress]) {
				return false;
			}

			walletInfoMap[wallet].stagedTokenBalance[outboundTx.tokenAddress].add(outboundTx.amount);
			aggregatedTokenBalance[outboundTx.tokenAddress].sub(outboundTx.amount);
		}

		// Perform inbound (w to SC) transfers

		if (inboundTx.tokenAddress == address(0)) {
			require(walletInfoMap[wallet].stagedEtherBalance >= inboundTx.amount);
			walletInfoMap[wallet].stagedEtherBalance.sub(inboundTx.amount);
			aggregatedEtherBalance.add(inboundTx.amount);

		} else {
			require(walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress] >= inboundTx.amount);
			walletInfoMap[wallet].stagedTokenBalance[inboundTx.tokenAddress].sub(inboundTx.amount);
			aggregatedTokenBalance[inboundTx.tokenAddress].add(inboundTx.amount);
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