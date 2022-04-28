// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JCOwnerERC721
 * @author JustCause
 * This is a proof of concept starter contract for lossless donations
 *
 * Aave v3 is used to generate interest for crowdfunding
 *
 * Creates an ERC721 with info regarding each Just Cause Pool created
 *
 * Inherets from openzeppelin ERC721 contracts
 *
 **/

contract JCOwnerERC721 is ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Creation {
        uint256 timeStamp;
        address pool;
    }

    //key = keccak hash of depositor, pool and asset addresses
    mapping (uint256 => Creation) receivers;

    /**
    * @dev Constructor.
    */
    constructor() ERC721("JCP Owner Token", "JCPT_TEST_O1") {

    }

    /**
    * @notice Creates NFT for creator of pool
    * @param _poolReceiver address of receiver of JCP donations.
    * @param _timeStamp timeStamp of token creation
    * @param _pool address of JCP
    * @param _metaUri meta info uri for nft of JCP.
    * @return tokenId unique token id, uses OZ Counter
    **/
    function createReceiverToken(address _poolReceiver,
                                uint256 _timeStamp,
                                address _pool,
                                string memory _metaUri
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256  tokenId = _tokenIds.current();
        receivers[tokenId] = Creation(_timeStamp, _pool);
        _mint(_poolReceiver, tokenId);
        _setTokenURI(tokenId, _metaUri);

        return tokenId;
    }

    /**
    * @param _tokenId unique token id, uses OZ Counter
    * @return struct containing pool creation info
    **/
    function getCreation(uint256 _tokenId) public view returns (Creation memory) {
        return receivers[_tokenId];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
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