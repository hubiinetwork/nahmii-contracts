/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Compliant to Omphalos 0.11 Specification.
 *
 * Copyright (C) 2017-2018 Hubii
 */
pragma solidity ^0.4.19;

import './ERC20.sol';
import './SafeMath.sol';

pragma experimental ABIEncoderV2;

contract DexReserveFunds {
	//
	// Structures
	// -----------------------------------------------------------------------------------------------------------------
	struct DepositInfo {
 		uint256 amount;
 		uint256 timestamp;
 		address token;      //0 for ethers
 	}

	struct PerWalletInfo {
		uint256 tradeNonce;

		DepositInfo[] deposits;

		// Active balance of ethers and tokens.
		uint256 activeEtherBalance;
		mapping (address => uint256) activeTokenBalance;

		// Staged balance of ethers and tokens.
		uint256 stagedEtherBalance;
		mapping (address => uint256) stagedTokenBalance;
	}

	//
	// Variables
	// -----------------------------------------------------------------------------------------------------------------
	address private owner;

	mapping (address => PerWalletInfo) private walletInfoMap;

	uint256 aggregatedEtherBalance;
	mapping (address => uint256) aggregatedTokenBalance;

	uint256 renevueEtherBalance;
	mapping(address => uint256) renevueTokenBalance;

	//
	// Events
	// -----------------------------------------------------------------------------------------------------------------
	event OwnerChanged(address oldOwner, address newOwner);
	event Deposit(address from, uint256 amount, address token); //token==0 for ethers
	event AddRevenueEvent(uint256 amount, address token); //token==0 for ethers

	//
	// Constructor and owner change
	// -----------------------------------------------------------------------------------------------------------------
	function DexReserveFunds(address _owner) public {
		require(_owner != address(0));

		owner = _owner;

		aggregatedEtherBalance = 0;
		renevueEtherBalance = 0;
	}
	
	function changeOwner(address newOwner) public onlyOwner {
		address oldOwner;

		require(newOwner != address(0));

		if (newOwner != owner) {
			//set new owner
			oldOwner = owner;
			owner = newOwner;

			//emit event
			OwnerChanged(oldOwner, newOwner);
		}
	}

	//
	// Deposit functions
	// -----------------------------------------------------------------------------------------------------------------
	function () public payable {
		require(msg.sender != owner);
		require(msg.value > 0);
		
		//add to per-wallet active balance
		walletInfoMap[msg.sender].activeEtherBalance = SafeMath.add(walletInfoMap[msg.sender].activeEtherBalance, msg.value);
		walletInfoMap[msg.sender].deposits.push(DepositInfo(msg.value, now, address(0)));
		//walletInfoMap[msg.sender].depositsTimestampMap[now] = walletInfoMap[msg.sender].deposits.length;  <<--- not added yet

		//add to aggregated balance
		aggregatedEtherBalance = SafeMath.add(aggregatedEtherBalance, msg.value);

		//emit event
		Deposit(msg.sender, msg.value, address(0));
	}

	function depositTokens(address tokenAddress, uint256 amount) public {
		ERC20 token;

		require(msg.sender != owner);
		require(tokenAddress != address(0));
		require(amount > 0);

		//try to execute token transfer
		token = ERC20(tokenAddress);
		require(token.transferFrom(msg.sender, this, amount));

		//add to per-wallet active balance
		walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);
		walletInfoMap[msg.sender].deposits.push(DepositInfo(amount, now, tokenAddress));
		//walletInfoMap[msg.sender].depositsTimestampMap[now] = walletInfoMap[msg.sender].deposits.length;  <<--- not added yet

		//add to aggregated balance
		aggregatedTokenBalance[tokenAddress] = SafeMath.add(aggregatedTokenBalance[tokenAddress], amount);

		//emit event
		Deposit(msg.sender, amount, tokenAddress);
	}

	function deposit(address wallet, uint index) public view onlyOwner returns (uint256 amount, uint256 timestamp, address token) {
 		require(index < walletInfoMap[wallet].deposits.length);

 		amount = walletInfoMap[wallet].deposits[index].amount;
 		timestamp = walletInfoMap[wallet].deposits[index].timestamp;
 		token = walletInfoMap[wallet].deposits[index].token;
 	}

	function depositCount(address wallet) public view onlyOwner returns (uint256) {
 		return walletInfoMap[wallet].deposits.length;
 	}

	//
	// Reneuve functions
	// -----------------------------------------------------------------------------------------------------------------
	function addRevenue(address tokenAddress, uint256 amount) public onlyOwner {
		require(amount > 0);

		if (tokenAddress == address(0)) {
			renevueEtherBalance = SafeMath.add(renevueEtherBalance, amount);
		} else {
			renevueTokenBalance[tokenAddress] = SafeMath.add(renevueTokenBalance[tokenAddress], amount);
		}

		//emit event
		AddRevenueEvent(amount, tokenAddress);
	}

	function renevueBalance(address tokenAddress) public view onlyOwner returns (uint256) {
		if (tokenAddress == address(0))
	 		return renevueEtherBalance;
		return renevueTokenBalance[tokenAddress];
 	}

	//
	// Helper internal functions
	// -----------------------------------------------------------------------------------------------------------------
	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}
}
