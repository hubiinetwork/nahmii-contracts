/*
 * Hubii Striim
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import "./ERC165.sol";

contract ERC721 is ERC165 {
    bytes4 internal constant InterfaceId_ERC721 = 0x80ac58cd;
    bytes4 internal constant InterfaceId_ERC721Exists = 0x4f558e79;
    bytes4 internal constant InterfaceId_ERC721Enumerable = 0x780e9d63;
    bytes4 internal constant InterfaceId_ERC721Metadata = 0x5b5e139f;

    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    function balanceOf(address _owner) public view returns (uint256 _balance);
    function ownerOf(uint256 _tokenId) public view returns (address _owner);
    function exists(uint256 _tokenId) public view returns (bool _exists);
    function approve(address _to, uint256 _tokenId) public;
    function getApproved(uint256 _tokenId) public view returns (address _operator);
    function setApprovalForAll(address _operator, bool _approved) public;
    function isApprovedForAll(address _owner, address _operator) public view returns (bool);
    function transferFrom(address _from, address _to, uint256 _tokenId) public;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) public;

    function totalSupply() public view returns (uint256);
    function tokenOfOwnerByIndex( address _owner, uint256 _index) public view returns (uint256 _tokenId);

    function name() external view returns (string _name);
    function symbol() external view returns (string _symbol);
    function tokenURI(uint256 _tokenId) public view returns (string);
}
