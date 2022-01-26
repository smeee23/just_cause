// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.9;

import { IJustCauseERC721 } from './Interfaces.sol';
import { JustCauseERC721 } from './JustCauseERC721.sol';

contract PoolTracker {

    //IJustCauseERC721 constant justCauseERC721 = IJustCauseERC721(address(0x92C20FD55EA32d98EAfE443ee82bf861988e299B)); //kovan
    JustCauseERC721 justCauseERC721;

    //contract addresses will point to bool if they exist
    mapping(address => bool) private isPool;
    mapping(address => address[]) private depositors;
    mapping(address => address[]) private owners;
    mapping(string => address) private names;
    address[] private verifiedPools;
    bytes32[] validByteCodeHashes;

    event AddVerifiedPools(address addressToAdd);
    event AddDeposit(address _userAddr, address _pool);
    event WithdrawDeposit(address _userAddr, address _pool);
    event OwnerAddress(address _owner, address _pool);

    event MessageSentBy(address sentBy);

    modifier onlyVerifiedByteCode(address pool) {
        bytes32 v1ByteCodeHash = 0x69e8ff0e7c2b29468c452ea99c81161f9d6137447623140dc2714549e6014d96;
        require(keccak256(abi.encodePacked(pool.code)) == v1ByteCodeHash, "byteCode not recognized");
        _;
    }

    modifier onlyPools(address _pool){
        require(isPool[_pool], "this function must be called from a pool");
        _;
    }

    constructor () {
        justCauseERC721 = new JustCauseERC721();
    }

    function addValidByteCodeHash(bytes32 _hash) public {
        validByteCodeHashes.push(_hash);
    }

    function addDeposit(address _userAddr, uint256 _amount, uint256 _liquidityIndex, uint256 _timeStamp, address _asset) onlyPools(msg.sender) external {
        depositors[_userAddr].push(msg.sender);
        justCauseERC721.addFunds(_userAddr, _amount, _liquidityIndex, _timeStamp,  msg.sender, _asset);
        emit AddDeposit(_userAddr, msg.sender);
        emit MessageSentBy(msg.sender);
    }

    function withdrawDeposit(address _userAddr,  uint256 _amount, uint256 _timeStamp, address _asset) onlyPools(msg.sender) external {
        for(uint8 i = 0; i < depositors[_userAddr].length -1; i++){
            if(depositors[_userAddr][i] == msg.sender){
                depositors[_userAddr][i] = depositors[_userAddr][depositors[_userAddr].length - 1];
                break;
            }
        }
        depositors[_userAddr].pop();
        justCauseERC721.withdrawFunds(_userAddr, _amount, _timeStamp, msg.sender, _asset);
        emit WithdrawDeposit(_userAddr, msg.sender);
        emit MessageSentBy(msg.sender);
    }

    function addVerifiedPools(address _pool, address _owner, string memory _name) external {
        require(names[_name] == address(0), "pool with name already exists");
        names[_name] =  _pool;
        verifiedPools.push( _pool);
        owners[_owner].push( _pool);
        isPool[_pool] = true;
        //emit AddVerifiedPools(_pool);
        //emit MessageSentBy(msg.sender);
    }

    function getERC721Address() public view returns(address){
        return address(justCauseERC721);
    }
    function getVerifiedPools() public view returns(address [] memory){
        return verifiedPools;
    }

    function getUserDeposits(address _userAddr) external view returns(address[] memory){
        return depositors[_userAddr];
    }

    function getUserOwned(address _userAddr) external view returns(address[] memory){
        return owners[_userAddr];
    }

    function getAddressFromName(string memory name) external view returns(address){
        return address(this);//names[name];
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