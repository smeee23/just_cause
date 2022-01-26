// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JustCauseERC721 is ERC721Enumerable, Ownable {
    //using Counters for Counters.Counter;
    //Counters.Counter private _tokenIndexes;

    struct Deposit {
        uint256 balance;
        uint256 liquidityIndex;
        uint256 timeStamp;
        address pool;
        address asset;
    }

    //key = keccak hash of depositor, pool and asset addresses
    mapping (uint256 => Deposit) deposits;

    constructor() ERC721("JustCause Pool Token", "JCPT_TEST1") {

    }

    function addFunds(address _tokenOwner, uint256 _amount, uint256 _liquidityIndex, uint256 _timeStamp, address _pool, address _asset) onlyOwner public returns (uint256) {
        //_tokenIds.increment();
        //uint256 tokenId = _tokenIds.current();
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        if(_exists(tokenId)){
            deposits[tokenId].balance += _amount;
        }
        else{
            deposits[tokenId] = Deposit(_amount, _liquidityIndex, _timeStamp, _pool, _asset);
            //owners[_tokenOwner].push(tokenId);
            _mint(_tokenOwner, tokenId);
        }
        //_setTokenURI(tokenId, tokenURI);

        return tokenId;
    }

    function withdrawFunds(address _tokenOwner, uint256 _amount, uint256 _timeStamp, address _pool, address _asset) onlyOwner public returns (uint256) {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_tokenOwner, _pool, _asset)));
        require(_exists(tokenId), "tokenId doesn't exist");
        uint256 balance = deposits[tokenId].balance;
        balance -= _amount;
        if(balance == 0){
            delete deposits[tokenId];
            _burn(tokenId);
        }
        //_setTokenURI(tokenId, tokenURI);
        deposits[tokenId].balance = balance;
        return tokenId;
    }

    function getDeposit(uint256 _tokenId) public view returns (uint256 balance, uint256 liquidityIndex, uint256 timeStamp, address pool, address asset) {
        Deposit memory deposit = deposits[_tokenId];
        balance = deposit.balance;
        liquidityIndex = deposit.liquidityIndex;
        timeStamp = deposit.timeStamp;
        pool = deposit.pool;
        asset = deposit.asset;
    }
}