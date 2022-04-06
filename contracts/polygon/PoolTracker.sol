// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.9;

import { IJustCausePool, IERC20, IPool, IPoolAddressesProvider, IWETHGateway } from './Interfaces.sol';
import { JCDepositorERC721 } from './JCDepositorERC721.sol';
import { JCOwnerERC721 } from './JCOwnerERC721.sol';
import { JustCausePoolAaveV3 } from './JustCausePoolAaveV3.sol';

contract PoolTracker {

    address baseJCPoolAddr;
    JustCausePoolAaveV3 baseJCPool;
    JCDepositorERC721 jCDepositorERC721;
    JCOwnerERC721 jCOwnerERC721;

    //contract addresses will point to bool if they exist
    mapping(address => bool) private isPool;
    //mapping(address => address[]) private depositors;
    //mapping(address => address[]) private owners;
    mapping(string => address) private names;
    mapping(address => uint256) private tvl;
    mapping(address => uint256) private totalDonated;
    address[] private verifiedPools;
    bytes32[] validByteCodeHashes;

    IPoolAddressesProvider provider;
    address poolAddr;
    address wethGatewayAddr;

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
        baseJCPool = new JustCausePoolAaveV3();

        provider = IPoolAddressesProvider(address(0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6)); // polygon mumbai v3
        poolAddr = provider.getPool();
        wethGatewayAddr = address(0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17);// polygon mumbai v3
    }

    function addValidByteCodeHash(bytes32 _hash) public {
        validByteCodeHashes.push(_hash);
    }

    function addDeposit(uint256 _amount, address _asset, address _pool, bool isETH) onlyPools(_pool) external payable {
        tvl[_asset] += _amount;
        if(isETH){
            IWETHGateway(wethGatewayAddr).depositETH{value: msg.value}(poolAddr, _pool, 0);
            IJustCausePool(_pool).depositETH/*{value: msg.value}*/(_asset, /*msg.sender,*/ msg.value);
        }
        else {
            IERC20 token = IERC20(_asset);
            require(token.allowance(msg.sender, address(this)) >= _amount, "sender not approved");
            token.transferFrom(msg.sender, address(this), _amount);
            token.approve(poolAddr, _amount);
            IPool(poolAddr).deposit(address(token), _amount, _pool, 0);
            IJustCausePool(_pool).deposit(_asset, _amount /*, msg.sender*/);
        }
        jCDepositorERC721.addFunds(msg.sender, _amount, block.timestamp,  _pool, _asset);
        emit AddDeposit(msg.sender, _pool, _asset, _amount);
    }

    function withdrawDeposit(uint256 _amount, address _asset, address _pool, bool _isETH) onlyPools(_pool) external {
        tvl[_asset] -= _amount;
        jCDepositorERC721.withdrawFunds(msg.sender, _amount, _pool, _asset);
        IJustCausePool(_pool).withdraw(_asset, _amount, msg.sender, _isETH);
        emit WithdrawDeposit(msg.sender, _pool, _asset, _amount);
    }

    function claimInterest(address _asset, address _pool, bool _isETH) onlyPools(_pool) external {
        uint256 amount = IJustCausePool(_pool).withdrawDonations(_asset, _isETH);
        totalDonated[_asset] += amount;
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

    function createJCPoolClone(address[] memory _acceptedTokens, string memory _name, string memory _about, string memory _picHash, address _receiver) external {
        require(names[_name] == address(0), "pool with name already exists");
        address child = clone(address(baseJCPool));
        IJustCausePool(child).initialize(_acceptedTokens, _name, _about, _picHash, _receiver);
        jCOwnerERC721.createReceiverToken(_receiver, block.timestamp, child);
        names[_name] =  child;
        verifiedPools.push(child);
        isPool[child] = true;
        emit AddPool(child, _name, _receiver);
    }

    function getTVL(address _asset) public view returns(uint256){
        return tvl[_asset];
    }

    function getTotalDonated(address _asset) public view returns(uint256){
        return totalDonated[_asset];
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