// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.9;

import { IERC20, ILendingPool, ILendingPoolAddressesProvider, IPoolTracker} from './Interfaces.sol';
import { SafeERC20 } from './Libraries.sol';

/**
 * This is a proof of concept starter contract, showing how uncollaterised loans are possible
 * using Aave v2 credit delegation.
 * This example supports stable interest rate borrows.
 * It is not production ready (!). User permissions and user accounting of loans should be implemented.
 * See @dev comments
 */

contract JustCausePool {
    //using SafeERC20 for IERC20;
    mapping(address => mapping(address => uint256)) private depositors;
    mapping(address => uint256) public totalDeposits;
    //mapping(address => mapping(address => uint256)) public deposits;
    IPoolTracker poolTracker;
    ILendingPoolAddressesProvider provider;
    //address private kovanDAI;v
    ILendingPool lendingPool;
    //IERC20 daiToken;
    //uint256 amount;
    address lendingPoolAddr;
    address[] acceptedTokens;

    event Deposit(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits);
    event Withdraw(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits);
    event WithdrawDonations(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits, uint256 assetBalance, address aTokenAddress);
    event BalanceOf(address FROM, uint256 AMOUNT, uint256 BALANCE);
    event GetLPAddress(address addr);
    event SeeAllowance(uint256 allowance);
    event GetPoolTracker(address test);
    address owner;
    address reciever;
    string name;

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
        require(depositors[_userAddr][_tokenAddr]  >= _amount, "no funds deposited for selected token");
        _;
    }

    modifier onlyReciever(address _requestAddr){
        require(reciever == _requestAddr, "you are not the current reciever for this pool");
        _;
    }

    constructor (address[] memory _acceptedTokens, string memory _name, address _poolTrackerAddr) {
        owner = msg.sender;
        reciever = msg.sender;
        name = _name;
        provider = ILendingPoolAddressesProvider(address(0x88757f2f99175387aB4C6a4b3067c77A695b0349));
        lendingPoolAddr = provider.getLendingPool();
        lendingPool = ILendingPool(lendingPoolAddr); // Kovan
        acceptedTokens = _acceptedTokens;

        poolTracker = IPoolTracker(address(_poolTrackerAddr));
        emit GetPoolTracker(poolTracker.getAddressFromName(name));
        poolTracker.addVerifiedPools(address(this), owner, _name);
    }

    function deposit(address _assetAddress, uint256 _amount) public {
        IERC20 token = IERC20(_assetAddress);
        require(token.allowance(msg.sender, address(this)) >= _amount, "sender not approved");
        token.transferFrom(msg.sender, address(this), _amount);
        address poolAddr = address(lendingPool);
        token.approve(poolAddr, _amount);
        lendingPool.deposit(address(token), _amount, address(this), 0);
        depositors[msg.sender][_assetAddress] += _amount;
        poolTracker.addDeposit(msg.sender, address(this));
        totalDeposits[_assetAddress] += _amount;
        emit Deposit(address(token), msg.sender, _amount, totalDeposits[_assetAddress]);
    }

    function withdraw(address _assetAddress, uint256 _amount) enoughFunds(msg.sender, _assetAddress, _amount) public {
        lendingPool.withdraw(_assetAddress, _amount, msg.sender);
        poolTracker.withdrawDeposit(msg.sender, address(this));
        depositors[msg.sender][_assetAddress] -= _amount;
        totalDeposits[_assetAddress] -= _amount;
        emit Withdraw(_assetAddress, msg.sender, _amount, totalDeposits[_assetAddress]);
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

    /**
     * Repay an uncollaterised loan
     * @param amount The amount to repay
     * @param asset The asset to be repaid
     *
     * User calling this function must have approved this contract with an allowance to transfer the tokens
     *
     * You should keep internal accounting of borrowers, if your contract will have multiple borrowers
     */
    /*function repayBorrower(uint256 amount, address asset) public {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(asset).safeApprove(address(lendingPool), amount);
        lendingPool.repay(asset, amount, 1, address(this));
    }*/

    /**
     * Withdraw all of a collateral as the underlying asset, if no outstanding loans delegated
     *
     *
     * Add permissions to this call, e.g. only the owner should be able to withdraw the collateral!
     */

    /*function withdrawDonations() public{
        //(address aTokenAddress,,) = dataProvider.getReserveTokensAddresses(address(daiToken));
        //uint256 assetBalance = IERC20(aTokenAddress).balanceOf(address(this));
        address testATokenAddress = address(0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8);
        uint256 assetBalance = IERC20(testATokenAddress).balanceOf(address(this));
        uint256 interestEarned = assetBalance - totalDeposits;
        lendingPool.withdraw(address(daiToken), interestEarned, owner);
        emit WithdrawDonations(address(daiToken), owner, interestEarned, totalDeposits, assetBalance, testATokenAddress);
    }*/
}