// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JCOwnerERC721 is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Creation {
        uint256 timeStamp;
        address pool;
    }

    //key = keccak hash of depositor, pool and asset addresses
    mapping (uint256 => Creation) receivers;

    constructor() ERC721("JCP Owner Token", "JCPT_TEST_O1") {

    }

    function createReceiverToken(address _poolReceiver, uint256 _timeStamp, address _pool) onlyOwner public returns (uint256) {
        _tokenIds.increment();
        uint256  tokenId = _tokenIds.current();
        receivers[tokenId] = Creation(_timeStamp, _pool);
        _mint(_poolReceiver, tokenId);
        return tokenId;
    }

    function getCreation(uint256 _tokenId) public view returns (Creation memory) {
        return receivers[_tokenId];
    }
}