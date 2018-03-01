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
 		int256 amount;
 		uint256 timestamp;
		uint256 balance;
 	}

	 struct DepositHistory {
		 address tokenAddress;
		 uint listIndex;
	 }

	struct PerWalletInfo {
		uint256 tradeNonce;

		DepositInfo[] depositsEther;
		mapping (address => DepositInfo[]) depositsToken;

		// Active balance of ethers and tokens.
		uint256 activeEtherBalance;
		mapping (address => uint256) activeTokenBalance;

		// Staged balance of ethers and tokens.
		uint256 stagedEtherBalance;
		mapping (address => uint256) stagedTokenBalance;

		DepositHistory[] depositsHistory;
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
	event OwnerChangedEvent(address oldOwner, address newOwner);
	event DepositEvent(address from, uint256 amount, address token); //token==0 for ethers
	event AddRevenueEvent(uint256 amount, address token); //token==0 for ethers
	event StageEvent(address from, uint256 amount, address token); //token==0 for ethers
	event UnstageEvent(address from, uint256 amount, address token); //token==0 for ethers


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
			OwnerChangedEvent(oldOwner, newOwner);
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
		walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(msg.value), now, walletInfoMap[msg.sender].activeEtherBalance));

		walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length));

		//add to aggregated balance
		aggregatedEtherBalance = SafeMath.add(aggregatedEtherBalance, msg.value);

		//emit event
		DepositEvent(msg.sender, msg.value, address(0));
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
		walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]));

		walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length));

		//add to aggregated balance
		aggregatedTokenBalance[tokenAddress] = SafeMath.add(aggregatedTokenBalance[tokenAddress], amount);

		//emit event
		DepositEvent(msg.sender, amount, tokenAddress);
	}

	function deposit(address wallet, uint index) public view onlyOwner returns (int256 amount, uint256 timestamp, address token) {
 		require(index < walletInfoMap[wallet].depositsHistory.length);

		DepositHistory storage dh = walletInfoMap[wallet].depositsHistory[index];
		//NOTE: Code duplication in order to keep compiler happy and avoid warnings
		if (dh.tokenAddress == address(0)) {
			DepositInfo[] storage di = walletInfoMap[wallet].depositsEther;

			amount = di[dh.listIndex].amount;
			timestamp = di[dh.listIndex].timestamp;
			token = address(0);
		} else {
			DepositInfo[] storage diT = walletInfoMap[wallet].depositsToken[dh.tokenAddress];
			amount = diT[dh.listIndex].amount;
			timestamp = diT[dh.listIndex].timestamp;
			token = dh.tokenAddress;
		}
 	}

	function depositCount(address wallet) public view onlyOwner returns (uint256) {
 		return walletInfoMap[wallet].depositsHistory.length;
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

	//
	// Staging functions
	// -----------------------------------------------------------------------------------------------------------------
	function stage(address tokenAddress, uint256 amount) public {
		require(msg.sender != owner);

		if (tokenAddress == address(0)) {
			if (amount > walletInfoMap[msg.sender].activeEtherBalance)
				amount = walletInfoMap[msg.sender].activeEtherBalance;
			require(amount > 0);

			walletInfoMap[msg.sender].activeEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].activeEtherBalance, amount);
			walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.add(walletInfoMap[msg.sender].stagedEtherBalance, amount);

			walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeEtherBalance));

			walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length));
		} else {
			if (amount > walletInfoMap[msg.sender].activeTokenBalance[tokenAddress])
				amount = walletInfoMap[msg.sender].activeTokenBalance[tokenAddress];
			require(amount > 0);

			walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.sub(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);
			walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress], amount);

			walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]));

			walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length));
		}

		//emit event
		StageEvent(msg.sender, amount, tokenAddress);
	}

	function unstage(address tokenAddress, uint256 amount) public {
		require(msg.sender != owner);
	
		if (tokenAddress == address(0)) {
			if (amount > walletInfoMap[msg.sender].stagedEtherBalance)
				amount = walletInfoMap[msg.sender].stagedEtherBalance;
			require(amount > 0);

			walletInfoMap[msg.sender].activeEtherBalance = SafeMath.add(walletInfoMap[msg.sender].activeEtherBalance, amount);
			walletInfoMap[msg.sender].stagedEtherBalance = SafeMath.sub(walletInfoMap[msg.sender].stagedEtherBalance, amount);

			walletInfoMap[msg.sender].depositsEther.push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeEtherBalance));

			walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(address(0), walletInfoMap[msg.sender].depositsEther.length));
		} else {
			if (amount > walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress])
				amount = walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress];
			require(amount > 0);

			walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress] = SafeMath.sub(walletInfoMap[msg.sender].stagedTokenBalance[tokenAddress], amount);
			walletInfoMap[msg.sender].activeTokenBalance[tokenAddress] = SafeMath.add(walletInfoMap[msg.sender].activeTokenBalance[tokenAddress], amount);

			walletInfoMap[msg.sender].depositsToken[tokenAddress].push(DepositInfo(int256(amount), now, walletInfoMap[msg.sender].activeTokenBalance[tokenAddress]));

			walletInfoMap[msg.sender].depositsHistory.push(DepositHistory(tokenAddress, walletInfoMap[msg.sender].depositsToken[tokenAddress].length));
		}

		//emit event
		UnstageEvent(msg.sender, amount, tokenAddress);
	}

	//
	// Balance retrieval
	// -----------------------------------------------------------------------------------------------------------------
	function activeBalance(address wallet, address tokenAddress, uint256 timestamp) public returns (uint256) {
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

	function stagedBalance(address wallet, address tokenAddress) public returns (uint256) {
		if (tokenAddress == address(0))
			return walletInfoMap[wallet].stagedEtherBalance;
		return walletInfoMap[wallet].stagedTokenBalance[tokenAddress];
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

	function activeBalanceLookup(uint256 timestamp, DepositInfo[] storage deposits) internal returns (uint256) {
		uint lo;
		uint hi;
		uint mid;

		hi = deposits.length;
		if (hi == 0)
			return 0; //no deposits

		//lookup for balance at the given timestamp (NOTE: mid has an offset of one)
		lo = 1;
		while (lo <= hi) {
			mid = lo + (hi - lo) / 2;
			if (timestamp == deposits[mid - 1].timestamp) {
				while (mid < deposits.length && timestamp == deposits[mid - 1].timestamp) {
					mid++;
				}
				break;
			}
			if (timestamp < deposits[mid - 1].timestamp)
				hi = mid;
			else
				lo = mid + 1;
		}
		if (lo > hi)
			mid = deposits.length; //if not found, get the latest

		return deposits[mid - 1].balance;
	}
}
