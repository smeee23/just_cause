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
    bool public isBase;

    ILendingPoolAddressesProvider provider;
    ILendingPool lendingPool;
    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x3c73A5E5785cAC854D468F727c606C07488a29D6)); // Kovan
    IWETHGateway constant wethGateway = IWETHGateway(address(0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70)); //Kovan

    address[] acceptedTokens;

    event Deposit(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits);
    event Withdraw(address tokenAddress, address depositor, uint256 amount, uint256 donation);
    event WithdrawDonations(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits, address aTokenAddress);

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

    modifier enoughFunds(address _userAddr, address _tokenAddr, uint256 _amount, uint256 _donation) {
        require(_amount > 0, "amount must exceed 0");
        //require(depositors[_userAddr][_tokenAddr]  >= _amount, "no funds deposited for selected token");
        require(_amount >= _donation, "donation cannot exceed withdrawal amount");
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
        address lendingPoolAddr = provider.getLendingPool();
        lendingPool = ILendingPool(lendingPoolAddr); // Kovan
        acceptedTokens = _acceptedTokens;
    }

    function deposit(address _assetAddress, uint256 _amount, address _depositor) onlyMaster(msg.sender) onlyAllowedTokens(_assetAddress) public {
        IERC20 token = IERC20(_assetAddress);
        require(token.allowance(_depositor, address(this)) >= _amount, "sender not approved");
        token.transferFrom(_depositor, address(this), _amount);
        address poolAddr = address(lendingPool);
        token.approve(poolAddr, _amount);
        lendingPool.deposit(address(token), _amount, address(this), 0);
        totalDeposits[_assetAddress] += _amount;
        //tallyDeposit(_amount, _assetAddress, _depositor);
    }

    function depositETH(address _wethAddress /*, address _depositor*/) onlyMaster(msg.sender) public payable {
        address poolAddr = address(lendingPool);
        wethGateway.depositETH{value: msg.value}(poolAddr, address(this), 0);
        totalDeposits[_wethAddress] += msg.value;
        //tallyDeposit(msg.value, _wethAddress, _depositor);
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

    function withdraw(address _assetAddress, uint256 _amount, uint256 _donation, address _depositor) onlyMaster(msg.sender) enoughFunds(_depositor, _assetAddress, _amount, _donation) public {
        //address poolAddr = address(lendingPool);
        if(_donation != 0){
            uint256 newAmount = _amount - _donation;
            lendingPool.withdraw(_assetAddress, _donation, receiver);
            if(newAmount != 0)
                lendingPool.withdraw(_assetAddress, newAmount, _depositor);
        }
        else
            lendingPool.withdraw(_assetAddress, _amount, _depositor);

        //depositors[_depositor][_assetAddress] -= _amount;
        totalDeposits[_assetAddress] -= _amount;

        //if(depositors[_depositor][_assetAddress] == 0){
            //poolTracker.withdrawDeposit(_depositor, _amount, block.timestamp, _assetAddress);
        //}
        emit Withdraw(_assetAddress, _depositor, _amount, _donation);
    }

    function withdrawDonations(address _assetAddress) onlyMaster(msg.sender) onlyAllowedTokens(_assetAddress) public{
        (address aTokenAddress,,) = dataProvider.getReserveTokensAddresses(_assetAddress);

        uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
        uint256 interestEarned = aTokenBalance - totalDeposits[_assetAddress];
        interestWithdrawn[_assetAddress] += interestEarned;
        lendingPool.withdraw(_assetAddress, interestEarned, receiver);
        emit WithdrawDonations(_assetAddress, receiver, interestEarned, totalDeposits[_assetAddress], aTokenAddress);
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
        (address aTokenAddress,,) = dataProvider.getReserveTokensAddresses(_assetAddress);
        return aTokenAddress;
    }

    function getUnclaimedInterest(address _assetAddress) external view returns (uint256){
        (address aTokenAddress,,) = dataProvider.getReserveTokensAddresses(_assetAddress);
            uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
            return aTokenBalance - totalDeposits[_assetAddress];
    }

    function getClaimedInterest(address _assetAddress) external view returns (uint256){
        return interestWithdrawn[_assetAddress];
    }

    function getATokenBalance(address _assetAddress) external view returns (uint256){
        (address aTokenAddress,,) = dataProvider.getReserveTokensAddresses(_assetAddress);
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

    function getAaveLiquidityIndex(address _asset) public view returns(uint256 liquidityIndex){
        (,,,,,,,liquidityIndex,,) = dataProvider.getReserveData(_asset);
    }
}