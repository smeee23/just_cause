// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { IERC20, ILendingPool, ILendingPoolAddressesProvider, IProtocolDataProvider, IWETHGateway} from './Interfaces.sol';
import { SafeERC20 } from './Libraries.sol';
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
/**
 * This is a proof of concept starter contract, showing how uncollaterised loans are possible
 * using Aave v2 credit delegation.
 * This example supports stable interest rate borrows.
 * It is not production ready (!). User permissions and user accounting of loans should be implemented.
 * See @dev comments
 */

contract JustCausePool is Initializable {
    //mapping(address => mapping(address => uint256)) private depositors;
    mapping(address => uint256) private totalDeposits;
    mapping(address => uint256) private interestWithdrawn;
    uint256 public claimIndex;
    bool public isBase;

    ILendingPoolAddressesProvider provider;
    address lendingPoolAddr;
    address dataProviderAddr;
    address wethGatewayAddr;

    /*ILendingPoolAddressesProvider provider;
    ILendingPool lendingPool;
    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x3c73A5E5785cAC854D468F727c606C07488a29D6));*/ // Kovan
    //IWETHGateway constant wethGateway = IWETHGateway(address(0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70)); //Kovan

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

        provider = ILendingPoolAddressesProvider(address(0x88757f2f99175387aB4C6a4b3067c77A695b0349));
        lendingPoolAddr = provider.getLendingPool();
        dataProviderAddr = address(0x3c73A5E5785cAC854D468F727c606C07488a29D6);//Kovan
        wethGatewayAddr = address(0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70);//Kovan
        acceptedTokens = _acceptedTokens;

        /*provider = ILendingPoolAddressesProvider(address(0x88757f2f99175387aB4C6a4b3067c77A695b0349));
        address lendingPoolAddr = provider.getLendingPool();
        lendingPool = ILendingPool(lendingPoolAddr); // Kovan*/
    }

    function deposit(address _assetAddress, uint256 _amount, address _depositor) onlyMaster(msg.sender) onlyAllowedTokens(_assetAddress) external {
        IERC20 token = IERC20(_assetAddress);
        require(token.allowance(_depositor, address(this)) >= _amount, "sender not approved");
        token.transferFrom(_depositor, address(this), _amount);
        //address poolAddr = address(lendingPool);
        token.approve(lendingPoolAddr, _amount);
        ILendingPool(lendingPoolAddr).deposit(address(token), _amount, address(this), 0);
        totalDeposits[_assetAddress] += _amount;
        emit Deposit(_assetAddress, _depositor, _amount);
    }

    function depositETH(address _wethAddress , address _depositor) onlyMaster(msg.sender) external payable {
        IWETHGateway(wethGatewayAddr).depositETH{value: msg.value}(lendingPoolAddr, address(this), 0);
        totalDeposits[_wethAddress] += msg.value;
        emit Deposit(_wethAddress, _depositor, msg.value);
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

    function withdraw(address _assetAddress, uint256 _amount, address _depositor) onlyMaster(msg.sender) enoughFunds(_depositor, _assetAddress, _amount) external {
        ILendingPool(lendingPoolAddr).withdraw(_assetAddress, _amount, _depositor);
        totalDeposits[_assetAddress] -= _amount;
        emit Withdraw(_assetAddress, _depositor, _amount);
    }

    function withdrawDonations(address _assetAddress) onlyMaster(msg.sender) onlyAllowedTokens(_assetAddress) external returns(uint256){
        (address aTokenAddress,,) = IProtocolDataProvider(dataProviderAddr).getReserveTokensAddresses(_assetAddress);
        uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
        uint256 interestEarned = aTokenBalance - totalDeposits[_assetAddress];
        ILendingPool(lendingPoolAddr).withdraw(_assetAddress, interestEarned, receiver);
        claimIndex = getAaveLiquidityIndex(_assetAddress);
        interestWithdrawn[_assetAddress] += interestEarned;
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

    function getATokenAddress(address _assetAddress) external view returns(address){
        (address aTokenAddress,,) = IProtocolDataProvider(dataProviderAddr).getReserveTokensAddresses(_assetAddress);
        return aTokenAddress;
    }

    function getUnclaimedInterest(address _assetAddress) external view returns (uint256){
        (address aTokenAddress,,) = IProtocolDataProvider(dataProviderAddr).getReserveTokensAddresses(_assetAddress);
            uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
            return aTokenBalance - totalDeposits[_assetAddress];
    }

    function getClaimedInterest(address _assetAddress) external view returns (uint256){
        return interestWithdrawn[_assetAddress];
    }

    function getATokenBalance(address _assetAddress) external view returns (uint256){
        (address aTokenAddress,,) = IProtocolDataProvider(dataProviderAddr).getReserveTokensAddresses(_assetAddress);
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
        return ILendingPool(lendingPoolAddr).getReserveNormalizedIncome(_asset);
    }

    function getAaveLiquidityIndex(address _asset) public view returns(uint256 liquidityIndex){
        (,,,,,,,liquidityIndex,,) = IProtocolDataProvider(dataProviderAddr).getReserveData(_asset);
    }
}