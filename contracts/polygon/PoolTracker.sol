// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.9;

import { IJustCausePool, IERC20, IPool, IPoolAddressesProvider, IWETHGateway } from './Interfaces.sol';
import { JCDepositorERC721 } from './JCDepositorERC721.sol';
import { JCOwnerERC721 } from './JCOwnerERC721.sol';
import { JustCausePoolAaveV3 } from './JustCausePoolAaveV3.sol';

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PoolTracker is ReentrancyGuard {

    JustCausePoolAaveV3 baseJCPool;
    JCDepositorERC721 jCDepositorERC721;
    JCOwnerERC721 jCOwnerERC721;

    //contract addresses will point to bool if they exist
    mapping(address => bool) private isPool;
    mapping(string => address) private names;
    mapping(address => uint256) private tvl;
    mapping(address => uint256) private totalDonated;
    address[] private verifiedPools;

    //IPoolAddressesProvider provider;
    address poolAddr;
    address wethGatewayAddr;
    address validator;

    event AddPool(address pool, string name, address receiver);
    event AddDeposit(address userAddr, address pool, address asset, uint256 amount);
    event WithdrawDeposit(address userAddr, address pool, address asset, uint256 amount);
    event Claim(address userAddr, address receiver, address pool, address asset, uint256 amount);

    modifier onlyPools(address _pool){
        require(isPool[_pool], "not called from a pool");
        _;
    }

    modifier onlyAcceptedTokens(address[] memory causeAcceptedTokens){
        address[] memory aaveAcceptedTokens = IPool(poolAddr).getReservesList();
        for(uint8 i = 0; i < causeAcceptedTokens.length; i++){
            bool found;
            for(uint8 j = 0; j < aaveAcceptedTokens.length; j++){
                if(causeAcceptedTokens[i] == aaveAcceptedTokens[j]){
                    found = true;
                }
            }
            require(found, "token not approved");
        }
        _;
    }

    modifier onlyAcceptedToken(address _asset){
        address[] memory aaveAcceptedTokens = IPool(poolAddr).getReservesList();
        bool found;
        for(uint8 j = 0; j < aaveAcceptedTokens.length; j++){
            if(_asset == aaveAcceptedTokens[j]){
                found = true;
            }
        }
        require(found, "token not approved");
        _;
    }

    constructor () {
        validator = msg.sender;
        jCDepositorERC721 = new JCDepositorERC721();
        jCOwnerERC721 = new JCOwnerERC721();
        baseJCPool = new JustCausePoolAaveV3();

        poolAddr = IPoolAddressesProvider(address(0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6)).getPool(); // polygon mumbai v3
        wethGatewayAddr = address(0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17);// polygon mumbai v3
    }

    function addDeposit(uint256 _amount, address _asset, address _pool, bool isETH) onlyPools(_pool) nonReentrant() external payable {
        tvl[_asset] += _amount;
        string memory _metaHash = IJustCausePool(_pool).getMetaUri();
        address _poolAddr = poolAddr;
        if(isETH){
            IWETHGateway(wethGatewayAddr).depositETH{value: msg.value}(_poolAddr, _pool, 0);
            IJustCausePool(_pool).depositETH(_asset, msg.value);
        }
        else {
            IERC20 token = IERC20(_asset);
            require(token.allowance(msg.sender, address(this)) >= _amount, "sender not approved");
            token.transferFrom(msg.sender, address(this), _amount);
            token.approve(_poolAddr, _amount);
            IPool(_poolAddr).deposit(address(token), _amount, _pool, 0);
            IJustCausePool(_pool).deposit(_asset, _amount);
        }
        jCDepositorERC721.addFunds(msg.sender, _amount, block.timestamp,  _pool, _asset, _metaHash);
        emit AddDeposit(msg.sender, _pool, _asset, _amount);
    }

    function withdrawDeposit(uint256 _amount, address _asset, address _pool, bool _isETH) onlyPools(_pool) nonReentrant() external {
        tvl[_asset] -= _amount;
        jCDepositorERC721.withdrawFunds(msg.sender, _amount, _pool, _asset);
        IJustCausePool(_pool).withdraw(_asset, _amount, msg.sender, _isETH);
        emit WithdrawDeposit(msg.sender, _pool, _asset, _amount);
    }

    function claimInterest(address _asset, address _pool, bool _isETH) onlyPools(_pool) nonReentrant() onlyAcceptedToken(_asset) external {
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

    function createJCPoolClone(address[] memory _acceptedTokens, string memory _name, string memory _about, string memory _picHash, string memory _metaUri, address _receiver) onlyAcceptedTokens(_acceptedTokens) external {
        require(names[_name] == address(0), "pool with name already exists");
        address child = clone(address(baseJCPool));
        bool isVerified;
        if(msg.sender == validator){
            verifiedPools.push(child);
            isVerified = true;
        }

        IJustCausePool(child).initialize(_acceptedTokens, _name, _about, _picHash, _metaUri, _receiver, isVerified);
        jCOwnerERC721.createReceiverToken(_receiver, block.timestamp, child, _metaUri);
        names[_name] =  child;

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

    function getAddressFromName(string memory _name) external view returns(address){
        return names[_name];
    }
}