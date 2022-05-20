// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.9;

import { IERC20, IPool, IPoolAddressesProvider, IWETHGateway} from './Interfaces.sol';
import { SafeERC20 } from './Libraries.sol';
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title JustCausePoolAaveV3 contract
 * @author JustCause
 * This is a proof of concept starter contract for lossless donations

   Aave v3 is used to generate interest for crowdfunding

   Contributors deposit tokens into JustCausePool which deposit
   them into Aave lending protocol.

   The interest earned is directed to the receiver associated with
   the Pool.

   When Contributors need access to their funds they withdraw original deposit
   and interest accrued is left behind for the receiver to claim.

 * @dev To be covered by a proxy contract
 * @dev deposits, withdraws, withdrawDonations controlled by the PoolTracker contract (Master)
 **/

contract JustCausePoolAaveV3 is Initializable {

    mapping(address => uint256) private totalDeposits;
    mapping(address => uint256) private interestWithdrawn;
    bool private isBase;

    IPoolAddressesProvider provider;
    address poolAddr;
    address wethGatewayAddr;

    address[] acceptedTokens;

    address receiver;
    address master;
    string name;
    string about;
    string picHash;
    string metaUri;
    bool isVerified;

    /**
    * @dev Only tokens that are on the accepted list can be passed
    * to functions marked by this modifier.
    **/
    modifier onlyAllowedTokens(address _tokenAddr){
        bool isAccepted;
        for (uint8 i = 0; i < acceptedTokens.length; i++){
            if(_tokenAddr == acceptedTokens[i]){
                isAccepted = true;
                break;
            }
        }
        require(isAccepted, "token not accepted by jcpool");
        _;
    }

    /**
    * @dev Only Receiver can call functions marked by this modifier.
    **/
    modifier onlyReceiver(address _sender){
        require(receiver == _sender, "not the receiver");
        _;
    }

    /**
    * @dev Only Master can call functions marked by this modifier.
    **/
    modifier onlyMaster(address _sender){
        require(master == _sender, "not the owner");
        _;
    }

    /**
    * @dev Limits string (pool name) to x characters when passed to
    * functions marked by this modifier.
    **/
    modifier strLength(string memory _str, uint8 _limit ){
        bytes memory strBytes = bytes(_str);
        if(strBytes.length > _limit){
            revert("string over character limit");
        }
        _;
    }

    /**
   * @dev Constructor.
   */
    constructor () {
        isBase = true;
    }

    /**
    * @notice Initializes the JustCause Pool.
    * @dev Function is invoked by the PoolTacker contract when a Pool is created.
    * @param _acceptedTokens List of tokens to be accepted by JCP.
    * @param _name String name of JCP.
    * @param _about ipfs hash of pool description of JCP.
    * @param _picHash ipfs hash of pic of JCP.
    * @param _metaUri meta info uri for nft of JCP.
    * @param _receiver address of receiver of JCP donations.
    * @param _isVerified indicates whether JCP is verified
    **/
    function initialize(
        address[] memory _acceptedTokens,
        string memory _name,
        string memory _about,
        string memory _picHash,
        string memory _metaUri,
        address _receiver,
        address _poolAddr,
        address _wethGatewayAddr,
        bool _isVerified

    ) external strLength(_name, 30) initializer() {

        require(isBase == false, "Cannot initialize base");
        require(receiver == address(0), "Initialize already called");

        receiver = _receiver;
        master = msg.sender;
        name = _name;
        about = _about;
        picHash = _picHash;
        metaUri = _metaUri;
        isVerified = _isVerified;

        poolAddr = _poolAddr;
        wethGatewayAddr = _wethGatewayAddr;
        acceptedTokens = _acceptedTokens;
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @param _amount The amount of supplied assets
    **/
    function deposit(address _assetAddress, uint256 _amount) external  onlyMaster(msg.sender) onlyAllowedTokens(_assetAddress){
        totalDeposits[_assetAddress] += _amount;
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @param _amount The amount of withdraw assets
    * @param _depositor The address making the deposit
    * @param _isETH bool indicating if asset is the base token of network (eth/matic/...)
    **/
    function withdraw(address _assetAddress, uint256 _amount, address _depositor, bool _isETH) external onlyMaster(msg.sender) {
        totalDeposits[_assetAddress] -= _amount;
        if(!_isETH){
            IPool(poolAddr).withdraw(_assetAddress, _amount, _depositor);
        }
        else{
            address wethAddress = IWETHGateway(wethGatewayAddr).getWETHAddress();
            require(wethAddress == _assetAddress, "asset does not match WETHGateway");
            address aTokenAddress = getATokenAddress(wethAddress);
            IERC20(aTokenAddress).approve(wethGatewayAddr, _amount);
            IWETHGateway(wethGatewayAddr).withdrawETH(poolAddr, _amount, _depositor);
        }
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @param _isETH bool indicating if asset is the base token of network (eth/matic/...)
    **/
    function withdrawDonations(address _assetAddress, bool _isETH) external onlyMaster(msg.sender) returns(uint256){
        address aTokenAddress = getATokenAddress(_assetAddress);
        uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
        uint256 interestEarned = aTokenBalance - totalDeposits[_assetAddress];
        interestWithdrawn[_assetAddress] += interestEarned;

        if(!_isETH){
            IPool(poolAddr).withdraw(_assetAddress, interestEarned, receiver);
        }
        else{
            require(IWETHGateway(wethGatewayAddr).getWETHAddress() == _assetAddress, "asset does not match WETHGateway");
            IERC20(aTokenAddress).approve(wethGatewayAddr, interestEarned);
            IWETHGateway(wethGatewayAddr).withdrawETH(poolAddr, interestEarned, receiver);
        }
        return interestEarned;
    }

    /**
    * @return acceptedTokens List of tokens to be accepted by JCP.
    **/
    function getAcceptedTokens() external view returns(address[] memory){
        return acceptedTokens;
    }

    /**
    * @return name String name of JCP.
    **/
    function getName() external view returns(string memory){
        return name;
    }

    /**
    * @return about ipfs hash of pool description of JCP.
    **/
    function getAbout() external view returns(string memory){
        return about;
    }

    /**
    * @return picHash ipfs hash of pic of JCP.
    **/
    function getPicHash() external view returns(string memory){
        return picHash;
    }

    /**
    * @return metaUri meta info uri for nft of JCP.
    **/
    function getMetaUri() external view returns(string memory){
        return metaUri;
    }

    /**
    * @return isVerified indicates whether JCP is verified
    **/
    function getIsVerified() external view returns(bool){
        return isVerified;
    }

    /**
    * @return receiver address of receiver of JCP donations.
    **/
    function getRecipient() external view returns(address){
        return receiver;
    }

    /**
    * @notice Returns general pool information
    * @return acceptedTokens List of tokens to be accepted by JCP.
    * @return name String name of JCP.
    * @return about ipfs hash of pool description of JCP.
    * @return picHash ipfs hash of pic of JCP.
    * @return metaUri meta info uri for nft of JCP.
    * @return receiver address of receiver of JCP donations.
    * @return isVerified indicates whether JCP is verified
    **/
    function getPoolInfo() external view returns (address[] memory, address, bool, string memory, string memory, string memory, string memory){
        return (acceptedTokens, receiver, isVerified, metaUri, picHash, about, name);
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @return aTokenAddress address of Aave's aToken for asset
    **/
    function getATokenAddress(address _assetAddress) public view returns(address aTokenAddress){
        aTokenAddress = IPool(poolAddr).getReserveData(_assetAddress).aTokenAddress;
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @return totalDeposit total assets deposited in pool
    **/
    function getTotalDeposits(address _assetAddress) public view returns(uint256){
        return totalDeposits[_assetAddress];
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @return unclaimedInterest accrued interest that has not yet been claimed
    **/
    function getUnclaimedInterest(address _assetAddress) public view returns (uint256){
        address aTokenAddress = getATokenAddress(_assetAddress);
        uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
        return aTokenBalance - totalDeposits[_assetAddress];
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @return claimedInterest interest that has been claimed (no longer in contract)
    **/
    function getClaimedInterest(address _assetAddress) public view returns (uint256){
        return interestWithdrawn[_assetAddress];
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @return aTokenBalance Pool balance of aToken for the asset
    **/
    function getATokenBalance(address _assetAddress) public view returns (uint256){
        address aTokenAddress = getATokenAddress(_assetAddress);
        return IERC20(aTokenAddress).balanceOf(address(this));
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @return normalizedIncome reserve's normalized income
    */
    function getReserveNormalizedIncome(address _assetAddress) public view returns(uint256){
        return IPool(poolAddr).getReserveNormalizedIncome(_assetAddress);
    }

    /**
    * @param _assetAddress The address of the underlying asset of the reserve
    * @return liquidityIndex reserve's liquidity index
    */
    function getAaveLiquidityIndex(address _assetAddress) public view returns(uint256 liquidityIndex){
        liquidityIndex = IPool(poolAddr).getReserveData(_assetAddress).liquidityIndex;
    }

    /**
    * @notice Returns asset specific pool information
    * @param _asset The address of the underlying asset of the reserve
    * @return liquidityIndex reserve's liquidity index
    * @return normalizedIncome reserve's normalized income
    * @return aTokenBalance Pool balance of aToken for the asset
    * @return claimedInterest interest that has been claimed (no longer in contract)
    * @return unclaimedInterest accrued interest that has not yet been claimed
    * @return totalDeposit total assets deposited in pool
    * @return aTokenAddress address of Aave's aToken for asset
    */
    function getPoolTokenInfo(address _asset) external view returns(uint256, uint256, uint256, uint256, uint256, uint256, address){
        return(getAaveLiquidityIndex(_asset), getReserveNormalizedIncome(_asset), getATokenBalance(_asset),
                getClaimedInterest(_asset), getUnclaimedInterest(_asset), getTotalDeposits(_asset), getATokenAddress(_asset));
    }
}