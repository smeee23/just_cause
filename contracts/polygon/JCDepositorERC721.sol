// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import {IPool, IPoolAddressesProvider} from './Interfaces.sol';

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JCDepositorERC721
 * @author JustCause
 * This is a proof of concept starter contract for lossless donations
 *
 * Aave v3 is used to generate interest for crowdfunding
 *
 * Creates an ERC721 with info regarding each Just Cause Pool depositor
 *
 * Inherets from openzeppelin ERC721 contracts
 *
 **/

contract JCDepositorERC721 is ERC721Enumerable, ERC721URIStorage, Ownable {

    struct Deposit {
        uint256 balance;
        uint256 timeStamp;
        address pool;
        address asset;
    }

    IPoolAddressesProvider provider;
    address poolAddr;

    //key = keccak hash of depositor, pool and asset addresses
    mapping (uint256 => Deposit) deposits;

    /**
    * @dev Constructor.
    */
    constructor(address _poolAddressesProviderAddr) ERC721("JCP Contributor Token", "JCPC") {
        provider = IPoolAddressesProvider(_poolAddressesProviderAddr); // polygon mumbai v3
        poolAddr = provider.getPool();
    }

    /**
    * @dev Creates NFT for depositor if first deposit for pool and asset
    * @param _tokenOwner address of depositor
    * @param _timeStamp timeStamp of token creation
    * @param _pool address of JCP
    * @param _metaUri meta info uri for nft of JCP
    * @param _asset The address of the underlying asset of the reserve
    * @return tokenId unique tokenId keccak hash of depositor, pool and asset addresses
    **/
    function addFunds(
        address _tokenOwner,
        uint256 _amount,
        uint256 _timeStamp,
        address _pool,
        address _asset,
        string memory _metaUri
    ) public onlyOwner returns (uint256) {

        //tokenId is keccak hash of depositor, pool and asset addresses
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        if(_exists(tokenId)){
            deposits[tokenId].timeStamp = _timeStamp;
            deposits[tokenId].balance += _amount;
        }
        else{
            deposits[tokenId] = Deposit(_amount, _timeStamp, _pool, _asset);
            _mint(_tokenOwner, tokenId);
            _setTokenURI(tokenId, _metaUri);
        }

        return tokenId;
    }

    /**
    * @dev Withdraw balance for depositor
    * @param _tokenOwner address of depositor
    * @param _amount amount to withdraw
    * @param _pool address of JCP
    * @param _asset The address of the underlying asset of the reserve
    **/
    function withdrawFunds(address _tokenOwner, uint256 _amount, address _pool, address _asset) onlyOwner external {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        require(_exists(tokenId), "tokenId doesn't exist");

        uint256 balance = deposits[tokenId].balance;
        require(balance >= _amount, "insufficient balance");
        balance -= _amount;
        if(balance == 0){
            deposits[tokenId].timeStamp = 0;
        }
        deposits[tokenId].balance = balance;
    }

    /**
    * @param _tokenId unique tokenId keccak hash of depositor, pool and asset addresses
    * @return Deposit struct containing info about deposit
    **/
    function getDepositInfo(uint256 _tokenId) public view returns (Deposit memory){
        return deposits[_tokenId];
    }

    /**
    * @param _tokenId unique tokenId keccak hash of depositor, pool and asset addresses
    * @return asset balance of user in pool
    **/
    function getUserBalance(uint256 _tokenId) public view returns (uint256){
        return deposits[_tokenId].balance;
    }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        require(from == address(0), "non-transferrable");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}