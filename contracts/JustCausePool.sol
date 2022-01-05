// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { IERC20, ILendingPool, ILendingPoolAddressesProvider, IPoolTracker, IProtocolDataProvider, IWETHGateway} from './Interfaces.sol';
import { SafeERC20 } from './Libraries.sol';

/**
 * This is a proof of concept starter contract, showing how uncollaterised loans are possible
 * using Aave v2 credit delegation.
 * This example supports stable interest rate borrows.
 * It is not production ready (!). User permissions and user accounting of loans should be implemented.
 * See @dev comments
 */

contract JustCausePool {
    mapping(address => mapping(address => uint256)) private depositors;
    mapping(address => uint256) private totalDeposits;
    mapping(address => uint256) private interestWithdrawn;

    IPoolTracker poolTracker;

    ILendingPoolAddressesProvider provider;
    ILendingPool lendingPool;
    IProtocolDataProvider constant dataProvider = IProtocolDataProvider(address(0x3c73A5E5785cAC854D468F727c606C07488a29D6)); // Kovan
    IWETHGateway constant wethGateway = IWETHGateway(address(0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70)); //Kovan

    address[] acceptedTokens;

    event Deposit(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits);
    event Withdraw(address tokenAddress, address depositor, uint256 amount, uint256 userDeposits, uint256 donation);
    event WithdrawDonations(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits, address aTokenAddress);
    event BalanceOf(address FROM, uint256 AMOUNT, uint256 BALANCE);
    event GetLPAddress(address addr);
    event SeeAllowance(uint256 allowance);
    event GetPoolTracker(address test);
    address owner;
    address receiver;
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
        require(depositors[_userAddr][_tokenAddr]  >= _amount, "no funds deposited for selected token");
        require(_amount >= _donation, "donation cannot exceed withdrawal amount");
        _;
    }

    modifier onlyReceiver(address _requestAddr){
        require(receiver == _requestAddr, "you are not the current reciever for this pool");
        _;
    }

    modifier strLength(string memory _str, uint8 _limit ){
        bytes memory strBytes = bytes(_str);
        require(strBytes.length < _limit, "string over character limit");
        _;
    }

    constructor (address[] memory _acceptedTokens, string memory _name, string memory _about, address _poolTrackerAddr, address _receiver) strLength(_name, 30) strLength(_about, 200) {
            owner = msg.sender;
            receiver = _receiver;
            name = _name;
            about = _about;
            provider = ILendingPoolAddressesProvider(address(0x88757f2f99175387aB4C6a4b3067c77A695b0349));
            address lendingPoolAddr = provider.getLendingPool();
            lendingPool = ILendingPool(lendingPoolAddr); // Kovan
            acceptedTokens = _acceptedTokens;

            poolTracker = IPoolTracker(address(_poolTrackerAddr));
            emit GetPoolTracker(poolTracker.getAddressFromName(name));
            poolTracker.addVerifiedPools(address(this), owner, _name);
    }

    function deposit(address _assetAddress, uint256 _amount) onlyAllowedTokens(_assetAddress) public {
        IERC20 token = IERC20(_assetAddress);
        require(token.allowance(msg.sender, address(this)) >= _amount, "sender not approved");
        token.transferFrom(msg.sender, address(this), _amount);
        address poolAddr = address(lendingPool);
        token.approve(poolAddr, _amount);
        lendingPool.deposit(address(token), _amount, address(this), 0);
        tallyDeposit(_amount, _assetAddress);
    }

    function depositETH(address _wethAddress) public payable {
        address poolAddr = address(lendingPool);
        wethGateway.depositETH{value: msg.value}(poolAddr, address(this), 0);
        tallyDeposit(msg.value, _wethAddress);
    }

    function tallyDeposit(uint256 _amount, address _assetAddress) internal {
        uint256 depositedAmount = depositors[msg.sender][_assetAddress];
        if(depositedAmount == 0){
            poolTracker.addDeposit(msg.sender, address(this));
        }
        depositedAmount += _amount;
        totalDeposits[_assetAddress] += _amount;
        depositors[msg.sender][_assetAddress] = depositedAmount;
    }

    function withdraw(address _assetAddress, uint256 _amount, uint256 _donation) enoughFunds(msg.sender, _assetAddress, _amount, _donation) public {
        address poolAddr = address(lendingPool);
        if(_donation != 0){
            uint256 newAmount = _amount - _donation;
            lendingPool.withdraw(_assetAddress, _donation, receiver);
            if(newAmount != 0)
                lendingPool.withdraw(_assetAddress, newAmount, msg.sender);
        }
        else
            lendingPool.withdraw(_assetAddress, _amount, msg.sender);

        depositors[msg.sender][_assetAddress] -= _amount;
        totalDeposits[_assetAddress] -= _amount;

        if(depositors[msg.sender][_assetAddress] == 0){
            poolTracker.withdrawDeposit(msg.sender, address(this));
        }
        emit Withdraw(_assetAddress, msg.sender, _amount, depositors[msg.sender][_assetAddress], _donation);
    }

    function withdrawDonations(address _assetAddress, bool _isETH) onlyAllowedTokens(_assetAddress) public{
        (address aTokenAddress,,) = dataProvider.getReserveTokensAddresses(_assetAddress);

        uint256 aTokenBalance = IERC20(aTokenAddress).balanceOf(address(this));
        uint256 interestEarned = aTokenBalance - totalDeposits[_assetAddress];
        interestWithdrawn[_assetAddress] += interestEarned;
        lendingPool.withdraw(_assetAddress, interestEarned, receiver);
        emit WithdrawDonations(_assetAddress, receiver, interestEarned, totalDeposits[_assetAddress], aTokenAddress);
    }

    function getUserBalance(address _userAddr, address _token) external view returns(uint256){
        return depositors[_userAddr][_token];
    }

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
}