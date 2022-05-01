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
        //uint256 interestEarned;
        uint256 timeStamp;
        uint256 amountScaled;
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
    ) onlyOwner public returns (uint256) {

        //tokenId is keccak hash of depositor, pool and asset addresses
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        uint256 liquidityIndex = getAaveLiquidityIndex(_asset);
        if(_exists(tokenId)){
            //if(deposits[tokenId][_asset].pool != address(0)){
                deposits[tokenId].timeStamp = _timeStamp;
                deposits[tokenId].balance += _amount;
                deposits[tokenId].amountScaled += rayDiv(_amount, liquidityIndex);
            //}
        }
        else{
            deposits[tokenId] = Deposit(_amount, _timeStamp, rayDiv(_amount, liquidityIndex), _pool, _asset);
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
            // problem is if claimant calls claim this alters the interest earned
            //deposits[tokenId].interestEarned += getATokenAmount(tokenId) - _amount;
            deposits[tokenId].timeStamp = 0;
            deposits[tokenId].amountScaled = 0;
        }
        else{
            deposits[tokenId].amountScaled -= rayDiv(_amount, getAaveLiquidityIndex(_asset));
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

    /**
    * @param _tokenId unique tokenId keccak hash of depositor, pool and asset addresses
    * @return aToken accrued
    **/
    function getATokenAmount(uint256 _tokenId) internal view returns(uint256){
        //if claimant calls claim this alters the amount
        return rayMul(deposits[_tokenId].amountScaled, getReserveNormalizedIncome(deposits[_tokenId].asset));
    }

    /**
    * @param _asset The address of the underlying asset of the reserve
    * @return reserve normalized income from aave
    **/
    function getReserveNormalizedIncome(address _asset) public view returns(uint256){
        return IPool(poolAddr).getReserveNormalizedIncome(_asset);
    }

    /**
    * @param _asset The address of the underlying asset of the reserve
    * @return liquidityIndex liquidity index from aave
    **/
    function getAaveLiquidityIndex(address _asset) public view returns(uint256 liquidityIndex){
        liquidityIndex = IPool(poolAddr).getReserveData(_asset).liquidityIndex;
    }

    /**
   * @dev Divides two ray, rounding half up to the nearest ray
   * @param a Ray
   * @param b Ray
   * @return The result of a/b, in ray
   **/
    function rayDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, 'division by 0');
        uint256 halfB = b / 2;

        uint256 ray = 1e27;
        require(a <= (type(uint256).max - halfB) / ray, 'multiplication overflow');

        return (a * ray + halfB) / b;
    }

   /**
   * @dev Multiplies two ray, rounding half up to the nearest ray
   * @param a Ray
   * @param b Ray
   * @return The result of a*b, in ray
   **/
  function rayMul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0 || b == 0) {
      return 0;
    }

    uint256 ray = 1e27;
    uint256 halfRAY = ray / 2;
    require(a <= (type(uint256).max - halfRAY) / b, 'multiplication overflow');

    return (a * b + halfRAY) / ray;
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        require(from == address(0), "non transferrable");
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