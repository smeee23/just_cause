// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.9;

import { IJustCausePool, IERC20, IPool, IPoolAddressesProvider, IWETHGateway } from './Interfaces.sol';
import { JCDepositorERC721 } from './JCDepositorERC721.sol';
import { JCOwnerERC721 } from './JCOwnerERC721.sol';
import { JustCausePoolAaveV3 } from './JustCausePoolAaveV3.sol';

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PoolTracker contract
 * @author JustCause
 * @notice Main point of interaction with JustCause Protocol
 * This is a proof of concept starter contract for lossless donations
 *
 * Aave v3 is used to generate interest for crowdfunding
 *
 * PoolTracker contract controls deposit calls to Aave to make
 * approvals needed only once per token. Calls JustCause Pools for
 * withdrawals and claims
 *
 * Controls Owner/Contributor NFT creation and updates for deposits/withdrawals
 *
 * Controls JustCause Pool creation with proxy contracts
 *
 * @dev Deposits, withdraws, and claims for Aave Pools
 * @dev Generate ERC721 token
 **/

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

    address poolAddr;
    address wethGatewayAddr;
    address validator;

    event AddPool(address pool, string name, address receiver);
    event AddDeposit(address userAddr, address pool, address asset, uint256 amount);
    event WithdrawDeposit(address userAddr, address pool, address asset, uint256 amount);
    event Claim(address userAddr, address receiver, address pool, address asset, uint256 amount);
    event Test(address[] aaveAccepted, address[] causeAccepted );
    /**
    * @dev Only address that are a pool can be passed to functions marked by this modifier.
    **/
    modifier onlyPools(address _pool){
        require(isPool[_pool], "not pool");
        _;
    }

    /**
    * @dev Only tokens that are accepted by Aave can be used in JCP creation
    **/
    modifier onlyAcceptedTokens(address[] memory causeAcceptedTokens){
        address[] memory aaveAcceptedTokens = IPool(poolAddr).getReservesList();
        for(uint8 i = 0; i < causeAcceptedTokens.length; i++){
            bool found;
            for(uint8 j = 0; j < aaveAcceptedTokens.length; j++){
                if(causeAcceptedTokens[i] == aaveAcceptedTokens[j]){
                    found = true;
                }
            }
            require(found, "tokens not approved");
        }
        _;
    }

    /**
    * @dev Only tokens that are accepted by Aave can be passed to functions marked by this modifier.
    **/
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

    /**
    * @dev Constructor.
    */
    constructor (address _poolAddressesProviderAddr, address _wethGatewayAddr) {
        validator = msg.sender;
        jCDepositorERC721 = new JCDepositorERC721(_poolAddressesProviderAddr);
        jCOwnerERC721 = new JCOwnerERC721();
        baseJCPool = new JustCausePoolAaveV3();

        poolAddr = IPoolAddressesProvider(_poolAddressesProviderAddr).getPool();
        wethGatewayAddr = address(_wethGatewayAddr);
    }

    /**
    * @dev Emit AddDeposit
    * @param _asset The address of the underlying asset of the reserve
    * @param _amount The amount of supplied assets
    * @param _pool address of JCP
    * @param _isETH bool indicating if asset is the base token of network (eth/matic/...)
    **/
    function addDeposit(uint256 _amount, address _asset, address _pool, bool _isETH) onlyPools(_pool) nonReentrant() external payable {
        tvl[_asset] += _amount;
        string memory _metaHash = IJustCausePool(_pool).getMetaUri();
        address _poolAddr = poolAddr;
        if(_isETH){
            require(IWETHGateway(wethGatewayAddr).getWETHAddress() == _asset, "asset does not match WETHGateway");
            require(msg.value > 0, "msg.value cannot be zero");
            IWETHGateway(wethGatewayAddr).depositETH{value: msg.value}(_poolAddr, _pool, 0);
        }
        else {
            require(msg.value == 0, "msg.value is not zero");
            IERC20 token = IERC20(_asset);
            require(token.allowance(msg.sender, address(this)) >= _amount, "sender not approved");
            token.transferFrom(msg.sender, address(this), _amount);
            token.approve(_poolAddr, _amount);
            IPool(_poolAddr).deposit(address(token), _amount, _pool, 0);
        }
        IJustCausePool(_pool).deposit(_asset, _amount);
        jCDepositorERC721.addFunds(msg.sender, _amount, block.timestamp,  _pool, _asset, _metaHash);
        emit AddDeposit(msg.sender, _pool, _asset, _amount);
    }

    /**
    * @dev Emit WithdrawDeposit
    * @param _asset The address of the underlying asset of the reserve
    * @param _amount The amount of withdraw assets
    * @param _pool address of JCP
    * @param _isETH bool indicating if asset is the base token of network (eth/matic/...)
    **/
    function withdrawDeposit(uint256 _amount, address _asset, address _pool, bool _isETH) external  onlyPools(_pool) nonReentrant(){
        tvl[_asset] -= _amount;
        jCDepositorERC721.withdrawFunds(msg.sender, _amount, _pool, _asset);
        IJustCausePool(_pool).withdraw(_asset, _amount, msg.sender, _isETH);
        emit WithdrawDeposit(msg.sender, _pool, _asset, _amount);
    }

    /**
    * @dev Emit Claim
    * @param _asset The address of the underlying asset of the reserve
    * @param _pool address of JCP
    * @param _isETH bool indicating if asset is the base token of network (eth/matic/...)
    **/
    function claimInterest(address _asset, address _pool, bool _isETH) external onlyPools(_pool) nonReentrant() onlyAcceptedToken(_asset){
        uint256 amount = IJustCausePool(_pool).withdrawDonations(_asset, _isETH);
        totalDonated[_asset] += amount;
        emit Claim(msg.sender, IJustCausePool(_pool).getRecipient(), _pool, _asset, amount);
    }

    /**
     * @param basePool address of base JCP
     * @return instance proxy instance of JCP
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `implementation`.
     *
     * This function uses the create opcode, which should never revert.
     **/
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

    /**
    * @dev Emit AddPool
    * @notice Creates JCP proxy
    * @param _acceptedTokens List of tokens to be accepted by JCP.
    * @param _name String name of JCP.
    * @param _about ipfs hash of pool description of JCP.
    * @param _picHash ipfs hash of pic of JCP.
    * @param _metaUri meta info uri for nft of JCP.
    * @param _receiver address of receiver of JCP donations.
    **/
    function createJCPoolClone(
        address[] memory _acceptedTokens,
        string memory _name,
        string memory _about,
        string memory _picHash,
        string memory _metaUri,
        address _receiver
    ) external onlyAcceptedTokens(_acceptedTokens){

        require(names[_name] == address(0), "pool with name already exists");
        address child = clone(address(baseJCPool));
        bool isVerified;
        if(msg.sender == validator){
            verifiedPools.push(child);
            isVerified = true;
        }

        IJustCausePool(child).initialize(_acceptedTokens, _name, _about, _picHash, _metaUri, _receiver, poolAddr, wethGatewayAddr, isVerified);
        jCOwnerERC721.createReceiverToken(_receiver, block.timestamp, child, _metaUri);
        names[_name] =  child;

        isPool[child] = true;
        emit AddPool(child, _name, _receiver);
    }

    /**
    * @param _asset The address of the underlying asset of the reserve
    * @return tvl of the protocol for a given asset
    **/
    function getTVL(address _asset) public view returns(uint256){
        return tvl[_asset];
    }

    /**
    * @param _asset The address of the underlying asset of the reserve
    * @return total claimed donation for a given asset
    **/
    function getTotalDonated(address _asset) public view returns(uint256){
        return totalDonated[_asset];
    }

    /**
    * @return address of ERC721 for depositors, created on deployment
    **/
    function getDepositorERC721Address() public view returns(address){
        return address(jCDepositorERC721);
    }

    /**
    * @return address of ERC721 for owners, created on deployment
    **/
    function getOwnerERC721Address() public view returns(address){
        return address(jCOwnerERC721);
    }

    /**
    * @return address of validator
    **/
    function getValidator() public view returns(address){
        return validator;
    }

    /**
    * @return address of aave pool
    **/
    function getPoolAddr() public view returns(address){
        return poolAddr;
    }

    /**
    * @return address array of aave reserve list
    **/
    function getReservesList() public view returns(address[] memory){
        return IPool(poolAddr).getReservesList();
    }

    /**
    * @return address of base JCP, created on deployment
    **/
    function getBaseJCPoolAddress() public view returns(address){
        return address(baseJCPool);
    }

    /**
    * @return list of verified pools
    **/
    function getVerifiedPools() public view returns(address [] memory){
        return verifiedPools;
    }

    /**
    * @param _pool address of pool
    * @return true if pool address exists
    **/
    function checkPool(address _pool) public view returns(bool){
        return isPool[_pool];
    }

    /**
    * @param _name string name of pool
    * @return pool address of a given pool name
    **/
    function getAddressFromName(string memory _name) external view returns(address){
        return names[_name];
    }
}