// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JCDepositorERC721 is ERC721Enumerable, Ownable {
    //using Counters for Counters.Counter;
    //Counters.Counter private _tokenIndexes;

    struct Deposit {
        uint256 balance;
        uint256 totalDeposits;
        uint256 timeStamp;
        uint256 liquidityIndex;
        address pool;
        address asset;
    }

    //key = keccak hash of depositor, pool and asset addresses
    mapping (uint256 => Deposit) deposits;

    constructor() ERC721("JCP Depositor Token", "JCPT_TEST_D1") {

    }

    function addFunds(address _tokenOwner, uint256 _amount, uint256 _liquidityIndex, uint256 _timeStamp, address _pool, address _asset) onlyOwner public returns (uint256) {
        //_tokenIds.increment();
        //uint256 tokenId = _tokenIds.current();
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        if(_exists(tokenId)){
            deposits[tokenId].balance += _amount;
            deposits[tokenId].totalDeposits += _amount;
        }
        else{
            deposits[tokenId] = Deposit(_amount, _amount, _timeStamp, _liquidityIndex, _pool, _asset);
            _mint(_tokenOwner, tokenId);
        }
        //_setTokenURI(tokenId, tokenURI);

        return tokenId;
    }

    function withdrawFunds(address _tokenOwner, uint256 _amount, address _pool, address _asset) onlyOwner public returns (uint256) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        require(_exists(tokenId), "tokenId doesn't exist");

        uint256 balance = deposits[tokenId].balance;
        require(balance >= _amount, "insufficient balance");
        balance -= _amount;
        /*if(balance == 0){
            //delete deposits[tokenId];
            //_burn(tokenId);
        }*/
        //_setTokenURI(tokenId, tokenURI);
        deposits[tokenId].balance = balance;
        return tokenId;
    }

    function getDepositInfo(uint256 _tokenId) public view returns (Deposit memory){ //uint256 balace, uint256 totalDeposits, uint256 timeStamp, uint256 liquidityIndex, address pool, address asset) {
        return deposits[_tokenId];
    }
}