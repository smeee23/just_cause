// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import { IOffsetHelper} from './interfaces/toucan/IOffsetHelper.sol';
import { IERC20} from './interfaces/other/IERC20.sol';
import { SafeERC20 } from './libraries/SafeERC20.sol';

//import Ownable from '@openzeppelin/contracts/access/Ownable.sol';

contract BurnPit {
    using SafeERC20 for IERC20;

    // OffsetHelper addr 0x79E63048B355F4FBa192c5b28687B852a5521b31
    // USDC + WETH on matic
    address[] acceptedTokens = [0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619 ];

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

    function burnTokens(
        //address _poolToken
    ) public {
        address offsetHelperAddr = 0x79E63048B355F4FBa192c5b28687B852a5521b31;
        address nctAddr = 0xD838290e877E0188a4A44700463419ED96c16107;
        address[] memory _acceptedTokens = acceptedTokens;
        for(uint8 i = 0; i < _acceptedTokens.length; i++){
            IERC20 token = IERC20(_acceptedTokens[i]);
            uint256 balance = token.balanceOf(address(this));
            if(balance > 0){
                address[] memory tco2s;
                uint256[] memory amounts;
                token.safeApprove(offsetHelperAddr, 0);
                token.safeApprove(offsetHelperAddr, balance);
                (tco2s, amounts) = IOffsetHelper(offsetHelperAddr).autoOffsetUsingToken(_acceptedTokens[i], nctAddr, balance);
                emit TokenBurned(_acceptedTokens[i], nctAddr, tco2s, amounts);
            }
        }
        if(address(this).balance > 0){
            address[] memory tco2s;
            uint256[] memory amounts;
            (tco2s, amounts) = IOffsetHelper(offsetHelperAddr).autoOffsetUsingETH{value: address(this).balance}(nctAddr, address(this).balance);
            emit ETHBurned(nctAddr, tco2s, amounts);
        }
    }

    receive() external payable{}
}