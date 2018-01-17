/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Copyright (C) 2017-2018 Hubii
 */
pragma solidity ^0.4.15;

import './ERC20.sol';
import './SafeMath.sol';

//TO-DO: Get transactions history
//       Remove zeppelin dependency
//       Check security

contract DexAssetsManager {
	address private owner;

	struct TransactionInfo {
		uint256 amount;
		uint256 timestamp;
		address token;      //0 for ethers
	}

	struct PerUserInfo {
		TransactionInfo[] deposits;

		uint256 allowedEthersWithdrawal;
		mapping (address => uint256) allowedTokensWithdrawal;

		TransactionInfo[] withdrawal;
	}

	mapping (address => PerUserInfo) private userInfoMap;

	//events
	event OwnerChanged(address oldOwner, address newOwner);

	event Deposit(address from, uint256 amount, address token); //token==0 for ethers
	event Withdraw(address to, uint256 amount, address token);  //token==0 for ethers

	function DexAssetsManager(address _owner) public {
		require(_owner != address(0));

		owner = _owner;
	}
	
	function changeOwner(address newOwner) public onlyOwner {
		require(newOwner != address(0));

		address oldOwner = owner;

		owner = newOwner;

		//raise event
		OwnerChanged(oldOwner, newOwner);
	}

	function () public payable {
		require(msg.sender != owner);
		require(msg.value > 0);

		//add deposit transaction
		userInfoMap[msg.sender].deposits.push(TransactionInfo(msg.value, now, 0));

		//raise event
		Deposit(msg.sender, msg.value, 0);
	}

	function depositTokens(address tokenAddress, uint256 amount) public {
		require(tokenAddress != address(0));
		require(amount > 0);

		ERC20 token = ERC20(tokenAddress);
		require(token.balanceOf(msg.sender) >= amount);

		//add deposit transaction
		userInfoMap[msg.sender].deposits.push(TransactionInfo(amount, now, tokenAddress));

		//raise event
		Deposit(msg.sender, amount, tokenAddress);
	}

	function getDepositsCount(address user) public view onlyOwner returns (uint256) {
		return userInfoMap[user].deposits.length;
	}

	function getDeposits(address user, uint index) public view onlyOwner returns (TransactionInfo) {
		require (index < userInfoMap[user].deposits.length);
		return userInfoMap[user].deposits[index];
	}

	function approveEthersWithdrawal(address beneficiary, uint256 amount) public onlyOwner {
		require(beneficiary != address(0));
		require(amount > 0);

		userInfoMap[beneficiary].allowedEthersWithdrawal = SafeMath.add(userInfoMap[beneficiary].allowedEthersWithdrawal, amount);
	}

	function approveTokensWithdrawal(address tokenAddress, address beneficiary, uint256 amount) public onlyOwner {
		require(tokenAddress != address(0));
		require(beneficiary != address(0));
		require(amount > 0);

		userInfoMap[beneficiary].allowedTokensWithdrawal[tokenAddress] = SafeMath.add(userInfoMap[beneficiary].allowedTokensWithdrawal[tokenAddress], amount);
	}

	function withdrawEthers() public {
		uint256 amount = userInfoMap[msg.sender].allowedEthersWithdrawal;
		userInfoMap[msg.sender].allowedEthersWithdrawal = 0;

		if (amount > 0) {
			//add withdrawal transaction
			userInfoMap[msg.sender].withdrawal.push(TransactionInfo(amount, now, 0));

			//transfer money to sender's wallet
			msg.sender.transfer(amount);
		}

		//raise event
		Withdraw(msg.sender, amount, 0);
	}


	function withdrawTokens(address tokenAddress) public {
		require(tokenAddress != address(0));
		ERC20 token = ERC20(tokenAddress);

		uint256 amount = userInfoMap[msg.sender].allowedTokensWithdrawal[tokenAddress];
		userInfoMap[msg.sender].allowedTokensWithdrawal[tokenAddress] = 0;

		if (amount > 0) {
			//add withdrawal transaction
			userInfoMap[msg.sender].withdrawal.push(TransactionInfo(amount, now, tokenAddress));

			//transfer tokens to sender's
			token.transfer(msg.sender, amount);
		}

		//raise event
		Withdraw(msg.sender, amount, tokenAddress);
	}

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}
}
