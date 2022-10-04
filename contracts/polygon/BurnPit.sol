// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { IOffsetHelper} from './interfaces/toucan/IOffsetHelper.sol';
import { IERC20} from './interfaces/other/IERC20.sol';
import { IWETH} from './interfaces/other/IWETH.sol';
import { SafeERC20 } from './libraries/SafeERC20.sol';

//import Ownable from '@openzeppelin/contracts/access/Ownable.sol';

contract BurnPit {
    using SafeERC20 for IERC20;

    // OffsetHelper addr 0xFAFcCd01C395e4542BEed819De61f02f5562fAEa
    // USDC + WETH on matic
    address[] acceptedTokens = [0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619, 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270];

    event TokenBurned(
        address token,
        address poolToken,
        address[] tco2s,
        uint256[] amounts
    );

    event ETHBurned(
        address poolToken,
        address[] tco2s,
        uint256[] amounts
    );

    event NoBal(
        uint256 tokenBalance,
        address tokenAddr
    );

    event Test(
        address[] _acceptedTokens
    );

    function burnTokens(
        //address _poolToken
    ) public {
        IWETH weth = IWETH(acceptedTokens[2]);
        weth.deposit(address(this).balance);
        address offsetHelperAddr = 0xFAFcCd01C395e4542BEed819De61f02f5562fAEa;
        address nctAddr = 0xD838290e877E0188a4A44700463419ED96c16107;
        address[] memory _acceptedTokens = acceptedTokens;
        for(uint8 i = 0; i < _acceptedTokens.length; i++){
            IERC20 token = IERC20(_acceptedTokens[i]);
            uint256 tokenBalance = token.balanceOf(address(this));
            if(tokenBalance > 0){
                address[] memory tco2s;
                uint256[] memory amounts;
                token.safeApprove(offsetHelperAddr, 0);
                token.safeApprove(offsetHelperAddr, tokenBalance);
                (tco2s, amounts) = IOffsetHelper(offsetHelperAddr).autoOffsetUsingToken(_acceptedTokens[i], nctAddr, tokenBalance);
                emit TokenBurned(_acceptedTokens[i], nctAddr, tco2s, amounts);
            }else{
                emit NoBal(tokenBalance, _acceptedTokens[i]);
            }
        }
        emit Test(_acceptedTokens);
        /*if(address(this).balance > 0){
            address[] memory tco2s;
            uint256[] memory amounts;
            (tco2s, amounts) = IOffsetHelper(offsetHelperAddr).autoOffsetUsingETH{value: address(this).balance}(nctAddr, address(this).balance);
            emit ETHBurned(nctAddr, tco2s, amounts);
        }*/
    }

    receive() external payable{}
}