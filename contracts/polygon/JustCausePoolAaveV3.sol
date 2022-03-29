// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { IERC20, IPool, IPoolAddressesProvider, IWETHGateway} from './Interfaces.sol';
import { SafeERC20 } from './Libraries.sol';
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
/**
 * This is a proof of concept starter contract, showing how uncollaterised loans are possible
 * using Aave v2 credit delegation.
 * This example supports stable interest rate borrows.
 * It is not production ready (!). User permissions and user accounting of loans should be implemented.
 * See @dev comments
 */

contract JustCausePoolAaveV3 is Initializable {
    //mapping(address => mapping(address => uint256)) private depositors;
    mapping(address => uint256) private totalDeposits;
    mapping(address => uint256) private interestWithdrawn;
    bool private isBase;

    IPoolAddressesProvider provider;
    address poolAddr;
    address wethGatewayAddr;

    address[] acceptedTokens;

    event Deposit(address tokenAddress, address depositor, uint256 amount);
    event Withdraw(address tokenAddress, address caller, uint256 amount);
    event WithdrawDonations(address tokenAddress, uint256 amount);

    address receiver;
    address master;
    string name;
    string about;

    modifier onlyAllowedTokens(address _tokenAddr){
        bool isAccepted;
        for (uint8 i = 0; i < acceptedTokens.length; i++){
            if(_tokenAddr == acceptedTokens[i]){
                isAccepted = true;
                break;
            }
        }
        require(isAccepted, "submitted token address is not accepted by pool");
        _;
    }

    modifier enoughFunds(address _userAddr, address _tokenAddr, uint256 _amount) {
        require(_amount > 0, "amount must exceed 0");
        //require(depositors[_userAddr][_tokenAddr]  >= _amount, "no funds deposited for selected token");
        _;
    }

    modifier onlyReceiver(address _sender){
        require(receiver == _sender, "you are not the current reciever for this pool");
        _;
    }

    modifier onlyMaster(address _sender){
        require(master == _sender, "you are not the owner");
        _;
    }

    modifier strLength(string memory _str, uint8 _limit ){
        bytes memory strBytes = bytes(_str);
        require(strBytes.length < _limit, "string over character limit");
        _;
    }

    constructor () {
        isBase = true;
    }

    function initialize(
        address[] memory _acceptedTokens,
        string memory _name,
        string memory _about,
        address _receiver)

    strLength(_name, 30) strLength(_about, 200) initializer() external {

        require(isBase == false, "Cannot initialize base");
        require(receiver == address(0), "Initialize already called");

        receiver = _receiver;
        master = msg.sender;
        name = _name;
        about = _about;

        provider = IPoolAddressesProvider(address(0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6)); // polygon mumbai v3
        poolAddr = provider.getPool();
        wethGatewayAddr = address(0x2a58E9bbb5434FdA7FF78051a4B82cb0EF669C17);// polygon mumbai v3
        acceptedTokens = _acceptedTokens;
    }

    function deposit(address _assetAddress, uint256 _amount/*, address _depositor*/) onlyMaster(msg.sender) onlyAllowedTokens(_assetAddress) external {
        //IERC20 token = IERC20(_assetAddress);
        //require(token.allowance(_depositor, address(this)) >= _amount, "sender not approved");
        //token.transferFrom(_depositor, address(this), _amount);
        //address poolAddr = address(Pool);
        //token.approve(poolAddr, _amount);
        //IPool(poolAddr).deposit(address(token), _amount, address(this), 0);
        totalDeposits[_assetAddress] += _amount;
        //emit Deposit(_assetAddress, _depositor, _amount);
    }

    function depositETH(address _wethAddress , /*address _depositor,*/ uint256 _value) onlyMaster(msg.sender) external {
        //IWETHGateway(wethGatewayAddr).depositETH{value: msg.value}(poolAddr, address(this), 0);
        totalDeposits[_wethAddress] += _value;
    }

    /*function tallyDeposit(uint256 _amount, address _assetAddress, address _depositor) internal {
        uint256 depositedAmount = depositors[_depositor][_assetAddress];
        //uint256 liquidityIndex = getAaveLiquidityIndex(_assetAddress);
        //if(depositedAmount == 0){
            //poolTracker.addDeposit(_depositor, _amount, liquidityIndex, block.timestamp, _assetAddress);
        //}
        depositedAmount += _amount;
        totalDeposits[_assetAddress] += _amount;
        depositors[_depositor][_assetAddress] = depositedAmount;
    }*/

    function withdraw(address _assetAddress, uint256 _amount, address _depositor, bool isETH) onlyMaster(msg.sender) enoughFunds(_depositor, _assetAddress, _amount) external {
        totalDeposits[_assetAddress] -= _amount;
        if(!isETH){
            IPool(poolAddr).withdraw(_assetAddress, _amount, _depositor);
        }
        else{
            address aTokenAddress = getATokenAddress(_assetAddress);
            IERC20(aTokenAddress).approve(wethGatewayAddr, _amount);
            IWETHGateway(wethGatewayAddr).withdrawETH(poolAddr, _amount, _depositor);
        }
        emit Withdraw(_assetAddress, _depositor, _amount);
    }

    function withdrawDonations(address _assetAddress, bool isETH) onlyMaster(msg.sender) onlyAllowedTokens(_assetAddress) external returns(uint256){
        address aTokenAddress = getATokenAddress(_assetAddress);
        uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
        uint256 interestEarned = aTokenBalance - totalDeposits[_assetAddress];
        interestWithdrawn[_assetAddress] += interestEarned;

        if(!isETH){
            IPool(poolAddr).withdraw(_assetAddress, interestEarned, receiver);
        }
        else{
            IERC20(aTokenAddress).approve(wethGatewayAddr, interestEarned);
            IWETHGateway(wethGatewayAddr).withdrawETH(poolAddr, interestEarned, receiver);
        }

        return interestEarned;
    }

    /*function getUserBalance(address _userAddr, address _token) external view returns(uint256){
        return depositors[_userAddr][_token];
    }*/

    function getTotalDeposits(address _token) external view returns(uint256){
        return totalDeposits[_token];
    }

    function getAcceptedTokens() external view returns(address[] memory){
        return acceptedTokens;
    }

    function getName() external view returns(string memory){
        return name;
    }

    function getAbout() external view returns(string memory){
        return about;
    }

    function getATokenAddress(address _assetAddress) public view returns(address aTokenAddress){
        //(,,,,,,,, aTokenAddress,,,,,,) = IPool(poolAddr).getReserveData(_assetAddress);
        aTokenAddress = IPool(poolAddr).getReserveData(_assetAddress).aTokenAddress;
    }

    function getUnclaimedInterest(address _assetAddress) external view returns (uint256){
        address aTokenAddress = getATokenAddress(_assetAddress);
        uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
        return aTokenBalance - totalDeposits[_assetAddress];
    }

    function getClaimedInterest(address _assetAddress) external view returns (uint256){
        return interestWithdrawn[_assetAddress];
    }

    function getATokenBalance(address _assetAddress) external view returns (uint256){
        address aTokenAddress = getATokenAddress(_assetAddress);
        return IERC20(aTokenAddress).balanceOf(address(this));
    }

    function getRecipient() external view returns(address){
        return receiver;
    }

    function getByteCode() external view returns(bytes memory) {
        return address(this).code;
    }

    function getHashByteCode() public view returns(bytes32) {
        return keccak256(abi.encodePacked(address(this).code));
    }

    function getReserveNormalizedIncome(address _asset) public view returns(uint256){
        return IPool(poolAddr).getReserveNormalizedIncome(_asset);
    }

    function getAaveLiquidityIndex(address _asset) public view returns(uint256 liquidityIndex){
        //(,liquidityIndex,,,,,,,,,,,,,) = IPool(poolAddr).getReserveData(_asset);
        liquidityIndex = IPool(poolAddr).getReserveData(_asset).liquidityIndex;
    }
}