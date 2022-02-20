// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.9;

import { IJustCausePool } from './Interfaces.sol';
import { JCDepositorERC721 } from './JCDepositorERC721.sol';
import { JCOwnerERC721 } from './JCOwnerERC721.sol';
import { JustCausePool } from './JustCausePool.sol';

contract PoolTracker {

    address baseJCPoolAddr;
    JustCausePool baseJCPool;
    JCDepositorERC721 jCDepositorERC721;
    JCOwnerERC721 jCOwnerERC721;

    //contract addresses will point to bool if they exist
    mapping(address => bool) private isPool;
    //mapping(address => address[]) private depositors;
    //mapping(address => address[]) private owners;
    mapping(string => address) private names;
    address[] private verifiedPools;
    bytes32[] validByteCodeHashes;

    event AddPool(address pool, string name, address receiver);
    event AddDeposit(address userAddr, address pool, address asset, uint256 amount);
    event WithdrawDeposit(address userAddr, address pool, address asset, uint256 amount);
    event Claim(address userAddr, address receiver, address pool, address asset, uint256 amount);

    modifier onlyVerifiedByteCode(address pool) {
        bytes32 v1ByteCodeHash = 0x69e8ff0e7c2b29468c452ea99c81161f9d6137447623140dc2714549e6014d96;
        require(keccak256(abi.encodePacked(pool.code)) == v1ByteCodeHash, "byteCode not recognized");
        _;
    }

    modifier onlyPools(address _pool){
        require(isPool[_pool], "not called from a pool");
        _;
    }

    constructor () {
        jCDepositorERC721 = new JCDepositorERC721();
        jCOwnerERC721 = new JCOwnerERC721();
        baseJCPool = new JustCausePool();
    }

    function addValidByteCodeHash(bytes32 _hash) public {
        validByteCodeHashes.push(_hash);
    }

    function addDeposit(uint256 _amount, address _asset, address _pool, bool isETH) onlyPools(_pool) external payable {
        if(isETH) IJustCausePool(_pool).depositETH{value: msg.value}(_asset, msg.sender);
        else IJustCausePool(_pool).deposit(_asset, _amount , msg.sender);
        jCDepositorERC721.addFunds(msg.sender, _amount, block.timestamp,  _pool, _asset);
        emit AddDeposit(msg.sender, _pool, _asset, _amount);
    }

    function withdrawDeposit(uint256 _amount, address _asset, address _pool) onlyPools(_pool) external {
        IJustCausePool(_pool).withdraw(_asset, _amount, msg.sender);
        jCDepositorERC721.withdrawFunds(msg.sender, _amount, _pool, _asset);
        emit WithdrawDeposit(msg.sender, _pool, _asset, _amount);
    }

    function claimInterest(address _asset, address _pool) onlyPools(_pool) external {
        uint256 amount = IJustCausePool(_pool).withdrawDonations(_asset);
        emit Claim(msg.sender, IJustCausePool(_pool).getRecipient(), _pool, _asset, amount);
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `implementation`.
     *
     * This function uses the create opcode, which should never revert.
     */
    function clone(address basePool) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, basePool))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "ERC1167: create failed");
    }

    function createJCPoolClone(address[] memory _acceptedTokens, string memory _name, string memory _about, address _receiver) external {
        require(names[_name] == address(0), "pool with name already exists");
        address child = clone(address(baseJCPool));
        IJustCausePool(child).initialize(_acceptedTokens, _name, _about, _receiver);
        jCOwnerERC721.createReceiverToken(_receiver, block.timestamp, child);
        names[_name] =  child;
        verifiedPools.push(child);
        isPool[child] = true;
        emit AddPool(child, _name, _receiver);
    }

    function getDepositorERC721Address() public view returns(address){
        return address(jCDepositorERC721);
    }

    function getOwnerERC721Address() public view returns(address){
        return address(jCOwnerERC721);
    }

    function getBaseJCPoolAddress() public view returns(address){
        return address(baseJCPool);
    }

    function getVerifiedPools() public view returns(address [] memory){
        return verifiedPools;
    }

    function checkPool(address _pool) public view returns(bool){
        return isPool[_pool];
    }

    /*function getUserDeposits(address _userAddr) external view returns(address[] memory){
        return depositors[_userAddr];
    }*/

    /*function getUserDeposits(address _userAddr) external view returns(address[] memory){
        uint256 numDeposits = jCDepositorERC721.balanceOf(_userAddr);
        address[] memory poolList;
        for(uint8 i = 0; i < numDeposits; i++){
            uint256 tokenId = jCDepositorERC721.tokenOfOwnerByIndex(_userAddr, i);
            (,,,, address pool,) = jCDepositorERC721.getDeposit(tokenId);
            poolList[i] = pool;
        }
        return poolList;
    }*/

    /*function getUserOwned(address _userAddr) external view returns(address[] memory){
        return owners[_userAddr];
    }*/

    function getAddressFromName(string memory _name) external view returns(address){
        return names[_name];
    }

    function checkByteCode(address _pool) external view returns(bool) {
        bool hashMatch = false;
        bytes32 hashOfPoolCode = keccak256(abi.encodePacked(_pool.code));
        bytes32[] memory validHashes = validByteCodeHashes;

        for(uint8 i = 0; i < validHashes.length; i++){
            if(hashOfPoolCode == validHashes[i]){
                hashMatch = true;
                break;
            }
        }
        return hashMatch;
    }
}