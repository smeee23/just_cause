// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract JustCauseERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Deposit {
        uint256 amount;
        uint256 liquidityIndex;
        uint256 timeStamp;
        address pool;
        address asset;
    }

    mapping (uint256 => Deposit) deposits;

    constructor() ERC721("JustCause Pool Token", "JCPT") {

    }

    function createItem(address _tokenOwner, uint256 _amount, uint256 _liquidityIndex, uint256 _timeStamp, address _pool, address _asset) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        deposits[newItemId] = Deposit(_amount, _liquidityIndex, _timeStamp, _pool, _asset);
        _mint(_tokenOwner, newItemId);
//      _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function getDeposit(uint256 _tokenId) public view returns (uint256 amount, uint256 liquidityIndex, uint256 timeStamp, address pool, address asset) {
        Deposit memory deposit = deposits[_tokenId];
        amount = deposit.amount;
        liquidityIndex = deposit.liquidityIndex;
        timeStamp = deposit.timeStamp;
        pool = deposit.pool;
        asset = deposit.asset;
    }
}