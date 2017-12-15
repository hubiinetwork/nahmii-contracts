/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Copyright (C) 2017 CoinFabrik
 */
pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/ERC20.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

//TO-DO: Get transactions history
//       Remove zeppelin dependency
//       Check security

contract DexAssetsManager {
	using SafeMath for uint256;

	address private owner;

	struct TransactionInfo {
		uint256 amount;
		uint256 timestamp;
	}

	struct PerUserInfo {
		TransactionInfo[] ethersDeposit;
		mapping (address => TransactionInfo[]) tokensDeposit;

		uint256 allowedEthersWithdrawal;
		mapping (address => uint256) allowedTokensWithdrawal;

		TransactionInfo[] ethersWithdrawal;
		mapping (address => TransactionInfo[]) tokensWithdrawal;
	}

	mapping (address => PerUserInfo) private userInfoMap;

	//events
	event OwnerChanged(address oldOwner, address newOwner);

	event EthersDeposited(address from, uint256 amount);
	event TokensDeposited(address token, address from, uint256 amount);
	event EthersWithdrawn(address to, uint256 amount);
	event TokensWithdrawn(address token, address to, uint256 amount);

	function DexAssetsManager(address _owner) {
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
		TransactionInfo tx;

		require(msg.sender != wallet);
		require(msg.value > 0);

		//add deposit transaction
		tx.amount = msg.value;
		tx.timestamp = now;
		userInfoMap[msg.sender].ethersDeposit.push(tx);

		//raise event
		EthersDeposited(msg.sender, tx.amount);
	}

	function depositTokens(address tokenAddress, uint256 amount) {
		TransactionInfo tx;

		require(tokenAddress != address(0));
		require(amount > 0);

		ERC20 token = ERC20(tokenAddress);
		require(token.balanceOf(msg.sender) >= amount);

		//add deposit transaction
		tx.amount = amount;
		tx.timestamp = now;
		userInfoMap[msg.sender].tokensDeposit[tokenAddress].push(tx);

		//raise event
		TokensDeposited(tokenAddress, msg.sender, weiAmount);
	}

	function approveEthersWithdrawal(address beneficiary, uint256 amount) public onlyOwner {
		require(beneficiary != address(0));
		require(amount > 0);

		userInfoMap[beneficiary].allowedEthersWithdrawal = userInfoMap[beneficiary].allowedEthersWithdrawal.add(amount);
	}

	function approveTokensWithdrawal(address tokenAddress, address beneficiary, uint256 amount) public onlyOwner {
		require(tokenAddress != address(0));
		require(beneficiary != address(0));
		require(amount > 0);

		userInfoMap[beneficiary].allowedTokensWithdrawal[tokenAddress] = userInfoMap[beneficiary].allowedTokensWithdrawal[tokenAddress].add(amount);
	}

	function withdrawEthers() {
		uint256 amount = userInfoMap[msg.sender].allowedEthersWithdrawal;
		userInfoMap[msg.sender].allowedEthersWithdrawal = 0;

		if (amount > 0) {
			TransactionInfo tx;

			tx.amount = amount;
			tx.timestamp = now;

			//transfer money to sender's wallet
			msg.sender.transfer(tx.amount);
		}

		//raise event
		EthersWithdrawn(msg.sender, amount);
	}


	function withdrawTokens(address tokenAddress) {
		require(tokenAddress != address(0));
		ERC20 token = ERC20(tokenAddress);

		uint256 amount = userInfoMap[msg.sender].allowedTokensWithdrawal[tokenAddress];
		userInfoMap[msg.sender].allowedTokensWithdrawal[tokenAddress] = 0;

		if (amount > 0) {
			TransactionInfo tx;

			tx.amount = amount;
			tx.timestamp = now;

			//transfer tokens to sender's
			token.transfer(tx.amount);
		}

		//raise event
		TokensWithdrawn(tokenAddress, msg.sender, amount);
	}

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}
}
