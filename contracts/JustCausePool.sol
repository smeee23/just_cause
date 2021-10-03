// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import { IERC20, ILendingPool, IProtocolDataProvider, IStableDebtToken, ILendingPoolAddressesProvider} from './Interfaces.sol';
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
    
    uint256 public totalDeposits;
    mapping(address => uint256) public deposits; 
    ILendingPoolAddressesProvider provider;
    IProtocolDataProvider dataProvider; // Kovan
    address private kovanDAI;
    ILendingPool lendingPool;
    IERC20 daiToken;
    uint256 amount;
    address lendingPoolAddr;
    
    event Deposit(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits);
    event Withdraw(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits);
    event WithdrawDonations(address tokenAddress, address depositor, uint256 amount, uint256 totalDeposits, uint256 assetBalance, address aTokenAddress);
    event BalanceOf(address FROM, uint256 AMOUNT, uint256 BALANCE);
    event GetLPAddress(address addr);
    event SeeAllowance(uint256 allowance);
    
    event Test(uint256 test);
    address owner;

    constructor () public {
        owner = msg.sender;
        provider = ILendingPoolAddressesProvider(address(0x88757f2f99175387aB4C6a4b3067c77A695b0349));
        dataProvider = IProtocolDataProvider(address(0x744C1aaA95232EeF8A9994C4E0b3a89659D9AB79));
        lendingPoolAddr = provider.getLendingPool();
        lendingPool = ILendingPool(lendingPoolAddr); // Kovan
        //lendingPool = ILendingPool(address(0x9FE532197ad76c5a68961439604C037EB79681F0)); // Kovan
        kovanDAI = address(0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD);
        amount = 50 * 1e18;
        daiToken = IERC20(kovanDAI);
    }
    
    function transferIn(/*address asset, uint256 amount*/) public {
        //emit BalanceOf(msg.sender, amount, daiToken.balanceOf(msg.sender));
        daiToken.transferFrom(msg.sender, address(this), amount);
        emit GetLPAddress(lendingPoolAddr);
    }
    
    function deposit(/*address asset, uint256 amount*/) public {
            daiToken.approve(address(lendingPool), amount);
            emit SeeAllowance(daiToken.allowance(address(this), address(lendingPool)));
            lendingPool.deposit(address(daiToken), amount, address(this), 0);
            deposits[msg.sender] = deposits[msg.sender] + amount;
            totalDeposits += amount;
            emit Deposit(address(daiToken), msg.sender, amount, totalDeposits);
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
    function withdraw(/*address asset, uint256 amount*/) public {
        //require(deposits[msg.sender] >= amount, "insufficient balance");
        lendingPool.withdraw(address(daiToken), amount, msg.sender);
        deposits[msg.sender] = deposits[msg.sender] - amount;
        totalDeposits -= amount;
        emit Withdraw(address(daiToken), msg.sender, amount, totalDeposits);
    }
    
    function withdrawDonations() public{
        //(address aTokenAddress,,) = dataProvider.getReserveTokensAddresses(address(daiToken));
        //uint256 assetBalance = IERC20(aTokenAddress).balanceOf(address(this));
        address testATokenAddress = address(0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8);
        uint256 assetBalance = IERC20(testATokenAddress).balanceOf(address(this));
        uint256 interestEarned = assetBalance - totalDeposits;
        lendingPool.withdraw(address(daiToken), interestEarned, owner);
        emit WithdrawDonations(address(daiToken), owner, interestEarned, totalDeposits, assetBalance, testATokenAddress);
    } 
}